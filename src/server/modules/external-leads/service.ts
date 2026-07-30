import { ApiError } from "@/server/auth/guards";
import { ExternalLeadInput } from "@/server/modules/external-leads/types";

/**
 * Encaminha o lead pro CRM externo (SimplificaLink/Sistema do Aluno) via o endpoint público
 * documentado por eles (`POST /api/public/leads`, autenticado por `unitId`+`token` no corpo,
 * não por header). unitId/token ficam só em env var (nunca no client) — mesmo com o endpoint
 * deles aceitando embutir isso num `<form>` HTML público, prefir fazer o relay pelo nosso
 * próprio backend pra manter o padrão do resto do projeto (nenhum segredo no bundle do client)
 * e poder validar/padronizar os dados antes de mandar.
 */
export async function submitExternalLead(
  input: ExternalLeadInput,
  options: { leadType: "patient" | "student"; originLabel: string }
): Promise<void> {
  const endpoint = process.env.SIMPLIFICALINK_ENDPOINT;
  const unitId = process.env.SIMPLIFICALINK_UNIT_ID;
  const token = process.env.SIMPLIFICALINK_TOKEN;
  if (!endpoint || !unitId || !token) {
    throw new ApiError(503, "Captação de leads temporariamente indisponível — tente novamente mais tarde");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      unitId,
      token,
      leadType: options.leadType,
      originLabel: options.originLabel,
      name: input.name,
      email: input.email || undefined,
      whatsapp: input.whatsapp,
      interest: input.interest || undefined,
    }),
  });

  if (!response.ok) {
    console.error("[external-leads] falha ao enviar lead pro SimplificaLink:", response.status, await response.text().catch(() => ""));
    throw new ApiError(502, "Não foi possível enviar seu cadastro agora — tente novamente em instantes");
  }
}
