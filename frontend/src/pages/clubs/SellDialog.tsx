import { HandCoins, Info } from "lucide-react";
import { useState } from "react";
import { sellPlayer } from "@/api/market";
import { ActionFailureNotice } from "@/components/ActionFailureNotice";
import { ContractStatusBadge, PenaltyRateBadge } from "@/components/badges";
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
import { useAction } from "@/hooks/useAction";
import type { SellResult, SquadPlayer } from "@/types/api";
import { toActionFailure, type ActionFailure } from "@/utils/failure";
import { formatDateTime, formatMoney, formatSignedMoney } from "@/utils/format";

interface SellDialogProps {
  player: SquadPlayer;
  clubName: string;
  onClose: () => void;
  onSold: () => void;
}

function SellResultDialog({
  result,
  clubName,
  onClose,
}: {
  result: SellResult;
  clubName: string;
  onClose: () => void;
}) {
  const fulfilled = result.penalty_rate === 0;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125">
        <SuccessHeader
          title="Venda concluída"
          description={`${result.player_name} saiu do ${clubName} e voltou a ficar livre.`}
        />
        {fulfilled && (
          <Notice tone="success" title="Fidelidade cumprida">
            Sem multa: o contrato foi encerrado.
          </Notice>
        )}
        <ResultList
          items={[
            { label: "Valor de compra", hint: "Pago na compra, sem a taxa", value: formatMoney(result.purchase_value) },
            { label: "Valor de venda", hint: "Valor de mercado no momento da venda", value: formatMoney(result.value) },
            { label: "Dias restantes", value: String(result.remaining_days) },
            {
              label: "Multa",
              hint: fulfilled ? "Fidelidade cumprida" : `${result.penalty_rate}% do valor de venda, até 10,00`,
              value: formatMoney(result.penalty),
            },
            { label: "Lucro", hint: "Valor de venda − valor de compra", value: formatMoney(result.profit ?? 0) },
            {
              label: "Comissão",
              hint: result.fee > 0 ? "Progressiva sobre o lucro" : "Sem lucro, sem comissão",
              value: formatMoney(result.fee),
            },
            {
              label: "Crédito no caixa",
              hint: "Venda − multa − comissão",
              value: formatSignedMoney(result.cash_change),
              strong: true,
            },
            { label: "Contrato", value: <ContractStatusBadge status={result.contract_status} /> },
            { label: `Novo caixa do ${clubName}`, value: formatMoney(result.club_cash), strong: true },
          ]}
        />
        <DialogFooter className="border-t pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SellDialog({ player, clubName, onClose, onSold }: SellDialogProps) {
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [result, setResult] = useState<SellResult | null>(null);
  const { contract } = player;

  const sell = useAction(() => sellPlayer(player.id), {
    successMessage: "Venda realizada.",
    onSuccess: (sold) => {
      setResult(sold);
      onSold();
    },
    onError: (error) => setFailure(toActionFailure(error)),
  });

  function submit() {
    setFailure(null);
    void sell.run();
  }

  if (result) return <SellResultDialog result={result} clubName={clubName} onClose={onClose} />;

  return (
    <Dialog open onOpenChange={(open) => !open && !sell.pending && onClose()}>
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Vender jogador</DialogTitle>
          <DialogDescription>
            O {clubName} vende pelo valor de mercado do momento, e o jogador volta a ficar livre.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ActionFailureNotice failure={failure} refusedTitle="Venda recusada" action="venda" />
          <PlayerSummary player={player} />
          <ResultList
            items={[
              { label: "Valor de compra", value: formatMoney(contract.purchase_value) },
              { label: "Fim da fidelidade", value: formatDateTime(contract.loyalty_until) },
              { label: "Dias restantes", value: String(contract.remaining_days) },
              { label: "% de multa se vender agora", value: <PenaltyRateBadge rate={contract.penalty_rate} /> },
            ]}
          />
          {contract.penalty_rate > 0 ? (
            <Notice tone="warning" title="Venda antes do fim da fidelidade">
              O contrato é rescindido e o clube paga multa de {contract.penalty_rate}% do valor de venda, até 10,00.
            </Notice>
          ) : (
            <Notice tone="success" title="Fidelidade cumprida">
              Sem multa: o contrato é encerrado.
            </Notice>
          )}
          <Notice tone="info" icon={Info}>
            A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e crédito são calculados
            ao confirmar.
          </Notice>
          {sell.pending && <Notice tone="info">Enviando a venda. Os botões ficam desabilitados até a resposta.</Notice>}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" disabled={sell.pending} onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton
            label="Confirmar venda"
            pendingLabel="Vendendo…"
            icon={HandCoins}
            pending={sell.pending}
            retry={failure?.network}
            onClick={submit}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
