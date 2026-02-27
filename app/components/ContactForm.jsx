export default function ContactForm() {
  return (
    <form className="contact-form">
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <textarea placeholder="Message" rows="4" />
      <button type="button" className="btn btn-primary">
        Send Message
      </button>
    </form>
  );
}

