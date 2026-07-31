import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import PageReplacementCalculatorTool from "../../../components/PageReplacementCalculatorTool";
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
  const pagePath = `/${locale}/tools/page-replacement-algorithm-calculator`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "Page Replacement Algorithm Calculator | FIFO, LRU, Optimal"
      : "Page Replacement Algorithm Calculator | FIFO, LRU, Optimal, Clock";
  const keywords =
    locale === "fi"
      ? [
          "page replacement algorithm calculator",
          "page replacement solver",
          "FIFO LRU Optimal calculator",
          "page fault calculator",
          "operating system calculator",
          "kayttojarjestelmat",
        ]
      : [
          "page replacement algorithm calculator",
          "page replacement algorithm solver",
          "FIFO page replacement calculator",
          "LRU page replacement calculator",
          "Optimal page replacement calculator",
          "Clock page replacement calculator",
          "page fault calculator",
          "operating system calculator",
        ];

  return {
    title: seoTitle,
    description: dict.meta.pageReplacementCalculatorDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/page-replacement-algorithm-calculator",
        fi: "/fi/tools/page-replacement-algorithm-calculator",
        "x-default": "/en/tools/page-replacement-algorithm-calculator",
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
      description: dict.meta.pageReplacementCalculatorDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: dict.meta.pageReplacementCalculatorTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: dict.meta.pageReplacementCalculatorDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedPageReplacementCalculatorPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/page-replacement-algorithm-calculator`;
  const faqItems = Array.isArray(dict.pageReplacementCalculator?.faqItems)
    ? dict.pageReplacementCalculator.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.pageReplacementCalculator?.introParagraphs)
    ? dict.pageReplacementCalculator.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.pageReplacementCalculator?.heroPoints)
    ? dict.pageReplacementCalculator.heroPoints.filter(Boolean)
    : [];
  const seoSections = Array.isArray(dict.pageReplacementCalculator?.seoSections)
    ? dict.pageReplacementCalculator.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.pageReplacementCalculator?.seoHowTo?.steps)
    ? dict.pageReplacementCalculator.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.pageReplacementCalculatorTitle,
    description: dict.meta.pageReplacementCalculatorDescription,
    url: pageUrl,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Operating System Calculator",
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
      "FIFO page replacement simulation",
      "LRU page replacement simulation",
      "Optimal page replacement simulation",
      "Clock page replacement simulation",
      "LFU and LIFO page replacement simulation",
      "Step-by-step frame table",
      "Page fault, hit, hit rate, and miss rate results",
      "Algorithm comparison table",
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

  const howToJsonLd =
    howToSteps.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: dict.pageReplacementCalculator?.seoHowTo?.title,
          description: dict.pageReplacementCalculator?.seoHowTo?.description,
          step: howToSteps.map((item, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: item.title,
            text: item.description,
            url: `${pageUrl}#${item.id}`,
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
        name: dict.meta.pageReplacementCalculatorTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/page-replacement-algorithm-calculator" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      {howToJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      ) : null}

      <section className="section shell tool-hero-section" id="page-replacement-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.pageReplacementCalculator?.heroKicker ? (
              <p className="tool-hero-kicker">{dict.pageReplacementCalculator.heroKicker}</p>
            ) : null}
            <h1>{dict.pageReplacementCalculator?.heroTitle || dict.meta.pageReplacementCalculatorTitle}</h1>
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
              <a href="#page-replacement-calculator">{dict.pageReplacementCalculator?.jumpStart}</a>
              <a href="#page-replacement-guide">{dict.pageReplacementCalculator?.jumpHowTo}</a>
              <a href="#page-replacement-faq">{dict.pageReplacementCalculator?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <PageReplacementCalculatorTool text={dict.pageReplacementCalculator} hideHeader />

      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="page-replacement-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.pageReplacementCalculator?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.pageReplacementCalculator?.seoSectionSubtitle}</p>

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
                  <h3>{dict.pageReplacementCalculator?.seoHowTo?.title}</h3>
                  <p>{dict.pageReplacementCalculator?.seoHowTo?.description}</p>
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
        id="page-replacement-faq"
        title={dict.pageReplacementCalculator?.faqTitle}
        subtitle={dict.pageReplacementCalculator?.faqSubtitle}
        items={faqItems}
      />

      <section className="section shell" id="page-replacement-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.pageReplacementCalculator?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/karnaugh-map-solver`}>
              <h3>{dict.meta.karnaughMapSolverTitle}</h3>
              <p>{dict.pageReplacementCalculator?.relatedKmapDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools/remove-line-breaks`}>
              <h3>{dict.meta.removeLineBreaksTitle}</h3>
              <p>{dict.pageReplacementCalculator?.relatedTextDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.pageReplacementCalculator?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.pageReplacementCalculator?.relatedBrowseDescription}</p>
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
