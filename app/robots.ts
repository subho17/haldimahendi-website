import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://haldimehendi.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/matches", "/membership", "/profile", "/help", "/safe-online"],
        disallow: ["/chat", "/inbox", "/photos", "/preferences", "/settings", "/auth/", "/admin/", "/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/search", "/matches", "/membership", "/profile", "/help", "/safe-online"],
        disallow: ["/chat", "/inbox", "/photos", "/preferences", "/settings", "/auth/", "/admin/", "/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/search", "/matches", "/membership", "/profile", "/help", "/safe-online"], 
        disallow: ["/chat", "/inbox", "/photos", "/preferences", "/settings", "/auth/", "/admin/", "/api/", "/_next/", "/static/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
