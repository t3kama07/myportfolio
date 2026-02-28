import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ProjectsSection from "../../components/ProjectsSection";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.meta.projectsTitle,
    description: dict.meta.projectsDescription,
    alternates: {
      canonical: `/${locale}/projects`,
      languages: {
        en: "/en/projects",
        fi: "/fi/projects",
      },
    },
    openGraph: {
      url: `/${locale}/projects`,
      title: `${dict.meta.projectsTitle} | Manjula`,
      description: dict.meta.projectsDescription,
    },
  };
}

export default async function LocalizedProjectsPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/projects" />
      <ProjectsSection
        projects={dict.projects.items}
        title={dict.projects.title}
        subtitle={dict.projects.subtitle}
        liveDemoLabel={dict.projects.liveDemo}
        githubLabel={dict.projects.github}
      />
      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
