import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { blogPosts } from "../../data/blogPosts";
import { getDictionary, isValidLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { notFound } from "next/navigation";

function getBlogCopy(locale) {
  if (locale === "fi") {
    return {
      title: "Blogi",
      description:
        "Ajatuksia web-kehityksesta, UI/UX-ratkaisuista ja kaytannon SEO-optimoinnista oikeissa projekteissa.",
      intro:
        "Talta sivulta loydat artikkeleita kehitystyosta, suorituskyvysta ja kayttajaystavallisista web-ratkaisuista.",
      readLabel: "Lue artikkeli",
      comingSoon: "Lisaa artikkeleita tulossa pian.",
    };
  }

  return {
    title: "Blog",
    description:
      "Notes on web development, UI/UX decisions, and practical SEO improvements from real-world builds.",
    intro:
      "This page shares practical articles on product development, SEO, and user-centered web experiences.",
    readLabel: "Read article",
    comingSoon: "More posts are coming soon.",
  };
}

function formatDateLabel(isoDate, locale) {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const copy = getBlogCopy(locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: "/en/blog",
        fi: "/fi/blog",
        "x-default": "/en/blog",
      },
    },
    openGraph: {
      url: `/${locale}/blog`,
      title: `${copy.title} | Manjula`,
      description: copy.description,
    },
  };
}

export default async function LocalizedBlogPage({ params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const copy = getBlogCopy(locale);
  const siteUrl = getSiteUrl();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${copy.title} | Manjula`,
    description: copy.description,
    url: `${siteUrl}/${locale}/blog`,
    publisher: {
      "@type": "Person",
      name: "Manjula",
    },
  };

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath="/blog" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <section className="section shell">
        <div className="glass-card blog-wrap">
          <h1>{copy.title}</h1>
          <p className="section-subtitle">{copy.intro}</p>

          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article className="blog-card" id={post.slug} key={post.slug}>
                <p className="blog-date">{formatDateLabel(post.datePublished, locale)}</p>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <a className="btn btn-secondary" href={`/${locale}/blog/${post.slug}`}>
                  {copy.readLabel}
                </a>
              </article>
            ))}
          </div>

          <p className="blog-note">{copy.comingSoon}</p>
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
