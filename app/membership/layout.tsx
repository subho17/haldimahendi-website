import type { Metadata } from "next";
import { generateMembershipSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Premium Membership",
  description: "Unlock premium features - contact details, profile highlights, priority support, and more.",
  other: {
    "script:ld+json": JSON.stringify(generateMembershipSchema("https://haldimehendi.example.com")),
  },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
