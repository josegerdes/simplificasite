import Link from "next/link";
import { GraduationCap, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { CountdownTimer } from "@/components/public/countdown-timer";

export interface PublicCourseCardData {
  slug: string;
  name: string;
  shortDescription: string;
  coverImageUrl: string | null;
  saleMode: "checkout" | "lead";
  price: number;
  originalPrice: number | null;
  promoDeadline: string | null;
  seatsRemaining: number | null;
  soldOut: boolean;
  startDate: string | null;
  featured: boolean;
}

export function CourseCard({ course }: { course: PublicCourseCardData }) {
  const lowSeats = course.seatsRemaining !== null && course.seatsRemaining > 0 && course.seatsRemaining <= 10;

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className={`group relative flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-brand-ink shadow-lg ring-1 transition-transform hover:-translate-y-1 hover:ring-brand-teal/60 md:w-72 ${
        course.featured ? "ring-brand-gold/50" : "ring-white/10"
      }`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-brand-teal to-brand-tealDark">
        {course.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImageUrl}
            alt={course.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {course.featured && (
            <Badge className="gap-1 border-transparent bg-brand-gold text-brand-ink">
              <Star className="h-3 w-3 fill-brand-ink" />
              Destaque
            </Badge>
          )}
          {course.soldOut && <Badge variant="destructive">Esgotado</Badge>}
          {!course.soldOut && lowSeats && <Badge variant="warning">Últimas vagas</Badge>}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="relative inline-block font-heading text-base font-semibold leading-tight text-white">
            {course.name}
            {course.featured && (
              <span className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-brand-gold" />
            )}
          </h3>
          {course.startDate && <p className="mt-1 text-xs text-white/70">{course.startDate}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div>
          {course.saleMode === "lead" ? (
            <p className="font-heading text-sm font-bold text-brand-teal">Tenho interesse</p>
          ) : (
            <>
              <p className="text-xs text-white/50">Matrícula por</p>
              <div className="flex items-center gap-2">
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-xs text-white/40 line-through">{formatBRL(course.originalPrice)}</span>
                )}
                <p className="font-heading text-lg font-bold text-brand-teal">{formatBRL(course.price)}</p>
              </div>
              {course.promoDeadline && <CountdownTimer deadline={course.promoDeadline} compact />}
            </>
          )}
        </div>
        <GraduationCap className="h-5 w-5 text-white/30" />
      </div>
    </Link>
  );
}
