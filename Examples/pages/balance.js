import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

export default function BalancePage() {
  const { language } = useLanguage();
  const t = getTranslations(language, 'balance');
  
  const [iccid, setIccid] = useState("");
  const [iccidError, setIccidError] = useState("");
  const [iccidChecked, setIccidChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [imsi, setImsi] = useState(null);
  const [smsStatus, setSmsStatus] = useState(null);
  
  // Top-up/package purchase states
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [rewardType, setRewardType] = useState("cashback"); // 'cashback' | 'discount' | 'coupon'
  const [couponCode, setCouponCode] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Check if ICCID is in URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlIccid = urlParams.get('iccid');
    if (urlIccid) {
      setIccid(urlIccid);
      // Automatically check the ICCID from URL
      handleCheckIccidWithValue(urlIccid);
    }
  }, []);

  // Load logged-in account email from localStorage (set on account page)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("ikd-user-email") || "";
        setUserEmail(stored);
      }
    } catch {
      setUserEmail("");
    }
  }, []);

  // Load available packages when user wants to top up
  useEffect(() => {
    if (showTopUp && availablePackages.length === 0) {
      loadAvailablePackages();
    }
  }, [showTopUp]);

  const handleCheckIccidWithValue = async (iccidValue) => {
    setIccidError("");
    setLoading(true);
    setIccidChecked(false);
    setPackageData(null);
    setPurchaseSuccess(false);
    setShowTopUp(false);

    const trimmed = iccidValue.trim();
    if (!trimmed || trimmed.length < 10) {
      setIccidError(t.errorIccid);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/iccid/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iccid: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIccidError(data.error || t.errorConnection);
        setLoading(false);
        return;
      }

      if (data.success) {
        setPackageData(data.packages);
        setImsi(data.imsi);
        setSmsStatus(data.smsStatus);
        setIccidChecked(true);
      } else {
        setIccidError(t.errorNoData);
      }
    } catch (error) {
      setIccidError(t.errorConnection);
      console.error('Error checking ICCID:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIccid = (e) => {
    e.preventDefault();
    handleCheckIccidWithValue(iccid);
  };

  const loadAvailablePackages = async () => {
    setLoadingPackages(true);
    setIccidError("");

    try {
      const response = await fetch('/api/packages/list');
      const data = await response.json();

      if (response.ok && data.success) {
        setAvailablePackages(data.packages);
      } else {
        setIccidError(data.error || t.errorConnection);
      }
    } catch (err) {
      setIccidError(t.errorConnection);
      console.error('Error loading packages:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handlePurchase = async (pkg) => {
    if (!iccid || iccid.trim().length < 10) {
      setIccidError(t.errorIccid);
      return;
    }

    if (!userEmail) {
      setIccidError(
        "Please log in to your account before purchasing a package."
      );
      return;
    }

    setSelectedPackage(pkg);
    setPurchasing(true);
    setIccidError("");
    setPurchaseSuccess(false);

    try {
      const response = await fetch('/api/packages/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iccid: iccid.trim(),
          packageTemplateId: pkg.id,
          validityPeriod: pkg.validityDays,
          packageName: pkg.name,
          email: userEmail,
          price: pkg.cost,
          rewardType,
          couponCode: rewardType === "coupon" ? couponCode.trim() : ""
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPurchaseSuccess(true);
        setPurchaseResult(data);
        // Reload the ICCID check to show the new package
        setTimeout(() => {
          setShowTopUp(false);
          handleCheckIccidWithValue(iccid.trim());
        }, 3000);
      } else {
        setIccidError(data.error || t.errorConnection);
      }
    } catch (err) {
      setIccidError(t.errorConnection);
      console.error('Error purchasing package:', err);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Layout>
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: "1.75rem" }}>
            <div className="section-eyebrow">{t.eyebrow}</div>
            <h2 className="section-title">{t.title}</h2>
            <p className="section-description">
              {t.description}
            </p>
          </div>

          <div 
            style={{ 
              maxWidth: showTopUp ? "100%" : "650px",
              margin: "0 auto"
            }}
          >
            {/* ICCID Input Card */}
            <div
              className="package-card"
              style={{ 
                padding: "2rem",
                marginBottom: "2rem",
                background: "radial-gradient(circle at top left, rgba(0, 79, 254, 0.08), rgba(2, 4, 10, 0.95))",
                border: "1px solid rgba(0, 79, 254, 0.3)"
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem",
                marginBottom: "1.25rem" 
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #004ffe, #6ef825)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem"
                }}>
                  📱
                </div>
                <h3 style={{ 
                  fontSize: "1.15rem", 
                  fontWeight: "600",
                  margin: 0,
                  color: "#e5e7eb"
                }}>
                  {t.iccidTitle}
                </h3>
              </div>
              
              <form onSubmit={handleCheckIccid}>
                <div style={{ marginBottom: "1rem" }}>
                  <label 
                    htmlFor="iccid-input"
                    style={{ 
                      display: "block",
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      marginBottom: "0.5rem",
                      fontWeight: "500"
                    }}
                  >
                    {t.iccidLabel}
                  </label>
                  <input
                    id="iccid-input"
                    type="text"
                    value={iccid}
                    onChange={(e) => setIccid(e.target.value)}
                    placeholder={t.iccidPlaceholder}
                    disabled={loading || purchasing}
                    style={{
                      width: "100%",
                      padding: "0.875rem 1rem",
                      fontSize: "1rem",
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      border: "2px solid rgba(0, 79, 254, 0.3)",
                      borderRadius: "12px",
                      color: "#e5e7eb",
                      transition: "all 0.2s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(0, 79, 254, 0.6)";
                      e.target.style.backgroundColor = "rgba(15, 23, 42, 0.9)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(0, 79, 254, 0.3)";
                      e.target.style.backgroundColor = "rgba(15, 23, 42, 0.6)";
                    }}
                  />
                </div>

                {/* Email is taken from logged-in account; no email input here */}

                {iccidError && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.875rem 1rem",
                      background: "linear-gradient(135deg, rgba(127, 29, 29, 0.2), rgba(127, 29, 29, 0.1))",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      color: "#fca5a5",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                    <span>{iccidError}</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ 
                    width: "100%",
                    padding: "1rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  disabled={loading || purchasing}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span style={{ 
                        width: "16px", 
                        height: "16px", 
                        border: "2px solid #fff", 
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }} />
                      {t.checking}
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span>🔍</span>
                      {t.checkButton}
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Loading state */}
            {loading && (
              <p
                className="section-description"
                style={{ marginBottom: "1rem", textAlign: "center" }}
              >
                {t.checking}
              </p>
            )}

            {/* Purchase Success Message */}
            {purchaseSuccess && purchaseResult && (
              <div
                style={{
                  marginBottom: "2rem",
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, rgba(6, 95, 70, 0.3), rgba(6, 95, 70, 0.1))",
                  border: "2px solid rgba(110, 248, 37, 0.4)",
                  borderRadius: "16px",
                  fontSize: "0.9rem",
                  color: "#d1fae5"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  marginBottom: "0.75rem" 
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6ef825, #004ffe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem"
                  }}>
                    ✓
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "1.1rem" }}>
                      {t.success}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>
                      {t.successMessage}
                    </p>
                  </div>
                </div>
                <p style={{ margin: "0.5rem 0", fontSize: "0.875rem" }}>
                  {t.refreshing}
                </p>
                {purchaseResult.smsStatus === 'sent' && (
                  <p style={{ margin: "0.5rem 0", fontSize: "0.85rem", opacity: 0.85 }}>
                    📱 {t.smsConfirmed}
                  </p>
                )}
              </div>
            )}

            {/* Once ICCID is checked, show the data */}
            {iccidChecked && packageData && !showTopUp && (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(110, 248, 37, 0.2), rgba(0, 79, 254, 0.2))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem"
                  }}>
                    📊
                  </div>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      margin: 0,
                      color: "#e5e7eb",
                      fontWeight: "600"
                    }}
                  >
                    {t.yourPackages}
                  </h3>
                </div>

                {/* Display all packages as cards */}
                <div className="packages-grid" style={{ marginBottom: "1.5rem" }}>
                  {packageData.map((pkg, index) => {
                    const usagePercent = Math.min((pkg.usedData / pkg.totalData) * 100, 100);
                    const remainingData = Math.max(pkg.totalData - pkg.usedData, 0);
                    const isLowData = usagePercent > 80;

                    return (
                      <article
                        key={index}
                        className="package-card"
                        style={{ padding: "1.3rem 1.2rem" }}
                      >
                        <div className="package-chip-row">
                          <span className="package-region">{t.packageNumber}{index + 1}</span>
                          <span 
                            className="package-chip"
                            style={{
                              background: isLowData ? "rgba(239, 68, 68, 0.15)" : "rgba(110, 248, 37, 0.15)",
                              color: isLowData ? "#fca5a5" : "#bbf7d0",
                              borderColor: isLowData ? "rgba(239, 68, 68, 0.6)" : "rgba(110, 248, 37, 0.6)"
                            }}
                          >
                            {isLowData ? t.lowData : t.active}
                          </span>
                        </div>
                        
                        <h3 className="package-name">{pkg.name}</h3>
                        
                        <div className="package-main" style={{ marginBottom: "1rem" }}>
                          <div>
                            <div className="package-data">
                              {remainingData.toFixed(2)} GB
                            </div>
                            <div className="package-duration">{t.remaining}</div>
                          </div>
                          <div className="package-price">
                            <div style={{ fontSize: "1.1rem", color: "#e5e7eb" }}>
                              {pkg.totalData.toFixed(2)} GB
                            </div>
                            <span className="package-note">{t.total}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderRadius: "999px",
                            overflow: "hidden",
                            marginBottom: "0.75rem"
                          }}
                        >
                          <div
                            style={{
                              width: `${usagePercent}%`,
                              height: "100%",
                              background: isLowData 
                                ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                                : "linear-gradient(135deg, #004ffe, #6ef825)",
                              transition: "width 0.5s ease"
                            }}
                          />
                        </div>

                        <div style={{ fontSize: "0.86rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
                          <strong style={{ color: "#e5e7eb" }}>{t.used}:</strong> {pkg.usedData.toFixed(2)} GB ({usagePercent.toFixed(1)}%)
                        </div>
                        
                        <div style={{ fontSize: "0.86rem", color: "#9ca3af" }}>
                          <strong style={{ color: "#e5e7eb" }}>{t.expires}:</strong> {pkg.expirationDate}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Summary card */}
                <div className="modal-summary" style={{ marginBottom: "1.2rem" }}>
                  <div>
                    <div className="modal-summary-label">{t.totalPackages}</div>
                    <div className="modal-summary-value">{packageData.length}</div>
                  </div>
                  <div>
                    <div className="modal-summary-label">{t.iccidLabel}</div>
                    <div className="modal-summary-value" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                      {iccid.trim()}
                    </div>
                  </div>
                </div>

                {/* Show IMSI if available */}
                {imsi && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "0.7rem",
                      fontSize: "0.86rem",
                      marginBottom: "1rem",
                      border: "1px solid rgba(0, 79, 254, 0.3)"
                    }}
                  >
                    <span style={{ color: "#9ca3af" }}>
                      <strong style={{ color: "#e5e7eb" }}>IMSI:</strong> {imsi}
                    </span>
                  </div>
                )}
                
                {/* SMS status messages */}
                {smsStatus === 'sent' && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "#065f46",
                      borderRadius: "0.7rem",
                      fontSize: "0.86rem",
                      color: "#d1fae5",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>✓</span>
                    <span>{t.smsConfirmed}</span>
                  </div>
                )}
                
                {smsStatus === 'failed' && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "#7f1d1d",
                      borderRadius: "0.7rem",
                      fontSize: "0.86rem",
                      color: "#fca5a5",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>✗</span>
                    <span>SMS confirmation failed</span>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                  <button
                    className="btn-primary"
                    onClick={() => setShowTopUp(true)}
                    style={{
                      width: "100%",
                      padding: "1rem 1.25rem",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span>🛒</span>
                    <span>{t.buyPackage}</span>
                  </button>
                  <a
                    href={`https://gjendja.internetkudo.com/?iccid=${iccid.trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      padding: "1rem 1.25rem",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      gap: "0.5rem"
                    }}
                  >
                    <span>🌐</span>
                    <span>{t.ourSite}</span>
                  </a>
                </div>
              </>
            )}

            {/* Top-up Section - Show available packages */}
            {showTopUp && (
              <>
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem 1.1rem",
                    borderRadius: "0.9rem",
                    border: "1px solid rgba(0, 79, 254, 0.45)",
                    background:
                      "radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(2, 4, 10, 0.95))"
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.86rem",
                      marginBottom: "0.6rem",
                      color: "#e5e7eb",
                      fontWeight: 500
                    }}
                  >
                    Choose your reward for this purchase
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem"
                    }}
                  >
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setRewardType("cashback")}
                      style={{
                        padding: "0.55rem 0.9rem",
                        fontSize: "0.85rem",
                        borderColor:
                          rewardType === "cashback"
                            ? "rgba(110, 248, 37, 0.8)"
                            : undefined,
                        boxShadow:
                          rewardType === "cashback"
                            ? "0 0 0 1px rgba(110, 248, 37, 0.4)"
                            : "none"
                      }}
                    >
                      10% cashback (credit)
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setRewardType("discount")}
                      style={{
                        padding: "0.55rem 0.9rem",
                        fontSize: "0.85rem",
                        borderColor:
                          rewardType === "discount"
                            ? "rgba(59, 130, 246, 0.9)"
                            : undefined,
                        boxShadow:
                          rewardType === "discount"
                            ? "0 0 0 1px rgba(59, 130, 246, 0.5)"
                            : "none"
                      }}
                    >
                      3% instant discount
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setRewardType("coupon")}
                      style={{
                        padding: "0.55rem 0.9rem",
                        fontSize: "0.85rem",
                        borderColor:
                          rewardType === "coupon"
                            ? "rgba(236, 72, 153, 0.9)"
                            : undefined,
                        boxShadow:
                          rewardType === "coupon"
                            ? "0 0 0 1px rgba(236, 72, 153, 0.5)"
                            : "none"
                      }}
                    >
                      Use coupon
                    </button>
                  </div>

                  {rewardType === "coupon" && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        style={{
                          width: "100%",
                          padding: "0.7rem 0.9rem",
                          fontSize: "0.85rem",
                          backgroundColor: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(148, 163, 184, 0.5)",
                          borderRadius: "0.7rem",
                          color: "#e5e7eb"
                        }}
                      />
                    </div>
                  )}
                  <p
                    style={{
                      marginTop: "0.55rem",
                      fontSize: "0.8rem",
                      color: "#9ca3af"
                    }}
                  >
                    Cashback is saved as account credit (linked to your email)
                    and can be used in future versions of the site.
                  </p>
                </div>

                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "2rem",
                  padding: "1.25rem",
                  background: "radial-gradient(circle at top left, rgba(0, 79, 254, 0.08), rgba(2, 4, 10, 0.95))",
                  border: "1px solid rgba(0, 79, 254, 0.3)",
                  borderRadius: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #004ffe, #6ef825)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem"
                    }}>
                      🛍️
                    </div>
                    <h3
                    style={{
                      fontSize: "1.15rem",
                      color: "#e5e7eb",
                      fontWeight: "600",
                      margin: 0
                    }}
                  >
                    {t.availablePackages}
                  </h3>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowTopUp(false)}
                    style={{
                      padding: "0.65rem 1rem",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span>←</span>
                    <span>{t.backButton}</span>
                  </button>
                </div>

                {loadingPackages ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                    <p>{language === 'sq' ? 'Duke ngarkuar pakot...' : 'Loading packages...'}</p>
                  </div>
                ) : (
                  <div className="packages-grid">
                    {availablePackages.map((pkg) => (
                      <article key={pkg.id} className="package-card">
                        <div className="package-chip-row">
                          <span className="package-region">{pkg.locationZone}</span>
                          <span className="package-chip">{pkg.validityDays} ditë</span>
                        </div>
                        
                        <h3 className="package-name">{pkg.name}</h3>
                        <p className="package-bestfor">{pkg.displayName}</p>
                        
                        <div className="package-main">
                          <div>
                            <div className="package-data">{pkg.dataGB} GB</div>
                            <div className="package-duration">{pkg.validityDays} {t.days}</div>
                          </div>
                          <div className="package-price">
                            <div className="package-amount">€{pkg.cost.toFixed(2)}</div>
                            <span className="package-note">{t.price}</span>
                          </div>
                        </div>

                        <ul className="package-features">
                          <li>✓ {pkg.dataGB} GB {t.features.data}</li>
                          <li>✓ {t.features.validity} {pkg.validityDays} {t.days}</li>
                          <li>✓ {t.features.instant}</li>
                          {pkg.sponsor && <li>✓ {pkg.sponsor}</li>}
                        </ul>

                        <button
                          className="btn-primary package-cta"
                          onClick={() => handlePurchase(pkg)}
                          disabled={purchasing || !iccid || iccid.trim().length < 10}
                          style={{
                            opacity: (!iccid || iccid.trim().length < 10) ? 0.5 : 1,
                            cursor: (!iccid || iccid.trim().length < 10) ? 'not-allowed' : 'pointer',
                            fontWeight: "600",
                            padding: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem"
                          }}
                        >
                          {purchasing && selectedPackage?.id === pkg.id ? (
                            <>
                              <span style={{ 
                                width: "14px", 
                                height: "14px", 
                                border: "2px solid #fff", 
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                                animation: "spin 0.6s linear infinite"
                              }} />
                              <span>{t.activating}</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>{t.activateNow}</span>
                            </>
                          )}
                        </button>
                      </article>
                    ))}
                  </div>
                )}

                {availablePackages.length === 0 && !loadingPackages && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "1rem",
                      border: "1px solid rgba(0, 79, 254, 0.45)",
                      color: "#9ca3af"
                    }}
                  >
                    <p>{t.noPackages}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
