import Footer from "../../../components/Footer";
import ImageToWebpTool from "../../../components/ImageToWebpTool";
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
  const pagePath = `/${locale}/tools/image-to-webp`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle = locale === "fi" ? "PNG/JPG kuvat WebP-muotoon ilmaiseksi" : "Free PNG/JPG to WebP Converter";
  const keywords =
    locale === "fi"
      ? [
          "kuva webp muunnin",
          "png webp",
          "jpg webp",
          "jpeg webp",
          "png to webp",
          "jpg to webp",
          "jpeg to webp",
          "convert to webp",
          "convert png to webp",
          "ilmainen webp muunnin",
          "Manjula tyokalut",
        ]
      : [
          "image to webp converter",
          "jpg to webp",
          "png to webp",
          "jpeg to webp",
          "convert to webp",
          "convert png to webp",
          "online webp converter",
          "free webp converter",
          "convert image to webp",
          "Manjula tools",
        ];

  return {
    title: seoTitle,
    description: dict.meta.imageToWebpDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/image-to-webp",
        fi: "/fi/tools/image-to-webp",
        "x-default": "/en/tools/image-to-webp",
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
      title: `${dict.meta.imageToWebpTitle} | Manjula`,
      description: dict.meta.imageToWebpDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: dict.meta.imageToWebpTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.imageToWebpTitle} | Manjula`,
      description: dict.meta.imageToWebpDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedImageToWebpPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/image-to-webp`;
  const faqItems = Array.isArray(dict.imageToWebp?.faqItems)
    ? dict.imageToWebp.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const imageToWebpJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.imageToWebpTitle,
    description: dict.meta.imageToWebpDescription,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
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
        name: dict.meta.imageToWebpTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/image-to-webp" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageToWebpJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <h1 className="sr-only">{dict.meta.imageToWebpTitle}</h1>
      <ImageToWebpTool text={dict.imageToWebp} />
      {faqItems.length ? (
        <section className="section shell" id="webp-faq">
          <div className="glass-card webp-faq-wrap">
            <h2>{dict.imageToWebp.faqTitle}</h2>
            <p className="section-subtitle">{dict.imageToWebp.faqSubtitle}</p>
            <div className="webp-faq-list">
              {faqItems.map((item) => (
                <article className="webp-faq-item" key={item.question}>
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
