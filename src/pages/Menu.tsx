import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";

export default function Menu() {
  const { saves, loadSave, deleteSave } = useGameStore();
  const navigate = useNavigate();

  function handleLoad(id: string) {
    loadSave(id);
    navigate("/week");
  }

  return (
    <div className="max-w-lg mx-auto mt-16 flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-black text-red-500 tracking-widest uppercase mb-2">MyGM.io</h1>
        <p className="text-gray-400">Become the greatest General Manager of all time</p>
      </div>

      <Button size="lg" onClick={() => navigate("/new-save")}>
        + Nouvelle Partie
      </Button>

      {saves.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Parties sauvegardées</h2>
          {saves.map((save) => (
            <div
              key={save.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white">{save.gmName}</div>
                <div className="text-sm text-gray-400 capitalize">
                  {save.brand} · Semaine {save.week} · {save.fans.toLocaleString()} fans
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleLoad(save.id)}>
                  Charger
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm("Supprimer cette sauvegarde ?")) deleteSave(save.id);
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
