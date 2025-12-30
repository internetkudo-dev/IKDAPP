import cookie from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("admin_auth", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })
  );

  res.status(200).json({ ok: true });
}


