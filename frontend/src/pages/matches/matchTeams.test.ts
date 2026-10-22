import { describe, expect, it } from "vitest";
import type { Duel, DuelParticipant, Match } from "@/types/api";
import type { Attribute, Position } from "@/utils/labels";
import { attackerRole, defenderRole, teamOnPitch } from "./matchTeams";

function participant(id: number, position: Position, attribute: Attribute, value: number): DuelParticipant {
  return { player_id: id, player_name: `Jogador ${id}`, position, condition: "APTO", attribute, value };
}

function duel(order: number, club: number, attacker: DuelParticipant, defender: DuelParticipant, goal: boolean): Duel {
  return { order, attacking_club_id: club, attacker, defender, goal };
}

const MATCH: Match = {
  id: 1,
  played_at: "2026-11-12T15:00:00-03:00",
  home: { club_id: 1, club_name: "Águias FC", formation: "2-1-1", goals: 1 },
  away: { club_id: 2, club_name: "Delta FC", formation: "2-1-1", goals: 2 },
  result: "VISITANTE",
  duels: [
    duel(4, 2, participant(44, "ATA", "shooting", 81), participant(30, "GOL", "defending", 77), true),
    duel(1, 1, participant(34, "ATA", "shooting", 75), participant(40, "GOL", "defending", 72), true),
    duel(2, 1, participant(33, "MEI", "passing", 82), participant(41, "ZAG", "defending", 84), false),
    duel(3, 1, participant(31, "LAT", "dribbling", 63), participant(42, "LAT", "defending", 63), false),
    duel(5, 2, participant(43, "MEI", "passing", 70), participant(32, "ZAG", "defending", 84), false),
    duel(6, 2, participant(42, "LAT", "dribbling", 79), participant(31, "LAT", "defending", 56), true),
  ],
};

describe("teamOnPitch", () => {
  it("monta o time pelos duelos devolvidos, do goleiro ao 4º jogador de linha", () => {
    const home = teamOnPitch(MATCH, "home");
    expect(home.goalkeeper.participant.player_id).toBe(30);
    expect(home.line.map((entry) => entry.participant.player_id)).toEqual([32, 31, 33, 34]);
  });

  it("junta ataque e defesa do 2º jogador de linha e marca quem fez gol", () => {
    const away = teamOnPitch(MATCH, "away");
    const second = away.line[1];
    expect(second.participant.player_id).toBe(42);
    expect(second.attributes).toEqual([
      { attribute: "dribbling", value: 79 },
      { attribute: "defending", value: 63 },
    ]);
    expect(second.scored).toBe(true);
    expect(away.line[3].scored).toBe(true);
    expect(away.line[2].scored).toBe(false);
  });

  it("descreve o papel de cada duelo", () => {
    expect([0, 1, 2].map(attackerRole)).toEqual(["4º de linha", "3º de linha", "2º de linha"]);
    expect([0, 1, 2].map(defenderRole)).toEqual(["Goleiro", "1º de linha", "2º de linha"]);
  });
});
