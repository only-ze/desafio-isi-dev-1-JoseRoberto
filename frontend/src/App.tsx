import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClubDetailPage } from "./pages/clubs/ClubDetailPage";
import { ClubsPage } from "./pages/clubs/ClubsPage";
import { PlayersPage } from "./pages/players/PlayersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/players" replace />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="clubs" element={<ClubsPage />} />
          <Route path="clubs/:id" element={<ClubDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}