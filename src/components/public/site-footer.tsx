import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";

export interface SiteFooterLocation {
  id: string;
  name: string;
  address: string;
}

export function SiteFooter({
  brandName,
  logoUrl,
  locations,
  whatsappNumber,
}: {
  brandName: string;
  logoUrl: string;
  locations: SiteFooterLocation[];
  whatsappNumber: string | null;
}) {
  return (
    <footer className="border-t border-white/10 bg-brand-ink text-white/70">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div>
          {/* Sem filtro de cor — mantém a identidade visual (teal) original da logo. */}
          <img src={logoUrl} alt={brandName} className="mb-3 h-9 w-auto" />
          <p className="text-sm">Formação de qualidade para transformar carreiras na Odontologia.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Nossas unidades</p>
          {locations.map((location) => (
            <p key={location.id} className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="text-white/90">{location.name}:</span> {location.address}
              </span>
            </p>
          ))}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Fale conosco</p>
          {whatsappNumber ? (
            <Link
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              className="flex items-center gap-2 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Link>
          ) : (
            <p>Fale com a gente pelo chat do site.</p>
          )}
          <Link href="/contato" className="block hover:text-white">
            Página de contato
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {brandName}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
