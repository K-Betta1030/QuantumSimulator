// src/quantum/components/CircuitDiagram.tsx
import React from "react";
import { useQuantumStore } from "../store/quantumStore";
import DroppableZone from "./DroppableZone";
import GateTooltip from "./GateTooltip";

export default function CircuitDiagram() {
  const gates = useQuantumStore((s) => s.gates);
  const removeGate = useQuantumStore((s) => s.removeGate);
  const currentStep = useQuantumStore((s) => s.currentStep);
  const setHoveredGate = useQuantumStore((s) => s.setHoveredGate);

  const START_X = 60;
  const GATE_W = 40;
  const GATE_H = 40;
  const GAP_X = 20;
  const STEP_WIDTH = GATE_W + GAP_X;

  // ★ 3本目のワイヤー用にY座標を定義（間隔は70pxに調整）
  const LINE_Y0 = 50;
  const LINE_Y1 = 120;
  const LINE_Y2 = 190; 

  const SVG_HEIGHT = 240; 
  const svgWidth = START_X + gates.length * STEP_WIDTH + 100;

  return (
    <div style={{ position: "relative", overflowX: "auto", background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }}>
      
      {/* ★ドロップ領域を3分割 (高さのバランスを調整) */}
      <DroppableZone qubitId={0} top={25} height={70} hasGate={gates.some(g => g.target === 0)} />
      <DroppableZone qubitId={1} top={95} height={70} hasGate={gates.some(g => g.target === 1)} />
      <DroppableZone qubitId={2} top={165} height={70} hasGate={gates.some(g => g.target === 2)} />

      <svg height={SVG_HEIGHT} style={{ minWidth: "100%", width: svgWidth, position: "relative", zIndex: 1, pointerEvents: "none" }}>
        
        {/* ワイヤーのラベル */}
        <text x="10" y={LINE_Y0 + 5} fontFamily="monospace" fontWeight="bold">q0</text>
        <text x="10" y={LINE_Y1 + 5} fontFamily="monospace" fontWeight="bold">q1</text>
        <text x="10" y={LINE_Y2 + 5} fontFamily="monospace" fontWeight="bold">q2</text>

        {/* ワイヤーの線 */}
        <line x1="40" y1={LINE_Y0} x2="100%" y2={LINE_Y0} stroke="#333" strokeWidth="2" />
        <line x1="40" y1={LINE_Y1} x2="100%" y2={LINE_Y1} stroke="#333" strokeWidth="2" />
        <line x1="40" y1={LINE_Y2} x2="100%" y2={LINE_Y2} stroke="#333" strokeWidth="2" />

        {/* ステップ実行時のハイライト（高さを3本分に拡張） */}
        {currentStep < gates.length && (
          <rect
            x={START_X + currentStep * STEP_WIDTH - GAP_X/2}
            y={20}
            width={STEP_WIDTH}
            height={SVG_HEIGHT - 40}
            fill="rgba(255, 165, 0, 0.2)"
            rx="5"
          />
        )}

        {gates.map((g, i) => {
          const x = START_X + i * STEP_WIDTH;
          
          // ★ ターゲットビットに応じてY座標を動的に決定
          const y = g.target === 0 ? LINE_Y0 : (g.target === 1 ? LINE_Y1 : LINE_Y2);
          
          // ※ CNOTは現状0と1の固定描画のままにしています（後で汎用化します）
          if (g.name === "CNOT") {
             const cx = x + GATE_W / 2;
             return (
               <g key={g.id} onMouseEnter={() => setHoveredGate("CNOT")} onMouseLeave={() => setHoveredGate(null)} style={{ cursor: "pointer", pointerEvents: "auto" }} onClick={() => removeGate(i)}>
                 <line x1={cx} y1={LINE_Y0} x2={cx} y2={LINE_Y1} stroke="#333" strokeWidth="2" />
                 <circle cx={cx} cy={LINE_Y0} r="5" fill="#333" />
                 <circle cx={cx} cy={LINE_Y1} r="15" fill="#333" />
                 <text x={cx} y={LINE_Y1 + 5} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>
                 <rect x={x} y={20} width={GATE_W} height={SVG_HEIGHT - 40} fill="transparent" />
               </g>
             );
          }

          // 通常ゲートの描画
          return (
            <g key={g.id} onMouseEnter={() => setHoveredGate(g.name)} onMouseLeave={() => setHoveredGate(null)} style={{ cursor: "pointer", pointerEvents: "auto" }} onClick={() => removeGate(i)}>
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
      <GateTooltip />
    </div>
  );
}