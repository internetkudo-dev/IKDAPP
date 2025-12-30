import { useEffect, useState } from "react";
import { FAQ } from "../data/faq";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

export default function FAQSection() {
  const { language } = useLanguage();
  const t = getTranslations(language, "faqSection");
  const items = Array.isArray(t.items) && t.items.length > 0 ? t.items : FAQ;
  const [openId, setOpenId] = useState(items[0]?.id);

  useEffect(() => {
    setOpenId(items[0]?.id);
  }, [items]);

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">{t.eyebrow}</div>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-description">{t.description}</p>
        </div>
        <div className="faq-list" role="list">
          {items.map((item) => {
            const open = item.id === openId;
            return (
              <article key={item.id} className="faq-item" role="listitem">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">{open ? "−" : "+"}</span>
                </button>
                {open && <p className="faq-answer">{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


