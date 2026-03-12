import Footer from "../../../components/Footer";
import InvoiceGeneratorTool from "../../../components/InvoiceGeneratorTool";
import Navbar from "../../../components/Navbar";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pagePath = `/${locale}/tools/invoice-generator`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle = locale === "fi" ? "Ilmainen laskugeneraattori verkossa" : "Free Online Invoice Generator";
  const keywords =
    locale === "fi"
      ? [
          "laskugeneraattori",
          "ilmainen laskugeneraattori",
          "verkkolaskugeneraattori",
          "invoice generator",
          "free invoice generator",
          "online invoice generator",
          "free online invoice generator",
          "invoice generator free",
          "invoice generator online",
          "lasku pdf",
          "verkkolasku tyokalu",
          "invoice pdf download",
          "Manjula tyokalut",
        ]
      : [
          "invoice generator",
          "free invoice generator",
          "invoice generator free",
          "online invoice generator",
          "free online invoice generator",
          "invoice generator online",
          "invoice maker",
          "invoice template",
          "invoice pdf download",
          "online invoice creator",
          "free invoice tool",
          "PDF invoice generator",
          "Manjula tools",
        ];
  const ogImageAlt = locale === "fi" ? "Laskugeneraattori, tekijana Manjula" : "Invoice Generator by Manjula";

  return {
    title: seoTitle,
    description: dict.meta.invoiceGeneratorDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/invoice-generator",
        fi: "/fi/tools/invoice-generator",
        "x-default": "/en/tools/invoice-generator",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "Manjula",
      locale: locale === "fi" ? "fi_FI" : "en_US",
      alternateLocale: locale === "fi" ? ["en_US"] : ["fi_FI"],
      title: `${dict.meta.invoiceGeneratorTitle} | Manjula`,
      description: dict.meta.invoiceGeneratorDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.invoiceGeneratorTitle} | Manjula`,
      description: dict.meta.invoiceGeneratorDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedInvoiceGeneratorPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/invoice-generator`;
  const faqItems = Array.isArray(dict.invoiceGenerator?.faqItems)
    ? dict.invoiceGenerator.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const invoiceToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.invoiceGeneratorTitle,
    description: dict.meta.invoiceGeneratorDescription,
    url: pageUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    isAccessibleForFree: true,
    creator: {
      "@type": "Person",
      name: "Manjula",
      url: siteUrl,
    },
  };
  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "fi" ? "Etusivu" : "Home",
        item: `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "fi" ? "Tyokalut" : "Tools",
        item: `${siteUrl}/${locale}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dict.meta.invoiceGeneratorTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/invoice-generator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(invoiceToolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <h1 className="sr-only">{dict.meta.invoiceGeneratorTitle}</h1>
      <InvoiceGeneratorTool locale={locale} text={dict.invoiceGenerator} />
      {faqItems.length ? (
        <section className="section shell" id="invoice-faq">
          <div className="glass-card invoice-faq-wrap">
            <h2>{dict.invoiceGenerator.faqTitle}</h2>
            <p className="section-subtitle">{dict.invoiceGenerator.faqSubtitle}</p>
            <div className="invoice-faq-list">
              {faqItems.map((item) => (
                <article className="invoice-faq-item" key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
