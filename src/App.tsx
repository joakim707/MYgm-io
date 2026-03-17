import { Navigate, Route, Routes } from "react-router-dom";
import { useGameStore } from "./store/gameStore";
import Layout from "./ui/Layout";
import Menu from "./pages/Menu";
import NewSave from "./pages/NewSave";
import Draft from "./pages/Draft";
import WeekHub from "./pages/WeekHub";
import Booking from "./pages/Booking";
import Results from "./pages/Results";
import Roster from "./pages/Roster";
import Rivalries from "./pages/Rivalries";

function RequireSave({ children }: { children: React.ReactNode }) {
  const activeSave = useGameStore((s) => s.activeSave());
  if (!activeSave) return <Navigate to="/menu" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/new-save" element={<NewSave />} />
        <Route
          path="/draft"
          element={<RequireSave><Draft /></RequireSave>}
        />
        <Route
          path="/week"
          element={<RequireSave><WeekHub /></RequireSave>}
        />
        <Route
          path="/booking"
          element={<RequireSave><Booking /></RequireSave>}
        />
        <Route
          path="/show-results"
          element={<RequireSave><Results /></RequireSave>}
        />
        <Route
          path="/roster"
          element={<RequireSave><Roster /></RequireSave>}
        />
        <Route
          path="/rivalries"
          element={<RequireSave><Rivalries /></RequireSave>}
        />
      </Routes>
    </Layout>
  );
}
