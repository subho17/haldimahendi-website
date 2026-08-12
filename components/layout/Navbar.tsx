"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import NavbarGuest from "./NavbarGuest";
import AuthenticatedNavbar from "@/components/authenticated/AuthenticatedNavbar";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <NavbarGuest />;
  }

  if (isAuthenticated) {
    return <AuthenticatedNavbar />;
  }

  return <NavbarGuest />;
}
