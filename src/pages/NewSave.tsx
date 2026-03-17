import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";

export default function NewSave() {
  const [gmName, setGmName] = useState("");
  const [brand, setBrand] = useState<"raw" | "smackdown">("raw");
  const { createSave } = useGameStore();
  const navigate = useNavigate();

  function handleStart() {
    if (!gmName.trim()) return;
    createSave(gmName.trim(), brand);
    navigate("/draft");
  }

  return (
    <div className="max-w-md mx-auto mt-16 flex flex-col gap-6">
      <h1 className="text-2xl font-black text-white">Nouvelle Partie</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 font-medium">Ton nom de GM</label>
        <input
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
          value={gmName}
          onChange={(e) => setGmName(e.target.value)}
          placeholder="Ex: The Boss"
          maxLength={30}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 font-medium">Choisis ta brand</label>
        <div className="flex gap-3">
          {(["raw", "smackdown"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`flex-1 py-4 rounded-lg font-black uppercase text-lg tracking-widest border-2 transition-all cursor-pointer ${
                brand === b
                  ? b === "raw"
                    ? "bg-red-700 border-red-500 text-white"
                    : "bg-blue-700 border-blue-500 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500"
              }`}
            >
              {b === "raw" ? "RAW" : "SmackDown"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={() => navigate("/menu")}>
          Annuler
        </Button>
        <Button className="flex-1" onClick={handleStart} disabled={!gmName.trim()}>
          Commencer le Draft →
        </Button>
      </div>
    </div>
  );
}
