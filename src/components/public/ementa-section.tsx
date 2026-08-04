import Link from "next/link";
import { CheckCircle2, Download, Package, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";

export interface EmentaModuleData {
  title: string;
  topics: string[];
}

/**
 * Ementa renderizada como seção de vendas de verdade (não só um link de PDF escondido):
 * módulos numerados visualmente + CTAs intercalados pra converter quem está lendo o
 * conteúdo — a pessoa mais engajada da página é justamente quem está aqui.
 */
export function EmentaSection({
  modules,
  materials,
  courseSlug,
  price,
}: {
  modules: EmentaModuleData[];
  materials: string[];
  courseSlug: string;
  price: number;
}) {
  if (modules.length === 0 && materials.length === 0) return null;

  const midpoint = Math.ceil(modules.length / 2);
  const firstHalf = modules.slice(0, midpoint);
  const secondHalf = modules.slice(midpoint);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">Ementa completa do curso</h2>
          <p className="mt-1 text-sm text-white/50">Tudo que você vai aprender, módulo por módulo</p>
        </div>
        <a
          href={`/api/public/courses/${courseSlug}/ementa-pdf`}
          target="_blank"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand-teal px-4 py-2.5 text-sm font-semibold text-brand-teal transition-colors hover:bg-brand-teal hover:text-white"
        >
          <Download className="h-4 w-4" />
          Baixar em PDF
        </a>
      </div>

      <div className="space-y-4">
        {firstHalf.map((module, index) => (
          <ModuleCard key={module.title} module={module} index={index} />
        ))}
      </div>

      {secondHalf.length > 0 && (
        <>
          <InlineCta price={price} />
          <div className="mt-4 space-y-4">
            {secondHalf.map((module, index) => (
              <ModuleCard key={module.title} module={module} index={midpoint + index} />
            ))}
          </div>
        </>
      )}

      {materials.length > 0 && <MaterialsCard materials={materials} />}

      <FinalCta price={price} />
    </div>
  );
}

function MaterialsCard({ materials }: { materials: string[] }) {
  return (
    <div className="mt-6 rounded-xl border border-brand-gold/30 bg-brand-gold/[0.06] p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
          <Package className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-heading font-semibold text-white">Lista de Material</h3>
          <p className="text-xs text-white/50">O que você precisa ter/levar para acompanhar o curso na prática</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 pl-11 sm:grid-cols-2">
        {materials.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-white/70">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModuleCard({ module, index }: { module: EmentaModuleData; index: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-brand-teal/40">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal font-heading text-sm font-bold text-white">
          {index + 1}
        </span>
        <h3 className="font-heading font-semibold text-white">{module.title}</h3>
      </div>
      {module.topics.length > 0 && (
        <ul className="grid grid-cols-1 gap-1.5 pl-11 sm:grid-cols-2">
          {module.topics.map((topic) => (
            <li key={topic} className="flex items-start gap-2 text-sm text-white/70">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-teal" />
              {topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InlineCta({ price }: { price: number }) {
  return (
    <div className="my-6 flex flex-col items-center gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="font-heading font-semibold text-white">Gostando do que vê? Sua vaga te espera.</p>
        <p className="text-sm text-white/60">Garanta agora por apenas {formatBRL(price)}</p>
      </div>
      <Button asChild variant="cta" className="w-full shrink-0 sm:w-auto">
        <Link href="#matricula">
          <Sparkles className="h-4 w-4" />
          Garantir minha vaga
        </Link>
      </Button>
    </div>
  );
}

function FinalCta({ price }: { price: number }) {
  return (
    <div className="mt-8 rounded-xl bg-gradient-to-br from-brand-teal to-brand-tealDark p-6 text-center sm:p-8">
      <p className="font-heading text-lg font-bold text-white sm:text-xl">
        Curso completo, prática real e vaga limitada.
      </p>
      <p className="mt-2 text-white/90">Comece hoje pagando só a matrícula — {formatBRL(price)}</p>
      <Button asChild size="xl" variant="secondary" className="mt-5">
        <Link href="#matricula">Garantir minha vaga agora</Link>
      </Button>
    </div>
  );
}
