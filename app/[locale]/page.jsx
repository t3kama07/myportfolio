import ContactSection from "../components/ContactSection";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import ProjectsSection from "../components/ProjectsSection";
import ServicesSection from "../components/ServicesSection";
import SkillScroller from "../components/SkillScroller";
import { getDictionary, isValidLocale } from "@/lib/i18n";
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

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/" />
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
      <ContactSection locale={locale} contactSection={dict.contactSection} footer={dict.footer} />
    </main>
  );
}
