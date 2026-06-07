import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import SafeRouteDailyTool from "../../../components/SafeRouteDailyTool";
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
  const pagePath = `/${locale}/tools/safe-route-daily`;
  const pageUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/assets/profileimage.jpeg`;

  return {
    title: dict.meta.safeRouteDailyTitle,
    description: dict.meta.safeRouteDailyDescription,
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/tools/safe-route-daily",
        fi: "/fi/tools/safe-route-daily",
        "x-default": "/en/tools/safe-route-daily",
      },
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "Manjula",
      locale: locale === "fi" ? "fi_FI" : "en_US",
      alternateLocale: locale === "fi" ? ["en_US"] : ["fi_FI"],
      title: dict.meta.safeRouteDailyTitle,
      description: dict.meta.safeRouteDailyDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: dict.meta.safeRouteDailyTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.safeRouteDailyTitle,
      description: dict.meta.safeRouteDailyDescription,
      images: [ogImage],
    },
  };
}

export default async function LocalizedSafeRouteDailyPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const introParagraphs = Array.isArray(dict.safeRouteDaily?.introParagraphs)
    ? dict.safeRouteDaily.introParagraphs.filter(Boolean)
    : [];
  const heroPoints = Array.isArray(dict.safeRouteDaily?.heroPoints)
    ? dict.safeRouteDaily.heroPoints.filter(Boolean)
    : [];

  return (
    <main className="portfolio-page" id="top" lang={locale}>
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools/safe-route-daily" />

      <section className="section shell tool-hero-section" id="safe-route-daily-overview">
        <div className="glass-card tool-hero-wrap">
          <div className="tool-hero-copy">
            {dict.safeRouteDaily?.heroKicker ? <p className="tool-hero-kicker">{dict.safeRouteDaily.heroKicker}</p> : null}
            <h1>{dict.safeRouteDaily?.heroTitle || dict.meta.safeRouteDailyTitle}</h1>
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
          </div>
        </div>
      </section>

      <SafeRouteDailyTool text={dict.safeRouteDaily} locale={locale} hideHeader />

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
