/** `crypto.randomUUID()` só existe em contexto seguro (HTTPS ou localhost) — em produção
 *  servida por HTTP puro (sem SSL configurado ainda) ele é `undefined` e quebra a página
 *  inteira com um TypeError não tratado. Usa quando disponível, cai pra um fallback simples
 *  (não-criptográfico, mas suficiente pra um id de sessão local) quando não está. */
export function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
