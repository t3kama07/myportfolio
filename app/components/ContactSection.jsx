import ContactForm from "./ContactForm";
import Footer from "./Footer";

export default function ContactSection({ locale, contactSection, footer }) {
  return (
    <footer className="contact-footer" id="contact">
      <div className="shell">
        <div className="glass-card contact-card">
          <h2>{contactSection.title}</h2>
          <p>{contactSection.description}</p>
          <ContactForm formText={contactSection.form} />
        </div>
        <Footer locale={locale} footer={footer} withTopSpacing />
      </div>
    </footer>
  );
}
