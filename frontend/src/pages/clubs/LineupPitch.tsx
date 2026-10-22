import { Plus } from "lucide-react";
import { PitchPlayer } from "@/components/PitchPlayer";
import type { Player } from "@/types/api";
import { sectorRows } from "@/utils/formations";
import { GRASS_STYLE } from "@/utils/pitch";
import type { Formation } from "@/utils/labels";
import type { LineupSlot } from "./lineupSlots";

function rowOffsets(formation: Formation): number[] {
  const lineRows = sectorRows(formation).length - 1;
  const step = lineRows > 1 ? 46 / (lineRows - 1) : 0;
  return [86, ...Array.from({ length: lineRows }, (_, index) => 64 - index * step)];
}

function FieldLines({ strokeWidth }: { strokeWidth: number }) {
  return (
    <svg
      viewBox="0 0 100 120"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      fill="none"
      stroke="rgba(255,255,255,0.45)"
      strokeWidth={strokeWidth}
      aria-hidden
    >
      <rect x="4" y="4" width="92" height="112" />
      <line x1="4" y1="60" x2="96" y2="60" />
      <circle cx="50" cy="60" r="11" />
      <rect x="27" y="4" width="46" height="16" />
      <rect x="27" y="100" width="46" height="16" />
    </svg>
  );
}

export function MiniPitch({ formation }: { formation: Formation }) {
  const offsets = rowOffsets(formation);
  return (
    <div className="relative h-9 w-7 shrink-0 overflow-hidden rounded-sm" style={GRASS_STYLE} aria-hidden>
      <FieldLines strokeWidth={3} />
      {sectorRows(formation).flatMap(({ sector, count }, row) =>
        Array.from({ length: count }, (_, index) => (
          <span
            key={`${sector}-${index}`}
            className="absolute size-1 -translate-1/2 rounded-full bg-white"
            style={{ left: `${((index + 1) / (count + 1)) * 100}%`, top: `${offsets[row]}%` }}
          />
        )),
      )}
    </div>
  );
}

export interface PitchMarker {
  slot: LineupSlot;
  player: Player | undefined;
}

function surname(name: string): string {
  const parts = name.split(" ");
  return parts[parts.length - 1] ?? name;
}

function Marker({ slot, player }: PitchMarker) {
  if (!player) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-white/70 text-white/80">
          <Plus className="size-4" />
        </div>
        <span className="rounded bg-black/50 px-1.5 text-[11px] text-white">{slot.label}</span>
      </div>
    );
  }
  return (
    <PitchPlayer name={player.name} label={surname(player.name)} unfit={player.condition === "MAL_CONDICIONADO"} />
  );
}

interface LineupPitchProps {
  formation: Formation;
  markers: PitchMarker[];
}

export function LineupPitch({ formation, markers }: LineupPitchProps) {
  const offsets = rowOffsets(formation);
  const rows = sectorRows(formation);
  return (
    <div className="relative aspect-5/6 w-full overflow-hidden rounded-lg" style={GRASS_STYLE}>
      <FieldLines strokeWidth={0.5} />
      {rows.flatMap(({ sector, count }, row) =>
        markers
          .filter((marker) => marker.slot.sector === sector)
          .map((marker, index) => (
            <div
              key={marker.slot.key}
              className="absolute -translate-x-1/2 -translate-y-1/3"
              style={{ left: `${((index + 1) / (count + 1)) * 100}%`, top: `${offsets[row]}%` }}
            >
              <Marker {...marker} />
            </div>
          )),
      )}
    </div>
  );
}
