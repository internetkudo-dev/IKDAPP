import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

function pickString(value) {
  return typeof value === "string" ? value : "";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslations(language, "checkout");

  const packageId = pickString(router.query.packageId);
  const name = pickString(router.query.name);
  const price = pickString(router.query.price);
  const currency = pickString(router.query.currency) || "eur";

  const hasSelection = useMemo(() => {
    return Boolean(packageId && name && price);
  }, [packageId, name, price]);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleStripeCheckout = async () => {
    if (!hasSelection || isCheckingOut) return;
    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          name,
          price,
          currency
        })
      });

      if (!res.ok) {
        setCheckoutError(t.startError || "Could not start checkout. Please try again.");
        return;
      }

      const data = await res.json();
      if (data && data.url) {
        window.location.assign(data.url);
      } else {
        setCheckoutError(t.linkError || "Checkout link unavailable. Please try again.");
      }
    } catch (e) {
      setCheckoutError(t.connectError || "Error connecting to payment provider. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Layout>
      <section className="section checkout-shell">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">{t.eyebrow || "Checkout"}</div>
            <h1 className="section-title">{t.title || "Checkout"}</h1>
            <p className="section-description">
              {t.description ||
                "Review your selection, then pay securely to complete your order."}
            </p>
          </div>

          {!hasSelection ? (
            <div className="checkout-card">
              <div className="checkout-empty-title">
                {t.noSelectionTitle || "No package selected"}
              </div>
              <p className="checkout-empty-body">
                {t.noSelectionBody ||
                  "Please choose a package first, then continue to checkout."}
              </p>
              <Link href="/#packages">
                <button type="button" className="btn-primary">
                  {t.goToPackages || "View packages"}
                </button>
              </Link>
            </div>
          ) : (
            <div className="checkout-card">
              <div className="checkout-summary">
                <div className="checkout-row">
                  <div className="checkout-label">{t.packageLabel || "Package"}</div>
                  <div className="checkout-value">{name}</div>
                </div>
                <div className="checkout-row">
                  <div className="checkout-label">{t.priceLabel || "Price"}</div>
                  <div className="checkout-value">{price}</div>
                </div>
              </div>

              {checkoutError && <div className="checkout-error">{checkoutError}</div>}

              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStripeCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? t.redirecting || "Redirecting…" : t.payButton || "Pay with card"}
                </button>
                <Link href="/#packages">
                  <button type="button" className="btn-secondary">
                    {t.changeSelection || "Change selection"}
                  </button>
                </Link>
              </div>

              <div className="checkout-fineprint">
                {t.fineprint ||
                  "You’ll be redirected to our payment provider to complete your purchase."}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}


