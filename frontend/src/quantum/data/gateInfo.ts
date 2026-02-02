// src/quantum/data/gateInfo.ts

export interface GateMeta {
  name: string;
  description: string;
  matrix: string[][]; // 2x2 または 4x4 の文字列表現
  multiplier?: string; // "1/√2" などの係数
}

export const GATE_INFO: Record<string, GateMeta> = {
  H: {
    name: "Hadamard (H)",
    description: "量子的な重ね合わせ状態を作ります。|0⟩を|+⟩に変換します。",
    multiplier: "1/√2",
    matrix: [
      ["1", "1"],
      ["1", "-1"]
    ]
  },
  X: {
    name: "Pauli-X (NOT)",
    description: "古典的なNOTゲートに相当します。ビットを反転(0↔1)させます。",
    matrix: [
      ["0", "1"],
      ["1", "0"]
    ]
  },
  Y: {
    name: "Pauli-Y",
    description: "ビット反転と位相の反転を同時に行います。",
    matrix: [
      ["0", "-i"],
      ["i", "0"]
    ]
  },
  Z: {
    name: "Pauli-Z",
    description: "位相を反転させます(|1⟩の符号を反転)。",
    matrix: [
      ["1", "0"],
      ["0", "-1"]
    ]
  },
  S: {
    name: "Phase (S)",
    description: "Zゲートの平方根です。90度(π/2)の位相回転を与えます。",
    matrix: [
      ["1", "0"],
      ["0", "i"]
    ]
  },
  Sdg: {
    name: "S† (S-dagger)",
    description: "Sゲートの逆操作です。-90度の位相回転を与えます。",
    matrix: [
      ["1", "0"],
      ["0", "-i"]
    ]
  },
  T: {
    name: "T Gate",
    description: "Sゲートの平方根です。45度(π/4)の位相回転を与えます。",
    matrix: [
      ["1", "0"],
      ["0", "e^(iπ/4)"]
    ]
  },
  Tdg: {
    name: "T† (T-dagger)",
    description: "Tゲートの逆操作です。",
    matrix: [
      ["1", "0"],
      ["0", "e^(-iπ/4)"]
    ]
  },
  CNOT: {
    name: "CNOT (CX)",
    description: "制御NOTゲート。制御ビットが1の時だけ、ターゲットを反転します。",
    matrix: [
      ["1", "0", "0", "0"],
      ["0", "1", "0", "0"],
      ["0", "0", "0", "1"],
      ["0", "0", "1", "0"]
    ]
  }
};