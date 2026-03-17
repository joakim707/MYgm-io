import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";

function Home() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>MyGM.io</h1>
      <p>Connecte en tant que : {user?.email}</p>
      <button onClick={signOut}>Se deconnecter</button>
      <div style={{ marginTop: 16 }}>
        <Link to="/dashboard">Aller au dashboard</Link>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard protege</h2>
      <p>Ici on mettra les saves, roster, booking, etc.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
