"use client";

import { useEffect } from "react";

export default function PWA() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const handleLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          registration = reg;
          console.log("SW registered: ", registration);

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
