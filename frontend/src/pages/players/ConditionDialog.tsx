import { useState } from "react";
import { changeCondition } from "@/api/players";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import type { Player } from "@/types/api";
import { formatMoney } from "@/utils/format";
import { CONDITION_LABEL, CONDITIONS, type Condition } from "@/utils/labels";

interface ConditionDialogProps {
  player: Player;
  onClose: () => void;
  onSaved: () => void;
}

export function ConditionDialog({ player, onClose, onSaved }: ConditionDialogProps) {
  const [condition, setCondition] = useState<Condition>(player.condition);

  const save = useAction(() => changeCondition(player.id, condition), {
    successMessage: (updated) =>
      `Condição atualizada. Novo valor de mercado: ${formatMoney(updated.market_value)}.`,
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && !save.pending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar condição</DialogTitle>
          <DialogDescription>
            {player.name}: o valor de mercado muda conforme a condição, a agilidade e a idade.
          </DialogDescription>
        </DialogHeader>
        <Select value={condition} onValueChange={(next) => setCondition(next as Condition)}>
          <SelectTrigger className="w-full" aria-label="Condição">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((option) => (
              <SelectItem key={option} value={option} disabled={player.condition === "DOENTE" && option === "APTO"}>
                {CONDITION_LABEL[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {player.condition === "DOENTE" && (
          <p className="text-xs text-muted-foreground">De Doente não vai direto para Apto: passe por Mal condicionado.</p>
        )}
        {condition === "DOENTE" && player.club_id !== null && (
          <p className="text-xs text-muted-foreground">Se for titular, o jogador sai da escalação do clube.</p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={save.pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={save.pending} onClick={() => void save.run()}>
            {save.pending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}