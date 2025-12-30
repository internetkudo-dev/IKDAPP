import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "../lib/useLanguage";
import { getTranslations } from "../lib/translations";

const SECTIONS = [
  { id: "packages", key: "packages" },
  { id: "how-it-works", key: "howItWorks" },
  { id: "coverage", key: "coverage" },
  { id: "faq", key: "faq" },
  { id: "support", key: "support" }
];

function scrollToSection(id) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Navbar({ theme = "dark", onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { language, changeLanguage } = useLanguage();
  const t = getTranslations(language, 'nav');

  const handleNavClick = (id) => {
    setOpen(false);
    
    // Check if we're on the homepage
    if (router.pathname === "/") {
      // We're on homepage, just scroll
      scrollToSection(id);
    } else {
      // We're on a different page, navigate to homepage with hash
      router.push(`/#${id}`).then(() => {
        // After navigation, scroll to section
        setTimeout(() => {
          scrollToSection(id);
        }, 100);
      });
    }
  };

  return (
    <header className="navbar-shell">
      <div className="container navbar-inner">
        <div className="navbar-left">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="brand-mark" style={{ cursor: "pointer" }}>
              <span className="brand-dot" />
              <span className="brand-text">DataKudo</span>
            </div>
          </Link>
        </div>
        <nav className="navbar-nav-desktop" aria-label="Primary navigation">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className="nav-link"
              type="button"
              onClick={() => handleNavClick(s.id)}
            >
              {t[s.key]}
            </button>
          ))}
          <Link href="/checkout">
            <button className="nav-link" type="button">
              {t.checkout || "Checkout"}
            </button>
          </Link>
          <Link href="/balance">
            <button
              className="nav-link"
              type="button"
            >
              {t.balance}
            </button>
          </Link>
        </nav>
        <div className="navbar-right">
          {/* Language Toggle */}
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={() => changeLanguage(language === 'en' ? 'sq' : 'en')}
            aria-label="Change language"
            title={language === 'en' ? 'Shqip' : 'English'}
            style={{
              fontWeight: "600",
              fontSize: "0.75rem",
              padding: "0 0.5rem"
            }}
          >
            {language === 'en' ? 'SQ' : 'EN'}
          </button>
          
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? (
              // Moon icon
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.7 6.7 0 1 0 9.8 9.8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // Sun icon
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <div className="navbar-cta" style={{ marginRight: "0.25rem" }}>
            <Link href="/account" aria-label="My account">
              <button type="button" className="navbar-icon-btn" aria-label="My account">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 21a8 8 0 1 0-16 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
        <button
          className="navbar-burger"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      {open && (
        <nav className="navbar-nav-mobile" aria-label="Primary navigation">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className="nav-link nav-link-mobile"
              type="button"
              onClick={() => handleNavClick(s.id)}
            >
              {t[s.key]}
            </button>
          ))}
          <Link href="/checkout">
            <button
              type="button"
              className="nav-link nav-link-mobile"
              onClick={() => setOpen(false)}
            >
              {t.checkout || "Checkout"}
            </button>
          </Link>
          <Link href="/balance">
            <button
              type="button"
              className="nav-link nav-link-mobile"
              onClick={() => setOpen(false)}
            >
              {t.balance}
            </button>
          </Link>
          <Link href="/account">
            <button
              type="button"
              className="navbar-icon-btn navbar-mobile-cta"
              style={{ marginTop: "0.5rem" }}
              onClick={() => setOpen(false)}
              aria-label="My account"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 21a8 8 0 1 0-16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          <button
            type="button"
            className="navbar-icon-btn navbar-mobile-cta"
            onClick={() => changeLanguage(language === 'en' ? 'sq' : 'en')}
            aria-label="Change language"
            style={{
              fontWeight: "600",
              fontSize: "0.85rem"
            }}
          >
            {language === 'en' ? '🇦🇱 SQ' : '🇬🇧 EN'}
          </button>
          <button
            type="button"
            className="navbar-icon-btn navbar-mobile-cta"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.7 6.7 0 1 0 9.8 9.8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </nav>
      )}
    </header>
  );
}


