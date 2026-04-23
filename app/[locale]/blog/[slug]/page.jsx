import Image from "next/image";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import { blogPosts, getBlogPostBySlug } from "../../../data/blogPosts";
import { getDictionary, isValidLocale, locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { notFound } from "next/navigation";

function formatDateLabel(isoDate, locale) {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    blogPosts.map((post) => ({
      locale,
      slug: post.slug,
    })),
  );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {};
  }
  const socialImageSrc = post.featuredImage?.src || post.tools[0]?.image?.src || "/assets/profileimage.jpeg";
  const socialImageAlt = post.featuredImage?.alt || post.tools[0]?.image?.alt || post.title;

  return {
    title: post.title,
    description: post.seoDescription,
    keywords: [
      "tech journey 2026",
      "beginner tech tools",
      "learn coding for beginners",
      ...post.tools.map((tool) => tool.name),
    ],
    alternates: {
      canonical: `/${locale}/blog/${post.slug}`,
      languages: {
        en: `/en/blog/${post.slug}`,
        fi: `/fi/blog/${post.slug}`,
        "x-default": `/en/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      url: `/${locale}/blog/${post.slug}`,
      title: post.title,
      description: post.seoDescription,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      images: [
        {
          url: socialImageSrc,
          width: 1200,
          height: 675,
          alt: socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDescription,
      images: [socialImageSrc],
    },
  };
}

export default async function LocalizedBlogPostPage({ params }) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/${locale}/blog/${post.slug}`;
  const articleImages = [
    post.featuredImage?.src ? `${siteUrl}${post.featuredImage.src}` : null,
    ...post.tools.map((tool) => (tool.image?.src ? `${siteUrl}${tool.image.src}` : null)),
  ].filter(Boolean);
  const uniqueArticleImages = [...new Set(articleImages)];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    mainEntityOfPage: postUrl,
    image: uniqueArticleImages,
    author: {
      "@type": "Person",
      name: "Manjula",
    },
    publisher: {
      "@type": "Person",
      name: "Manjula",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="portfolio-page" id="top">
      <Navbar locale={locale} nav={dict.nav} currentPath={`/blog/${post.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="section shell">
        <article className="glass-card blog-post-wrap">
          <p className="blog-post-breadcrumb">
            <a href={`/${locale}/blog`}>Blog</a> / <span>{post.title}</span>
          </p>
          <h1>{post.title}</h1>
          <p className="blog-post-meta">
            <time dateTime={post.datePublished}>{formatDateLabel(post.datePublished, locale)}</time>
            <span aria-hidden="true"> | </span>
            <span>{post.readTime}</span>
          </p>

          {post.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <ol className="blog-tool-list">
            {post.tools.map((tool) => (
              <li key={tool.name} id={tool.name.toLowerCase().replace(/\s+/g, "-")}>
                <h3>{tool.name}</h3>
                {tool.image?.src ? (
                  <figure className="blog-tool-figure">
                    <Image
                      src={tool.image.src}
                      alt={tool.image.alt || `${tool.name} illustration`}
                      width={1200}
                      height={675}
                      sizes="(max-width: 720px) 100vw, (max-width: 1120px) 92vw, 860px"
                      className="blog-tool-image"
                    />
                  </figure>
                ) : null}
                <p>{tool.description}</p>
              </li>
            ))}
          </ol>

          <h2>Summary</h2>
          <p>{post.summary}</p>

          <section className="blog-faq" id="faq">
            <h2>FAQ</h2>
            <div className="faq-list">
              {post.faq.map((item) => (
                <article className="faq-item" key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </article>
      </section>

      <footer className="contact-footer">
        <div className="shell">
          <Footer locale={locale} footer={dict.footer} />
        </div>
      </footer>
    </main>
  );
}
