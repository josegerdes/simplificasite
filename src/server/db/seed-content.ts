import { randomUUID } from "crypto";

import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { CourseDoc, EmentaModule } from "@/server/db/schema";
import { ensureEmentaExists } from "@/server/modules/ementa/service";

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
  ementaModules: EmentaModule[];
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
    ementaModules: [
      { title: "Fundamentos da Estratificação", topics: ["Seleção de cor e resinas", "Anatomia dental aplicada", "Bioimitação do esmalte e dentina"] },
      { title: "Planejamento do Sorriso", topics: ["Análise facial e proporções", "Mock-up e wax-up digital", "Comunicação com o paciente"] },
      { title: "Execução Clínica", topics: ["Isolamento absoluto", "Técnica de estratificação passo a passo", "Acabamento e polimento"] },
      { title: "Prática em Pacientes Reais", topics: ["Atendimento supervisionado", "Casos clínicos completos", "Antes e depois"] },
    ],
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
    ementaModules: [
      { title: "Fundamentos da Dentística", topics: ["Diagnóstico e plano de tratamento", "Materiais restauradores modernos", "Adesão dental"] },
      { title: "Dentística Direta", topics: ["Restaurações em resina composta", "Técnicas de estratificação", "Reanatomização estética"] },
      { title: "Dentística Indireta", topics: ["Facetas e coroas estéticas", "Onlays e overlays", "Cimentação adesiva"] },
      { title: "Reabilitação Estética Avançada", topics: ["Casos multidisciplinares", "Clareamento dental", "Planejamento digital do sorriso"] },
      { title: "Prática Clínica Supervisionada", topics: ["Atendimento a pacientes reais", "Discussão de casos", "Acompanhamento pós-tratamento"] },
    ],
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
    ementaModules: [
      { title: "Fundamentos em Prótese", topics: ["Planejamento protético", "Materiais e ligas", "Oclusão aplicada"] },
      { title: "Prótese Fixa e Removível", topics: ["Coroas e pontes", "Prótese parcial removível", "Prótese total"] },
      { title: "Prótese sobre Implante", topics: ["Planejamento de caso", "Componentes protéticos", "Prótese unitária e múltipla"] },
      { title: "Odontologia Digital", topics: ["Escaneamento intraoral", "Planejamento digital", "Fluxo digital completo"] },
    ],
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
    ementaModules: [
      { title: "Fundamentos da HOF", topics: ["Anatomia facial aplicada", "Farmacologia das toxinas e preenchedores", "Biossegurança"] },
      { title: "Toxina Botulínica", topics: ["Terço superior da face", "Sorriso gengival", "Técnicas avançadas de aplicação"] },
      { title: "Preenchimento Facial", topics: ["Ácido hialurônico", "Harmonização de lábios", "Contorno facial"] },
      { title: "Bioestimuladores e Fios", topics: ["Bioestimuladores de colágeno", "Fios de sustentação", "Protocolos combinados"] },
      { title: "Atendimento em Pacientes Reais", topics: ["Avaliação e diagnóstico facial", "Casos supervisionados", "Antes e depois"] },
    ],
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
    ementaModules: [
      { title: "Fundamentos da Implantodontia", topics: ["Anatomia óssea aplicada", "Biomecânica dos implantes", "Planejamento de caso"] },
      { title: "Diagnóstico por Imagem", topics: ["Tomografia computadorizada", "Planejamento digital 3D", "Guias cirúrgicos"] },
      { title: "Cirurgia de Implantes", topics: ["Técnica cirúrgica básica", "Enxertos ósseos", "Cirurgia guiada"] },
      { title: "Prótese sobre Implante", topics: ["Prótese unitária", "Prótese total sobre implantes", "Componentes protéticos"] },
      { title: "Casos Clínicos Avançados", topics: ["Casos estéticos", "Complicações e manejo", "Acompanhamento pós-operatório"] },
    ],
  },
  {
    name: "Atualização em Cirurgia Oral Menor",
    shortDescription: "Atualização prática para o dia a dia do consultório.",
    longDescription: "Curso de atualização em cirurgia oral menor com foco em procedimentos do dia a dia clínico.",
    workloadHours: 40,
    startDate: "Abril de 2026",
    coverImageUrl: null,
    highlights: ["Procedimentos do dia a dia", "Turma reduzida", "Certificado de atualização"],
    ementaModules: [
      { title: "Fundamentos da Cirurgia Oral", topics: ["Anestesia local avançada", "Instrumental cirúrgico", "Biossegurança"] },
      { title: "Exodontias", topics: ["Exodontia simples e complexa", "Dentes inclusos", "Manejo de complicações"] },
      { title: "Pequenas Cirurgias", topics: ["Frenectomia", "Biópsias", "Cirurgia periodontal básica"] },
    ],
  },
  {
    name: "Residência em Laminados Cerâmicos",
    shortDescription: "Imersão prática e intensiva em laminados cerâmicos.",
    longDescription: "Residência intensiva com foco total em laminados cerâmicos, do preparo dental à cimentação final.",
    workloadHours: 40,
    startDate: "21 e 22 de Fevereiro",
    coverImageUrl: null,
    highlights: ["Formato imersivo de fim de semana", "Prática em pacientes reais", "Turma limitada"],
    ementaModules: [
      { title: "Planejamento Estético", topics: ["Seleção de casos", "Escala de cor cerâmica", "Comunicação com o laboratório"] },
      { title: "Preparo Dental", topics: ["Preparo minimamente invasivo", "Moldagem e escaneamento", "Provisórios estéticos"] },
      { title: "Cimentação Final", topics: ["Protocolo adesivo", "Cimentação de laminados", "Ajuste oclusal e polimento"] },
    ],
  },
  {
    name: "Especialização em Periodontia",
    shortDescription: "Diagnóstico e tratamento periodontal do básico ao avançado.",
    longDescription: "Especialização em periodontia com prática clínica constante, do diagnóstico ao tratamento cirúrgico avançado.",
    workloadHours: 360,
    startDate: "7 de Novembro",
    coverImageUrl: null,
    highlights: ["Diagnóstico e tratamento avançado", "Prática clínica constante", "Professores especialistas"],
    ementaModules: [
      { title: "Fundamentos da Periodontia", topics: ["Anatomia periodontal", "Diagnóstico das doenças periodontais", "Exame clínico e radiográfico"] },
      { title: "Tratamento Não Cirúrgico", topics: ["Raspagem e alisamento radicular", "Controle de biofilme", "Terapia periodontal de suporte"] },
      { title: "Cirurgia Periodontal", topics: ["Cirurgia ressectiva", "Cirurgia regenerativa", "Enxertos gengivais"] },
      { title: "Estética Periodontal", topics: ["Aumento de coroa clínica", "Recobrimento radicular", "Periodontia e implantodontia"] },
    ],
  },
  {
    name: "Especialização em Endodontia",
    shortDescription: "Tratamento endodôntico moderno com tecnologia rotatória.",
    longDescription: "Especialização em endodontia com uso de tecnologia rotatória moderna e prática supervisionada em casos reais.",
    workloadHours: 360,
    startDate: "11 de Março",
    coverImageUrl: null,
    highlights: ["Tecnologia rotatória moderna", "Casos clínicos reais", "Professores especialistas"],
    ementaModules: [
      { title: "Fundamentos da Endodontia", topics: ["Anatomia do sistema de canais", "Diagnóstico pulpar", "Isolamento absoluto"] },
      { title: "Instrumentação Rotatória", topics: ["Sistemas rotatórios modernos", "Preparo biomecânico", "Odontometria eletrônica"] },
      { title: "Obturação e Casos Clínicos", topics: ["Técnicas de obturação", "Retratamento endodôntico", "Casos clínicos complexos"] },
    ],
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
        locations: [
          {
            id: randomUUID(),
            name: "Unidade Rio de Janeiro",
            address: "Botafogo - Rua Oliveira Fausto, 35",
            imageUrl: "/images/site/unidade-botafogo.jpg",
          },
          { id: randomUUID(), name: "Unidade Minas Gerais", address: "Rua João Basílio", imageUrl: null },
        ],
        socialLinks: {
          instagram: "https://www.instagram.com/simplificadoctor/",
          facebook: "https://www.facebook.com/profile.php?id=100088237646673",
          tiktok: null,
          youtube: null,
        },
        updatedAt: now,
      },
      $setOnInsert: {
        _id: new ObjectId(),
        singleton: true,
        brandName: "Simplifica Doctor",
        logoUrl: "/logo.png",
        heroImageUrl: "/images/site/hero-equipe.jpg",
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
    // A ementa nunca é opcional — todo curso já nasce com uma (ver ementaDocs abaixo) — só o
    // checklist "revisar" fica pendente pra lembrar o admin de conferir antes de divulgar.
    ementaPublished: true,
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

  const ementaDocs = docs.map((doc, index) => ({
    _id: new ObjectId(),
    courseId: doc._id,
    modules: SEED_COURSES[index]!.ementaModules,
    generatedByAi: false,
    updatedAt: now,
  }));
  await collections.ementas(db).insertMany(ementaDocs);

  console.log(`[seed-content] ${docs.length} cursos (com ementa) + conteúdo institucional criados.`);
}

/**
 * Backfill defensivo, roda em todo boot: `seedSiteContent` só popula ementa+publicação
 * na primeira vez (courseCount === 0), então cursos que já existiam de antes de a ementa
 * virar obrigatória/publicada por padrão nunca recebiam o conteúdo — o mesmo tipo de bug
 * do site-config com campo novo faltando em doc já salvo. Aqui garante, pra qualquer curso
 * já existente: (1) tem um doc de ementa (usa o conteúdo do seed se o nome bater, senão
 * gera via `ensureEmentaExists`), e (2) `ementaPublished` está true.
 */
export async function backfillCourseEmentas(db: Db): Promise<void> {
  const courses = await collections.courses(db).find({}).toArray();
  if (courses.length === 0) return;

  const existingEmentaCourseIds = new Set(
    (await collections.ementas(db).find({}, { projection: { courseId: 1 } }).toArray()).map((e) => String(e.courseId))
  );

  const now = new Date();
  let createdEmentas = 0;
  for (const course of courses) {
    if (!existingEmentaCourseIds.has(String(course._id))) {
      const seedMatch = SEED_COURSES.find((c) => c.name === course.name);
      if (seedMatch) {
        await collections.ementas(db).insertOne({
          _id: new ObjectId(),
          courseId: course._id,
          modules: seedMatch.ementaModules,
          generatedByAi: false,
          updatedAt: now,
        });
      } else {
        await ensureEmentaExists(db, course);
      }
      createdEmentas += 1;
    }
  }

  const publishResult = await collections
    .courses(db)
    .updateMany({ ementaPublished: { $ne: true } }, { $set: { ementaPublished: true, updatedAt: now } });

  if (createdEmentas > 0 || publishResult.modifiedCount > 0) {
    console.log(
      `[seed-content] backfill de ementa: ${createdEmentas} ementa(s) criada(s), ${publishResult.modifiedCount} curso(s) publicado(s).`
    );
  }
}
