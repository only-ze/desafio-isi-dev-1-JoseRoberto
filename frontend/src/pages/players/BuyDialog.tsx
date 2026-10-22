import { ArrowRight, Info, Shield, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { buyPlayer } from "@/api/market";
import { ActionFailureNotice, toActionFailure, type ActionFailure } from "@/components/ActionFailureNotice";
import { ContractStatusBadge } from "@/components/badges";
import { FormField } from "@/components/FormField";
import { Notice } from "@/components/Notice";
import { PlayerSummary } from "@/components/PlayerSummary";
import { ResultList } from "@/components/ResultList";
import { SubmitButton } from "@/components/SubmitButton";
import { SuccessHeader } from "@/components/SuccessHeader";
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

function BuyResultDialog({ result, club, onClose }: { result: BuyResult; club: Club | undefined; onClose: () => void }) {
  const clubName = club?.name ?? "clube";
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125">
        <SuccessHeader title="Compra concluída" description={`${result.player_name} agora é do ${clubName}.`} />
        <ResultList
          items={[
            { label: "Valor", hint: "Valor de mercado no momento da compra", value: formatMoney(result.value) },
            {
              label: "Taxa",
              hint: result.fee > 0 ? "5% do valor, porque passa de 30,00" : "Sem taxa: o valor não passa de 30,00",
              value: formatMoney(result.fee),
            },
            {
              label: "Custo total",
              hint: "Valor + taxa",
              value: formatMoney(Math.abs(result.cash_change)),
              strong: true,
            },
            { label: "Fim da fidelidade", value: formatDateTime(result.contract.loyalty_until) },
            {
              label: "Contrato",
              value: <ContractStatusBadge status={result.contract.status} />,
            },
            { label: `Novo caixa do ${clubName}`, value: formatMoney(result.club_cash), strong: true },
          ]}
        />
        <DialogFooter className="border-t pt-4">
          <Button asChild variant="outline">
            <Link to={`/clubs/${result.club_id}`}>
              Ver clube <ArrowRight />
            </Link>
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BuyDialog({ player, clubs, clubsError, onClose, onBought }: BuyDialogProps) {
  const [clubId, setClubId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<{ club?: string; loyalty?: string }>({});
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [result, setResult] = useState<BuyResult | null>(null);
  const selectedClub = clubs.find((club) => String(club.id) === clubId);

  const buy = useAction(
    () => buyPlayer(player.id, { club_id: Number(clubId), loyalty_until: toApiDateTime(date, time) }),
    {
      successMessage: "Compra realizada.",
      onSuccess: (bought) => {
        setResult(bought);
        onBought();
      },
      onError: (error) => setFailure(toActionFailure(error)),
    },
  );

  function chooseClub(value: string) {
    setClubId(value);
    setErrors((current) => ({ ...current, club: undefined }));
  }

  function changeLoyalty(setValue: (value: string) => void, value: string) {
    setValue(value);
    setErrors((current) => ({ ...current, loyalty: undefined }));
  }

  function submit() {
    const found = {
      club: clubId ? undefined : "Escolha o clube comprador.",
      loyalty: !date ? "Informe a data do fim da fidelidade." : !time ? "Informe a hora do fim da fidelidade." : undefined,
    };
    setErrors(found);
    if (found.club || found.loyalty) return;
    setFailure(null);
    void buy.run();
  }

  if (result) {
    return <BuyResultDialog result={result} club={clubs.find((club) => club.id === result.club_id)} onClose={onClose} />;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !buy.pending && onClose()}>
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Comprar jogador</DialogTitle>
          <DialogDescription>Escolha o clube comprador e até quando vai a fidelidade do contrato.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ActionFailureNotice failure={failure} refusedTitle="Compra recusada" action="compra" />
          <PlayerSummary player={player} />
          <FormField
            id="club"
            label="Clube comprador"
            error={errors.club ?? clubsError ?? undefined}
            hint={
              selectedClub
                ? `Caixa atual: ${formatMoney(selectedClub.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
                : "O custo total (valor + taxa) pode ir até 50% do caixa do clube."
            }
          >
            <Select value={clubId} onValueChange={chooseClub} disabled={buy.pending}>
              <SelectTrigger
                id="club"
                className="w-full *:data-[slot=select-value]:flex-1"
                aria-invalid={Boolean(errors.club)}
              >
                <Shield className="text-muted-foreground" />
                <SelectValue placeholder="Escolha o clube" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={String(club.id)}>
                    {club.name} ({club.acronym}) · caixa {formatMoney(club.cash)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="loyalty-date"
            label="Fim da fidelidade"
            error={errors.loyalty}
            hint="Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00)."
          >
            <div className="grid grid-cols-[1fr_8rem] gap-2">
              <Input
                id="loyalty-date"
                type="date"
                value={date}
                disabled={buy.pending}
                onChange={(event) => changeLoyalty(setDate, event.target.value)}
                aria-invalid={Boolean(errors.loyalty && !date)}
              />
              <Input
                type="time"
                value={time}
                disabled={buy.pending}
                onChange={(event) => changeLoyalty(setTime, event.target.value)}
                aria-label="Hora do fim da fidelidade"
                aria-invalid={Boolean(errors.loyalty && date && !time)}
              />
            </div>
          </FormField>
          <Notice tone="info" icon={Info}>
            A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo caixa são calculados ao
            confirmar.
          </Notice>
          {buy.pending && <Notice tone="info">Enviando a compra. Os botões ficam desabilitados até a resposta.</Notice>}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" disabled={buy.pending} onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton
            label="Confirmar compra"
            pendingLabel="Comprando…"
            icon={ShoppingCart}
            pending={buy.pending}
            retry={failure?.network}
            onClick={submit}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
