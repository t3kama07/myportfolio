import { permanentRedirect } from "next/navigation";

export default function InvoiceGeneratorRedirectPage() {
  permanentRedirect("/en/tools/invoice-generator");
}
