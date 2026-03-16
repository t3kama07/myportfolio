import { isValidLocale } from "@/lib/i18n";
import { notFound, permanentRedirect } from "next/navigation";

export default async function LocalizedProjectsPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  permanentRedirect(`/${locale}#projects`);
}
