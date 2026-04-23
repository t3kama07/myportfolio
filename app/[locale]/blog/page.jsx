import Image from "next/image";
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
      readLabel: "Jatka lukemista...",
      topicLabel: "Artikkelit",
      comingSoon: "Lisaa artikkeleita tulossa pian.",
    };
  }

  return {
    title: "Blog",
    description:
      "Notes on web development, UI/UX decisions, and practical SEO improvements from real-world builds.",
    intro:
      "This page shares practical articles on product development, SEO, and user-centered web experiences.",
    readLabel: "Keep reading...",
    topicLabel: "Articles",
    comingSoon: "More posts are coming soon.",
  };
}

function formatCardDateLabel(isoDate, locale) {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-US", {
    month: "short",
    day: "numeric",
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
            {blogPosts.map((post) => {
              const firstToolWithImage = post.tools?.find((tool) => tool?.image?.src);
              const featuredImageSrc =
                post.featuredImage?.src || firstToolWithImage?.image?.src || "/assets/profileimage.jpeg";
              const featuredImageAlt =
                post.featuredImage?.alt || firstToolWithImage?.image?.alt || `${post.title} featured image`;

              return (
                <article className="blog-card" id={post.slug} key={post.slug}>
                  <div className="blog-card-media">
                    <Image
                      src={featuredImageSrc}
                      alt={featuredImageAlt}
                      width={1200}
                      height={675}
                      sizes="(max-width: 900px) 100vw, (max-width: 1200px) 92vw, 900px"
                      className="blog-card-image"
                    />
                  </div>
                  <div className="blog-card-content">
                    <p className="blog-topic">{copy.topicLabel}</p>
                    <h2>{post.title}</h2>
                    <p className="blog-excerpt">{post.excerpt}</p>
                    <a className="blog-read-link" href={`/${locale}/blog/${post.slug}`}>
                      {copy.readLabel}
                    </a>
                    <p className="blog-date">{formatCardDateLabel(post.datePublished, locale)}</p>
                  </div>
                </article>
              );
            })}
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
