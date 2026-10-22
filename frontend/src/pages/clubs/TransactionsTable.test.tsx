import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Transaction } from "@/types/api";
import { TransactionsTable } from "./TransactionsTable";

const TRANSACTIONS: Transaction[] = [
  {
    id: 11,
    club_id: 1,
    player_id: 2,
    player_name: "Meia Lua",
    type: "VENDA",
    value: 40,
    fee: 0.3,
    penalty: 4,
    profit: 3,
    cash_change: 35.7,
    created_at: "2026-11-05T16:40:00-03:00",
  },
  {
    id: 10,
    club_id: 1,
    player_id: 2,
    player_name: "Meia Lua",
    type: "COMPRA",
    value: 37,
    fee: 1.85,
    penalty: 0,
    profit: null,
    cash_change: -38.85,
    created_at: "2026-11-02T10:15:00-03:00",
  },
];

describe("TransactionsTable", () => {
  it("mostra as transações na ordem recebida, com sinais e valores da API", () => {
    render(<TransactionsTable transactions={TRANSACTIONS} />);
    const [sale, purchase] = screen.getAllByRole("row").slice(1);

    expect(within(sale).getByText("05/11/2026 16:40")).toBeInTheDocument();
    expect(within(sale).getByText("Venda")).toBeInTheDocument();
    expect(within(sale).getByText("+3,00")).toBeInTheDocument();
    expect(within(sale).getByText("+35,70")).toBeInTheDocument();

    expect(within(purchase).getByText("Compra")).toBeInTheDocument();
    expect(within(purchase).getByText("–")).toBeInTheDocument();
    expect(within(purchase).getByText("-38,85")).toBeInTheDocument();
  });
});
