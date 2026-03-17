import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";
import { generateShowRecap, generateShowPoster } from "../lib/openai";

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

  const [recap, setRecap] = useState("");
  const [recapLoading, setRecapLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [posterLoading, setPosterLoading] = useState(false);

  const save = activeSave();
  if (!save) { navigate("/menu"); return null; }

  const lastShow = save.showHistory[save.showHistory.length - 1];
  if (!lastShow) { navigate("/week"); return null; }

  async function handleGenerateRecap() {
    if (!save) return;
    setRecapLoading(true);
    setRecap("");
    try {
      const text = await generateShowRecap(save);
      setRecap(text);
    } finally {
      setRecapLoading(false);
    }
  }

  async function handleGeneratePoster() {
    if (!save) return;
    setPosterLoading(true);
    setPosterUrl("");
    try {
      const url = await generateShowPoster(save);
      setPosterUrl(url);
    } finally {
      setPosterLoading(false);
    }
  }

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

      {/* ── IA Recap ── */}
      <div className="bg-gray-900 border border-purple-900/50 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-sm font-bold">✦ IA — Article de Presse</span>
            <span className="text-xs text-gray-500">GPT-4o mini</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerateRecap}
            disabled={recapLoading}
          >
            {recapLoading ? "Rédaction..." : "Générer l'article"}
          </Button>
        </div>

        {recapLoading && (
          <div className="text-purple-300 text-sm animate-pulse">Le journaliste rédige son article...</div>
        )}

        {recap && (
          <div className="bg-gray-800 border border-purple-800/40 rounded p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
            {recap}
          </div>
        )}
      </div>

      {/* ── DALL-E Affiche ── */}
      <div className="bg-gray-900 border border-purple-900/50 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-sm font-bold">✦ IA — Affiche du Show</span>
            <span className="text-xs text-gray-500">DALL-E 3</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGeneratePoster}
            disabled={posterLoading}
          >
            {posterLoading ? "Génération (~15s)..." : "Générer l'affiche"}
          </Button>
        </div>

        {posterLoading && (
          <div className="text-purple-300 text-sm animate-pulse">DALL-E 3 crée l'affiche du show...</div>
        )}

        {posterUrl && (
          <div className="rounded-lg overflow-hidden border border-purple-800/40">
            <img
              src={posterUrl}
              alt={`Affiche ${save.brand} semaine ${lastShow.week}`}
              className="w-full object-cover"
            />
            <div className="bg-gray-800 px-3 py-2 flex justify-between items-center">
              <span className="text-xs text-gray-400">{save.brand.toUpperCase()} · Semaine {lastShow.week} · GM {save.gmName}</span>
              <a
                href={posterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-200"
              >
                Ouvrir ↗
              </a>
            </div>
          </div>
        )}
      </div>

      <Button size="lg" onClick={() => navigate("/week")}>
        Continuer → Semaine {save.week}
      </Button>
    </div>
  );
}
