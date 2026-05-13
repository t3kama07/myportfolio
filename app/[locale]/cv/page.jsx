import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import CvPageActions from "@/app/components/CvPageActions";
import { getCvData } from "@/app/data/cv";
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
    title: dict.meta.cvTitle,
    description: dict.meta.cvDescription,
    alternates: {
      canonical: `/${locale}/cv`,
      languages: {
        en: "/en/cv",
        fi: "/fi/cv",
        "x-default": "/en/cv",
      },
    },
    openGraph: {
      url: `/${locale}/cv`,
      title: dict.meta.cvTitle,
      description: dict.meta.cvDescription,
    },
  };
}

export default async function CvPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const cvData = getCvData(locale);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/cv`;
  const pageText = dict.cvPage;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: cvData.name,
    url: pageUrl,
    image: `${siteUrl}${cvData.photo.src}`,
    jobTitle: cvData.role,
    description: cvData.summary,
    email: "mailto:manjulakpmp@gmail.com",
    telephone: "+358415769826",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Oulu",
      addressCountry: "FI",
    },
    sameAs: ["https://manjula.live", "https://github.com/t3kama07", "https://www.linkedin.com/in/kpmp/"],
  };

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/cv" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <section className="section shell cv-page-section">
        <div className="glass-card cv-hero">
          <div className="cv-hero-copy">
            <p className="cv-kicker">{pageText.kicker}</p>
            <h1>{cvData.name}</h1>
            <p className="cv-role">{cvData.role}</p>
            <p className="cv-summary">{cvData.summary}</p>
          </div>

          <aside className="cv-actions-card">
            <h2>{pageText.actionsTitle}</h2>
            <p>{pageText.actionsDescription}</p>
            <div className="cv-action-list">
              <CvPageActions pageText={pageText} cvData={cvData} locale={locale} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section shell cv-page-section">
        <div className="cv-layout">
          <aside className="glass-card cv-sidebar">
            <div className="cv-photo-wrap">
              <Image
                className="cv-photo"
                src={cvData.photo.src}
                alt={cvData.photo.alt}
                width={320}
                height={320}
                priority
              />
            </div>

            <div className="cv-sidebar-block">
              <h2>{pageText.contactTitle}</h2>
              <dl className="cv-contact-list">
                {cvData.contact.map((item) => (
                  <div key={item.label} className="cv-contact-item">
                    <dt>{item.label}</dt>
                    <dd>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="cv-sidebar-block">
              <h2>{pageText.skillsTitle}</h2>
              <div className="cv-skill-groups">
                {cvData.skillGroups.map((group) => (
                  <section key={group.label} className="cv-skill-group">
                    <h3>{group.label}</h3>
                    <div className="cv-chip-list">
                      {group.items.map((item) => (
                        <span key={item} className="cv-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </aside>

          <article className="glass-card cv-sheet">
            <section className="cv-section">
              <h2>{pageText.aboutTitle}</h2>
              <p>{cvData.about}</p>
            </section>

            <section className="cv-section">
              <h2>{pageText.summaryTitle}</h2>
              <p>{cvData.summary}</p>
            </section>

            <section className="cv-section">
              <h2>{pageText.educationTitle}</h2>
              <div className="cv-entry-list">
                {cvData.education.map((item) => (
                  <article key={`${item.degree}-${item.school}`} className="cv-entry">
                    <div className="cv-entry-head">
                      <div>
                        <h3>{item.degree}</h3>
                        <p>{item.school}</p>
                      </div>
                      <span>{item.dates}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="cv-section">
              <h2>{pageText.projectsTitle}</h2>
              <div className="cv-entry-list">
                {cvData.projects.map((project) => (
                  <article key={project.title} className="cv-entry">
                    <div className="cv-entry-head">
                      <div>
                        <h3>{project.title}</h3>
                        {project.subtitle ? <p>{project.subtitle}</p> : null}
                      </div>
                      {project.links?.length ? (
                        <div className="cv-link-list">
                          {project.links.map((link) => (
                            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <ul>
                      {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="cv-section">
              <h2>{pageText.extraTitle}</h2>
              <ul>
                {cvData.extras.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </article>
        </div>
      </section>

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} withTopSpacing />
        </div>
      </footer>
    </main>
  );
}
