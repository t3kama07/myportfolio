export default function ServicesSection({ services }) {
  return (
    <section className="section shell" id="what-doing">
      <div className="glass-card doing-section">
        <h2>What I&apos;m Doing</h2>
        <div className="doing-pills" aria-label="What I am doing">
          {services.map((service) => (
            <span key={service}>{service}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

