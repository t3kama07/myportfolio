import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
import ImageCropperTool from "../../../components/ImageCropperTool";
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
  const pagePath = `/${locale}/tools/image-cropper`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "Kuvan Rajaus Verkossa | Ilmainen Image Cropper"
      : "Image Cropper Online | Free Image Crop Tool";
  const keywords =
    locale === "fi"
      ? [
          "kuvan rajaus",
          "image cropper",
          "crop image online",
          "rajaa kuva verkossa",
          "rajaukset somekuville",
          "crop png online",
          "crop jpg online",
          "free image cropper",
          "Manjula tyokalut",
        ]
      : [
          "image cropper",
          "image cropper online",
          "online image cropper",
          "image crop",
          "image crop online",
          "online image crop",
          "free image crop",
          "crop image online",
          "image crop tool",
          "image crop and resize",
          "free image cropper",
          "photo cropper",
          "crop jpg online",
          "crop png online",
          "crop webp online",
          "image aspect ratio cropper",
          "Manjula tools",
        ];
  const ogImageAlt = locale === "fi" ? "Kuvan rajaus -tyokalu, tekijana Manjula" : "Image Cropper by Manjula";

  return {
    title: seoTitle,
    description: dict.meta.imageCropperDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/image-cropper",
        fi: "/fi/tools/image-cropper",
        "x-default": "/en/tools/image-cropper",
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
      description: dict.meta.imageCropperDescription,
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
      description: dict.meta.imageCropperDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedImageCropperPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/image-cropper`;
  const faqItems = Array.isArray(dict.imageCropper?.faqItems)
    ? dict.imageCropper.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const introParagraphs = Array.isArray(dict.imageCropper?.introParagraphs)
    ? dict.imageCropper.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.imageCropper?.heroPoints) ? dict.imageCropper.heroPoints.filter(Boolean) : [];
  const seoSections = Array.isArray(dict.imageCropper?.seoSections)
    ? dict.imageCropper.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.imageCropper?.seoHowTo?.steps)
    ? dict.imageCropper.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const imageCropperJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.imageCropperTitle,
    description: dict.meta.imageCropperDescription,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: locale === "fi" ? "Kuvanmuokkaus" : "Image Editing",
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
      "Drag and resize crop box",
      "Preset aspect ratios",
      "Rotate left and right",
      "Export PNG, JPG, or WebP",
      "Live crop preview",
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
        name: dict.meta.imageCropperTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/image-cropper" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageCropperJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <section className="section shell tool-hero-section" id="image-cropper-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.imageCropper?.heroKicker ? <p className="tool-hero-kicker">{dict.imageCropper.heroKicker}</p> : null}
            <h1>{dict.imageCropper?.heroTitle || dict.meta.imageCropperTitle}</h1>
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
              <a href="#image-cropper">{dict.imageCropper?.jumpStart}</a>
              <a href="#image-cropper-guide">{dict.imageCropper?.jumpHowTo}</a>
              <a href="#image-cropper-faq">{dict.imageCropper?.jumpFaq}</a>
            </div>
          </div>
        </div>
      </section>

      <ImageCropperTool text={dict.imageCropper} hideHeader />
      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="image-cropper-guide">
          <div className="glass-card tool-guide-wrap">
            <h2>{dict.imageCropper?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.imageCropper?.seoSectionSubtitle}</p>

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
                  <h3>{dict.imageCropper?.seoHowTo?.title}</h3>
                  <p>{dict.imageCropper?.seoHowTo?.description}</p>
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
        id="image-cropper-faq"
        title={dict.imageCropper?.faqTitle}
        subtitle={dict.imageCropper?.faqSubtitle}
        items={faqItems}
      />
      <section className="section shell" id="image-cropper-related-tools">
        <div className="glass-card tool-related-wrap">
          <h2>{dict.imageCropper?.relatedTitle}</h2>
          <div className="tool-related-list">
            <a className="tool-related-card" href={`/${locale}/tools/image-to-webp`}>
              <h3>{dict.meta.imageToWebpTitle}</h3>
              <p>{dict.imageCropper?.relatedWebpDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools/avif-to-jpg`}>
              <h3>{dict.meta.avifToJpgTitle}</h3>
              <p>{dict.imageCropper?.relatedAvifDescription}</p>
            </a>
            <a className="tool-related-card" href={`/${locale}/tools`}>
              <h3>{dict.imageCropper?.relatedBrowseLabel || dict.tools.title}</h3>
              <p>{dict.imageCropper?.relatedBrowseDescription}</p>
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
