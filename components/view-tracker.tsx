"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  slug: string;
}

/**
 * Client component that tracks page views
 * Only tracks in production (not on localhost)
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Only track views in production
    const isProduction =
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1");

    if (!isProduction) {
      return;
    }

    // Track the view
    fetch(`/api/track-view?slug=${encodeURIComponent(slug)}`, {
      method: "GET",
      // Don't wait for response - fire and forget for performance
    }).catch((error) => {
      // Silently fail - we don't want view tracking to break the page
      console.error("Failed to track view:", error);
    });
  }, [slug]);

  // This component doesn't render anything
  return null;
}
