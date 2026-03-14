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
  const seoTitle = locale === "fi" ? "Ilmainen CV-tyokalu verkossa" : "Free Online Resume Builder";
  const keywords =
    locale === "fi"
      ? [
          "cv tyokalu",
          "ansioluettelo tyokalu",
          "ilmainen cv tyokalu",
          "cv pdf",
          "cv docx",
          "ansioluettelo pdf",
          "ansioluettelo docx",
          "ats cv",
          "verkkocv",
          "Manjula tyokalut",
        ]
      : [
          "resume builder",
          "free resume builder",
          "online resume builder",
          "resume pdf download",
          "resume docx download",
          "cv builder",
          "ATS resume builder",
          "resume maker",
          "resume template",
          "Manjula tools",
        ];

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
      title: `${dict.meta.resumeBuilderTitle} | Manjula`,
      description: dict.meta.resumeBuilderDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: dict.meta.resumeBuilderTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.resumeBuilderTitle} | Manjula`,
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
  const resumeToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.resumeBuilderTitle,
    description: dict.meta.resumeBuilderDescription,
    url: pageUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    isAccessibleForFree: true,
    creator: {
      "@type": "Person",
      name: "Manjula",
      url: siteUrl,
    },
    featureList: [
      "Resume form",
      "Live preview",
      "Template switching",
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
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <h1 className="sr-only">{dict.meta.resumeBuilderTitle}</h1>
      <ResumeBuilderTool locale={locale} text={dict.resumeBuilder} />
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
