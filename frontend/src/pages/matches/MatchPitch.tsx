import { ArrowLeft, ArrowRight } from "lucide-react";
import { PitchPlayer } from "@/components/PitchPlayer";
import { cn } from "@/lib/utils";
import { sectorRows } from "@/utils/formations";
import { GRASS_STYLE } from "@/utils/pitch";
import { ATTRIBUTE_SHORT_LABEL } from "@/utils/labels";
import type { PitchEntry, TeamOnPitch, TeamSide } from "./matchTeams";

const LINE_COLUMNS: Record<number, number[]> = {
  2: [22, 40],
  3: [19, 32, 44],
};
const GOALKEEPER_COLUMN = 6;

function FieldLines() {
  return (
    <svg
      viewBox="0 0 190 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      fill="none"
      stroke="rgba(255,255,255,0.45)"
      strokeWidth={0.5}
      aria-hidden
    >
      <rect x="4" y="4" width="182" height="92" />
      <line x1="95" y1="4" x2="95" y2="96" />
      <circle cx="95" cy="50" r="12" />
      <rect x="4" y="27" width="20" height="46" />
      <rect x="166" y="27" width="20" height="46" />
    </svg>
  );
}

function caption(entry: PitchEntry): string {
  const values = entry.attributes.map(({ attribute, value }) => `${ATTRIBUTE_SHORT_LABEL[attribute]} ${value}`);
  return [entry.participant.position, ...values].join(" · ");
}

function columns(team: TeamOnPitch): { x: number; entries: PitchEntry[] }[] {
  const rows = sectorRows(team.side.formation).slice(1);
  const lineColumns = LINE_COLUMNS[rows.length] ?? LINE_COLUMNS[3];
  let next = 0;
  return [
    { x: GOALKEEPER_COLUMN, entries: [team.goalkeeper] },
    ...rows.map(({ count }, index) => {
      const entries = team.line.slice(next, next + count);
      next += count;
      return { x: lineColumns[index], entries };
    }),
  ];
}

function TeamTag({ team, tone }: { team: TeamOnPitch; tone: TeamSide }) {
  const Arrow = tone === "home" ? ArrowRight : ArrowLeft;
  return (
    <span
      className={cn(
        "absolute top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white",
        tone === "home" ? "left-3" : "right-3",
      )}
    >
      <span className={cn("size-2 rounded-full", tone === "home" ? "bg-primary" : "bg-white")} aria-hidden />
      <span className="font-medium">{team.side.club_name}</span>
      <span className="text-white/70">{team.side.formation}</span>
      <span className="text-white/70">| ataca</span>
      <Arrow className="size-3" />
    </span>
  );
}

function Team({ team, tone }: { team: TeamOnPitch; tone: TeamSide }) {
  return (
    <>
      <TeamTag team={team} tone={tone} />
      {columns(team).flatMap(({ x, entries }) =>
        entries.map((entry, index) => (
          <div
            key={entry.participant.player_id}
            className="absolute -translate-x-1/2 -translate-y-1/3"
            style={{
              left: `${tone === "home" ? x : 100 - x}%`,
              top: `${((index + 1) / (entries.length + 1)) * 100}%`,
            }}
          >
            <PitchPlayer
              name={entry.participant.player_name}
              label={entry.participant.player_name}
              caption={caption(entry)}
              tone={tone}
              unfit={entry.participant.condition === "MAL_CONDICIONADO"}
              scored={entry.scored}
            />
          </div>
        )),
      )}
    </>
  );
}

export function MatchPitch({ home, away }: { home: TeamOnPitch; away: TeamOnPitch }) {
  return (
    <div className="relative aspect-19/10 w-full overflow-hidden rounded-lg" style={GRASS_STYLE}>
      <FieldLines />
      <Team team={home} tone="home" />
      <Team team={away} tone="away" />
    </div>
  );
}
