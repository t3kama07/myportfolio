import ContactSection from "../components/ContactSection";
import FaqSection from "../components/FaqSection";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import ProjectsSection from "../components/ProjectsSection";
import ServicesSection from "../components/ServicesSection";
import SkillScroller from "../components/SkillScroller";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        fi: "/fi",
        "x-default": "/en",
      },
    },
    openGraph: {
      url: `/${locale}`,
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
    },
  };
}

export default async function LocalizedHomePage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}`;
  const faqItems = Array.isArray(dict.homeFaq?.items)
    ? dict.homeFaq.items.filter((item) => item?.question && item?.answer)
    : [];
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
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Manjula",
    url: pageUrl,
    jobTitle: dict.hero.kicker,
    description: dict.meta.homeDescription,
    knowsAbout: dict.skills.items,
  };

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <HeroSection locale={locale} hero={dict.hero} />
      <ServicesSection
        services={dict.services.items}
        title={dict.services.title}
        ariaLabel={dict.services.aria}
      />

      <section className="section shell" id="skills">
        <div className="glass-card tech-stack-section">
          <SkillScroller skills={dict.skills.items} ariaLabel={dict.skills.aria} />
        </div>
      </section>

      <ProjectsSection
        projects={dict.projects.items}
        title={dict.projects.title}
        subtitle={dict.projects.subtitle}
        liveDemoLabel={dict.projects.liveDemo}
        githubLabel={dict.projects.github}
      />
      <FaqSection
        id="faq"
        title={dict.homeFaq?.title}
        subtitle={dict.homeFaq?.subtitle}
        items={faqItems}
      />
      <ContactSection locale={locale} contactSection={dict.contactSection} footer={dict.footer} />
    </main>
  );
}
