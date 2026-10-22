import { request, type QueryParams } from "@/api/http";
import type { Player, PlayerCreateInput, PlayerPage, PlayerUpdateInput } from "@/types/api";
import type { Condition } from "@/utils/labels";

export function listPlayers(query: QueryParams, signal?: AbortSignal) {
  return request<PlayerPage>("/players", { query, signal });
}

export function createPlayer(body: PlayerCreateInput) {
  return request<Player>("/players", { method: "POST", body });
}

export function updatePlayer(id: number, body: PlayerUpdateInput) {
  return request<Player>(`/players/${id}`, { method: "PUT", body });
}

export function changeCondition(id: number, condition: Condition) {
  return request<Player>(`/players/${id}/condition`, { method: "PATCH", body: { condition } });
}

export function deletePlayer(id: number) {
  return request<void>(`/players/${id}`, { method: "DELETE" });
}
