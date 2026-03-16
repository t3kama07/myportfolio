import { permanentRedirect } from "next/navigation";

export default function ContactPage() {
  permanentRedirect("/en#contact");
}
