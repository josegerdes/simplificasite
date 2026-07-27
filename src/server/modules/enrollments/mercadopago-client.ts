import { MercadoPagoConfig } from "mercadopago";

import { ApiError } from "@/server/auth/guards";

let cachedConfig: MercadoPagoConfig | null = null;

/** Lazy (não no module scope) — mesmo motivo do `db/client.ts`: o build do Next
 *  carrega os route handlers antes de variáveis de ambiente de runtime existirem. */
export function getMercadoPagoClient(): MercadoPagoConfig {
  if (cachedConfig) return cachedConfig;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new ApiError(422, "Pagamento indisponível no momento — Mercado Pago não configurado");
  }
  cachedConfig = new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
  return cachedConfig;
}
