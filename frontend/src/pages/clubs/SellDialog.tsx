import { useState } from "react";
import { sellPlayer } from "@/api/market";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ResultList } from "@/components/ResultList";
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
import { formatMoney, formatSignedMoney } from "@/utils/format";

interface SellDialogProps {
  player: SquadPlayer;
  onClose: () => void;
  onSold: () => void;
}

export function SellDialog({ player, onClose, onSold }: SellDialogProps) {
  const [result, setResult] = useState<SellResult | null>(null);

  const sell = useAction(() => sellPlayer(player.id), {
    successMessage: "Venda realizada.",
    onSuccess: (sold) => {
      setResult(sold);
      onSold();
    },
  });

  if (!result) {
    return (
      <ConfirmDialog
        open
        title={`Vender ${player.name}`}
        description={
          <>
            O jogador é vendido pelo valor de mercado atual ({formatMoney(player.market_value)}) e volta a ficar livre.
            Faltam {player.contract.remaining_days} dias de fidelidade: a multa e a comissão são calculadas pela API.
          </>
        }
        confirmLabel="Confirmar venda"
        pending={sell.pending}
        onConfirm={() => void sell.run()}
        onCancel={onClose}
      />
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Venda realizada</DialogTitle>
          <DialogDescription>
            {result.player_name} voltou a ficar livre. Contrato {result.contract_status.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <ResultList
          items={[
            { label: "Valor de compra", value: formatMoney(result.purchase_value) },
            { label: "Valor de venda", value: formatMoney(result.value) },
            { label: "Dias restantes", value: String(result.remaining_days) },
            { label: `Multa (${result.penalty_rate}%)`, value: formatMoney(result.penalty) },
            { label: "Lucro", value: formatMoney(result.profit ?? 0) },
            { label: "Comissão", value: formatMoney(result.fee) },
            { label: "Crédito no caixa", value: formatSignedMoney(result.cash_change), strong: true },
            { label: "Novo caixa", value: formatMoney(result.club_cash), strong: true },
          ]}
        />
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
