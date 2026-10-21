import { request } from "@/api/http";
import type { Club, ClubCreateInput, ClubDetail, Lineup, LineupInput } from "@/types/api";

export type ClubSort = "name" | "net_worth_asc" | "net_worth_desc";

export function listClubs(sort: ClubSort = "name", signal?: AbortSignal) {
  return request<Club[]>("/clubs", { query: { sort }, signal });
}

export function getClub(id: number, signal?: AbortSignal) {
  return request<ClubDetail>(`/clubs/${id}`, { signal });
}

export function createClub(body: ClubCreateInput) {
  return request<Club>("/clubs", { method: "POST", body });
}

export function getLineup(clubId: number, signal?: AbortSignal) {
  return request<Lineup>(`/clubs/${clubId}/lineup`, { signal });
}

export function saveLineup(clubId: number, body: LineupInput) {
  return request<Lineup>(`/clubs/${clubId}/lineup`, { method: "PUT", body });
}
