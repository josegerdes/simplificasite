/** A IA às vezes ignora a instrução de "sem markdown" e devolve **negrito**, *itálico*,
 *  `código` ou # títulos — como esses campos vão direto pra um <input>/<textarea> puro (sem
 *  renderizar markdown), isso aparece pro admin como asteriscos soltos no texto. Tira essa
 *  formatação de qualquer resposta de IA antes de devolver pro client, em vez de confiar
 *  só na instrução do prompt. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}
