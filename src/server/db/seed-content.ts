import { randomUUID } from "crypto";

import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { CourseDoc } from "@/server/db/schema";

const PILLARS = [
  {
    title: "Excelência no Ensino",
    description:
      "Formação de alto nível com professores renomados e conteúdos atualizados, preparando você para os desafios reais da odontologia.",
  },
  {
    title: "Acessibilidade e Inclusão",
    description: "Educação de qualidade a um valor acessível, tornando especializações odontológicas viáveis para mais profissionais.",
  },
  {
    title: "Ética e Compromisso",
    description: "Transparência e responsabilidade, honrando nossos compromissos com alunos, parceiros e comunidade.",
  },
  {
    title: "Inovação Constante",
    description: "Aplicamos as inovações mais recentes da odontologia, com formação moderna e alinhada às tendências do mercado.",
  },
  {
    title: "Práticas em pacientes reais",
    description: "Desde cedo, nossos alunos atuam em atendimentos reais com supervisão especializada, acelerando o desenvolvimento clínico.",
  },
  {
    title: "Networking e Colaboração",
    description: "Eventos e experiências que fortalecem o aprendizado e a troca de conhecimento entre alunos e professores.",
  },
];

const TESTIMONIALS = [
  {
    name: "Dra. Kézia Reis Vangelotti",
    role: "Cirurgiã Dentista",
    quote: "Equipe excelente! As aulas foram muito esclarecedoras e de forma muito didática.",
  },
  {
    name: "Dra. Ingrid Ribeiro",
    role: "Cirurgiã Dentista",
    quote:
      "O melhor curso de laminados do Rio de Janeiro! Amei fazer parte desse time, aprendi muito, foi o divisor de águas na minha profissão.",
  },
  {
    name: "Dra. Lilian de Araujo",
    role: "Cirurgiã Dentista",
    quote:
      "Difícil expressar tudo que esse curso me proporcionou. Um curso completo, inovador e de qualidade, além das minhas expectativas.",
  },
  {
    name: "Dra. Jéssica Baron",
    role: "Cirurgiã Dentista",
    quote:
      "Somente gratidão a esse curso, nos entregou muito conhecimento! Nos passaram tudo de forma leve, divertida e responsável.",
  },
  {
    name: "Dr. Luis Fernando Santos Oliveira",
    role: "Cirurgião Dentista",
    quote: "O carinho que vocês têm com o ato de ensinar faz qualquer um se apaixonar pela profissão! Um prazer aprender com esse time.",
  },
];

interface SeedCourse {
  name: string;
  shortDescription: string;
  longDescription: string;
  workloadHours: number;
  startDate: string;
  coverImageUrl: string | null;
  highlights: string[];
}

const BANNERS = [
  "/images/banners/turma-nova.webp",
  "/images/banners/pratica-hof.webp",
  "/images/banners/pratica-implanto.webp",
  "/images/banners/tendencias-hof.webp",
  "/images/banners/veja.webp",
  "/images/banners/hof-turma.webp",
];

const SEED_COURSES: SeedCourse[] = [
  {
    name: "Facetas de Resina Estratificadas",
    shortDescription: "Técnica de estratificação em resina composta para resultados estéticos previsíveis.",
    longDescription:
      "Curso prático de facetas em resina composta estratificada, do planejamento do sorriso à execução clínica em pacientes reais.",
    workloadHours: 40,
    startDate: "06 de Agosto",
    coverImageUrl: null,
    highlights: ["Prática em pacientes reais", "Planejamento digital do sorriso", "Certificado de conclusão"],
  },
  {
    name: "Especialização em Dentística Restauradora",
    shortDescription: "Especialização completa em dentística, do diagnóstico à reabilitação estética.",
    longDescription:
      "Formação completa em dentística restauradora moderna, unindo fundamentos teóricos e prática clínica supervisionada.",
    workloadHours: 360,
    startDate: "15 de Outubro",
    coverImageUrl: null,
    highlights: ["Carga horária completa de especialização", "Professores renomados", "Atendimento a pacientes reais"],
  },
  {
    name: "Especialização em Prótese Dentária",
    shortDescription: "Prótese sobre dente e sobre implante, do planejamento à odontologia digital.",
    longDescription:
      "Especialização em prótese dentária com módulo de atualização em prótese sobre implante e capacitação em odontologia digital.",
    workloadHours: 360,
    startDate: "22 de Setembro",
    coverImageUrl: null,
    highlights: ["Prótese sobre implante", "Odontologia digital", "Prática supervisionada"],
  },
  {
    name: "Especialização em Harmonização Orofacial",
    shortDescription: "Formação completa em HOF, uma das áreas que mais crescem na odontologia.",
    longDescription:
      "Especialização em Harmonização Orofacial com aulas teóricas e práticas em pacientes reais, acompanhando as tendências mais atuais da área.",
    workloadHours: 360,
    startDate: "Turmas abertas",
    coverImageUrl: "/images/banners/hof-turma.webp",
    highlights: ["Últimas técnicas de HOF", "Prática supervisionada", "Alta demanda de mercado"],
  },
  {
    name: "Especialização em Implantodontia",
    shortDescription: "Do planejamento à cirurgia, com prática em pacientes reais desde o início.",
    longDescription:
      "Especialização completa em implantodontia, do planejamento digital à cirurgia guiada, com prática constante em pacientes reais.",
    workloadHours: 360,
    startDate: "09 de Outubro",
    coverImageUrl: "/images/banners/pratica-implanto.webp",
    highlights: ["Cirurgia guiada", "Prática desde o início do curso", "Supervisão de especialistas"],
  },
  {
    name: "Atualização em Cirurgia Oral Menor",
    shortDescription: "Atualização prática para o dia a dia do consultório.",
    longDescription: "Curso de atualização em cirurgia oral menor com foco em procedimentos do dia a dia clínico.",
    workloadHours: 40,
    startDate: "Abril de 2026",
    coverImageUrl: null,
    highlights: ["Procedimentos do dia a dia", "Turma reduzida", "Certificado de atualização"],
  },
  {
    name: "Residência em Laminados Cerâmicos",
    shortDescription: "Imersão prática e intensiva em laminados cerâmicos.",
    longDescription: "Residência intensiva com foco total em laminados cerâmicos, do preparo dental à cimentação final.",
    workloadHours: 40,
    startDate: "21 e 22 de Fevereiro",
    coverImageUrl: null,
    highlights: ["Formato imersivo de fim de semana", "Prática em pacientes reais", "Turma limitada"],
  },
  {
    name: "Especialização em Periodontia",
    shortDescription: "Diagnóstico e tratamento periodontal do básico ao avançado.",
    longDescription: "Especialização em periodontia com prática clínica constante, do diagnóstico ao tratamento cirúrgico avançado.",
    workloadHours: 360,
    startDate: "7 de Novembro",
    coverImageUrl: null,
    highlights: ["Diagnóstico e tratamento avançado", "Prática clínica constante", "Professores especialistas"],
  },
  {
    name: "Especialização em Endodontia",
    shortDescription: "Tratamento endodôntico moderno com tecnologia rotatória.",
    longDescription: "Especialização em endodontia com uso de tecnologia rotatória moderna e prática supervisionada em casos reais.",
    workloadHours: 360,
    startDate: "11 de Março",
    coverImageUrl: null,
    highlights: ["Tecnologia rotatória moderna", "Casos clínicos reais", "Professores especialistas"],
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Popula o site-config singleton com o conteúdo institucional real (copiado do
 * simplificadoctor.com — hero, pilares, depoimentos, localização) e os 9 cursos
 * presenciais de exemplo. Idempotente: só roda se ainda não existir NENHUM
 * curso (não mexe em nada se o admin já começou a cadastrar conteúdo real).
 */
export async function seedSiteContent(db: Db): Promise<void> {
  const courseCount = await collections.courses(db).countDocuments();
  if (courseCount > 0) {
    console.log("[seed-content] Ignorado: já existem cursos cadastrados.");
    return;
  }

  const now = new Date();
  await collections.siteConfig(db).updateOne(
    { singleton: true },
    {
      $set: {
        heroTitle: "Comece agora a formação que vai fazer a diferença na sua carreira",
        heroSubtitle:
          "Na Simplifica Doctor, formamos profissionais odontológicos capacitados e atualizados, com cursos acessíveis e práticos que elevam o padrão da odontologia no Brasil.",
        pillars: PILLARS,
        testimonials: TESTIMONIALS.map((t) => ({ id: randomUUID(), ...t })),
        location: "Botafogo - Rua Oliveira Fausto, 35",
        updatedAt: now,
      },
      $setOnInsert: {
        _id: new ObjectId(),
        singleton: true,
        brandName: "Simplifica Doctor",
        logoUrl: "/logo.png",
        whatsappNumber: null,
        pixel: {
          pixelId: null,
          testEventCode: null,
          enabled: false,
          events: { pageView: true, viewContent: true, initiateCheckout: true, purchase: true },
        },
        aiAgent: { enabled: false, model: "gpt-4o-mini", extraInstructions: "" },
        salesTools: { defaultSeatsLimit: 40, urgencyBannerEnabled: true, urgencyBannerText: "Vagas limitadas — garanta a sua matrícula agora" },
      },
    },
    { upsert: true }
  );

  const docs: CourseDoc[] = SEED_COURSES.map((course, index) => ({
    _id: new ObjectId(),
    slug: slugify(course.name),
    name: course.name,
    modality: "PRESENCIAL",
    status: "PUBLISHED",
    shortDescription: course.shortDescription,
    longDescription: course.longDescription,
    highlights: course.highlights,
    instructors: [],
    coverImageUrl: course.coverImageUrl ?? BANNERS[index % BANNERS.length] ?? null,
    workloadHours: course.workloadHours,
    location: "Botafogo - Rua Oliveira Fausto, 35",
    startDate: course.startDate,
    price: 500,
    originalPrice: null,
    promoDeadline: null,
    seatsLimit: 40,
    seatsSold: 0,
    pixelOverride: { enabled: false, pixelId: null },
    ementaPublished: false,
    checklist: [
      { id: randomUUID(), label: "Pegar ementa/conteúdo detalhado com o professor", done: true, isDefault: true },
      { id: randomUUID(), label: "Confirmar carga horária, datas e turma", done: true, isDefault: true },
      { id: randomUUID(), label: "Criar artes e banners de divulgação", done: false, isDefault: true },
      { id: randomUUID(), label: "Configurar preço, vagas e ferramentas de venda", done: true, isDefault: true },
      { id: randomUUID(), label: "Revisar descrição, destaques e depoimentos", done: true, isDefault: true },
      { id: randomUUID(), label: "Gerar e revisar a ementa em PDF", done: false, isDefault: true },
    ],
    createdAt: now,
    updatedAt: now,
  }));

  await collections.courses(db).insertMany(docs);
  console.log(`[seed-content] ${docs.length} cursos + conteúdo institucional criados.`);
}
