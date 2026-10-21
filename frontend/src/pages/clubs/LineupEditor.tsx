import { Check, Lock, Swords } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { saveLineup } from "@/api/clubs";
import { errorMessage } from "@/api/http";
import { ConditionBadge } from "@/components/badges";
import { Notice } from "@/components/Notice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAction } from "@/hooks/useAction";
import type { Lineup, Player, SquadPlayer } from "@/types/api";
import { initials } from "@/utils/format";
import { POSITION_LABEL, type Formation } from "@/utils/labels";
import { FormationPicker } from "./FormationPicker";
import { LineupPitch } from "./LineupPitch";
import { assignSlots, slotsFor, usedAttributes, type LineupSlot, type SlotSelection } from "./lineupSlots";

const STARTERS = 5;
const listFormatter = new Intl.ListFormat("pt-BR", { type: "conjunction" });

function initialSelection(lineup: Lineup): SlotSelection {
  return lineup.formation ? assignSlots(lineup.formation, lineup.players) : {};
}

function LineupNotice({ lineup, clubName, refusal }: { lineup: Lineup; clubName: string; refusal: string | null }) {
  if (refusal) {
    return (
      <Notice tone="error" title="A escalação foi recusada">
        {refusal}
      </Notice>
    );
  }
  if (lineup.complete) return null;
  const missing = STARTERS - lineup.players.length;
  const detail = lineup.formation
    ? `A formação ${lineup.formation} continua salva, com ${lineup.players.length} ${lineup.players.length === 1 ? "titular" : "titulares"}. Titular vendido ou que fica doente sai da escalação: ${missing === 1 ? "preencha a vaga" : "preencha as vagas"} e salve de novo.`
    : `Escolha a formação e um titular para cada uma das ${STARTERS} vagas e salve.`;
  return (
    <Notice tone="warning" title={`Escalação incompleta: o ${clubName} não pode jogar partidas`}>
      {detail}
    </Notice>
  );
}

function AttributesCell({ player, lineNumber }: { player: Player; lineNumber: number | null }) {
  return (
    <div className="flex gap-3 whitespace-nowrap text-muted-foreground">
      {usedAttributes(player, lineNumber).map(({ label, value }) => (
        <span key={label}>
          {label} <span className="font-semibold text-foreground tabular-nums">{value}</span>
        </span>
      ))}
    </div>
  );
}

function ReservesCard({ reserves, squadSize }: { reserves: SquadPlayer[]; squadSize: number }) {
  return (
    <Card className="gap-0 py-0">
      <div className="border-b p-4">
        <p className="font-medium">Reservas</p>
        <p className="text-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
      </div>
      {reserves.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {squadSize === 0
            ? "O elenco está vazio."
            : `Nenhum reserva: os ${squadSize} jogadores do elenco estão escolhidos.`}
        </p>
      ) : (
        <ul className="divide-y">
          {reserves.map((player) => (
            <li key={player.id} className="space-y-2 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">{initials(player.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{POSITION_LABEL[player.position]}</p>
                </div>
                {player.condition !== "APTO" && <ConditionBadge condition={player.condition} />}
              </div>
              {player.condition === "DOENTE" && (
                <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Doente não pode ser escalado.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

interface LineupEditorProps {
  clubId: number;
  clubName: string;
  squad: SquadPlayer[];
  lineup: Lineup;
  onSaved: () => void;
}

export function LineupEditor({ clubId, clubName, squad, lineup, onSaved }: LineupEditorProps) {
  const [formation, setFormation] = useState<Formation | "">(lineup.formation ?? "");
  const [selection, setSelection] = useState<SlotSelection>(() => initialSelection(lineup));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refusal, setRefusal] = useState<string | null>(null);

  const slots = formation ? slotsFor(formation) : [];
  const squadById = useMemo(() => new Map(squad.map((player) => [String(player.id), player])), [squad]);
  const chosenIds = new Set(Object.values(selection));
  const chosen = squad.filter((player) => chosenIds.has(String(player.id)));
  const lineNumbers = new Map(
    chosen.filter((player) => player.position !== "GOL").map((player, index) => [player.id, index + 1]),
  );
  const unfit = chosen.filter((player) => player.condition === "MAL_CONDICIONADO");
  const reserves = squad.filter((player) => !chosenIds.has(String(player.id)));

  const save = useAction(saveLineup, {
    successMessage: (saved) => `Escalação salva na ${saved.formation}, com ${saved.players.length} titulares.`,
    onSuccess: onSaved,
    onError: (error) => setRefusal(errorMessage(error)),
  });

  function changeFormation(next: Formation) {
    setFormation(next);
    setSelection(assignSlots(next, chosen));
    setErrors({});
  }

  function choose(slot: LineupSlot, playerId: string) {
    setSelection((current) => ({ ...current, [slot.key]: playerId }));
    setErrors((current) => {
      const next = { ...current };
      delete next[slot.key];
      return next;
    });
  }

  function reset() {
    setFormation(lineup.formation ?? "");
    setSelection(initialSelection(lineup));
    setErrors({});
    setRefusal(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!formation) found.formation = "Escolha a formação.";
    for (const slot of slots) {
      if (!selection[slot.key]) found[slot.key] = "Escolha um titular.";
    }
    setErrors(found);
    if (!formation || Object.keys(found).length > 0) return;
    setRefusal(null);
    void save.run(clubId, { formation, player_ids: slots.map((slot) => Number(selection[slot.key])) });
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="gap-0 overflow-hidden py-0">
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex items-start justify-between gap-4 border-b p-4">
            <div>
              <p className="font-medium">Titulares</p>
              <p className="text-xs text-muted-foreground">
                1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
              </p>
            </div>
            {lineup.complete ? (
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                <Check /> Completa
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                Incompleta
              </Badge>
            )}
          </div>

          <div className="space-y-4 p-4">
            <LineupNotice lineup={lineup} clubName={clubName} refusal={refusal} />
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Formação</p>
                <p className="text-xs text-muted-foreground">
                  Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da conta.
                </p>
              </div>
              <FormationPicker value={formation} invalid={Boolean(errors.formation)} onChange={changeFormation} />
              {errors.formation && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.formation}
                </p>
              )}
            </div>
          </div>

          {slots.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Vaga</TableHead>
                  <TableHead>Titular</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead className="text-right">Overall</TableHead>
                  <TableHead>Atributos usados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => {
                  const player = squadById.get(selection[slot.key] ?? "");
                  const candidates = squad.filter(
                    (option) => slot.positions.includes(option.position) && option.condition !== "DOENTE",
                  );
                  const error = errors[slot.key];
                  return (
                    <TableRow key={slot.key}>
                      <TableCell className="pl-4 align-top">
                        <p className="font-medium">{slot.label}</p>
                        <p className="text-xs text-muted-foreground">{slot.positionsLabel}</p>
                      </TableCell>
                      <TableCell className="align-top">
                        <Select
                          value={selection[slot.key] ?? ""}
                          onValueChange={(next) => choose(slot, next)}
                          disabled={candidates.length === 0}
                        >
                          <SelectTrigger
                            className="w-56"
                            aria-label={`Titular: ${slot.label}`}
                            aria-invalid={Boolean(error)}
                          >
                            <SelectValue
                              placeholder={candidates.length ? "Escolha o titular" : `Sem ${slot.positionsLabel} no elenco`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {candidates.map((option) => {
                              const id = String(option.id);
                              return (
                                <SelectItem
                                  key={id}
                                  value={id}
                                  disabled={chosenIds.has(id) && selection[slot.key] !== id}
                                >
                                  {option.name} ({option.position})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {error && (
                          <p role="alert" className="mt-1 text-xs text-destructive">
                            {error}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{player && <ConditionBadge condition={player.condition} />}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{player?.overall}</TableCell>
                      <TableCell>
                        {player && <AttributesCell player={player} lineNumber={lineNumbers.get(player.id) ?? null} />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {unfit.length > 0 && (
            <div className="px-4 pt-4">
              <Notice
                tone="warning"
                title={`${listFormatter.format(unfit.map((player) => player.name))} ${unfit.length === 1 ? "está mal condicionado" : "estão mal condicionados"}`}
              >
                {unfit.length === 1 ? "Pode" : "Podem"} jogar, mas cada atributo vale 15% a menos durante a partida.
              </Notice>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t p-4">
            <p className="mr-auto max-w-sm text-xs text-muted-foreground">
              A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar
              depois de escalar de novo.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={save.pending} onClick={reset}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.pending}>
                <Check /> {save.pending ? "Salvando..." : "Salvar escalação"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <Card className="gap-0 overflow-hidden py-0">
          <div className="border-b p-4">
            <p className="font-medium">Em campo</p>
            <p className="text-xs text-muted-foreground">
              {formation
                ? `Prévia da formação ${formation}, do goleiro ao ataque.`
                : "Escolha uma formação para ver a prévia."}
            </p>
          </div>
          {formation && (
            <div className="p-4">
              <LineupPitch
                formation={formation}
                markers={slots.map((slot) => ({ slot, player: squadById.get(selection[slot.key] ?? "") }))}
              />
            </div>
          )}
          <p className="flex gap-2 border-t bg-muted/40 p-4 text-xs text-muted-foreground">
            <Swords className="size-4 shrink-0" />
            Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais recuados. É gol
            quando o ataque é maior que a defesa.
          </p>
        </Card>
        <ReservesCard reserves={reserves} squadSize={squad.length} />
      </div>
    </div>
  );
}
