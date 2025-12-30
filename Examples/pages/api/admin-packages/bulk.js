import {
  getAllAdminPackages,
  replaceAllAdminPackages
} from "../../../lib/adminPackagesStore";

function isAuthed(req) {
  const flag = req.cookies?.admin_auth;
  return flag === "1";
}

export default function handler(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "PUT") {
    try {
      const { ids, updates } = req.body || {};
      if (!Array.isArray(ids) || !ids.length || !updates || typeof updates !== "object") {
        res.status(400).json({ error: "Invalid request body" });
        return;
      }

      const all = getAllAdminPackages();
      const updated = all.map((pkg) => {
        if (ids.includes(pkg.id)) {
          return {
            ...pkg,
            ...updates,
            id: pkg.id // id is immutable
          };
        }
        return pkg;
      });

      replaceAllAdminPackages(updated);
      const updatedItems = updated.filter((p) => ids.includes(p.id));
      res.status(200).json({ items: updatedItems });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[admin-packages][bulk][PUT] error", err);
      res.status(500).json({ error: "Failed to update packages" });
    }
    return;
  }

  res.setHeader("Allow", ["PUT"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

