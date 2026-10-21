import { request } from "@/api/http";
import type { BuyResult } from "@/types/api";

export function buyPlayer(playerId: number, body: { club_id: number; loyalty_until: string }) {
  return request<BuyResult>(`/players/${playerId}/buy`, { method: "POST", body });
}