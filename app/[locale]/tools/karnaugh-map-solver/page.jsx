import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
import KarnaughMapSolverTool from "../../../components/KarnaughMapSolverTool";
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
  const pagePath = `/${locale}/tools/karnaugh-map-solver`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "Karnaugh Map Solver verkossa | Ilmainen K-map yksinkertaistaja"
      : "Karnaugh Map Solver Online | Free K-map Simplifier";
  const keywords =
    locale === "fi"
      ? [
          "karnaugh map solver",
          "k-map solver",
          "karnaugh map simplifier",
          "boolean algebra solver",
          "totuustaulu",
          "logiikkalauseke",
          "sop simplifier",
          "digital logic tool",
          "Manjula tyokalut",
        ]
      : [
          "karnaugh map solver",
          "k-map solver",
          "karnaugh map simplifier",
          "boolean algebra solver",
          "sop simplifier",
          "logic simplifier",
          "digital logic tool",
          "4 variable k-map",
          "Manjula tools",
        ];

  return {
    title: seoTitle,
    description: dict.meta.karnaughMapSolverDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/karnaugh-map-solver",
        fi: "/fi/tools/karnaugh-map-solver",
        "x-default": "/en/tools/karnaugh-map-solver",
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
      description: dict.meta.karnaughMapSolverDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: locale === "fi" ? "Karnaugh Map Solver, tekijana Manjula" : "Karnaugh Map Solver by Manjula",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: dict.meta.karnaughMapSolverDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedKarnaughMapSolverPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/karnaugh-map-solver`;
  const faqItems = Array.isArray(dict.karnaughMapSolver?.faqItems)
    ? dict.karnaughMapSolver.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.karnaughMapSolver?.introParagraphs)
    ? dict.karnaughMapSolver.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.karnaughMapSolver?.heroPoints)
    ? dict.karnaughMapSolver.heroPoints.filter(Boolean)
    : [];
  const seoSections = Array.isArray(dict.karnaughMapSolver?.seoSections)
    ? dict.karnaughMapSolver.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.karnaughMapSolver?.seoHowTo?.steps)
    ? dict.karnaughMapSolver.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.karnaughMapSolverTitle,
    description: dict.meta.karnaughMapSolverDescription,
    url: pageUrl,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Digital Logic Tool",
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
      "2-variable Karnaugh maps",
      "3-variable Karnaugh maps",
      "4-variable Karnaugh maps",
      "Minterm and don't-care input",
      "Clickable K-map cells",
      "SOP simplification",
      "Visual group highlighting",
      "Shareable URL parameters",
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
        name: dict.meta.karnaughMapSolverTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/karnaugh-map-solver" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <section className="section shell tool-hero-section" id="karnaugh-map-solver-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.karnaughMapSolver?.heroKicker ? (
              <p className="tool-hero-kicker">{dict.karnaughMapSolver.heroKicker}</p>
            ) : null}
            <h1>{dict.karnaughMapSolver?.heroTitle || dict.meta.karnaughMapSolverTitle}</h1>
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
              <a href="#karnaugh-map-solver">{dict.karnaughMapSolver?.jumpStart}</a>
              <a href="#karnaugh-map-solver-guide">{dict.karnaughMapSolver?.jumpHowTo}</a>
              <a href="#karnaugh-map-solver-faq">{dict.karnaughMapSolver?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <KarnaughMapSolverTool text={dict.karnaughMapSolver} hideHeader />

      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="karnaugh-map-solver-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.karnaughMapSolver?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.karnaughMapSolver?.seoSectionSubtitle}</p>

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
                  <h3>{dict.karnaughMapSolver?.seoHowTo?.title}</h3>
                  <p>{dict.karnaughMapSolver?.seoHowTo?.description}</p>
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
        id="karnaugh-map-solver-faq"
        title={dict.karnaughMapSolver?.faqTitle}
        subtitle={dict.karnaughMapSolver?.faqSubtitle}
        items={faqItems}
      />

      <section className="section shell" id="kmap-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.karnaughMapSolver?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/remove-line-breaks`}>
              <h3>{dict.meta.removeLineBreaksTitle}</h3>
              <p>{dict.karnaughMapSolver?.relatedTextDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools/image-cropper`}>
              <h3>{dict.meta.imageCropperTitle}</h3>
              <p>{dict.karnaughMapSolver?.relatedImageDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.karnaughMapSolver?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.karnaughMapSolver?.relatedBrowseDescription}</p>
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
