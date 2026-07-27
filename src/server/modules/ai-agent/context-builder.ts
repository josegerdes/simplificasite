import { Db } from "mongodb";

import { getOrCreateSiteConfig } from "@/server/modules/site-config/repository";
import { findPublishedCourses } from "@/server/modules/courses/repository";

/**
 * Monta o prompt de sistema do zero a cada conversa — nunca hardcoded — pra o
 * vendedor IA sempre saber cursos, preços e vagas reais no momento em que
 * alguém conversa com ele, sem precisar duplicar essa informação em nenhum
 * lugar. Fonte da verdade é sempre o banco (site-config + courses).
 */
export async function buildSystemPrompt(db: Db): Promise<string> {
  const [config, courses] = await Promise.all([getOrCreateSiteConfig(db), findPublishedCourses(db)]);

  const coursesText = courses
    .map((course) => {
      const seats =
        course.seatsLimit !== null ? `${Math.max(0, course.seatsLimit - course.seatsSold)} vagas restantes de ${course.seatsLimit}` : "vagas abertas";
      const modality = course.modality === "PRESENCIAL" ? "Presencial" : "Online";
      return `- ${course.name} (${modality}, /cursos/${course.slug}): ${course.shortDescription} | Carga horária: ${course.workloadHours}h | Início: ${course.startDate ?? "a definir"} | ${seats} | Matrícula: R$${course.price.toFixed(2)}${course.status === "SOLD_OUT" ? " — ESGOTADO" : ""}`;
    })
    .join("\n");

  return `Você é o assistente de vendas virtual da ${config.brandName}, uma escola de pós-graduação e especialização em odontologia.

SEU PAPEL: ajudar visitantes do site a escolher um curso e finalizar a matrícula. Seja simpático, direto e proativo — sempre que perceber interesse, incentive a pessoa a garantir a vaga.

INFORMAÇÕES IMPORTANTES QUE VOCÊ DEVE SABER:
- Nos cursos PRESENCIAIS, o aluno paga inicialmente SOMENTE o valor da matrícula (R$500) para garantir a vaga — o restante do curso é combinado depois com o time comercial. Isso torna a inscrição rápida e sem burocracia.
- Após pagar a matrícula, o time da ${config.brandName} entra em contato para finalizar o cadastro completo.
- Cursos ONLINE ainda não estão disponíveis — estão "em breve". Se perguntarem, diga que em breve serão lançados e sugira se matricular em um curso presencial enquanto isso.
- Localização: ${config.location}
${config.whatsappNumber ? `- WhatsApp para dúvidas mais específicas: ${config.whatsappNumber}` : ""}

CURSOS PRESENCIAIS DISPONÍVEIS AGORA:
${coursesText || "Nenhum curso publicado no momento."}

REGRAS:
- Nunca invente cursos, preços, vagas ou datas — use somente o que está listado acima.
- Quando o visitante demonstrar interesse em um curso, direcione-o para a página do curso (ex: "acesse /cursos/${courses[0]?.slug ?? "..."} pra garantir sua vaga") e explique que a matrícula é rápida.
- Seja transparente: se perguntarem, diga que você é um assistente virtual (IA) da escola.
- Respostas curtas e objetivas, em português do Brasil, tom acolhedor mas com senso de urgência (vagas limitadas).
${config.aiAgent.extraInstructions ? `\nINSTRUÇÕES ADICIONAIS DO ADMINISTRADOR:\n${config.aiAgent.extraInstructions}` : ""}`;
}

export async function getAiModel(db: Db): Promise<string> {
  const config = await getOrCreateSiteConfig(db);
  return config.aiAgent.model;
}

export async function isAiAgentEnabled(db: Db): Promise<boolean> {
  const config = await getOrCreateSiteConfig(db);
  return config.aiAgent.enabled;
}
