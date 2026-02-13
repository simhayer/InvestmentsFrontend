import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wallstreetai.io";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/analytics/", "/settings/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
