import { getSiteUrl } from "@/lib/site";

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/en/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/en/tools/resume-builder`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/en/tools/invoice-generator`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/en/tools/image-to-webp`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/en/tools/avif-to-jpg`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/en/tools/heic-to-png`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/fi`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/fi/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/fi/tools/resume-builder`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/fi/tools/invoice-generator`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/fi/tools/image-to-webp`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/fi/tools/avif-to-jpg`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.55,
    },
    {
      url: `${siteUrl}/fi/tools/heic-to-png`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.55,
    },
  ];
}
