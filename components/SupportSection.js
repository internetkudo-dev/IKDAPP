import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

export default function SupportSection() {
  const { language } = useLanguage();
  const t = getTranslations(language, "supportSection");

  return (
    <section className="section support-shell" id="support">
      <div className="container support-inner">
        <div className="support-copy">
          <div className="section-eyebrow">{t.eyebrow}</div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-description support-description">
            {t.description}
          </p>
          <ul className="support-list">
            <li>{t.emailLabel}</li>
            <li>{t.avgReply}</li>
          </ul>
        </div>
        <form
          className="support-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="support-form-title">{t.formTitle}</div>
          <label className="support-field">
            <span>{t.nameLabel}</span>
            <input type="text" placeholder={t.namePlaceholder} required />
          </label>
          <label className="support-field">
            <span>Email</span>
            <input type="email" placeholder={t.emailPlaceholder} required />
          </label>
          <label className="support-field">
            <span>{t.messageLabel}</span>
            <textarea
              rows={3}
              placeholder={t.messagePlaceholder}
              required
            />
          </label>
          <button type="submit" className="btn-primary support-submit">
            {t.submitLabel}
          </button>
          <p className="support-footnote">
            {t.footnote}
          </p>
        </form>
      </div>
      <div className="container" style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (typeof document === "undefined") return;
            const faqSection = document.getElementById("faq");
            if (faqSection) {
              faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        >
          {t.deviceButton}
        </button>
        <p className="support-footnote" style={{ marginTop: "0.6rem" }}>
          {t.deviceAlert}
        </p>
      </div>
    </section>
  );
}


