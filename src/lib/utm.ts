export interface UtmParams {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
}

/** Lê os UTMs da URL atual — chamado só na hora de enviar o checkout (não precisa
 *  persistir em cookie/localStorage: se o visitante não converter na mesma sessão de
 *  navegação em que clicou no anúncio, a atribuição de campanha já seria imprecisa mesmo). */
export function readUtmFromLocation(): UtmParams {
  if (typeof window === "undefined") {
    return { source: null, medium: null, campaign: null, content: null, term: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    term: params.get("utm_term"),
  };
}
