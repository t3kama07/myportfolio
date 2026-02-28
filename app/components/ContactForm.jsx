export default function ContactForm({ formText }) {
  return (
    <form className="contact-form">
      <input type="text" placeholder={formText.name} />
      <input type="email" placeholder={formText.email} />
      <textarea placeholder={formText.message} rows="4" />
      <button type="button" className="btn btn-primary">
        {formText.send}
      </button>
    </form>
  );
}
