import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClubDetailPage } from "./pages/clubs/ClubDetailPage";
import { ClubsPage } from "./pages/clubs/ClubsPage";
import { MatchDetailPage } from "./pages/matches/MatchDetailPage";
import { MatchesPage } from "./pages/matches/MatchesPage";
import { PlayersPage } from "./pages/players/PlayersPage";
import { StandingsPage } from "./pages/standings/StandingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/players" replace />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="clubs" element={<ClubsPage />} />
          <Route path="clubs/:id" element={<ClubDetailPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="matches/:id" element={<MatchDetailPage />} />
          <Route path="standings" element={<StandingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
