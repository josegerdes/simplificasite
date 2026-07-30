"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { title: "Início", href: "/" },
  { title: "Cursos", href: "/cursos" },
  { title: "Paciente Modelo", href: "/paciente-modelo" },
  { title: "Contato", href: "/contato" },
];

export function SiteHeader({ brandName, logoUrl }: { brandName: string; logoUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-ink/95 backdrop-blur supports-[backdrop-filter]:bg-brand-ink/80">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Sem filtro de cor — a logo já tem a identidade visual (teal) e não pode ser alterada. */}
          <img src={logoUrl} alt={brandName} className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-base font-semibold text-white/80 transition-colors hover:text-white",
                pathname === item.href && "text-white"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="cta">
            <Link href="/cursos">Garantir minha vaga</Link>
          </Button>
        </div>

        <button className="text-white md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-ink px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-base font-semibold text-white/80" onClick={() => setOpen(false)}>
                {item.title}
              </Link>
            ))}
            <Button asChild variant="cta" className="mt-2">
              <Link href="/cursos" onClick={() => setOpen(false)}>
                Garantir minha vaga
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
