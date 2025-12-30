import { useMemo, useState } from "react";
import { PACKAGES } from "../data/packages";
import PackageModal from "./PackageModal";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

export default function Hero({ packages = PACKAGES }) {
  const [selected, setSelected] = useState(null);
  const { language } = useLanguage();
  const t = getTranslations(language, "hero");

  const featuredPackage = useMemo(() => {
    const source = Array.isArray(packages) && packages.length > 0 ? packages : PACKAGES;
    return source.find((p) => p.highlighted) || source[0];
  }, [packages]);

  return (
    <>
      <section className="hero-shell">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="hero-pill">{t.pill}</div>
            <h1 className="hero-title">
              {t.titleMain}
              <span className="hero-gradient">{t.titleHighlight}</span>
            </h1>
            <p className="hero-subtitle">
              {t.subtitle}
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (typeof document === "undefined") return;
                  const el = document.getElementById("packages");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.primaryCta}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (typeof document === "undefined") return;
                  const el = document.getElementById("how-it-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.secondaryCta}
              </button>
            </div>
            <p className="hero-footnote">
              {t.footnote}
            </p>
          </div>
          <div className="hero-card">
            <div className="hero-card-header">
              <span className="hero-card-label">{t.featuredLabel}</span>
              <span className="hero-card-region">
                {featuredPackage.regionGroup
                  ? `${featuredPackage.regionGroup} · ${featuredPackage.region}`
                  : featuredPackage.region}
              </span>
            </div>
            <div className="hero-card-main">
              <div>
                <div className="hero-card-data">{featuredPackage.data}</div>
                <div className="hero-card-duration">
                  {featuredPackage.duration}
                </div>
              </div>
              <div className="hero-card-price">
                <span className="hero-card-amount">{featuredPackage.price}</span>
                <span className="hero-card-note">{t.oneTime}</span>
              </div>
            </div>
            <ul className="hero-card-list">
              {featuredPackage.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-primary"
              style={{ width: "100%", marginTop: "0.75rem" }}
              onClick={() => setSelected(featuredPackage)}
            >
              {t.buyFeatured}
            </button>
          </div>
        </div>
      </section>
      <PackageModal
        open={!!selected}
        pkg={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}


