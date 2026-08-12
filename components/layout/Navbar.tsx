"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import NavbarGuest from "./NavbarGuest";
import AuthenticatedNavbar from "@/components/authenticated/AuthenticatedNavbar";
import { useMounted } from "@/hooks/useMounted";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const mounted = useMounted();

  if (!mounted || isLoading) {
    return <NavbarGuest />;
  }

  if (isAuthenticated) {
    return <AuthenticatedNavbar />;
  }

  return <NavbarGuest />;
}
