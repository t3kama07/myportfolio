export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-content shell">
        <a className="nav-brand" href="#top">
          MANJULA
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="lang-switch" role="group" aria-label="Language switch">
          <button type="button" className="lang-btn is-active" aria-pressed="true">
            EN
          </button>
          <button type="button" className="lang-btn" aria-pressed="false">
            FI
          </button>
        </div>
        <a className="btn btn-primary btn-cv" href="/cv.pdf">
          Download CV
        </a>
      </div>
    </header>
  );
}

