import {
  getAllAdminPackages,
  createAdminPackage
} from "../../../lib/adminPackagesStore";

function isAuthed(req) {
  // Next API routes expose parsed cookies on req.cookies
  const flag = req.cookies?.admin_auth;
  return flag === "1";
}

export default function handler(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    const items = getAllAdminPackages();
    res.status(200).json({ items });
    return;
  }

  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const created = createAdminPackage(body);
      res.status(201).json({ item: created });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[admin-packages][POST] error", err);
      res.status(500).json({ error: "Failed to create package" });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}


