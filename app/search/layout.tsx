import type { Metadata } from "next";
import { generateSearchSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Search Matches",
  description: "Search and filter potential life partners by age, religion, location, and more.",
  other: {
    "script:ld+json": JSON.stringify(generateSearchSchema("https://haldimehendi.example.com")),
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
