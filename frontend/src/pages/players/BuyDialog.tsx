import { useState } from "react";

import { buyPlayer } from "@/api/market";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import type { BuyResult, Club, Player } from "@/types/api";
import { formatDateTime, formatMoney, toApiDateTime } from "@/utils/format";

interface BuyDialogProps {
  player: Player;
  clubs: Club[];
  clubsError: string | null;
  onClose: () => void;
  onBought: () => void;
}

function ResultRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</dd>
    </div>
  );
}

export function BuyDialog({ player, clubs, clubsError, onClose, onBought }: BuyDialogProps) {
  const [clubId, setClubId] = useState("");
  const [loyalty, setLoyalty] = useState("");
  const [errors, setErrors] = useState<{ club?: string; loyalty?: string }>({});
  const [result, setResult] = useState<BuyResult | null>(null);

  const buy = useAction(
    () => buyPlayer(player.id, { club_id: Number(clubId), loyalty_until: toApiDateTime(loyalty) }),
    {
      successMessage: "Compra realizada.",
      onSuccess: (bought) => {
        setResult(bought);
        onBought();
      },
    },
  );

  function submit() {
    const found = {
      club: clubId ? undefined : "Escolha o clube comprador.",
      loyalty: loyalty ? undefined : "Informe o fim da fidelidade.",
    };
    setErrors(found);
    if (found.club || found.loyalty) return;
    void buy.run();
  }

  if (result) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compra realizada</DialogTitle>
            <DialogDescription>{result.player_name} agora faz parte do elenco.</DialogDescription>
          </DialogHeader>
          <dl className="divide-y">
            <ResultRow label="Valor" value={formatMoney(result.value)} />
            <ResultRow label="Taxa" value={formatMoney(result.fee)} />
            <ResultRow label="Custo total" value={formatMoney(Math.abs(result.cash_change))} strong />
            <ResultRow label="Fim da fidelidade" value={formatDateTime(result.contract.loyalty_until)} />
            <ResultRow label="Novo caixa" value={formatMoney(result.club_cash)} strong />
          </dl>
          <DialogFooter>
            <Button onClick={onClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !buy.pending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comprar {player.name}</DialogTitle>
          <DialogDescription>
            Preço atual: {formatMoney(player.market_value)}. A API calcula a taxa e confere o limite de caixa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField id="club" label="Clube comprador" error={errors.club ?? clubsError ?? undefined}>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger id="club" className="w-full" aria-invalid={Boolean(errors.club)}>
                <SelectValue placeholder="Escolha o clube" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={String(club.id)}>
                    {club.name} ({club.acronym})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="loyalty"
            label="Fim da fidelidade"
            error={errors.loyalty}
            hint="Data e hora no horário de Brasília (UTC-3)."
          >
            <Input
              id="loyalty"
              type="datetime-local"
              value={loyalty}
              onChange={(event) => setLoyalty(event.target.value)}
              aria-invalid={Boolean(errors.loyalty)}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={buy.pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={buy.pending} onClick={submit}>
            {buy.pending ? "Comprando..." : "Confirmar compra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}