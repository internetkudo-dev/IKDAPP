import {
  getAdminPackageById,
  updateAdminPackage,
  deleteAdminPackage
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

  const {
    query: { id }
  } = req;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  if (req.method === "GET") {
    const item = getAdminPackageById(id);
    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(200).json({ item });
    return;
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const body = req.body || {};
      const updated = updateAdminPackage(id, body);
      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json({ item: updated });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[admin-packages][PUT] error", err);
      res.status(500).json({ error: "Failed to update package" });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const ok = deleteAdminPackage(id);
      if (!ok) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(204).end();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[admin-packages][DELETE] error", err);
      res.status(500).json({ error: "Failed to delete package" });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}


