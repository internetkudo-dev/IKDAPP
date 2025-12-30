import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        setError("Invalid password.");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Restricted</div>
            <h2 className="section-title">Admin login</h2>
            <p className="section-description">
              Enter the admin password to manage packages.
            </p>
          </div>
          <div className="admin-form-card" style={{ maxWidth: "420px" }}>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <label className="admin-label">
                  Password
                  <input
                    type="password"
                    className="admin-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
              </div>
              {error && <div className="admin-error">{error}</div>}
              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}


