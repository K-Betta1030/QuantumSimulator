import { create } from "zustand";
import { Complex } from "../../types/quantum";

export interface QuantumState {
  stateVector: [Complex, Complex];
  probabilities: [number, number];
  history: [Complex, Complex][];

  gates: string[];
  currentStep: number;
  isRunning: boolean;
  log: string[];

  pushLog: (msg: string) => void;
  clearLog: () => void;

  setGates: (g: string[]) => void;
  addGate: (g: string) => void;
  removeGate: (idx: number) => void;

  updateFromBackend: (newState: [Complex, Complex], newProbs: [number, number]) => void;

  pushHistory: (v: [Complex, Complex]) => void;
  popHistory: () => [Complex, Complex] | null;

  nextStep: () => void;
  prevStep: () => void;

  reset: () => void;
  setIsRunning: (v: boolean) => void;
}

const initialComplexState: [Complex, Complex] = [
  {re: 1, im: 0},
  {re: 0, im: 0}
]

export const useQuantumStore = create<QuantumState>((set, get) => ({
  gates: ["H", "Z", "X"],
  currentStep: 0,

  stateVector: initialComplexState,
  probabilities: [1, 0],
  history: [initialComplexState],
  isRunning: false,

  log: ["Simulator Ready"],
  pushLog: (msg) =>
    set((s) => ({
      log: [...s.log, msg]
    })),
  clearLog: () => set({ log: [] }),

  setGates: (g) => set({ gates: g }),
  updateFromBackend: (newState, newProbs) => set((s) => ({
    stateVector: newState,
    probabilities: newProbs,
  })),

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
      stateVector: initialComplexState,
      probabilities: [1, 0],
      history: [initialComplexState],
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
