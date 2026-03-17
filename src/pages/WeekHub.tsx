import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";

export default function WeekHub() {
  const { activeSave, usePowerCard } = useGameStore();
  const navigate = useNavigate();
  const save = activeSave();
  if (!save) { navigate("/menu"); return null; }

  const myRoster = save.roster.filter((s) => s.brand === save.brand);
  const injured = myRoster.filter((s) => s.injured);
  const lastShow = save.showHistory[save.showHistory.length - 1];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Semaine {save.week}</h1>
          <p className="text-gray-400 text-sm capitalize">{save.gmName} · Brand {save.brand}</p>
        </div>
        <Button size="lg" onClick={() => navigate("/booking")}>
          Booker le Show →
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Budget", value: `${save.budget.toLocaleString()}$`, color: "text-green-400" },
          { label: "Fans", value: save.fans.toLocaleString(), color: "text-yellow-400" },
          { label: "Réputation", value: `${save.brandReputation}/100`, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Last show recap */}
      {lastShow && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Dernier Show (Semaine {lastShow.week})</h2>
          <div className="flex gap-6">
            <div className="text-center">
              <div className={`text-3xl font-black ${lastShow.overallRating >= 70 ? "text-green-400" : lastShow.overallRating >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                {lastShow.overallRating}
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">+{lastShow.fansGained.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Fans gagnés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">+{lastShow.moneyEarned.toLocaleString()}$</div>
              <div className="text-xs text-gray-500">Recettes</div>
            </div>
          </div>
        </div>
      )}

      {/* Injured */}
      {injured.length > 0 && (
        <div className="bg-gray-900 border border-red-900 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-widest text-red-500 mb-3">Blessés ({injured.length})</h2>
          <div className="flex flex-col gap-2">
            {injured.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-white">{s.name} <span className="text-red-400 text-sm">— {s.injuryWeeksLeft} sem. restantes</span></span>
                {save.powerCards.find((c) => c.id === "heal_injury" && c.quantity > 0) && (
                  <Button size="sm" variant="secondary" onClick={() => usePowerCard("heal_injury", s.id)}>
                    Soigner (carte)
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Power cards */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Cartes de Pouvoir</h2>
        <div className="flex flex-wrap gap-2">
          {save.powerCards.map((card) => (
            <div
              key={card.id}
              className={`bg-gray-800 border rounded px-3 py-2 text-sm ${card.quantity === 0 ? "opacity-40 border-gray-700" : "border-gray-600"}`}
            >
              <div className="font-bold text-white">{card.name} <span className="text-gray-400">×{card.quantity}</span></div>
              <div className="text-gray-400 text-xs">{card.description}</div>
              <div className="text-yellow-400 text-xs mt-1">{card.cost.toLocaleString()}$</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate("/roster")}>Roster</Button>
        <Button variant="secondary" onClick={() => navigate("/rivalries")}>Rivalités</Button>
      </div>
    </div>
  );
}
