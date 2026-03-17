import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";

const segmentTypeLabels: Record<string, string> = {
  match_single: "Match",
  match_tag: "Tag Match",
  promo: "Promo",
  angle: "Angle",
  interview: "Interview",
};

function ratingColor(r: number) {
  if (r >= 75) return "text-green-400";
  if (r >= 55) return "text-yellow-400";
  return "text-red-400";
}

function ratingLabel(r: number) {
  if (r >= 80) return "Légendaire";
  if (r >= 70) return "Excellent";
  if (r >= 60) return "Bon";
  if (r >= 50) return "Correct";
  if (r >= 40) return "Médiocre";
  return "Catastrophique";
}

export default function Results() {
  const { activeSave } = useGameStore();
  const navigate = useNavigate();
  const save = activeSave();

  if (!save) { navigate("/menu"); return null; }

  const lastShow = save.showHistory[save.showHistory.length - 1];
  if (!lastShow) { navigate("/week"); return null; }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white">Résultats du Show</h1>
        <p className="text-gray-400 text-sm">Semaine {lastShow.week}</p>
      </div>

      {/* Overall rating */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className={`text-7xl font-black ${ratingColor(lastShow.overallRating)}`}>
          {lastShow.overallRating}
        </div>
        <div className="text-xl text-gray-300 font-semibold mt-1">{ratingLabel(lastShow.overallRating)}</div>

        <div className="flex justify-center gap-8 mt-4">
          <div>
            <div className="text-xl font-bold text-yellow-400">+{lastShow.fansGained.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Nouveaux fans</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">+{lastShow.moneyEarned.toLocaleString()}$</div>
            <div className="text-xs text-gray-500">Recettes</div>
          </div>
          <div>
            <div className={`text-xl font-bold ${lastShow.moralChange >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {lastShow.moralChange >= 0 ? "+" : ""}{lastShow.moralChange}
            </div>
            <div className="text-xs text-gray-500">Moral</div>
          </div>
        </div>
      </div>

      {/* Segment results */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">Détail des segments</h2>
        {lastShow.segments.map((sr, i) => {
          const winner = sr.winnerId ? save.roster.find((s) => s.id === sr.winnerId) : null;
          return (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{segmentTypeLabels[sr.type] ?? sr.type}</span>
                <span className={`text-lg font-black ${ratingColor(sr.score)}`}>{sr.score}</span>
              </div>
              {winner && (
                <div className="text-sm text-white">
                  🏆 <strong>{winner.name}</strong>
                </div>
              )}
              <div className="mt-1 flex flex-col gap-0.5">
                {sr.highlights.map((h, j) => (
                  <div key={j} className="text-xs text-gray-400">— {h}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Button size="lg" onClick={() => navigate("/week")}>
        Continuer → Semaine {save.week}
      </Button>
    </div>
  );
}
