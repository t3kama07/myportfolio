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
  const keywords =
    locale === "fi"
      ? [
          "kuva webp muunnin",
          "jpg webp",
          "png webp",
          "ilmainen kuvatyokalu",
          "Manjula tyokalut",
        ]
      : [
          "image to webp converter",
          "jpg to webp",
          "png to webp",
          "free image converter",
          "Manjula tools",
        ];

  return {
    title: dict.meta.imageToWebpTitle,
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
      title: `${dict.meta.imageToWebpTitle} | Manjula`,
      description: dict.meta.imageToWebpDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: dict.meta.imageToWebpTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.imageToWebpTitle} | Manjula`,
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
  const imageToWebpJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: dict.meta.imageToWebpTitle,
    description: dict.meta.imageToWebpDescription,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    isAccessibleForFree: true,
    creator: {
      "@type": "Person",
      name: "Manjula",
      url: siteUrl,
    },
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/image-to-webp" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageToWebpJsonLd) }}
      />
      <h1 className="sr-only">{dict.meta.imageToWebpTitle}</h1>
      <ImageToWebpTool text={dict.imageToWebp} />

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
