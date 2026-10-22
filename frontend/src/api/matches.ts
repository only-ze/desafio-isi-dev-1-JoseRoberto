import { request } from "@/api/http";
import type { Match, MatchCreateInput, MatchSummary, Standing } from "@/types/api";

export function listMatches(clubId: string, signal?: AbortSignal) {
  return request<MatchSummary[]>("/matches", { query: { club_id: clubId || undefined }, signal });
}

export function getMatch(id: number, signal?: AbortSignal) {
  return request<Match>(`/matches/${id}`, { signal });
}

export function playMatch(body: MatchCreateInput) {
  return request<Match>("/matches", { method: "POST", body });
}

export function getStandings(signal?: AbortSignal) {
  return request<Standing[]>("/standings", { signal });
}
