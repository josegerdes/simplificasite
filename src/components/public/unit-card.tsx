import Link from "next/link";
import { Building2, MapPin, MoveRight } from "lucide-react";

import { LocationMap } from "@/components/public/location-map";

export interface UnitCardLocation {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
}

/** Card de unidade física — usado na home e na página do curso (seção institucional).
 *  Unidade sem foto ainda cadastrada (ex: Minas Gerais) ganha um placeholder de marca em
 *  vez de ficar com um buraco vazio no layout. */
export function UnitCard({ location }: { location: UnitCardLocation }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 transition-transform hover:-translate-y-1">
      {location.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={location.imageUrl} alt={location.name} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-brand-teal/25 to-brand-tealDark/40">
          <Building2 className="h-12 w-12 text-white/30" />
        </div>
      )}
      <div className="p-5">
        <p className="font-heading text-lg font-bold text-white">{location.name}</p>
        <p className="mt-1.5 flex items-start gap-2 text-sm text-white/70">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
          {location.address}
        </p>
        <div className="mt-4">
          <LocationMap name={location.name} address={location.address} />
        </div>
        <Link
          href={directionsUrl}
          target="_blank"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal hover:underline"
        >
          Como chegar
          <MoveRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
