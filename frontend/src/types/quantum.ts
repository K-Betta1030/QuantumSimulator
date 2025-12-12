
export interface Complex {
  re: number;
  im: number;
}

// 今後、ゲートの型などもここにまとめると便利です
export type GateType = "X" | "Y" | "Z" | "H";