import cookie from "cookie";

const DEFAULT_PASSWORD = "changeme-admin";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const body = req.body || {};
  const provided = String(body.password || "");
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

  if (!provided || provided !== expected) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const maxAge = 60 * 60 * 8; // 8 hours
  const isProd = process.env.NODE_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("admin_auth", "1", {
      httpOnly: true,
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: isProd
    })
  );

  res.status(200).json({ ok: true });
}


