import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Button from "../ui/Button";
import type { BookedSegment, GMSave, SegmentType } from "../domain/types";

const segmentTypeLabels: Record<SegmentType, string> = {
  match_single: "Match Simple",
  match_tag: "Match Tag",
  promo: "Promo",
  angle: "Angle",
  interview: "Interview",
};

export default function Booking() {
  const { activeSave, addSegment, removeSegment, setMainEvent, runShow } = useGameStore();
  const navigate = useNavigate();
  const [type, setType] = useState<SegmentType>("match_single");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const save = activeSave();
  if (!save) { navigate("/menu"); return null; }

  const available = save.roster.filter((s) => s.brand === save.brand && !s.injured);

  function toggleParticipant(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAdd() {
    if (selectedIds.length === 0 || !save) return;
    addSegment({
      type,
      participants: selectedIds,
      isMainEvent: save.bookedShow.length === 0,
    });
    setSelectedIds([]);
  }

  function handleRunShow() {
    runShow();
    navigate("/show-results");
  }

  const needsMinParticipants =
    (type === "match_single" && selectedIds.length < 2) ||
    (type === "match_tag" && selectedIds.length < 4) ||
    (["promo", "angle", "interview"].includes(type) && selectedIds.length < 1);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Booking — Semaine {save.week}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/week")}>← Hub</Button>
          <Button
            onClick={handleRunShow}
            disabled={save.bookedShow.length === 0}
          >
            Lancer le Show ({save.bookedShow.length} segments) →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {(Object.keys(segmentTypeLabels) as SegmentType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`py-2 px-3 rounded text-sm font-medium border transition-colors cursor-pointer ${
              type === t
                ? "bg-red-600 border-red-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            {segmentTypeLabels[t]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Participants selector */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">
            Participants sélectionnés : {selectedIds.length}
          </h2>
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
            {available.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleParticipant(s.id)}
                className={`text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                  selectedIds.includes(s.id)
                    ? "bg-red-700 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  Pop {s.popularity} · Ring {s.inRing} · Mic {s.mic}
                </span>
              </button>
            ))}
          </div>
          <Button onClick={handleAdd} disabled={needsMinParticipants} className="mt-2">
            + Ajouter le segment
          </Button>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Carte du Show</h2>
          {save.bookedShow.length === 0 && (
            <p className="text-gray-600 text-sm">Aucun segment booké</p>
          )}
          {save.bookedShow.map((seg) => (
            <SegmentCard
              key={seg.id}
              seg={seg}
              save={save}
              onRemove={() => removeSegment(seg.id)}
              onSetMainEvent={() => setMainEvent(seg.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SegmentCard({
  seg,
  save,
  onRemove,
  onSetMainEvent,
}: {
  seg: BookedSegment;
  save: GMSave;
  onRemove: () => void;
  onSetMainEvent: () => void;
}) {
  const names = seg.participants
    .map((id) => save.roster.find((s) => s.id === id)?.name ?? "?")
    .join(" vs ");

  return (
    <div className={`rounded px-3 py-2 border text-sm flex items-center justify-between gap-2 ${seg.isMainEvent ? "border-yellow-600 bg-yellow-900/20" : "border-gray-700 bg-gray-800"}`}>
      <div>
        {seg.isMainEvent && <span className="text-yellow-400 text-xs font-bold mr-1">★ MAIN EVENT</span>}
        <span className="text-gray-400 text-xs">{segmentTypeLabels[seg.type]}</span>
        <div className="text-white font-medium">{names}</div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {!seg.isMainEvent && (
          <button onClick={onSetMainEvent} className="text-yellow-500 hover:text-yellow-300 text-xs cursor-pointer">★</button>
        )}
        <button onClick={onRemove} className="text-red-500 hover:text-red-300 cursor-pointer">✕</button>
      </div>
    </div>
  );
}
