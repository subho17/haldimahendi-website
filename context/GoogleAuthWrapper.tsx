"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "demo_google_client_id";

export default function GoogleAuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
