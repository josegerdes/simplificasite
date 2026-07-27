"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  quote: string;
}

const PHOTO_BY_NAME: Record<string, string> = {
  "Dra. Kézia Reis Vangelotti": "/images/testimonials/kezia.jpg",
  "Dra. Ingrid Ribeiro": "/images/testimonials/ingrid.jpg",
  "Dra. Lilian de Araujo": "/images/testimonials/lilian.jpg",
  "Dra. Jéssica Baron": "/images/testimonials/jessica.jpg",
  "Dr. Luis Fernando Santos Oliveira": "/images/testimonials/luis-fernando.jpg",
};

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function TestimonialsCarousel({ testimonials }: { testimonials: TestimonialData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (testimonials.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial) => {
            const photo = PHOTO_BY_NAME[testimonial.name];
            return (
              <div key={testimonial.id} className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                <div className="flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                  <Quote className="h-6 w-6 text-brand-teal" />
                  <p className="flex-1 text-sm text-white/80">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal text-sm font-semibold text-white">
                        {initials(testimonial.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                      <p className="text-xs text-white/50">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.id}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn("h-1.5 rounded-full transition-all", index === selected ? "w-6 bg-brand-teal" : "w-1.5 bg-white/20")}
            aria-label={`Ir para depoimento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
