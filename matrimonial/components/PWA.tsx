"use client";

import { useEffect } from "react";

export default function PWA() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // In development mode, NEVER register service workers and unregister any existing ones
    // to prevent caching stale Turbopack / Next.js chunks.
    const isDev =
      process.env.NODE_ENV !== "production" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.");

    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().then(() => {
            console.log("Unregistered development service worker:", reg);
          });
        }
      });

      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const handleLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          registration = reg;

          // Check for updates periodically
          intervalId = setInterval(() => {
            const reg = registration;
            if (reg && reg.active) {
              reg.update().catch((err) => {
                console.warn("SW update check failed:", err);
              });
            }
          }, 60 * 60 * 1000); // Every hour

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const reg = registration;
            if (!reg) return;
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New version available, refresh to update");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log("SW registration failed: ", error);
        });
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return null;
}

