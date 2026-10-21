import { request } from "@/api/http";
import type { Club } from "@/types/api";

export type ClubSort = "name" | "net_worth_asc" | "net_worth_desc";

export function listClubs(sort: ClubSort = "name", signal?: AbortSignal) {
  return request<Club[]>("/clubs", { query: { sort }, signal });
}