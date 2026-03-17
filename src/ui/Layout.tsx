import { Link, useLocation } from "react-router-dom";
import { useGameStore } from "../store/gameStore";

const navLinks = [
  { to: "/week", label: "Hub" },
  { to: "/booking", label: "Booking" },
  { to: "/roster", label: "Roster" },
  { to: "/rivalries", label: "Rivalités" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const activeSave = useGameStore((s) => s.activeSave());

  const inGame = activeSave !== null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <Link to={inGame ? "/week" : "/menu"} className="text-red-500 font-black text-xl tracking-widest uppercase no-underline">
          MyGM.io
        </Link>

        {inGame && (
          <nav className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded text-sm font-medium no-underline transition-colors ${
                  location.pathname === link.to
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {inGame && (
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Semaine <strong className="text-white">{activeSave.week}</strong></span>
            <span>Budget <strong className="text-green-400">{activeSave.budget.toLocaleString()}$</strong></span>
            <span>Fans <strong className="text-yellow-400">{activeSave.fans.toLocaleString()}</strong></span>
          </div>
        )}
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
