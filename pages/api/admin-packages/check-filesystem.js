// Diagnostic endpoint to check file system permissions
// This helps debug sync issues

import fs from "fs";
import path from "path";

function isAuthed(req) {
  const flag = req.cookies?.admin_auth;
  return flag === "1";
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const dataDir = path.join(process.cwd(), "data");

  const diagnostics = {
    dataDirectoryExists: false,
    dataDirectoryWritable: false,
    dataDirectoryPath: dataDir,
    files: {},
    errors: []
  };

  try {
    // Check if data directory exists
    diagnostics.dataDirectoryExists = fs.existsSync(dataDir);

    if (!diagnostics.dataDirectoryExists) {
      // Try to create it
      try {
        fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
        diagnostics.dataDirectoryExists = true;
        diagnostics.messages = ["Created data directory"];
      } catch (mkdirError) {
        diagnostics.errors.push(`Failed to create data directory: ${mkdirError.message}`);
        return res.status(500).json(diagnostics);
      }
    }

    // Check if directory is writable
    try {
      const testFile = path.join(dataDir, ".test-write");
      fs.writeFileSync(testFile, "test");
      fs.unlinkSync(testFile);
      diagnostics.dataDirectoryWritable = true;
    } catch (writeError) {
      diagnostics.errors.push(`Data directory is not writable: ${writeError.message}`);
    }

    // Check existing files
    const filesToCheck = [
      "stripe-products.json",
      "admin-packages.json",
      "account-purchases.json"
    ];

    for (const filename of filesToCheck) {
      const filePath = path.join(dataDir, filename);
      const fileInfo = {
        exists: fs.existsSync(filePath),
        readable: false,
        writable: false,
        size: 0
      };

      if (fileInfo.exists) {
        try {
          const stats = fs.statSync(filePath);
          fileInfo.size = stats.size;
          fileInfo.readable = true;
          
          // Try to read
          fs.readFileSync(filePath, "utf8");
          
          // Try to write (append mode to not overwrite)
          const testContent = fs.readFileSync(filePath, "utf8");
          fs.writeFileSync(filePath, testContent, "utf8");
          fileInfo.writable = true;
        } catch (fileError) {
          fileInfo.error = fileError.message;
          if (fileError.code === "EACCES") {
            fileInfo.error = "Permission denied";
          }
        }
      } else {
        // Try to create the file
        try {
          if (filename === "account-purchases.json") {
            fs.writeFileSync(filePath, JSON.stringify({ purchases: [] }, null, 2), "utf8");
          } else {
            fs.writeFileSync(filePath, "[]", "utf8");
          }
          fileInfo.exists = true;
          fileInfo.writable = true;
          fileInfo.readable = true;
        } catch (createError) {
          fileInfo.error = `Failed to create: ${createError.message}`;
        }
      }

      diagnostics.files[filename] = fileInfo;
    }

    // Overall status
    const allFilesWritable = Object.values(diagnostics.files).every(
      (f) => f.writable !== false
    );
    diagnostics.overallStatus = diagnostics.dataDirectoryWritable && allFilesWritable
      ? "OK"
      : "ISSUES_FOUND";

    res.status(200).json(diagnostics);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[check-filesystem] error", err);
    diagnostics.errors.push(`Unexpected error: ${err.message}`);
    res.status(500).json(diagnostics);
  }
}

