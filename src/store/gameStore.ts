import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { GMSave, BookedSegment, Rivalry, PowerCardId } from "../domain/types";
import { seedRoster, seedTitles, seedPowerCards } from "../domain/seed";
import { simulateShow, applyShowResults } from "../domain/simulate";

interface GameState {
  saves: GMSave[];
  activeSaveId: string | null;

  // Getters
  activeSave: () => GMSave | null;

  // Save management
  createSave: (gmName: string, brand: "raw" | "smackdown") => string;
  loadSave: (id: string) => void;
  deleteSave: (id: string) => void;

  // Draft
  draftSuperstar: (superstarId: string) => void;

  // Booking
  addSegment: (segment: Omit<BookedSegment, "id">) => void;
  removeSegment: (segmentId: string) => void;
  reorderSegments: (segments: BookedSegment[]) => void;
  setMainEvent: (segmentId: string) => void;

  // Rivalries
  createRivalry: (rivalry: Omit<Rivalry, "id">) => void;
  updateRivalryIntensity: (rivalryId: string, delta: number) => void;

  // Show
  runShow: () => void;

  // Power cards
  usePowerCard: (cardId: PowerCardId, targetId?: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      saves: [],
      activeSaveId: null,

      activeSave: () => {
        const { saves, activeSaveId } = get();
        return saves.find((s) => s.id === activeSaveId) ?? null;
      },

      createSave: (gmName, brand) => {
        const id = uuid();
        const roster = seedRoster();
        const newSave: GMSave = {
          id,
          gmName,
          brand,
          week: 1,
          budget: 150000,
          fans: 50000,
          brandReputation: 50,
          roster,
          titles: seedTitles(),
          rivalries: [],
          bookedShow: [],
          showHistory: [],
          powerCards: seedPowerCards(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ saves: [...state.saves, newSave], activeSaveId: id }));
        return id;
      },

      loadSave: (id) => set({ activeSaveId: id }),

      deleteSave: (id) =>
        set((state) => ({
          saves: state.saves.filter((s) => s.id !== id),
          activeSaveId: state.activeSaveId === id ? null : state.activeSaveId,
        })),

      draftSuperstar: (superstarId) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const updated = {
            ...save,
            roster: save.roster.map((s) =>
              s.id === superstarId ? { ...s, brand: save.brand } : s
            ),
          };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      addSegment: (segment) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const newSeg: BookedSegment = { ...segment, id: uuid() };
          const updated = { ...save, bookedShow: [...save.bookedShow, newSeg] };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      removeSegment: (segmentId) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const updated = { ...save, bookedShow: save.bookedShow.filter((s) => s.id !== segmentId) };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      reorderSegments: (segments) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const updated = { ...save, bookedShow: segments };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      setMainEvent: (segmentId) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const updated = {
            ...save,
            bookedShow: save.bookedShow.map((seg) => ({
              ...seg,
              isMainEvent: seg.id === segmentId,
            })),
          };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      createRivalry: (rivalry) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const newRivalry: Rivalry = { ...rivalry, id: uuid() };
          const updated = { ...save, rivalries: [...save.rivalries, newRivalry] };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      updateRivalryIntensity: (rivalryId, delta) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const updated = {
            ...save,
            rivalries: save.rivalries.map((r) =>
              r.id === rivalryId
                ? { ...r, intensity: Math.max(0, Math.min(100, r.intensity + delta)) }
                : r
            ),
          };
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      runShow: () =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;
          const result = simulateShow(save);
          const updated = applyShowResults(save, result);
          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),

      usePowerCard: (cardId, targetId) =>
        set((state) => {
          const save = state.saves.find((s) => s.id === state.activeSaveId);
          if (!save) return state;

          const card = save.powerCards.find((c) => c.id === cardId);
          if (!card || card.quantity === 0 || save.budget < card.cost) return state;

          let updated = {
            ...save,
            budget: save.budget - card.cost,
            powerCards: save.powerCards.map((c) =>
              c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c
            ),
          };

          if (cardId === "heal_injury" && targetId) {
            updated = {
              ...updated,
              roster: updated.roster.map((s) =>
                s.id === targetId ? { ...s, injured: false, injuryWeeksLeft: 0 } : s
              ),
            };
          } else if (cardId === "momentum_push" && targetId) {
            updated = {
              ...updated,
              roster: updated.roster.map((s) =>
                s.id === targetId
                  ? { ...s, momentum: Math.min(20, s.momentum + 10) }
                  : s
              ),
            };
          }

          return { saves: state.saves.map((s) => (s.id === save.id ? updated : s)) };
        }),
    }),
    { name: "mygm-saves" }
  )
);
