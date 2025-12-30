import { useState } from "react";
import { useRouter } from "next/router";

export default function PackageModal({ open, pkg, onClose }) {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Important: keep hooks unconditionally called (Rules of Hooks).
  // Only render UI when we have a package + modal is open.
  if (!open || !pkg) return null;

  const getDisplayCountries = () => {
    if (Array.isArray(pkg.countryDetails) && pkg.countryDetails.length > 0) {
      return pkg.countryDetails
        .map((c) => {
          const name = c && typeof c.name === "string" ? c.name.trim() : "";
          const flag = c && (c.flag || c.icon) ? String(c.flag || c.icon).trim() : "";
          if (!name) return "";
          return flag ? `${flag} ${name}` : name;
        })
        .filter(Boolean);
    }

    const raw = Array.isArray(pkg.countries) ? pkg.countries : [];
    const regionGroup = typeof pkg.regionGroup === "string" ? pkg.regionGroup.trim() : "";
    const region = typeof pkg.region === "string" ? pkg.region.trim() : "";

    const isEmojiOnly = (value) => {
      const s = String(value || "").trim();
      if (!s) return false;
      try {
        return /^\p{Extended_Pictographic}+$/u.test(s);
      } catch {
        return /^[\uD800-\uDBFF][\uDC00-\uDFFF]+$/.test(s);
      }
    };

    const seen = new Set();
    const cleaned = [];
    for (const item of raw) {
      const s = typeof item === "string" ? item.trim() : "";
      if (!s) continue;
      if (isEmojiOnly(s)) continue;
      if (regionGroup && s === regionGroup) continue;
      if (region && s === region) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(s);
    }
    return cleaned;
  };

  const displayCountries = getDisplayCountries();

  const handleGoToCheckoutPage = async () => {
    setCheckoutError("");
    try {
      await router.push({
        pathname: "/checkout",
        query: {
          packageId: pkg.id,
          name: pkg.name,
          price: pkg.price,
          currency: "eur"
        }
      });
      if (typeof onClose === "function") onClose();
    } catch (e) {
      setCheckoutError("Could not open checkout page. Please try again.");
    }
  };

  const handleStripeCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          name: pkg.name,
          price: pkg.price,
          // Adjust currency if needed, e.g. "usd"
          currency: "eur"
        })
      });

      if (!res.ok) {
        setCheckoutError("Could not start checkout. Please try again.");
        return;
      }

      const data = await res.json();
      if (data && data.url) {
        window.location.assign(data.url);
      } else {
        setCheckoutError("Checkout link unavailable. Please try again.");
      }
    } catch (e) {
      setCheckoutError("Error connecting to payment provider. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          <h2>Checkout</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-intro">
            You selected the <strong>{pkg.name}</strong> package.
          </p>
          <div className="modal-summary">
            <div>
              <div className="modal-summary-label">Region</div>
              <div className="modal-summary-value">{pkg.region}</div>
            </div>
            <div>
              <div className="modal-summary-label">Data</div>
              <div className="modal-summary-value">{pkg.data}</div>
            </div>
            <div>
              <div className="modal-summary-label">Duration</div>
              <div className="modal-summary-value">{pkg.duration}</div>
            </div>
            <div>
              <div className="modal-summary-label">Price</div>
              <div className="modal-summary-value">{pkg.price}</div>
            </div>
          </div>
          {Array.isArray(pkg.countryDetails) && pkg.countryDetails.length > 0 ? (
            <div style={{ marginTop: "0.9rem" }}>
              <div className="modal-summary-label">Coverage by country</div>
              <ul className="modal-country-list">
                {pkg.countryDetails.map((c) => (
                  <li key={c.name} className="modal-country-item">
                    <div className="modal-country-header">
                      <span className="modal-country-name">
                        {/* Optional icon/identifier before the country name, e.g. "albanian_flag_icon Albania" */}
                        {c.icon || c.flag ? `${c.icon || c.flag} ${c.name}` : c.name}
                      </span>
                    </div>
                    <div className="modal-country-operators">
                      Operators:{" "}
                      {Array.isArray(c.operators) && c.operators.length > 0
                        ? c.operators.join(", ")
                        : Array.isArray(pkg.operators) && pkg.operators.length > 0
                        ? pkg.operators.join(", ")
                        : "Not specified"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              {displayCountries.length > 0 && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.86rem" }}>
                  <div className="modal-summary-label">Included countries</div>
                  <div className="modal-summary-value">
                    {displayCountries.join(", ")}
                  </div>
                </div>
              )}
              {Array.isArray(pkg.operators) && pkg.operators.length > 0 && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.86rem" }}>
                  <div className="modal-summary-label">Supported operators</div>
                  <div className="modal-summary-value">
                    {pkg.operators.join(", ")}
                  </div>
                </div>
              )}
            </>
          )}
          {checkoutError && (
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.86rem",
                color: "#b91c1c"
              }}
            >
              {checkoutError}
            </div>
          )}
        </div>
        <div
          className="modal-footer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "0.5rem",
            marginTop: "0.75rem"
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={handleGoToCheckoutPage}
            style={{ width: "100%" }}
          >
            Continue to checkout
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleStripeCheckout}
            disabled={isCheckingOut}
            style={{ width: "100%" }}
          >
            {isCheckingOut ? "Redirecting…" : "Quick pay (card)"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ width: "100%" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


