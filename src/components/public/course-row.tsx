"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CourseRow({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="py-4">
      <div className="container mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scrollBy(-600)}
            className="rounded-full border border-white/20 p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(600)}
            className="rounded-full border border-white/20 p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="container flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
