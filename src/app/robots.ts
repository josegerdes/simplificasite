import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/api", "/courses", "/enrollments", "/abandoned-carts", "/sellers", "/site-config", "/settings", "/contact-messages", "/docs"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
