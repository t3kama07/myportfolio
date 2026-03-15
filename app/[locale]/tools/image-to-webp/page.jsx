import FaqSection from "../../../components/FaqSection";
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
  const seoTitle =
    locale === "fi"
      ? "Kuva WebP-muotoon verkossa | JPG, PNG ja JPEG to WebP"
      : "Image to WebP Converter Online | Free JPG, PNG, JPEG to WebP Tool";
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
          "convert jpg to webp",
          "online webp converter",
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
          "convert jpg to webp",
          "online webp converter",
          "free webp converter",
          "convert image to webp",
          "png jpg to webp",
          "Manjula tools",
        ];
  const ogImageAlt =
    locale === "fi" ? "Kuva WebP-muotoon -muunnin, tekijana Manjula" : "Image to WebP Converter by Manjula";

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
      title: seoTitle,
      description: dict.meta.imageToWebpDescription,
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
  const introParagraphs = Array.isArray(dict.imageToWebp?.introParagraphs)
    ? dict.imageToWebp.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.imageToWebp?.heroPoints) ? dict.imageToWebp.heroPoints.filter(Boolean) : [];
  const seoSections = Array.isArray(dict.imageToWebp?.seoSections)
    ? dict.imageToWebp.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.imageToWebp?.seoHowTo?.steps)
    ? dict.imageToWebp.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const imageToWebpJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.imageToWebpTitle,
    description: dict.meta.imageToWebpDescription,
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
      "JPG to WebP conversion",
      "PNG to WebP conversion",
      "JPEG to WebP conversion",
      "Batch image conversion",
      "Adjustable WebP quality",
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

      <section className="section shell tool-hero-section" id="image-to-webp-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.imageToWebp?.heroKicker ? <p className="tool-hero-kicker">{dict.imageToWebp.heroKicker}</p> : null}
            <h1>{dict.imageToWebp?.heroTitle || dict.meta.imageToWebpTitle}</h1>
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
              <a href="#image-to-webp">{dict.imageToWebp?.jumpStart}</a>
              <a href="#image-to-webp-guide">{dict.imageToWebp?.jumpHowTo}</a>
              <a href="#webp-faq">{dict.imageToWebp?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <ImageToWebpTool text={dict.imageToWebp} hideHeader />
      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="image-to-webp-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.imageToWebp?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.imageToWebp?.seoSectionSubtitle}</p>

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
                  <h3>{dict.imageToWebp?.seoHowTo?.title}</h3>
                  <p>{dict.imageToWebp?.seoHowTo?.description}</p>
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
        id="webp-faq"
        title={dict.imageToWebp?.faqTitle}
        subtitle={dict.imageToWebp?.faqSubtitle}
        items={faqItems}
      />
      <section className="section shell" id="webp-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.imageToWebp?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/avif-to-jpg`}>
              <h3>{dict.meta.avifToJpgTitle}</h3>
              <p>{dict.imageToWebp?.relatedAvifDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.imageToWebp?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.imageToWebp?.relatedBrowseDescription}</p>
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
