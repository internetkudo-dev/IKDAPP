import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const VIEW_LOGIN = "login";
const VIEW_SIGNUP = "signup";
const VIEW_DASHBOARD = "dashboard";
const VIEW_EDIT = "edit";

// NOTE: These are mock helpers; later you can replace them with real API calls.
function fakeSignIn(email, password) {
  // TODO: replace with real API
  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  return {
    ok: true,
    user: {
      id: "user-1",
      email,
      name: "Demo User"
    }
  };
}

function fakeSignUp(name, email, password) {
  // TODO: replace with real API
  if (!name || !email || !password) {
    return { ok: false, error: "Name, email and password are required." };
  }
  return {
    ok: true,
    user: {
      id: "user-1",
      email,
      name
    }
  };
}

  // Mock previous packages + balance – swap out once backend exists.
  const MOCK_ACCOUNT = {
    balance: 18.5,
    currency: "€",
    packages: [
      {
        id: "acc-pack-1",
        name: "Traveler EU",
        region: "Europe · EU + UK",
        data: "20 GB",
        remainingData: "6.2 GB",
        duration: "15 days",
        status: "Active"
      },
      {
        id: "acc-pack-2",
        name: "Nomad Global",
        region: "Global · 70+ countries",
        data: "30 GB",
        remainingData: "0 GB",
        duration: "30 days",
        status: "Expired"
      }
    ]
  };

export default function AccountPage() {
  const [view, setView] = useState(VIEW_LOGIN);
  const [user, setUser] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [topUpAmount, setTopUpAmount] = useState("10");

  // Edit account form state (mock-only for now)
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Loaded from API: real purchases + live ICCID usage when opening account.
  const [accountLoading, setAccountLoading] = useState(false);
  const [livePackages, setLivePackages] = useState([]);
  const [accountStats, setAccountStats] = useState({
    totalSpent: 0,
    lastPurchase: null
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = fakeSignIn(loginEmail.trim(), loginPassword.trim());
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Unable to sign in.");
      return;
    }

    setUser(res.user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ikd-user-email", res.user.email);
    }
    setView(VIEW_DASHBOARD);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = fakeSignUp(
      signupName.trim(),
      signupEmail.trim(),
      signupPassword.trim()
    );
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Unable to sign up.");
      return;
    }

    setUser(res.user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ikd-user-email", res.user.email);
    }
    setView(VIEW_DASHBOARD);
  };

  const handleTopUp = () => {
    // Top-up via this mock account page has been disabled.
    // Use the dedicated balance/top-up page instead.
    return null;
  };

  const showLogin = () => {
    setError("");
    setView(VIEW_LOGIN);
  };

  const showSignup = () => {
    setError("");
    setView(VIEW_SIGNUP);
  };

  const showDashboard = () => {
    setError("");
    setView(VIEW_DASHBOARD);
  };

  const showEdit = () => {
    setError("");
    setEditMessage("");
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
    }
    setView(VIEW_EDIT);
  };

  // When we have a user and we're on the dashboard, load their purchases
  // and check package usage for each stored ICCID.
  useEffect(() => {
    if (!user || view !== VIEW_DASHBOARD) return;

    let cancelled = false;
    async function loadAccount() {
      try {
        setAccountLoading(true);
        const res = await fetch(
          `/api/account/me?email=${encodeURIComponent(user.email)}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (!cancelled) {
            setAccountLoading(false);
          }
          return;
        }

        const iccids = Array.isArray(data.iccids) ? data.iccids : [];
        const allPackages = [];

        for (const iccid of iccids) {
          try {
            const usageRes = await fetch("/api/iccid/check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ iccid })
            });
            const usageData = await usageRes.json();
            if (usageRes.ok && usageData.success && usageData.packages) {
              allPackages.push({
                iccid,
                packages: usageData.packages
              });
            }
          } catch {
            // ignore individual ICCID failures in demo mode
          }
        }

        if (!cancelled) {
          setLivePackages(allPackages);
          setAccountStats({
            totalSpent: data.totalSpent || 0,
            lastPurchase: data.lastPurchase || null
          });
          setAccountLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAccountLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [user, view]);

  return (
    <Layout>
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: "1.75rem" }}>
            <div className="section-eyebrow">Account</div>
            <h2 className="section-title">
              {view === VIEW_DASHBOARD && user
                ? "Manage your data account"
                : "Sign in to manage your data"}
            </h2>
            <p className="section-description">
              Log in or create an account to keep track of your eSIM packages,
              check your remaining data and top up your balance. We&apos;ll
              connect this to your live API later.
            </p>
          </div>

          {/* Tabs */}
          <div
            className="package-filter-chips"
            style={{ marginBottom: "1.5rem" }}
          >
            <button
              type="button"
              className={
                "package-filter-chip" +
                (view === VIEW_LOGIN ? " is-active" : "")
              }
              onClick={showLogin}
            >
              Log in
            </button>
            <button
              type="button"
              className={
                "package-filter-chip" +
                (view === VIEW_SIGNUP ? " is-active" : "")
              }
              onClick={showSignup}
            >
              Sign up
            </button>
            <button
              type="button"
              className={
                "package-filter-chip" +
                (view === VIEW_DASHBOARD ? " is-active" : "")
              }
              onClick={showDashboard}
              disabled={!user}
              style={!user ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              My account
            </button>
            <button
              type="button"
              className={
                "package-filter-chip" +
                (view === VIEW_EDIT ? " is-active" : "")
              }
              onClick={showEdit}
              disabled={!user}
              style={!user ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              Edit details
            </button>
          </div>

          {error && (
            <p
              className="section-description"
              style={{ color: "#fca5a5", marginBottom: "1rem" }}
            >
              {error}
            </p>
          )}

          {/* Login form */}
          {view === VIEW_LOGIN && (
            <div className="support-form">
              <h3 className="support-form-title">Log in</h3>
              <form onSubmit={handleLogin}>
                <div className="support-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="support-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary support-submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </form>
            </div>
          )}

          {/* Signup form */}
          {view === VIEW_SIGNUP && (
            <div className="support-form">
              <h3 className="support-form-title">Create an account</h3>
              <form onSubmit={handleSignup}>
                <div className="support-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="support-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="support-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary support-submit"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>
            </div>
          )}

          {/* Dashboard */}
          {view === VIEW_DASHBOARD && (
            <div className="support-form" style={{ marginTop: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem"
                }}
              >
                <h3 className="support-form-title" style={{ marginBottom: 0 }}>
                  Account overview
                </h3>
                {user && (
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    Signed in as {user.email}
                  </span>
                )}
              </div>

              {/* Quick stats (mock data for now) */}
              <div
                className="modal-summary"
                style={{ marginBottom: "1.1rem" }}
              >
                <div>
                  <div className="modal-summary-label">
                    Active packages
                  </div>
                  <div className="modal-summary-value">
                    {livePackages.reduce(
                      (sum, entry) => sum + entry.packages.length,
                      0
                    )}
                  </div>
                </div>
                <div>
                  <div className="modal-summary-label">Total spent</div>
                  <div className="modal-summary-value">
                    €{accountStats.totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Top-up via this account page has been removed. Use the main balance/top-up flow instead. */}

              {/* Last bought package (from stored purchases) */}
              {accountStats.lastPurchase && (
                <div
                  className="package-card"
                  style={{
                    padding: "1.1rem 1.1rem 1rem",
                    marginBottom: "1.1rem",
                    borderColor: "rgba(110, 248, 37, 0.7)"
                  }}
                >
                  <div className="package-chip-row">
                    <span className="package-region">Last bought package</span>
                    <span className="package-chip">
                      €
                      {(
                        accountStats.lastPurchase.effectivePrice ??
                        accountStats.lastPurchase.basePrice ??
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <h3 className="package-name">
                    {accountStats.lastPurchase.packageName || "Package"}
                  </h3>
                  <div className="package-main">
                    <div>
                      <div className="package-duration">
                        Purchased on{" "}
                        {new Date(
                          accountStats.lastPurchase.purchasedAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="package-price">
                      <span className="package-note">
                        {accountStats.lastPurchase.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!accountStats.lastPurchase && (
                <p className="section-description" style={{ marginBottom: "1rem" }}>
                  You haven&apos;t purchased any packages with this account yet.
                </p>
              )}

              {/* Active packages from stored ICCIDs (live usage) */}
              <h4
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "0.6rem",
                  color: "#e5e7eb"
                }}
              >
                Your active packages
              </h4>

              {accountLoading && (
                <p
                  className="section-description"
                  style={{ marginBottom: "0.8rem" }}
                >
                  Checking your packages...
                </p>
              )}

              <div className="packages-grid">
                {livePackages.map((entry) =>
                  entry.packages.map((pkg) => (
                    <article
                      key={`${entry.iccid}-${pkg.name}-${pkg.expirationDateRaw}`}
                      className="package-card"
                      style={{ padding: "1.1rem 1.1rem 1rem" }}
                    >
                      <div className="package-chip-row">
                        <span className="package-region">
                          ICCID: {entry.iccid}
                        </span>
                        <span className="package-chip">Active</span>
                      </div>
                      <h3 className="package-name">{pkg.name}</h3>
                      <div className="package-main">
                        <div>
                          <div className="package-data">
                            {(pkg.totalData - pkg.usedData).toFixed(2)} GB
                          </div>
                          <div className="package-duration">remaining</div>
                        </div>
                        <div className="package-price">
                          <span className="package-note">
                            Total: {pkg.totalData.toFixed(2)} GB
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.86rem",
                          color: "#9ca3af"
                        }}
                      >
                        Expires: {pkg.expirationDate}
                      </div>
                    </article>
                  ))
                )}

                {!accountLoading && livePackages.length === 0 && (
                  <p className="section-description">
                    No active packages found for your stored ICCIDs yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Edit account details (mock) */}
          {view === VIEW_EDIT && (
            <div className="support-form" style={{ marginTop: "1rem" }}>
              <h3 className="support-form-title">Edit account details</h3>
              <p
                className="support-footnote"
                style={{ marginBottom: "1rem", marginTop: 0 }}
              >
                This demo lets you update your name, email and password locally.
                Later you can connect it to your real authentication backend.
              </p>

              {editMessage && (
                <p
                  className="section-description"
                  style={{
                    marginBottom: "1rem",
                    color: editMessage.startsWith("Error")
                      ? "#fca5a5"
                      : "#bbf7d0"
                  }}
                >
                  {editMessage}
                </p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEditMessage("");

                  if (!editName.trim() || !editEmail.trim()) {
                    setEditMessage("Error: name and email are required.");
                    return;
                  }

                  if (
                    (newPassword || confirmPassword || currentPassword) &&
                    newPassword !== confirmPassword
                  ) {
                    setEditMessage("Error: new passwords do not match.");
                    return;
                  }

                  // For now, just update local user state.
                  if (user) {
                    setUser({
                      ...user,
                      name: editName.trim(),
                      email: editEmail.trim()
                    });
                  }

                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setEditMessage("Account details saved (demo only).");
                }}
              >
                <div className="support-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="support-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid rgba(15, 23, 42, 0.9)",
                    margin: "0.75rem 0 0.75rem"
                  }}
                />

                <div className="support-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="support-field">
                  <span>New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="support-field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary support-submit"
                  style={{ marginTop: "0.5rem" }}
                >
                  Save changes
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}


