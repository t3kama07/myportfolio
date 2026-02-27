import ContactForm from "./ContactForm";
import Footer from "./Footer";

export default function ContactSection() {
  return (
    <footer className="contact-footer" id="contact">
      <div className="shell">
        <div className="glass-card contact-card">
          <h2>Contact Me</h2>
          <p>Let&apos;s collaborate and build something meaningful together.</p>
          <ContactForm />
        </div>
        <Footer />
      </div>
    </footer>
  );
}

