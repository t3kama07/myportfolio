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
    </section>
  );
}
