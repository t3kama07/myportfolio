import Footer from "../../../../components/Footer";
import Navbar from "../../../../components/Navbar";
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
  const pagePath = `/${locale}/tools/screen-recorder/privacy-policy`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/screen-recorder-icon.png`;
  const title = dict.screenRecorder?.privacyPolicyTitle || dict.screenRecorder?.privacyTitle;
  const description = dict.screenRecorder?.privacySummary || dict.meta.screenRecorderDescription;

  return {
    title,
    description,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/screen-recorder/privacy-policy",
        fi: "/fi/tools/screen-recorder/privacy-policy",
        "x-default": "/en/tools/screen-recorder/privacy-policy",
      },
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "Manjula",
      locale: locale === "fi" ? "fi_FI" : "en_US",
      alternateLocale: locale === "fi" ? ["en_US"] : ["fi_FI"],
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 128,
          height: 128,
          alt: dict.meta.screenRecorderTitle,
        },
      ],
    },
  };
}

export default async function LocalizedScreenRecorderPrivacyPolicyPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/tools/screen-recorder/privacy-policy`;
  const policyItems = Array.isArray(dict.screenRecorder?.privacyPolicyItems)
    ? dict.screenRecorder.privacyPolicyItems.filter(Boolean)
    : [];

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
        item: `${siteUrl}/${locale}/tools/screen-recorder`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: dict.screenRecorder?.privacyTitle || "Privacy Policy",
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/screen-recorder" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="section shell tool-hero-section" id="screen-recorder-privacy-policy">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            <p className="tool-hero-kicker">{dict.screenRecorder?.privacyTitle}</p>
            <h1>{dict.screenRecorder?.privacyPolicyTitle}</h1>
            <p className="tool-hero-lead">{dict.screenRecorder?.privacyPolicySubtitle}</p>
            <p className="tool-hero-lead">{dict.screenRecorder?.privacyPolicyIntro}</p>
            <div className="tool-jump-links">
              <a href={`/${locale}/tools/screen-recorder`}>{dict.meta.screenRecorderTitle}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="glass-card tool-guide-wrap">
          <h2>{dict.screenRecorder?.privacyTitle}</h2>
          <div className="tool-guide-content">
            {policyItems.map((item) => (
              <article className="tool-guide-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
            <article className="tool-guide-card">
              <p>{dict.screenRecorder?.privacyContactLabel}</p>
              <p>
                <a href="mailto:hello@manjula.live">hello@manjula.live</a>
              </p>
            </article>
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
