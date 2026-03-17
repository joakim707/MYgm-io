import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";

const DRAFT_SLOTS = 10;

const styleLabels: Record<string, string> = {
  powerhouse: "Powerhouse",
  highflyer: "Highflyer",
  technicien: "Technicien",
  brawler: "Brawler",
};

export default function Draft() {
  const { activeSave, draftSuperstar } = useGameStore();
  const navigate = useNavigate();
  const save = activeSave();

  if (!save) return null;

  const drafted = save.roster.filter((s) => s.brand === save.brand);
  const available = save.roster.filter((s) => s.brand === "free_agent");
  const remaining = DRAFT_SLOTS - drafted.length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Draft du Roster</h1>
          <p className="text-gray-400 text-sm">
            Sélectionne {DRAFT_SLOTS} superstars pour ta brand{" "}
            <span className="text-white font-bold uppercase">{save.brand}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-red-500">{drafted.length}/{DRAFT_SLOTS}</div>
          <div className="text-xs text-gray-500">drafté(s)</div>
        </div>
      </div>

      {drafted.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Ton roster</h2>
          <div className="flex flex-wrap gap-2">
            {drafted.map((s) => (
              <span key={s.id} className="bg-red-900/40 text-red-200 border border-red-800 px-3 py-1 rounded text-sm font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">Free Agents disponibles</h2>
        {available.map((s) => (
          <div
            key={s.id}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <div className="flex-1">
              <div className="font-bold text-white">{s.name}</div>
              <div className="text-xs text-gray-400">
                {s.alignment === "face" ? "Face" : s.alignment === "heel" ? "Heel" : "Neutral"} ·{" "}
                {styleLabels[s.style]} · {s.salary.toLocaleString()}$/sem
              </div>
            </div>
            <div className="flex gap-3 text-xs text-center">
              <div>
                <div className="text-white font-bold">{s.popularity}</div>
                <div className="text-gray-500">Pop</div>
              </div>
              <div>
                <div className="text-white font-bold">{s.inRing}</div>
                <div className="text-gray-500">Ring</div>
              </div>
              <div>
                <div className="text-white font-bold">{s.mic}</div>
                <div className="text-gray-500">Mic</div>
              </div>
            </div>
            <Button
              size="sm"
              disabled={remaining === 0}
              onClick={() => draftSuperstar(s.id)}
            >
              Draft
            </Button>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        disabled={drafted.length < 6}
        onClick={() => navigate("/week")}
        className="mt-2"
      >
        Valider le roster ({drafted.length} superstars) →
      </Button>
    </div>
  );
}
