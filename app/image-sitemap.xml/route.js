import { blogPosts } from "../data/blogPosts";
import { getSiteUrl } from "@/lib/site";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const locales = ["en", "fi"];
  const sharedHomeImages = [
    "/assets/profileimage.jpeg",
    "/assets/logo.webp",
    "/assets/mreng.png",
    "/assets/tassu.png",
    "/assets/kielibuddy_thumbnail.png",
    "/assets/Jobtracker.webp",
    "/assets/pawtee.webp",
  ];
  const screenRecorderImages = ["/assets/screen-recorder-icon.png"];

  const blogRows = locales.flatMap((locale) =>
    blogPosts.map((post) => {
      const pageUrl = `${siteUrl}/${locale}/blog/${post.slug}`;
      const images = [
        post.featuredImage?.src
          ? {
              url: `${siteUrl}${post.featuredImage.src}`,
              title: post.featuredImage.alt || post.title,
            }
          : null,
        ...post.tools.map((tool) =>
          tool.image?.src
            ? {
                url: `${siteUrl}${tool.image.src}`,
                title: tool.image.alt || `${tool.name} image`,
              }
            : null,
        ),
      ].filter(Boolean);
      const uniqueImages = Array.from(new Map(images.map((image) => [image.url, image])).values());

      return { pageUrl, images: uniqueImages };
    }),
  );

  const siteRows = locales.flatMap((locale) => [
    {
      pageUrl: `${siteUrl}/${locale}`,
      images: sharedHomeImages.map((src) => ({
        url: `${siteUrl}${src}`,
        title: "Manjula portfolio image",
      })),
    },
    {
      pageUrl: `${siteUrl}/${locale}/tools/screen-recorder`,
      images: screenRecorderImages.map((src) => ({
        url: `${siteUrl}${src}`,
        title: "Screen recorder icon",
      })),
    },
  ]);

  const rows = [...siteRows, ...blogRows];

  const xmlBody = rows
    .map(
      ({ pageUrl, images }) => `<url>
  <loc>${escapeXml(pageUrl)}</loc>
  ${images
    .map(
      (image) =>
        `<image:image><image:loc>${escapeXml(image.url)}</image:loc><image:title>${escapeXml(image.title)}</image:title></image:image>`,
    )
    .join("\n  ")}
</url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlBody}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
