import { Thermometer, Volleyball } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/utils/format";

export const GRASS_STYLE: CSSProperties = {
  backgroundColor: "#1f5f32",
  backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 10%, transparent 10% 20%)",
};

interface PitchPlayerProps {
  name: string;
  label: string;
  caption?: string;
  tone?: "home" | "away";
  unfit?: boolean;
  scored?: boolean;
}

export function PitchPlayer({ name, label, caption, tone = "home", unfit = false, scored = false }: PitchPlayerProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold shadow",
          tone === "home" ? "border-white bg-primary text-primary-foreground" : "border-slate-300 bg-white text-slate-800",
        )}
      >
        {initials(name)}
        {unfit && (
          <span
            className="absolute -top-1.5 -left-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-amber-600 text-white"
            title="Mal condicionado"
          >
            <Thermometer className="size-2.5" />
          </span>
        )}
        {scored && (
          <span
            className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900"
            title="Gol no duelo"
          >
            <Volleyball className="size-2.5" />
          </span>
        )}
      </div>
      <span className="rounded bg-black/50 px-1.5 text-center text-[11px] leading-tight whitespace-nowrap text-white">
        {label}
        {caption && <span className="block text-[10px] text-white/80">{caption}</span>}
      </span>
    </div>
  );
}
