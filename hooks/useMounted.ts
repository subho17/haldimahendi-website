"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// Returns true only after hydration (client side). False during SSR.
// Replaces the `setMounted(true)` effect pattern to avoid lint errors.
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}