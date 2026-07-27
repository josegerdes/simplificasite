"use client";

import Script from "next/script";

export interface PublicPixelConfig {
  pixelId: string | null;
  testEventCode: string | null;
  events: { pageView: boolean; viewContent: boolean; initiateCheckout: boolean; purchase: boolean };
}

/** Base do Facebook Pixel — injetado só quando o admin configurou e ativou um Pixel ID.
 *  Eventos além de PageView são disparados nos componentes específicos (ver `usePixelEvent`). */
export function PixelScript({ pixel }: { pixel: PublicPixelConfig | null }) {
  if (!pixel?.pixelId) return null;

  return (
    <Script id="fb-pixel-base" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixel.pixelId}');
        ${pixel.testEventCode ? `fbq('set', 'agent', 'tmSdk', '${pixel.pixelId}');` : ""}
        ${pixel.events.pageView ? "fbq('track', 'PageView');" : ""}
      `}
    </Script>
  );
}

/** Dispara um evento do Pixel client-side, se o `fbq` já tiver carregado — usado pelos
 *  componentes de curso/checkout (ViewContent/InitiateCheckout/Purchase). */
export function trackPixelEvent(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}
