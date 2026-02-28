export default function Footer({ locale, footer }) {
  const year = new Date().getFullYear();

  return (
    <div className="footer-panel">
      <div className="footer-grid">
        <div className="footer-col">
          <h3>{footer.name}</h3>
          <p>{footer.role}</p>
          <p>{footer.location}</p>
        </div>

        <div className="footer-col">
          <h4>{footer.quickLinks}</h4>
          <a href={`/${locale}/#projects`}>{footer.projects}</a>
          <a href={`/${locale}/contact`}>{footer.requestCv}</a>
          <a href={`/${locale}/#contact`}>{footer.contact}</a>
        </div>

        <div className="footer-col">
          <h4>{footer.contactHeading}</h4>
          <a href="mailto:manjula.dev@gmail.com">manjula.dev@gmail.com</a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {footer.linkedin}
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            {footer.github}
          </a>
        </div>
      </div>

      <div className="footer-meta">
        <span>&copy; {year} Manjula</span>
        <span>{footer.builtWith}</span>
      </div>
    </div>
  );
}
