import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";
import type { RivalryType } from "../domain/types";

const rivalryTypeLabels: Record<RivalryType, string> = {
  trahison: "Trahison",
  title_chase: "Title Chase",
  respect: "Match de Respect",
  revenge: "Vengeance",
};

function IntensityBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${value >= 80 ? "bg-red-500" : value >= 50 ? "bg-orange-500" : "bg-yellow-500"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8">{value}</span>
    </div>
  );
}

export default function Rivalries() {
  const { activeSave, createRivalry, updateRivalryIntensity } = useGameStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [aStar, setAStar] = useState("");
  const [bStar, setBStar] = useState("");
  const [rType, setRType] = useState<RivalryType>("trahison");

  const save = activeSave();
  if (!save) { navigate("/menu"); return null; }

  const myRoster = save.roster.filter((s) => s.brand === save.brand);
  const activeRivalries = save.rivalries.filter((r) => r.active);

  function handleCreate() {
    if (!aStar || !bStar || aStar === bStar || !save) return;
    createRivalry({
      superstarAId: aStar,
      superstarBId: bStar,
      intensity: 30,
      chemistry: Math.round(Math.random() * 40 + 40),
      type: rType,
      weekStarted: save.week,
      active: true,
    });
    setShowForm(false);
    setAStar("");
    setBStar("");
  }

  function getName(id: string) {
    return save?.roster.find((s) => s.id === id)?.name ?? "?";
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Rivalités</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/week")}>← Hub</Button>
          <Button onClick={() => setShowForm((v) => !v)}>+ Nouvelle rivalité</Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white">Créer une rivalité</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Superstar A</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm"
                value={aStar}
                onChange={(e) => setAStar(e.target.value)}
              >
                <option value="">—</option>
                {myRoster.filter((s) => s.id !== bStar).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Superstar B</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm"
                value={bStar}
                onChange={(e) => setBStar(e.target.value)}
              >
                <option value="">—</option>
                {myRoster.filter((s) => s.id !== aStar).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <div className="flex gap-2">
              {(Object.keys(rivalryTypeLabels) as RivalryType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setRType(t)}
                  className={`px-3 py-1 rounded text-xs font-medium border cursor-pointer ${
                    rType === t ? "bg-red-700 border-red-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {rivalryTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={!aStar || !bStar || aStar === bStar}>
              Créer la rivalité
            </Button>
          </div>
        </div>
      )}

      {activeRivalries.length === 0 && !showForm && (
        <div className="text-gray-600 text-sm text-center py-8">Aucune rivalité active. Crées-en une !</div>
      )}

      <div className="flex flex-col gap-3">
        {activeRivalries.map((r) => (
          <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-white">{getName(r.superstarAId)}</span>
                <span className="text-gray-500 mx-2">vs</span>
                <span className="font-bold text-white">{getName(r.superstarBId)}</span>
              </div>
              <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded">
                {rivalryTypeLabels[r.type]}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mb-2">
              <span>Chimie : <strong className="text-white">{r.chemistry}</strong></span>
              <span>Depuis semaine {r.weekStarted}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Intensité</span>
              <IntensityBar value={r.intensity} />
              <div className="flex gap-1">
                <button
                  onClick={() => updateRivalryIntensity(r.id, -10)}
                  className="w-6 h-6 bg-gray-800 rounded text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer text-sm"
                >
                  −
                </button>
                <button
                  onClick={() => updateRivalryIntensity(r.id, 10)}
                  className="w-6 h-6 bg-gray-800 rounded text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
