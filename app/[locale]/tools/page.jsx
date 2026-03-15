import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.meta.toolsTitle,
    description: dict.meta.toolsDescription,
    alternates: {
      canonical: `/${locale}/tools`,
      languages: {
        en: "/en/tools",
        fi: "/fi/tools",
        "x-default": "/en/tools",
      },
    },
    openGraph: {
      url: `/${locale}/tools`,
      title: `${dict.meta.toolsTitle} | Manjula`,
      description: dict.meta.toolsDescription,
    },
  };
}

export default async function LocalizedToolsPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const internalToolPaths = {
    "avif-to-jpg": `/${locale}/tools/avif-to-jpg`,
    "invoice-generator": `/${locale}/tools/invoice-generator`,
    "image-to-webp": `/${locale}/tools/image-to-webp`,
    "resume-builder": `/${locale}/tools/resume-builder`,
  };

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/tools" />
      <h1 className="sr-only">{dict.meta.toolsTitle}</h1>

      <section className="section shell" id="tools">
        <div className="glass-card tools-wrap">
          <h2>{dict.tools.title}</h2>
          <p className="section-subtitle">{dict.tools.subtitle}</p>

          <div className="tools-grid">
            {dict.tools.items.map((tool) => {
              const resolvedHref = internalToolPaths[tool.id] || tool.href || "#";
              const isAvailable = resolvedHref !== "#";
              const isExternal = /^https?:\/\//.test(resolvedHref);

              return (
                <article className="tool-card" key={tool.id}>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <div className="tool-actions">
                    <a
                      className={`btn btn-primary${isAvailable ? "" : " is-disabled"}`}
                      href={resolvedHref}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {isAvailable ? dict.tools.open : dict.tools.comingSoon}
                    </a>
                  </div>
                </article>
              );
            })}
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
