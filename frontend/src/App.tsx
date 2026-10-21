import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { PlayersPage } from "@/pages/PlayersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/players" replace />} />
          <Route path="players" element={<PlayersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}