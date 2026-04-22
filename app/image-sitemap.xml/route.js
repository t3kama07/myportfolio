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
      const imageUrls = post.tools
        .map((tool) => tool.image?.src)
        .filter(Boolean)
        .map((src) => `${siteUrl}${src}`);

      return { pageUrl, imageUrls };
    }),
  );

  const siteRows = locales.flatMap((locale) => [
    {
      pageUrl: `${siteUrl}/${locale}`,
      imageUrls: sharedHomeImages.map((src) => `${siteUrl}${src}`),
    },
    {
      pageUrl: `${siteUrl}/${locale}/tools/screen-recorder`,
      imageUrls: screenRecorderImages.map((src) => `${siteUrl}${src}`),
    },
  ]);

  const rows = [...siteRows, ...blogRows];

  const xmlBody = rows
    .map(
      ({ pageUrl, imageUrls }) => `<url>
  <loc>${escapeXml(pageUrl)}</loc>
  ${imageUrls.map((url) => `<image:image><image:loc>${escapeXml(url)}</image:loc></image:image>`).join("\n  ")}
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
