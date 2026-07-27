"use client";

import { useEffect } from "react";

import { trackPixelEvent } from "@/components/public/pixel-script";

export function ViewContentTracker({ courseSlug, courseName, price }: { courseSlug: string; courseName: string; price: number }) {
  useEffect(() => {
    trackPixelEvent("ViewContent", { content_ids: [courseSlug], content_name: courseName, currency: "BRL", value: price });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  return null;
}
