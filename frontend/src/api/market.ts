import { request, requestBlob, type QueryParams } from "@/api/http";
import type { BuyResult, SellResult, TransactionList } from "@/types/api";

export function buyPlayer(playerId: number, body: { club_id: number; loyalty_until: string }) {
  return request<BuyResult>(`/players/${playerId}/buy`, { method: "POST", body });
}

export function sellPlayer(playerId: number) {
  return request<SellResult>(`/players/${playerId}/sell`, { method: "POST" });
}

export function listTransactions(clubId: number, query: QueryParams, signal?: AbortSignal) {
  return request<TransactionList>(`/clubs/${clubId}/transactions`, { query, signal });
}

export function exportTransactions(clubId: number, query: QueryParams) {
  return requestBlob(`/clubs/${clubId}/transactions/export`, { query });
}
