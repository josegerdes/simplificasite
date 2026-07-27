import { Lock } from "lucide-react";

import { CourseRow } from "@/components/public/course-row";

const ONLINE_TEASERS = [
  { title: "Odontologia Digital na Prática", tag: "Em breve" },
  { title: "Ortodontia Alinhadores", tag: "Em breve" },
  { title: "Estética Avançada em Resina", tag: "Em breve" },
  { title: "Gestão de Consultório", tag: "Em breve" },
];

/** Cursos online ainda não existem de verdade — mostra a prateleira borrada com
 *  "Em breve" pra sinalizar que estão chegando, sem prometer data nem permitir clique. */
export function OnlineTeaserRow() {
  return (
    <CourseRow title="Cursos Online" subtitle="A qualquer hora, de qualquer lugar — chegando em breve">
      {ONLINE_TEASERS.map((teaser) => (
        <div
          key={teaser.title}
          className="relative flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-gradient-to-br from-brand-teal/40 to-brand-ink shadow-lg ring-1 ring-white/10 md:w-72"
        >
          <div className="relative aspect-[4/5] w-full">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
              <Lock className="h-8 w-8 text-white/70" />
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {teaser.tag}
              </span>
              <p className="px-6 text-center font-heading text-sm font-semibold text-white/90">{teaser.title}</p>
            </div>
          </div>
        </div>
      ))}
    </CourseRow>
  );
}
