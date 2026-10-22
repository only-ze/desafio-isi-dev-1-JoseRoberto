import { ArrowLeft, SearchX, ShoppingCart, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClub } from "@/api/clubs";
import { ClubCrest } from "@/components/ClubCrest";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import type { ClubDetail, SquadPlayer } from "@/types/api";
import { formatMoney } from "@/utils/format";
import { LineupTab } from "./LineupTab";
import { SellDialog } from "./SellDialog";
import { SquadTable } from "./SquadTable";
import { TransactionsTab } from "./TransactionsTab";

const SQUAD_LIMIT = 12;

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card className="gap-2 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </Card>
  );
}

function ClubSummary({ club }: { club: ClubDetail }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Caixa" value={formatMoney(club.cash)} note="Só muda por compras e vendas" />
      <StatCard label="Valor do elenco" value={formatMoney(club.squad_value)} note="Soma dos valores de mercado" />
      <StatCard label="Patrimônio" value={formatMoney(club.net_worth)} note="Caixa + valor do elenco" />
      <StatCard
        label="Elenco"
        value={`${club.players.length} de ${SQUAD_LIMIT}`}
        note={`Limite de ${SQUAD_LIMIT} jogadores`}
      />
    </div>
  );
}

export function ClubDetailPage() {
  const clubId = Number(useParams().id);
  const [tab, setTab] = useState("squad");
  const [sellTarget, setSellTarget] = useState<SquadPlayer | null>(null);

  const fetchClub = useCallback((signal: AbortSignal) => getClub(clubId, signal), [clubId]);
  const club = useFetch(fetchClub);
  const detail = club.data;

  const backLink = (
    <Button asChild variant="outline">
      <Link to="/clubs">
        <ArrowLeft /> Clubes
      </Link>
    </Button>
  );

  if (!detail) {
    const notFound = club.errorStatus === 404;
    return (
      <Card className="py-0">
        <DataState
          loading={club.loading}
          error={notFound ? `${club.error} O endereço pode estar errado ou o clube não existe.` : club.error}
          empty={false}
          loadingLabel="Carregando clube..."
          errorTitle={notFound ? "Clube não encontrado" : "Não foi possível carregar o clube"}
          errorIcon={notFound ? SearchX : undefined}
          errorAction={
            notFound ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/clubs">
                  <ArrowLeft /> Voltar para clubes
                </Link>
              </Button>
            ) : undefined
          }
          onRetry={club.reload}
        >
          {null}
        </DataState>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        media={<ClubCrest acronym={detail.acronym} size="lg" />}
        title={detail.name}
        description={`Sigla ${detail.acronym} · elenco ordenado por posição, nome e id`}
        actions={backLink}
      />

      <div className={cn("transition-opacity", club.refreshing && "opacity-60")}>
        <ClubSummary club={detail} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="squad">Elenco ({detail.players.length})</TabsTrigger>
          <TabsTrigger value="lineup">Escalação</TabsTrigger>
          <TabsTrigger value="transactions">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="squad">
          <Card className="gap-0 overflow-hidden py-0">
            <DataState
              loading={false}
              error={club.error}
              empty={detail.players.length === 0}
              errorTitle="Não foi possível carregar o elenco"
              emptyIcon={Users}
              emptyTitle="O clube ainda não tem jogadores"
              emptyMessage="Compre jogadores livres para formar o elenco."
              emptyAction={
                <Button asChild variant="outline" size="sm">
                  <Link to="/players">
                    <ShoppingCart /> Comprar jogadores
                  </Link>
                </Button>
              }
              onRetry={club.reload}
            >
              <SquadTable players={detail.players} onSell={setSellTarget} />
            </DataState>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Dias restantes e % de multa valem se o jogador fosse vendido agora. Vendido, ele volta a ficar livre e sai da
            escalação.
          </p>
        </TabsContent>

        <TabsContent value="lineup">
          <LineupTab clubId={detail.id} clubName={detail.name} squad={detail.players} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab club={detail} />
        </TabsContent>
      </Tabs>

      {sellTarget && (
        <SellDialog
          player={sellTarget}
          clubName={detail.name}
          onClose={() => setSellTarget(null)}
          onSold={club.reload}
        />
      )}
    </>
  );
}
