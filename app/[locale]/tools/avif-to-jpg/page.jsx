import AvifToJpgTool from "../../../components/AvifToJpgTool";
import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
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
  const pagePath = `/${locale}/tools/avif-to-jpg`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "AVIF JPG-muotoon verkossa | Ilmainen AVIF to JPG Converter"
      : "AVIF to JPG Converter Online | Free AVIF to JPEG Tool";
  const keywords =
    locale === "fi"
      ? [
          "avif to jpg",
          "avif to jpeg",
          "convert avif to jpg",
          "avif muunnin",
          "avif jpg muunnin",
          "muunna avif jpg",
          "ilmainen avif muunnin",
          "online avif to jpg",
          "avif kuva jpg",
          "avif file to jpg",
          "avif to jpg converter",
          "what is an avif file",
          "Manjula tyokalut",
        ]
      : [
          "avif to jpg",
          "avif to jpeg",
          "convert avif to jpg",
          "convert avif to jpeg",
          "avif converter",
          "avif to jpg converter",
          "free avif to jpg converter",
          "online avif to jpg",
          "avif file to jpg",
          "batch avif to jpg",
          "what is an avif file",
          "Manjula tools",
        ];
  const ogImageAlt =
    locale === "fi" ? "AVIF JPG-muunnin, tekijana Manjula" : "AVIF to JPG Converter by Manjula";

  return {
    title: seoTitle,
    description: dict.meta.avifToJpgDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/avif-to-jpg",
        fi: "/fi/tools/avif-to-jpg",
        "x-default": "/en/tools/avif-to-jpg",
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
      description: dict.meta.avifToJpgDescription,
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
      description: dict.meta.avifToJpgDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedAvifToJpgPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/avif-to-jpg`;
  const faqItems = Array.isArray(dict.avifToJpg?.faqItems)
    ? dict.avifToJpg.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.avifToJpg?.introParagraphs)
    ? dict.avifToJpg.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.avifToJpg?.heroPoints) ? dict.avifToJpg.heroPoints.filter(Boolean) : [];
  const seoSections = Array.isArray(dict.avifToJpg?.seoSections)
    ? dict.avifToJpg.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.avifToJpg?.seoHowTo?.steps)
    ? dict.avifToJpg.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const avifToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.avifToJpgTitle,
    description: dict.meta.avifToJpgDescription,
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
      "AVIF to JPG conversion",
      "AVIF to JPEG conversion",
      "Batch image conversion",
      "Adjustable JPG quality",
      "Custom background color for transparency",
      "In-browser processing",
      "No file upload",
    ],
  };

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
        name: dict.meta.avifToJpgTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/avif-to-jpg" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(avifToolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="section shell tool-hero-section" id="avif-to-jpg-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.avifToJpg?.heroKicker ? <p className="tool-hero-kicker">{dict.avifToJpg.heroKicker}</p> : null}
            <h1>{dict.avifToJpg?.heroTitle || dict.meta.avifToJpgTitle}</h1>
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
              <a href="#avif-to-jpg">{dict.avifToJpg?.jumpStart}</a>
              <a href="#avif-to-jpg-guide">{dict.avifToJpg?.jumpHowTo}</a>
              <a href="#avif-to-jpg-faq">{dict.avifToJpg?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <AvifToJpgTool text={dict.avifToJpg} hideHeader />
      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="avif-to-jpg-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.avifToJpg?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.avifToJpg?.seoSectionSubtitle}</p>

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
                  <h3>{dict.avifToJpg?.seoHowTo?.title}</h3>
                  <p>{dict.avifToJpg?.seoHowTo?.description}</p>
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
        id="avif-to-jpg-faq"
        title={dict.avifToJpg?.faqTitle}
        subtitle={dict.avifToJpg?.faqSubtitle}
        items={faqItems}
      />
      <section className="section shell" id="avif-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.avifToJpg?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/image-to-webp`}>
              <h3>{dict.meta.imageToWebpTitle}</h3>
              <p>{dict.avifToJpg?.relatedWebpDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.avifToJpg?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.avifToJpg?.relatedBrowseDescription}</p>
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



