export default function HeroSection({ locale, hero }) {
  return (
    <section className="hero shell" id="about">
      <div className="hero-left">
        <h1>{hero.title}</h1>
        <p className="hero-kicker">{hero.kicker}</p>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-cta">
          <a className="btn btn-primary" href={`/${locale}/#projects`}>
            {hero.viewWork}
          </a>
          <a className="btn btn-secondary" href={`/${locale}/#contact`}>
            {hero.contactMe}
          </a>
        </div>
      </div>
    </section>
  );
}
