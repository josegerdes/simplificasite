import { createHash } from "crypto";

import { EnrollmentDoc, SiteConfigDoc } from "@/server/db/schema";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Envia o evento Purchase pra Conversions API (server-side) — redundante ao pixel
 * client-side de propósito: é o que garante a atribuição do anúncio mesmo quando o
 * navegador bloqueia o pixel (ad blocker, Safari ITP, etc). Dedup com o client via
 * o mesmo `event_id` (`enrollment.purchaseEventId`) nos dois eventos.
 */
export async function sendPurchaseConversion(config: SiteConfigDoc, enrollment: EnrollmentDoc): Promise<void> {
  const accessToken = process.env.FACEBOOK_CONVERSIONS_ACCESS_TOKEN;
  if (!accessToken || !config.pixel.enabled || !config.pixel.pixelId || !config.pixel.events.purchase) return;

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: enrollment.purchaseEventId,
        action_source: "website",
        user_data: {
          em: [sha256(enrollment.studentEmail)],
          ph: [sha256(enrollment.studentPhone.replace(/\D/g, ""))],
        },
        custom_data: { currency: "BRL", value: enrollment.amount },
      },
    ],
    ...(config.pixel.testEventCode ? { test_event_code: config.pixel.testEventCode } : {}),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${config.pixel.pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.error("[facebook-capi] falha ao enviar evento:", await response.text());
    }
  } catch (error) {
    console.error("[facebook-capi] erro de rede:", error);
  }
}
