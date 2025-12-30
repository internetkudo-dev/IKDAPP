export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-shell" id="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <div className="brand-mark brand-mark-footer">
            <span className="brand-dot" />
            <span className="brand-text">DataKudo</span>
          </div>
          <p className="footer-copy">
            High-speed mobile data packages with simple, transparent pricing.
          </p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <div className="footer-heading">Product</div>
            <a href="#packages">Packages</a>
            <a href="#how-it-works">How it works</a>
          </div>
          <div className="footer-column">
            <div className="footer-heading">Company</div>
            <a href="#coverage">Coverage</a>
            <a href="#support">Support</a>
          </div>
          <div className="footer-column">
            <div className="footer-heading">Legal</div>
            <a href="#support">Terms</a>
            <a href="#support">Privacy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {year} DataKudo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}


