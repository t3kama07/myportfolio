export default function HeroSection() {
  return (
    <section className="hero shell" id="about">
      <div className="hero-left">
        <h1>Hi, I&apos;m Manjula</h1>
        <p className="hero-kicker">Web Developer</p>
        <p className="hero-description">
          I specialize in building user-friendly, performant web applications.
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href="#projects">
            View My Work
          </a>
          <a className="btn btn-secondary" href="#contact">
            Contact Me
          </a>
        </div>
      </div>

      <div className="hero-right" aria-hidden="true">
        <div className="hero-image-wrap">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=1200&q=80"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}

