import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";

function StatBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6">{value}</span>
    </div>
  );
}

export default function Roster() {
  const { activeSave } = useGameStore();
  const navigate = useNavigate();
  const save = activeSave();
  if (!save) { navigate("/menu"); return null; }

  const myRoster = save.roster
    .filter((s) => s.brand === save.brand)
    .sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Roster — {myRoster.length} superstars</h1>
        <Button variant="ghost" onClick={() => navigate("/week")}>← Hub</Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
              <th className="text-left px-4 py-3">Superstar</th>
              <th className="px-4 py-3">Align.</th>
              <th className="px-4 py-3">Popularité</th>
              <th className="px-4 py-3">Ring</th>
              <th className="px-4 py-3">Mic</th>
              <th className="px-4 py-3">Stamina</th>
              <th className="px-4 py-3">Momentum</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {myRoster.map((s) => (
              <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-3">
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{s.style}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold ${s.alignment === "face" ? "text-blue-400" : s.alignment === "heel" ? "text-red-400" : "text-gray-400"}`}>
                    {s.alignment === "face" ? "Face" : s.alignment === "heel" ? "Heel" : "Neut."}
                  </span>
                </td>
                <td className="px-4 py-3"><StatBar value={s.popularity} /></td>
                <td className="px-4 py-3"><StatBar value={s.inRing} /></td>
                <td className="px-4 py-3"><StatBar value={s.mic} /></td>
                <td className="px-4 py-3"><StatBar value={s.stamina} /></td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-bold ${s.momentum > 0 ? "text-green-400" : s.momentum < 0 ? "text-red-400" : "text-gray-400"}`}>
                    {s.momentum > 0 ? "+" : ""}{s.momentum}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.injured ? (
                    <span className="text-red-400 text-xs font-bold">Blessé {s.injuryWeeksLeft}w</span>
                  ) : (
                    <span className="text-green-400 text-xs">OK</span>
                  )}
                  {s.titleHolder && <div className="text-yellow-400 text-xs">Champion</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
