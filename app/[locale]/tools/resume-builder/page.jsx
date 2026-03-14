import FaqSection from "../../../components/FaqSection";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import ResumeBuilderTool from "../../../components/ResumeBuilderTool";
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
  const pagePath = `/${locale}/tools/resume-builder`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;
  const seoTitle =
    locale === "fi"
      ? "Ilmainen CV-tyokalu verkossa | PDF ja DOCX ansioluettelo"
      : "Free Resume Builder Online | ATS-Friendly Resume Templates | PDF & DOCX";
  const keywords =
    locale === "fi"
      ? [
          "cv tyokalu",
          "ansioluettelo tyokalu",
          "ilmainen cv tyokalu",
          "ansioluettelopohja",
          "ansioluettelomalli",
          "ansioluettelon formaatti",
          "miten kirjoittaa ansioluettelo",
          "cv pdf",
          "cv docx",
          "ansioluettelo pdf",
          "ansioluettelo docx",
          "ats cv",
          "verkkocv",
          "ansioluettelo verkossa",
          "Manjula tyokalut",
        ]
      : [
          "resume",
          "resume builder",
          "free resume builder",
          "online resume builder",
          "resume format",
          "resume templates",
          "resume pdf download",
          "resume docx download",
          "cv builder",
          "ATS resume builder",
          "resume maker",
          "resume examples",
          "how to write a resume",
          "free resume templates",
          "resume template",
          "Manjula tools",
        ];
  const ogImageAlt =
    locale === "fi" ? "Ilmainen CV-tyokalu, tekijana Manjula" : "Free Resume Builder by Manjula";

  return {
    title: seoTitle,
    description: dict.meta.resumeBuilderDescription,
    keywords,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/resume-builder",
        fi: "/fi/tools/resume-builder",
        "x-default": "/en/tools/resume-builder",
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
      description: dict.meta.resumeBuilderDescription,
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
      description: dict.meta.resumeBuilderDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedResumeBuilderPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/resume-builder`;
  const faqItems = Array.isArray(dict.resumeBuilder?.faqItems)
    ? dict.resumeBuilder.faqItems.filter((item) => item?.question && item?.answer)
    : [];
  const seoSections = Array.isArray(dict.resumeBuilder?.seoSections)
    ? dict.resumeBuilder.seoSections.filter((item) => item?.title && item?.body)
    : [];
  const howToSteps = Array.isArray(dict.resumeBuilder?.seoHowTo?.steps)
    ? dict.resumeBuilder.seoHowTo.steps.filter((item) => item?.id && item?.title && item?.description)
    : [];

  const resumeToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.resumeBuilderTitle,
    description: dict.meta.resumeBuilderDescription,
    url: pageUrl,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: locale === "fi" ? "CV- ja ansioluettelotyokalu" : "Resume Builder",
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
      "Resume form",
      "Live preview",
      "ATS-friendly resume templates",
      "Template switching",
      "Resume format guidance",
      "PDF export",
      "DOCX export",
      "Local autosave",
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
          name: dict.resumeBuilder.seoHowTo.title,
          description: dict.resumeBuilder.seoHowTo.description,
          totalTime: "PT10M",
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
        name: dict.meta.resumeBuilderTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/resume-builder" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resumeToolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {howToJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      ) : null}
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <ResumeBuilderTool locale={locale} text={dict.resumeBuilder} />
      {seoSections.length || howToSteps.length ? (
        <section className="section shell" id="resume-builder-guide">
          <div className="glass-card resume-seo-wrap">
            <h2>{dict.resumeBuilder?.seoSectionTitle}</h2>
            <p className="section-subtitle">{dict.resumeBuilder?.seoSectionSubtitle}</p>

            <div className="resume-seo-grid">
              {seoSections.length ? (
                <div className="resume-seo-content">
                  {seoSections.map((item) => (
                    <article className="resume-seo-card" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              {howToSteps.length ? (
                <div className="resume-howto-panel">
                  <h3>{dict.resumeBuilder?.seoHowTo?.title}</h3>
                  <p>{dict.resumeBuilder?.seoHowTo?.description}</p>
                  <ol className="resume-howto-list">
                    {howToSteps.map((item) => (
                      <li className="resume-howto-step" id={item.id} key={item.id}>
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
        id="resume-builder-faq"
        title={dict.resumeBuilder?.faqTitle}
        subtitle={dict.resumeBuilder?.faqSubtitle}
        items={faqItems}
      />

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
