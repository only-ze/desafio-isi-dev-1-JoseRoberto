import type { Duel, DuelParticipant, Match, MatchSide } from "@/types/api";
import type { Attribute } from "@/utils/labels";

export type TeamSide = "home" | "away";

export interface PitchEntry {
  participant: DuelParticipant;
  attributes: { attribute: Attribute; value: number }[];
  scored: boolean;
}

export interface TeamOnPitch {
  side: MatchSide;
  goalkeeper: PitchEntry;
  line: PitchEntry[];
}

const ATTACKER_LINE_NUMBERS = [4, 3, 2];
const DEFENDER_ROLES = ["Goleiro", "1º de linha", "2º de linha"];

export function attackerRole(index: number): string {
  return `${ATTACKER_LINE_NUMBERS[index]}º de linha`;
}

export function defenderRole(index: number): string {
  return DEFENDER_ROLES[index] ?? "";
}

function byOrder(a: Duel, b: Duel): number {
  return a.order - b.order;
}

function attackEntry(duel: Duel): PitchEntry {
  const { attacker } = duel;
  return { participant: attacker, attributes: [{ attribute: attacker.attribute, value: attacker.value }], scored: duel.goal };
}

function defenseEntry(duel: Duel): PitchEntry {
  const { defender } = duel;
  return { participant: defender, attributes: [{ attribute: defender.attribute, value: defender.value }], scored: false };
}

export function teamDuels(match: Match, clubId: number): { attacks: Duel[]; defenses: Duel[] } {
  const ordered = [...match.duels].sort(byOrder);
  return {
    attacks: ordered.filter((duel) => duel.attacking_club_id === clubId),
    defenses: ordered.filter((duel) => duel.attacking_club_id !== clubId),
  };
}

export function teamOnPitch(match: Match, team: TeamSide): TeamOnPitch {
  const side = match[team];
  const { attacks, defenses } = teamDuels(match, side.club_id);
  const [toGoalkeeper, toFirst, toSecond] = attacks.map(attackEntry);
  const [goalkeeper, first, secondDefending] = defenses.map(defenseEntry);
  const second: PitchEntry = {
    participant: toSecond.participant,
    attributes: [...toSecond.attributes, ...secondDefending.attributes],
    scored: toSecond.scored,
  };
  return { side, goalkeeper, line: [first, second, toFirst, toGoalkeeper] };
}
