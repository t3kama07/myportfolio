import ContactSection from "../../components/ContactSection";
import Navbar from "../../components/Navbar";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        en: "/en/contact",
        fi: "/fi/contact",
        "x-default": "/en/contact",
      },
    },
    openGraph: {
      url: `/${locale}/contact`,
      title: `${dict.meta.contactTitle} | Manjula`,
      description: dict.meta.contactDescription,
    },
  };
}

export default async function LocalizedContactPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/contact" />
      <h1 className="sr-only">{dict.meta.contactTitle}</h1>
      <ContactSection locale={locale} contactSection={dict.contactSection} footer={dict.footer} />
    </main>
  );
}
