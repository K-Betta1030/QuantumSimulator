import { create } from "zustand";

export interface QuantumState {
  gates: string[];
  currentStep: number;
  stateVector: [number, number];
  history: [number, number][];
  isRunning: boolean;

  log: string[];
  pushLog: (msg: string) => void;
  clearLog: () => void;

  setGates: (g: string[]) => void;
  addGate: (g: string) => void;
  removeGate: (idx: number) => void;
  setStateVector: (v: [number, number]) => void;

  pushHistory: (v: [number, number]) => void;
  popHistory: () => [number, number] | null;

  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  setIsRunning: (v: boolean) => void;
}

export const useQuantumStore = create<QuantumState>((set, get) => ({
  gates: ["H", "Z", "X"],
  currentStep: 0,
  stateVector: [1, 0],
  history: [[1, 0]],
  isRunning: false,

  log: ["Simulator Ready"],
  pushLog: (msg) =>
    set((s) => ({
      log: [...s.log, msg]
    })),
  clearLog: () => set({ log: [] }),

  setGates: (g) => set({ gates: g }),
  setStateVector: (v) => set({ stateVector: v }),

  pushHistory: (v) =>
    set((s) => ({
      history: [...s.history, v]
    })),

  popHistory: () => {
    const h = get().history;
    if (h.length <= 1) return null;

    const newHist = h.slice(0, -1);
    const last = newHist[newHist.length - 1];

    set({ history: newHist, stateVector: last });
    return last;
  },

  nextStep: () =>
    set((s) => ({
      currentStep: s.currentStep + 1
    })),

  prevStep: () =>
    set((s) => ({
      currentStep: Math.max(0, s.currentStep - 1)
    })),

  reset: () =>
    set({
      currentStep: 0,
      stateVector: [1, 0],
      history: [[1, 0]],
      log: ["Reset to |0⟩"],
      isRunning: false,
    }),

  setIsRunning: (v) => set({ isRunning: v }),

  addGate: (gate: string) =>
    set((state) => ({
      gates: [...state.gates, gate],
    })),

  removeGate: (index: number) =>
    set((state) => ({
      gates: state.gates.filter((_, i) => i !== index),
    })),

}));
