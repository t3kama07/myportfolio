export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="footer-panel">
      <div className="footer-grid">
        <div className="footer-col">
          <h3>Manjula</h3>
          <p>Web Developer</p>
          <p>Helsinki, Finland</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="/#projects">Projects</a>
          <a href="/cv.pdf">Download CV</a>
          <a href="/#contact">Contact</a>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <a href="mailto:manjula.dev@gmail.com">manjula.dev@gmail.com</a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <div className="footer-meta">
        <span>© {year} Manjula</span>
        <span>Built with Next.js</span>
      </div>
    </div>
  );
}
