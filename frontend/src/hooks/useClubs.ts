import { useMemo } from "react";
import { listClubs } from "@/api/clubs";
import { useFetch } from "@/hooks/useFetch";
import type { Club } from "@/types/api";

const fetchClubs = (signal: AbortSignal) => listClubs("name", signal);
const NO_CLUBS: Club[] = [];

export function useClubs() {
  const result = useFetch(fetchClubs);
  const clubs = result.data ?? NO_CLUBS;
  const clubsById = useMemo(() => new Map(clubs.map((club) => [club.id, club])), [clubs]);
  return { clubs, clubsById, error: result.error, reload: result.reload };
}
