import { MapPin, ShieldCheck } from "lucide-react";

import { UnitCard } from "@/components/public/unit-card";

export interface InstitutionalPillar {
  title: string;
  description: string;
}

export interface InstitutionalLocation {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
}

/**
 * A página do curso não pode falar só do curso — quem nunca ouviu falar da escola precisa de
 * confiança institucional antes de pagar. Seção compacta com pilares + unidades/mapa,
 * reaproveitando o mesmo conteúdo do site-config usado na home.
 */
export function InstitutionalSection({
  brandName,
  pillars,
  locations,
}: {
  brandName: string;
  pillars: InstitutionalPillar[];
  locations: InstitutionalLocation[];
}) {
  return (
    <div className="space-y-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">Sobre a {brandName}</h2>
        <p className="mt-1 text-sm text-white/50">Formação de qualidade para transformar carreiras na Odontologia</p>
      </div>

      {pillars.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pillars.slice(0, 4).map((pillar) => (
            <div key={pillar.title} className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" />
              <div>
                <p className="font-heading text-sm font-semibold text-white">{pillar.title}</p>
                <p className="mt-0.5 text-sm text-white/60">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div>
          <p className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-white">
            <MapPin className="h-4 w-4 text-brand-teal" />
            Nossas unidades
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {locations.map((location) => (
              <UnitCard key={location.id} location={location} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
