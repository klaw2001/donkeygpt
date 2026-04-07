"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useTrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin routes
    if (pathname.startsWith("/admin")) return;

    fetch("/api/track/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);
}
