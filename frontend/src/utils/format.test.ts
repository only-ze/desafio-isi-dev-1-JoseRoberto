import { describe, expect, it } from "vitest";
import { formatDateTime, formatMoney, formatSignedMoney, normalizeName, toApiDateTime } from "./format";

describe("format", () => {
  it("mostra moedas com 2 casas e vírgula decimal", () => {
    expect(formatMoney(1234.5)).toBe("1.234,50");
    expect(formatMoney(0)).toBe("0,00");
  });

  it("mostra a variação do caixa com sinal", () => {
    expect(formatSignedMoney(35.7)).toBe("+35,70");
    expect(formatSignedMoney(-38.85)).toBe("-38,85");
  });

  it("mostra datas da API no horário de Brasília", () => {
    expect(formatDateTime("2026-11-02T10:15:00-03:00")).toBe("02/11/2026 10:15");
    expect(formatDateTime("2026-11-02T13:15:00Z")).toBe("02/11/2026 10:15");
  });

  it("envia data e hora digitadas com o fuso -03:00", () => {
    expect(toApiDateTime("2027-03-02", "10:15")).toBe("2027-03-02T10:15-03:00");
  });

  it("normaliza espaços do nome como a API", () => {
    expect(normalizeName("  Meia   Zeta ")).toBe("Meia Zeta");
  });
});
