import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Complex, CircuitGate } from "../../types/quantum"; // CircuitGateを追加
import { v4 as uuidv4 } from 'uuid'; // ID生成用（なければ一旦Date.now()等で代用可）

// uuidがない場合は簡易ID生成関数を使用
const generateId = () => Math.random().toString(36).substr(2, 9);

export interface QuantumState {
  // --- データ構造 ---
  stateVector: Complex[]; 
  probabilities: number[];
  history: Complex[][];

  // --- ★変更: ゲート管理 ---
  gates: CircuitGate[]; // string[] から変更
  
  // --- 既存 ---
  currentStep: number;
  isRunning: boolean;
  log: string[];

  // --- アクション ---
  pushLog: (msg: string) => void;
  clearLog: () => void;

  setGates: (g: CircuitGate[]) => void;
  
  // ★変更: ターゲットを指定して追加
  addGate: (name: string, target: number) => void;
  
  removeGate: (idx: number) => void;

  pushHistory: (v: Complex[]) => void;
  popHistory: () => Complex[] | null;
  updateFromBackend: (newState: Complex[], newProbs: number[]) => void;

  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setIsRunning: (v: boolean) => void;
}

const initialVector: Complex[] = [
  { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }
];

export const useQuantumStore = create<QuantumState>()(
  devtools((set, get) => ({
    gates: [], 
    currentStep: 0,
    stateVector: initialVector, 
    probabilities: [1, 0, 0, 0],
    history: [initialVector],
    isRunning: false,
    log: ["Simulator Ready (Circuit UI Phase)"],

    pushLog: (msg) => set((s) => ({ log: [...s.log, msg] })),
    clearLog: () => set({ log: [] }),
    
    setGates: (g) => set({ gates: g }),

    updateFromBackend: (newState, newProbs) => set((s) => ({
        stateVector: newState,
        probabilities: newProbs,
    })),

    pushHistory: (v) => set((s) => ({ history: [...s.history, v] })),

    popHistory: () => {
      const h = get().history;
      if (h.length <= 1) return null;
      const newHist = h.slice(0, -1);
      const last = newHist[newHist.length - 1];
      set({ history: newHist, stateVector: last });
      return last;
    },

    nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
    
    prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

    reset: () => set({
        currentStep: 0,
        stateVector: initialVector,
        probabilities: [1, 0, 0, 0],
        history: [initialVector],
        log: ["Reset to |00⟩"],
        isRunning: false,
        gates: [] // ゲートもクリア
    }),

    setIsRunning: (v) => set({ isRunning: v }),

    // ★変更: ターゲットを受け取り、オブジェクトとして追加
    addGate: (name: string, target: number) =>
      set((state) => ({
        gates: [
          ...state.gates, 
          { id: generateId(), name, target }
        ],
      })),

    removeGate: (index: number) =>
      set((state) => ({
        gates: state.gates.filter((_, i) => i !== index),
      })),
  }))
);