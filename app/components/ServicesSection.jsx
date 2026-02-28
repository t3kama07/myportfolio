export default function ServicesSection({ services, title, ariaLabel }) {
  return (
    <section className="section shell" id="what-doing">
      <div className="glass-card doing-section">
        <h2>{title}</h2>
        <div className="doing-pills" aria-label={ariaLabel}>
          {services.map((service) => (
            <span key={service}>{service}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
