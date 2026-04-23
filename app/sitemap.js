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
      url: `${siteUrl}/en/tools/image-cropper`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.63,
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
      url: `${siteUrl}/en/tools/remove-line-breaks`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.62,
    },
    {
      url: `${siteUrl}/en/tools/screen-recorder`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.61,
    },
    {
      url: `${siteUrl}/en/tools/screen-recorder/privacy-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${siteUrl}/en/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.72,
    },
    {
      url: `${siteUrl}/en/blog/10-easy-tools-to-start-your-tech-journey-in-2026`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.74,
    },
    {
      url: `${siteUrl}/en/blog/10-best-tools-to-create-3d-websites-using-three-js-in-2026`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
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
      url: `${siteUrl}/fi/tools/image-cropper`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.53,
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
    {
      url: `${siteUrl}/fi/tools/remove-line-breaks`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.52,
    },
    {
      url: `${siteUrl}/fi/tools/screen-recorder`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.51,
    },
    {
      url: `${siteUrl}/fi/tools/screen-recorder/privacy-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/fi/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.62,
    },
    {
      url: `${siteUrl}/fi/blog/10-easy-tools-to-start-your-tech-journey-in-2026`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.64,
    },
    {
      url: `${siteUrl}/fi/blog/10-best-tools-to-create-3d-websites-using-three-js-in-2026`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ];
}
