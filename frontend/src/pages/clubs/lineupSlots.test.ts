import { describe, expect, it } from "vitest";
import type { Player } from "@/types/api";
import type { Position } from "@/utils/labels";
import { assignSlots, formationSummary, slotsFor, usedAttributes } from "./lineupSlots";

function player(id: number, position: Position): Player {
  return {
    id,
    name: `Jogador ${id}`,
    position,
    agility: 50,
    age: 25,
    condition: "APTO",
    base_value: 10,
    market_value: 10,
    pace: 60,
    shooting: 61,
    passing: 62,
    dribbling: 63,
    defending: 64,
    physical: 65,
    potential: 70,
    overall: 62,
    club_id: 1,
  };
}

describe("lineupSlots", () => {
  it("monta as vagas da formação, do goleiro ao ataque", () => {
    const slots = slotsFor("2-1-1");
    expect(slots.map((slot) => slot.accessibleName)).toEqual(["Goleiro", "Defesa 1", "Defesa 2", "Meio", "Ataque"]);
    expect(formationSummary("1-2-1")).toBe("Defesa 1, meio 2, ataque 1");
  });

  it("encaixa os titulares salvos nas vagas pela posição", () => {
    const players = [player(1, "GOL"), player(2, "ZAG"), player(3, "LAT"), player(4, "MEI"), player(5, "ATA")];
    expect(assignSlots("2-1-1", players)).toEqual({
      "goal-0": "1",
      "defense-0": "2",
      "defense-1": "3",
      "midfield-0": "4",
      "attack-0": "5",
    });
  });

  it("deixa vazia a vaga sem jogador da posição", () => {
    expect(assignSlots("3-1", [player(1, "GOL"), player(5, "ATA")])).toEqual({ "goal-0": "1", "attack-0": "5" });
  });

  it("indica os atributos usados por cada jogador de linha", () => {
    expect(usedAttributes(player(2, "ZAG"), 1)).toEqual([{ label: "Defesa", value: 64 }]);
    expect(usedAttributes(player(3, "LAT"), 2)).toEqual([
      { label: "Drible", value: 63 },
      { label: "Defesa", value: 64 },
    ]);
    expect(usedAttributes(player(5, "ATA"), 4)).toEqual([{ label: "Finalização", value: 61 }]);
  });
});
