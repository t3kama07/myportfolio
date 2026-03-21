import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
import HeicToPngTool from "../../../components/HeicToPngTool";
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
  const pagePath = `/${locale}/tools/heic-to-png`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "HEIC PNG-muotoon verkossa | Ilmainen HEIC to PNG Converter"
      : "HEIC to PNG Converter Online | Free HEIC to PNG Tool";
  const keywords =
    locale === "fi"
      ? [
          "heic to png",
          "convert heic to png",
          "heic png muunnin",
          "muunna heic png",
          "heif to png",
          "convert heif to png",
          "heic muunnin",
          "online heic to png",
          "heic to png converter",
          "heic kuva png",
          "what is a heic file",
          "Manjula tyokalut",
        ]
      : [
          "heic to png",
          "convert heic to png",
          "heif to png",
          "convert heif to png",
          "heic to png converter",
          "free heic to png converter",
          "online heic to png",
          "batch heic to png",
          "heic file to png",
          "what is a heic file",
          "png converter",
          "Manjula tools",
        ];
  const ogImageAlt =
    locale === "fi" ? "HEIC PNG-muunnin, tekijana Manjula" : "HEIC to PNG Converter by Manjula";

  return {
    title: seoTitle,
    description: dict.meta.heicToPngDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/heic-to-png",
        fi: "/fi/tools/heic-to-png",
        "x-default": "/en/tools/heic-to-png",
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
      title: seoTitle,
      description: dict.meta.heicToPngDescription,
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
      title: seoTitle,
      description: dict.meta.heicToPngDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedHeicToPngPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/heic-to-png`;
  const faqItems = Array.isArray(dict.heicToPng?.faqItems)
    ? dict.heicToPng.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.heicToPng?.introParagraphs)
    ? dict.heicToPng.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.heicToPng?.heroPoints) ? dict.heicToPng.heroPoints.filter(Boolean) : [];
  const seoSections = Array.isArray(dict.heicToPng?.seoSections)
    ? dict.heicToPng.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.heicToPng?.seoHowTo?.steps)
    ? dict.heicToPng.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const heicToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.heicToPngTitle,
    description: dict.meta.heicToPngDescription,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: locale === "fi" ? "Kuvamuunnin" : "Image Converter",
    operatingSystem: "Web",
    inLanguage: locale,
    isAccessibleForFree: true,
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Person",
      name: "Manjula",
      url: siteUrl,
    },
    featureList: [
      "HEIC to PNG conversion",
      "HEIF to PNG conversion",
      "Batch image conversion",
      "Lossless PNG export",
      "In-browser processing",
      "No file upload",
    ],
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
        name: dict.meta.heicToPngTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/heic-to-png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(heicToolJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <section className="section shell tool-hero-section" id="heic-to-png-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.heicToPng?.heroKicker ? <p className="tool-hero-kicker">{dict.heicToPng.heroKicker}</p> : null}
            <h1>{dict.heicToPng?.heroTitle || dict.meta.heicToPngTitle}</h1>
            {introParagraphs.map((paragraph) => (
              <p className="tool-hero-lead" key={paragraph}>
                {paragraph}
              </p>
            ))}

            {heroPoints.length ? (
              <ul className="tool-hero-points">
                {heroPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}

            <div className="tool-jump-links">
              <a href="#heic-to-png">{dict.heicToPng?.jumpStart}</a>
              <a href="#heic-to-png-guide">{dict.heicToPng?.jumpHowTo}</a>
              <a href="#heic-to-png-faq">{dict.heicToPng?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <HeicToPngTool text={dict.heicToPng} hideHeader />
      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="heic-to-png-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.heicToPng?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.heicToPng?.seoSectionSubtitle}</p>

            <div className="tool-guide-grid">
              {seoSections.length ? (
                <div className="tool-guide-content">
                  {seoSections.map((item) => (
                    <article className="tool-guide-card" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              {howToSteps.length ? (
                <div className="tool-howto-panel">
                  <h3>{dict.heicToPng?.seoHowTo?.title}</h3>
                  <p>{dict.heicToPng?.seoHowTo?.description}</p>
                  <ol className="tool-howto-list">
                    {howToSteps.map((item) => (
                      <li className="tool-howto-step" id={item.id} key={item.id}>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
      <FaqSection
        id="heic-to-png-faq"
        title={dict.heicToPng?.faqTitle}
        subtitle={dict.heicToPng?.faqSubtitle}
        items={faqItems}
      />
      <section className="section shell" id="heic-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.heicToPng?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/avif-to-jpg`}>
              <h3>{dict.meta.avifToJpgTitle}</h3>
              <p>{dict.heicToPng?.relatedAvifDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools/image-to-webp`}>
              <h3>{dict.meta.imageToWebpTitle}</h3>
              <p>{dict.heicToPng?.relatedWebpDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.heicToPng?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.heicToPng?.relatedBrowseDescription}</p>
            </a>
          </div>
        </div>
      </section>

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
