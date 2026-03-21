import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import RemoveLineBreaksTool from "../../../components/RemoveLineBreaksTool";
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
  const pagePath = `/${locale}/tools/remove-line-breaks`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "Poista Rivinvaihdot Verkossa | Ilmainen Remove Line Breaks Tool"
      : "Remove Line Breaks Online | Free Line Break Remover Tool";
  const keywords =
    locale === "fi"
      ? [
          "remove line breaks",
          "remove line breaks online",
          "remove line breaks from text",
          "poista rivinvaihdot",
          "poista rivinvaihdot tekstista",
          "line break remover",
          "remove paragraph breaks",
          "newline remover",
          "how to remove line breaks in word",
          "how to remove line breaks in excel",
          "Manjula tyokalut",
        ]
      : [
          "remove line breaks",
          "remove line breaks online",
          "remove line breaks from text",
          "line break remover",
          "newline remover",
          "remove paragraph breaks",
          "replace line breaks with spaces",
          "remove line breaks in word",
          "remove line breaks in excel",
          "remove line breaks google docs",
          "Manjula tools",
        ];
  const ogImageAlt =
    locale === "fi" ? "Rivinvaihtojen poistotyokalu, tekijana Manjula" : "Remove Line Breaks Tool by Manjula";

  return {
    title: seoTitle,
    description: dict.meta.removeLineBreaksDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/remove-line-breaks",
        fi: "/fi/tools/remove-line-breaks",
        "x-default": "/en/tools/remove-line-breaks",
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
      description: dict.meta.removeLineBreaksDescription,
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
      description: dict.meta.removeLineBreaksDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedRemoveLineBreaksPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/remove-line-breaks`;
  const faqItems = Array.isArray(dict.removeLineBreaks?.faqItems)
    ? dict.removeLineBreaks.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.removeLineBreaks?.introParagraphs)
    ? dict.removeLineBreaks.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.removeLineBreaks?.heroPoints)
    ? dict.removeLineBreaks.heroPoints.filter(Boolean)
    : [];
  const seoSections = Array.isArray(dict.removeLineBreaks?.seoSections)
    ? dict.removeLineBreaks.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.removeLineBreaks?.seoHowTo?.steps)
    ? dict.removeLineBreaks.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const removeLineBreaksJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.removeLineBreaksTitle,
    description: dict.meta.removeLineBreaksDescription,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: locale === "fi" ? "Tekstityokalu" : "Text Utility",
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
      "Remove line breaks from text",
      "Replace line breaks with spaces",
      "Keep paragraph breaks",
      "Remove empty lines",
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
        name: dict.meta.removeLineBreaksTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/remove-line-breaks" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(removeLineBreaksJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <section className="section shell tool-hero-section" id="remove-line-breaks-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.removeLineBreaks?.heroKicker ? (
              <p className="tool-hero-kicker">{dict.removeLineBreaks.heroKicker}</p>
            ) : null}
            <h1>{dict.removeLineBreaks?.heroTitle || dict.meta.removeLineBreaksTitle}</h1>
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
              <a href="#remove-line-breaks">{dict.removeLineBreaks?.jumpStart}</a>
              <a href="#remove-line-breaks-guide">{dict.removeLineBreaks?.jumpHowTo}</a>
              <a href="#remove-line-breaks-faq">{dict.removeLineBreaks?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <RemoveLineBreaksTool text={dict.removeLineBreaks} hideHeader />
      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="remove-line-breaks-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.removeLineBreaks?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.removeLineBreaks?.seoSectionSubtitle}</p>

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
                  <h3>{dict.removeLineBreaks?.seoHowTo?.title}</h3>
                  <p>{dict.removeLineBreaks?.seoHowTo?.description}</p>
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
        id="remove-line-breaks-faq"
        title={dict.removeLineBreaks?.faqTitle}
        subtitle={dict.removeLineBreaks?.faqSubtitle}
        items={faqItems}
      />
      <section className="section shell" id="remove-line-breaks-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.removeLineBreaks?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/heic-to-png`}>
              <h3>{dict.meta.heicToPngTitle}</h3>
              <p>{dict.removeLineBreaks?.relatedHeicDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools/image-to-webp`}>
              <h3>{dict.meta.imageToWebpTitle}</h3>
              <p>{dict.removeLineBreaks?.relatedWebpDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.removeLineBreaks?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.removeLineBreaks?.relatedBrowseDescription}</p>
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
