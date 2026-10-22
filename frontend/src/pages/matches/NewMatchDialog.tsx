import { Info, Shield, Swords } from "lucide-react";
import { useState } from "react";
import { playMatch } from "@/api/matches";
import { ActionFailureNotice, toActionFailure, type ActionFailure } from "@/components/ActionFailureNotice";
import { FormField } from "@/components/FormField";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
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
import type { Club, Match } from "@/types/api";

type Field = "home" | "away";

interface ClubSelectProps {
  id: string;
  value: string;
  clubs: Club[];
  disabledId: string;
  invalid: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}

function ClubSelect({ id, value, clubs, disabledId, invalid, disabled, onChange }: ClubSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="w-full *:data-[slot=select-value]:flex-1" aria-invalid={invalid}>
        <Shield className="text-muted-foreground" />
        <SelectValue placeholder="Escolha o clube" />
      </SelectTrigger>
      <SelectContent>
        {clubs.map((club) => (
          <SelectItem key={club.id} value={String(club.id)} disabled={String(club.id) === disabledId}>
            {club.name} ({club.acronym})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface NewMatchDialogProps {
  clubs: Club[];
  onClose: () => void;
  onPlayed: (match: Match) => void;
}

export function NewMatchDialog({ clubs, onClose, onPlayed }: NewMatchDialogProps) {
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [failure, setFailure] = useState<ActionFailure | null>(null);

  const play = useAction(playMatch, {
    successMessage: (match) =>
      `Partida jogada: ${match.home.club_name} ${match.home.goals} × ${match.away.goals} ${match.away.club_name}.`,
    onSuccess: onPlayed,
    onError: (error) => setFailure(toActionFailure(error)),
  });

  function choose(field: Field, value: string) {
    if (field === "home") setHomeId(value);
    else setAwayId(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit() {
    const found = {
      home: homeId ? undefined : "Escolha o mandante.",
      away: !awayId ? "Escolha o visitante." : awayId === homeId ? "Escolha um clube diferente do mandante." : undefined,
    };
    setErrors(found);
    if (found.home || found.away) return;
    setFailure(null);
    void play.run({ home_club_id: Number(homeId), away_club_id: Number(awayId) });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !play.pending && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Nova partida</DialogTitle>
          <DialogDescription>Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ActionFailureNotice failure={failure} refusedTitle="Não foi possível jogar a partida" action="partida" />
          <FormField id="home-club" label="Mandante" error={errors.home} hint="Faz os 3 primeiros ataques.">
            <ClubSelect
              id="home-club"
              value={homeId}
              clubs={clubs}
              disabledId={awayId}
              invalid={Boolean(errors.home)}
              disabled={play.pending}
              onChange={(value) => choose("home", value)}
            />
          </FormField>
          <FormField id="away-club" label="Visitante" error={errors.away} hint="Precisa ser um clube diferente do mandante.">
            <ClubSelect
              id="away-club"
              value={awayId}
              clubs={clubs}
              disabledId={homeId}
              invalid={Boolean(errors.away)}
              disabled={play.pending}
              onChange={(value) => choose("away", value)}
            />
          </FormField>
          <Notice tone="info" icon={Info} title="Como sai o placar" className="text-xs">
            <p>
              Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais recuado) ao 4º (o
              mais avançado); o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. O atacante
              usa finalização (ATA), passe (MEI) ou drible (ZAG e LAT), e quem defende usa a defesa. É gol só quando o
              ataque é maior; mal condicionado joga com 15% a menos.
            </p>
            <p className="mt-2">Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
          </Notice>
          {play.pending && <Notice tone="info">Jogando a partida. Os botões ficam desabilitados até a resposta.</Notice>}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" disabled={play.pending} onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton
            label="Jogar partida"
            pendingLabel="Jogando…"
            icon={Swords}
            pending={play.pending}
            retry={failure?.network}
            onClick={submit}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
