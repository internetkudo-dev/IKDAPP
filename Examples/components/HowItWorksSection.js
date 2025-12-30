import { STEPS } from "../data/howItWorks";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

export default function HowItWorksSection() {
  const { language } = useLanguage();
  const t = getTranslations(language, "howItWorksSection");
  const steps = Array.isArray(t.steps) && t.steps.length > 0 ? t.steps : STEPS;

  return (
    <section className="section howit-shell" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">{t.eyebrow}</div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-description">{t.description}</p>
        </div>
        <div className="howit-grid">
          {steps.map((s) => (
            <article key={s.id || s.step} className="howit-card">
              <div className="howit-step">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


