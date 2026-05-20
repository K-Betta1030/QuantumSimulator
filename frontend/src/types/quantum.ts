
export interface Complex {
  re: number;
  im: number;
}

export interface CircuitGate {
  id: string;      // Reactのkey用にユニークIDを持たせると便利
  name: string;    // "H", "X", "CX" など
  target: number;  // 0 または 1
  controls?: number[]; // 制御ビットの配列 (例: CNOTなら [0], CCXなら [0, 1])
}
// 今後、ゲートの型などもここにまとめると便利です
export type GateType = "X" | "Y" | "Z" | "H" | "CNOT" | "CCX";