import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wallstreetai.io";
  const now = new Date();

  return [
    { url: `${siteUrl}/landing`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
