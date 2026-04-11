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
  const pagePath = `/${locale}/tools/screen-recorder`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/screen-recorder-icon.png`;

  return {
    title: dict.meta.screenRecorderTitle,
    description: dict.meta.screenRecorderDescription,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/screen-recorder",
        fi: "/fi/tools/screen-recorder",
        "x-default": "/en/tools/screen-recorder",
      },
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "Manjula",
      locale: locale === "fi" ? "fi_FI" : "en_US",
      alternateLocale: locale === "fi" ? ["en_US"] : ["fi_FI"],
      title: dict.meta.screenRecorderTitle,
      description: dict.meta.screenRecorderDescription,
      images: [
        {
          url: ogImage,
          width: 128,
          height: 128,
          alt: dict.meta.screenRecorderTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.screenRecorderTitle,
      description: dict.meta.screenRecorderDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedScreenRecorderPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/screen-recorder`;
  const downloadUrl = `${siteUrl}/downloads/screen-recorder-extension.zip`;
  const faqItems = Array.isArray(dict.screenRecorder?.faqItems)
    ? dict.screenRecorder.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.screenRecorder?.introParagraphs)
    ? dict.screenRecorder.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.screenRecorder?.heroPoints)
    ? dict.screenRecorder.heroPoints.filter(Boolean)
    : [];
  const seoSections = Array.isArray(dict.screenRecorder?.seoSections)
    ? dict.screenRecorder.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.screenRecorder?.seoHowTo?.steps)
    ? dict.screenRecorder.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const screenRecorderJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: dict.meta.screenRecorderTitle,
    description: dict.meta.screenRecorderDescription,
    url: pageUrl,
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome",
    inLanguage: locale,
    isAccessibleForFree: true,
    downloadUrl,
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
      "Screen recording",
      "Optional microphone audio",
      "Optional tab audio",
      "Recording timer",
      "Pause and stop controls",
      "Preview and download",
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
        name: dict.meta.screenRecorderTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/screen-recorder" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(screenRecorderJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <section className="section shell tool-hero-section" id="screen-recorder-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.screenRecorder?.heroKicker ? (
              <p className="tool-hero-kicker">{dict.screenRecorder.heroKicker}</p>
            ) : null}
            <h1>{dict.screenRecorder?.heroTitle || dict.meta.screenRecorderTitle}</h1>
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
              <a href="#screen-recorder-download">{dict.screenRecorder?.jumpDownload}</a>
              <a href="#screen-recorder-guide">{dict.screenRecorder?.jumpHowTo}</a>
              <a href="#screen-recorder-privacy">{dict.screenRecorder?.jumpPrivacy}</a>
              <a href="#screen-recorder-faq">{dict.screenRecorder?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="screen-recorder-download">
        <div className="glass-card tool-guide-wrap">
          <h2>{dict.screenRecorder?.downloadTitle}</h2>
          <p className="section-subtitle">{dict.screenRecorder?.downloadDescription}</p>
          <div className="tool-actions">
            <a className="btn btn-primary" href="/downloads/screen-recorder-extension.zip" download>
              {dict.screenRecorder?.downloadButton}
            </a>
            <a className="btn btn-secondary" href="#screen-recorder-guide">
              {dict.screenRecorder?.installGuideButton}
            </a>
            <a className="btn btn-secondary" href={`/${locale}/tools/screen-recorder/privacy-policy`}>
              {dict.screenRecorder?.privacyButton}
            </a>
          </div>
          <p>{dict.screenRecorder?.downloadNote}</p>
        </div>
      </section>

      <section className="section shell" id="screen-recorder-privacy">
        <div className="glass-card tool-guide-wrap">
          <h2>{dict.screenRecorder?.privacyTitle}</h2>
          <p className="section-subtitle">{dict.screenRecorder?.privacySummary}</p>
          <p>{dict.screenRecorder?.privacyCtaDescription}</p>
          <div className="tool-actions">
            <a className="btn btn-primary" href={`/${locale}/tools/screen-recorder/privacy-policy`}>
              {dict.screenRecorder?.privacyButton}
            </a>
          </div>
        </div>
      </section>

      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="screen-recorder-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.screenRecorder?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.screenRecorder?.seoSectionSubtitle}</p>

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
                  <h3>{dict.screenRecorder?.seoHowTo?.title}</h3>
                  <p>{dict.screenRecorder?.seoHowTo?.description}</p>
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
        id="screen-recorder-faq"
        title={dict.screenRecorder?.faqTitle}
        subtitle={dict.screenRecorder?.faqSubtitle}
        items={faqItems}
      />

      <section className="section shell" id="screen-recorder-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.screenRecorder?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/image-cropper`}>
              <h3>{dict.meta.imageCropperTitle}</h3>
              <p>{dict.screenRecorder?.relatedImageCropperDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools/image-to-webp`}>
              <h3>{dict.meta.imageToWebpTitle}</h3>
              <p>{dict.screenRecorder?.relatedWebpDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.screenRecorder?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.screenRecorder?.relatedBrowseDescription}</p>
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
