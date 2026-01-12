import React from "react";
import { useQuantumStore } from "../store/quantumStore";

export default function CircuitDiagram() {
  const gates = useQuantumStore((s) => s.gates);
  const removeGate = useQuantumStore((s) => s.removeGate);
  const currentStep = useQuantumStore((s) => s.currentStep);

  // --- レイアウト定数 ---
  const START_X = 60;   // 最初のゲートの開始位置
  const GATE_W = 40;    // ゲートの幅
  const GATE_H = 40;    // ゲートの高さ
  const GAP_X = 20;     // ゲート間の隙間
  const LINE_Y0 = 50;   // Qubit 0 の線のY座標
  const LINE_Y1 = 120;  // Qubit 1 の線のY座標
  const STEP_WIDTH = GATE_W + GAP_X;

  // 全体の幅 (ゲート数に応じて伸びるようにする)
  const svgWidth = Math.max(800, START_X + gates.length * STEP_WIDTH + 100);

  return (
    <div style={{ overflowX: "auto", background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }}>
      <svg width={svgWidth} height="180">
        {/* --- Qubit ラベル --- */}
        <text x="10" y={LINE_Y0 + 5} fontFamily="monospace" fontWeight="bold">q0</text>
        <text x="10" y={LINE_Y1 + 5} fontFamily="monospace" fontWeight="bold">q1</text>

        {/* --- ワイヤー (横線) --- */}
        <line x1="40" y1={LINE_Y0} x2={svgWidth} y2={LINE_Y0} stroke="#333" strokeWidth="2" />
        <line x1="40" y1={LINE_Y1} x2={svgWidth} y2={LINE_Y1} stroke="#333" strokeWidth="2" />

        {/* --- 現在のステップ表示 (オレンジの枠) --- */}
        {currentStep < gates.length && (
          <rect
            x={START_X + currentStep * STEP_WIDTH - GAP_X/2}
            y={20}
            width={STEP_WIDTH}
            height={140}
            fill="rgba(255, 165, 0, 0.2)"
            rx="5"
          />
        )}

        {/* --- ゲート描画 --- */}
        {gates.map((g, i) => {
          const x = START_X + i * STEP_WIDTH;
          // ターゲットが0なら上の線、1なら下の線に配置
          const y = g.target === 0 ? LINE_Y0 : LINE_Y1;
          
          // CNOT (CX) の特別描画
          if (g.name === "CNOT") {
             // 仕様上 CNOT は Control:0 -> Target:1 固定としているため
             // Control(0)に黒丸、Target(1)にXマーク付き丸を描画して繋ぎます
             const cx = x + GATE_W / 2;
             return (
               <g key={g.id} onClick={() => removeGate(i)} style={{ cursor: "pointer" }}>
                 {/* 縦線 */}
                 <line x1={cx} y1={LINE_Y0} x2={cx} y2={LINE_Y1} stroke="#333" strokeWidth="2" />
                 
                 {/* Control (黒丸) - Qubit 0 */}
                 <circle cx={cx} cy={LINE_Y0} r="5" fill="#333" />
                 
                 {/* Target (Xマーク付き丸) - Qubit 1 */}
                 <circle cx={cx} cy={LINE_Y1} r="15" fill="#333" />
                 {/* プラス記号 */}
                 <text x={cx} y={LINE_Y1 + 5} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>
                 
                 {/* 削除用透明ヒットエリア (クリックしやすくするため) */}
                 <rect x={x} y={20} width={GATE_W} height={140} fill="transparent" />
               </g>
             );
          }

          // 通常ゲートの描画
          return (
            <g key={g.id} onClick={() => removeGate(i)} style={{ cursor: "pointer" }}>
              {/* ゲートの箱 */}
              <rect
                x={x}
                y={y - GATE_H / 2}
                width={GATE_W}
                height={GATE_H}
                fill={i === currentStep ? "#ffe19a" : "white"}
                stroke="#333"
                strokeWidth="2"
                rx="4"
              />
              {/* 文字 */}
              <text
                x={x + GATE_W / 2}
                y={y + 5}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="14"
                fill="#333"
                pointerEvents="none"
              >
                {g.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}