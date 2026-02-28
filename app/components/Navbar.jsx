export default function Navbar({ locale, nav, currentPath = "/" }) {
  const enPath = `/en${currentPath === "/" ? "" : currentPath}`;
  const fiPath = `/fi${currentPath === "/" ? "" : currentPath}`;

  return (
    <header className="navbar">
      <div className="nav-content shell">
        <a className="nav-brand" href={`/${locale}`}>
          MANJULA
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href={`/${locale}/#projects`}>{nav.projects}</a>
          <a href={`/${locale}/#skills`}>{nav.skills}</a>
          <a href={`/${locale}/#contact`}>{nav.contact}</a>
        </nav>
        <div className="lang-switch" role="group" aria-label={nav.languageSwitch}>
          <a className={`lang-btn${locale === "en" ? " is-active" : ""}`} href={enPath} aria-current={locale === "en" ? "page" : undefined}>
            EN
          </a>
          <a className={`lang-btn${locale === "fi" ? " is-active" : ""}`} href={fiPath} aria-current={locale === "fi" ? "page" : undefined}>
            FI
          </a>
        </div>
        <a className="btn btn-primary btn-cv" href={`/${locale}/contact`}>
          {nav.requestCv}
        </a>
      </div>
    </header>
  );
}
