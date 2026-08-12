"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import NavbarGuest from "./NavbarGuest";
import AuthenticatedNavbar from "@/components/authenticated/AuthenticatedNavbar";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AuthenticatedNavbar />;
  }

  return <NavbarGuest />;
}
