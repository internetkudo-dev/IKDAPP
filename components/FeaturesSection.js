import { FEATURES } from "../data/features";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

const FEATURE_ICONS = {
  "Instant activation": "⚡",
  "Clear, upfront pricing": "💸",
  "Works on modern phones": "📱"
};

export default function FeaturesSection() {
  const { language } = useLanguage();
  const t = getTranslations(language, "featuresSection");
  const items = Array.isArray(t.items) && t.items.length > 0 ? t.items : FEATURES;

  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">{t.eyebrow}</div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-description">{t.description}</p>
        </div>
        <div className="features-grid">
          {items.map((f, index) => {
            const fallback = FEATURES[index];
            const iconTitle = fallback ? fallback.title : f.title;
            const icon = FEATURE_ICONS[iconTitle] || "●";
            return (
              <article key={f.id || f.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  {icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

