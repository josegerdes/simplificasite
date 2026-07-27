"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

function getRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

/** Contador de urgência pro preço promocional — só renderiza se o prazo ainda não passou;
 *  some sozinho quando o tempo acaba (sem precisar de reload). */
export function CountdownTimer({ deadline, compact = false }: { deadline: string; compact?: boolean }) {
  const [remaining, setRemaining] = useState(() => getRemaining(deadline));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(deadline)), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!remaining) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-coral/90 px-2 py-0.5 text-[11px] font-semibold text-white">
        <Flame className="h-3 w-3" />
        {remaining.days > 0 ? `${remaining.days}d ${remaining.hours}h` : `${remaining.hours}h ${remaining.minutes}m`}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-coral/40 bg-brand-coral/10 px-3 py-2 text-sm text-brand-coral">
      <Flame className="h-4 w-4 shrink-0" />
      <span>
        Preço promocional acaba em{" "}
        <strong>
          {remaining.days > 0 && `${remaining.days}d `}
          {String(remaining.hours).padStart(2, "0")}h {String(remaining.minutes).padStart(2, "0")}m{" "}
          {String(remaining.seconds).padStart(2, "0")}s
        </strong>
      </span>
    </div>
  );
}
