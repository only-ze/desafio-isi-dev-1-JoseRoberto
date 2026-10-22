import {
  Check,
  CirclePercent,
  Download,
  HandCoins,
  History,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
  User,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { QueryParams } from "@/api/http";
import { exportTransactions, listTransactions } from "@/api/market";
import { DataState } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import type { ClubDetail, Transaction, TransactionSummary } from "@/types/api";
import { saveBlob } from "@/utils/download";
import { formatMoney, formatSignedMoney } from "@/utils/format";
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPES, type TransactionType } from "@/utils/labels";
import { TransactionsTable } from "./TransactionsTable";

const ALL_PLAYERS = "__all__";

interface PlayerOption {
  id: string;
  name: string;
}

function playerOptions(transactions: Transaction[]): PlayerOption[] {
  const names = new Map<string, string>();
  for (const transaction of transactions) {
    const id = String(transaction.player_id);
    if (!names.has(id)) names.set(id, transaction.player_name);
  }
  return [...names].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function TypeCheckbox({ type, checked, onToggle }: { type: TransactionType; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-sm transition-colors",
        checked ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "flex size-3.5 items-center justify-center rounded-sm border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
        )}
        aria-hidden
      >
        {checked && <Check className="size-3" />}
      </span>
      {TRANSACTION_TYPE_LABEL[type]}
    </button>
  );
}

interface SummaryItem {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  signed?: boolean;
}

function SummaryBar({ summary }: { summary: TransactionSummary }) {
  const items: SummaryItem[] = [
    { icon: ShoppingCart, label: "Total pago em compras", value: summary.total_spent, hint: "Valor + taxa" },
    { icon: HandCoins, label: "Total recebido em vendas", value: summary.total_received, hint: "Crédito líquido" },
    { icon: CirclePercent, label: "Taxas e comissões", value: summary.total_fees, hint: "Somadas" },
    { icon: TriangleAlert, label: "Multas", value: summary.total_penalties, hint: "Por fidelidade" },
    {
      icon: TrendingUp,
      label: "Lucro total",
      value: summary.total_profit,
      hint: "Soma dos lucros, com sinal",
      signed: true,
    },
  ];
  return (
    <dl className="grid border-t bg-muted/30 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ icon: Icon, label, value, hint, signed }) => (
        <div key={label} className="border-b p-4 lg:border-b-0 lg:border-l lg:first:border-l-0">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" /> {label}
          </dt>
          <dd
            className={cn(
              "mt-1 font-semibold tabular-nums",
              signed && value > 0 && "text-green-700",
              signed && value < 0 && "text-red-700",
            )}
          >
            {signed && value !== 0 ? formatSignedMoney(value) : formatMoney(value)}
          </dd>
          <dd className="text-xs text-muted-foreground">{hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function describeFilters(types: TransactionType[], player: PlayerOption | undefined): string {
  const parts = [
    ...(types.length === 1 ? [TRANSACTION_TYPE_LABEL[types[0]]] : []),
    ...(player ? [`jogador ${player.name}`] : []),
  ];
  if (parts.length === 0) return "sem filtros";
  return parts.length === 1 ? `com o filtro ${parts[0]} aplicado` : `com os filtros ${parts.join(" e ")} aplicados`;
}

export function TransactionsTab({ club }: { club: ClubDetail }) {
  const [types, setTypes] = useState<TransactionType[]>([...TRANSACTION_TYPES]);
  const [playerId, setPlayerId] = useState("");
  const filtersActive = types.length < TRANSACTION_TYPES.length || playerId !== "";

  const query = useMemo<QueryParams>(
    () => ({
      type: types.length < TRANSACTION_TYPES.length ? types.join(",") : undefined,
      player_id: playerId || undefined,
    }),
    [types, playerId],
  );
  const fetchFiltered = useCallback(
    (signal: AbortSignal) => listTransactions(club.id, query, signal),
    [club.id, query],
  );
  const fetchAll = useCallback((signal: AbortSignal) => listTransactions(club.id, {}, signal), [club.id]);
  const history = useFetch(fetchFiltered);
  const allHistory = useFetch(fetchAll);

  const rows = history.data?.data ?? [];
  const players = useMemo(() => playerOptions(allHistory.data?.data ?? []), [allHistory.data]);
  const selectedPlayer = players.find((player) => player.id === playerId);
  const filename = `historico-clube-${club.id}.csv`;

  const download = useAction(async () => saveBlob(await exportTransactions(club.id, query), filename), {
    successMessage: `CSV baixado: ${filename}, ${describeFilters(types, selectedPlayer)}.`,
  });

  function toggleType(type: TransactionType) {
    setTypes((current) => {
      if (!current.includes(type)) return TRANSACTION_TYPES.filter((item) => item === type || current.includes(item));
      return current.length > 1 ? current.filter((item) => item !== type) : current;
    });
  }

  function clearFilters() {
    setTypes([...TRANSACTION_TYPES]);
    setPlayerId("");
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4">
          <div>
            <p className="font-medium">Histórico de transações</p>
            <p className="text-xs text-muted-foreground">
              Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.
            </p>
          </div>
          <Button variant="outline" disabled={download.pending} onClick={() => void download.run()}>
            <Download /> {download.pending ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b px-4 pb-4">
          <span className="text-sm text-muted-foreground">Tipo</span>
          {TRANSACTION_TYPES.map((type) => (
            <TypeCheckbox key={type} type={type} checked={types.includes(type)} onToggle={() => toggleType(type)} />
          ))}
          <Select value={playerId || ALL_PLAYERS} onValueChange={(next) => setPlayerId(next === ALL_PLAYERS ? "" : next)}>
            <SelectTrigger size="sm" className="w-auto min-w-44" aria-label="Jogador">
              <User className="text-muted-foreground" />
              <SelectValue>Jogador: {selectedPlayer?.name ?? "todos"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PLAYERS}>Todos os jogadores</SelectItem>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button variant="link" size="sm" className="h-auto px-1" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>

        <DataState
          loading={history.loading}
          error={history.error}
          errorTitle={filtersActive && !history.networkError ? "O filtro foi recusado" : undefined}
          empty={rows.length === 0}
          emptyIcon={History}
          emptyTitle={filtersActive ? "Nenhuma transação com esses filtros" : "Nenhuma transação ainda"}
          emptyMessage={
            filtersActive
              ? "Troque ou limpe os filtros para ver as outras transações."
              : "As compras e vendas do clube aparecem aqui, com os totais logo abaixo."
          }
          onRetry={history.reload}
        >
          <div className={cn("transition-opacity", history.refreshing && "opacity-60")}>
            <TransactionsTable transactions={rows} />
          </div>
        </DataState>
        {history.data && !history.error && <SummaryBar summary={history.data.summary} />}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Os totais respeitam os filtros. 300,00 + soma das variações = caixa atual ({formatMoney(club.cash)}).
      </p>
    </>
  );
}
