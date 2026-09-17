// import type { Metadata } from "next";

export function generateWebSiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shaadi Matrimonial",
    url: baseUrl,
    description: "India's trusted matrimonial platform for meaningful connections.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Shaadi Matrimonial",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icons/icon-192x192.png`,
      },
    },
  };
}

export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shaadi Matrimonial",
    url: baseUrl,
    logo: `${baseUrl}/icons/icon-192x192.png`,
    sameAs: [
      "https://facebook.com/shaadimatrimonial",
      "https://twitter.com/shaadimatrimonial",
      "https://instagram.com/shaadimatrimonial",
      "https://linkedin.com/company/shaadimatrimonial",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-XXXXXXXXXX",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function generateSearchSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Search Matches",
    description: "Search and filter potential life partners by age, religion, location, and more.",
    url: `${baseUrl}/search`,
    mainEntity: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateMembershipSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Premium Membership",
    description: "Unlock premium features on Shaadi Matrimonial - contact details, profile highlights, priority support.",
    url: `${baseUrl}/membership`,
    mainEntity: {
      "@type": "Service",
      name: "Premium Membership",
      provider: {
        "@type": "Organization",
        name: "Shaadi Matrimonial",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Premium (3 months)",
          price: "999",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          description: "View contact details, see who viewed your profile, chat priority support, profile highlighted in search",
        },
        {
          "@type": "Offer",
          name: "Premium Plus (12 months)",
          price: "2499",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          description: "Everything in Premium + personal matchmaking manager, advanced astro matching, profile boost",
        },
      ],
    },
  };
}

export function generateProfileSchema(profile: {
  name: string;
  age: number;
  gender: string;
  city: string;
  religion: string;
  occupation: string;
  education: string;
  bio?: string;
  avatarUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    homeLocation: {
      "@type": "Place",
      name: profile.city,
    },
    knowsAbout: [profile.religion, profile.occupation, profile.education],
    description: profile.bio,
    image: profile.avatarUrl,
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image,
    publisher: {
      "@type": "Organization",
      name: "HaldiMeHendi",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://haldimehendi.com"}/icons/icon-192x192.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}