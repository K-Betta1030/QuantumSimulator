import React from "react";
import { useQuantumStore } from "../store/quantumStore";
import DroppableZone from "./DroppableZone"; // ★追加

export default function CircuitDiagram() {
  const gates = useQuantumStore((s) => s.gates);
  const removeGate = useQuantumStore((s) => s.removeGate);
  const currentStep = useQuantumStore((s) => s.currentStep);

  const START_X = 60;
  const GATE_W = 40;
  const GATE_H = 40;
  const GAP_X = 20;
  const LINE_Y0 = 50;
  const LINE_Y1 = 120;
  const STEP_WIDTH = GATE_W + GAP_X;

  const svgWidth = Math.max(800, START_X + gates.length * STEP_WIDTH + 100);

  return (
    // ★親divに position: relative を追加 (DropZoneのabsolute基準にするため)
    <div style={{ position: "relative", overflowX: "auto", background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }}>
      
      {/* ★ドロップ領域 (SVGの裏に配置) */}
      {/* Qubit 0 用 (上半分) */}
      <DroppableZone qubitId={0} top={0} height={85} />
      
      {/* Qubit 1 用 (下半分) */}
      <DroppableZone qubitId={1} top={85} height={95} />

      {/* SVG (手前に配置) */}
      <svg width={svgWidth} height="180" style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}>
        {/* pointerEvents: "none" にして、クリックを下のDropZoneに通す...
            と言いたいところですが、ゲートのクリック(削除)もしたいので、
            SVG全体はnoneにしつつ、ゲートだけautoに戻すテクニックを使います。
        */}
        
        <text x="10" y={LINE_Y0 + 5} fontFamily="monospace" fontWeight="bold">q0</text>
        <text x="10" y={LINE_Y1 + 5} fontFamily="monospace" fontWeight="bold">q1</text>

        <line x1="40" y1={LINE_Y0} x2={svgWidth} y2={LINE_Y0} stroke="#333" strokeWidth="2" />
        <line x1="40" y1={LINE_Y1} x2={svgWidth} y2={LINE_Y1} stroke="#333" strokeWidth="2" />

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

        {gates.map((g, i) => {
          const x = START_X + i * STEP_WIDTH;
          const y = g.target === 0 ? LINE_Y0 : LINE_Y1;
          
          if (g.name === "CNOT") {
             const cx = x + GATE_W / 2;
             return (
               // ★ pointerEvents: "auto" を追加 (削除クリック用)
               <g key={g.id} onClick={() => removeGate(i)} style={{ cursor: "pointer", pointerEvents: "auto" }}>
                 <line x1={cx} y1={LINE_Y0} x2={cx} y2={LINE_Y1} stroke="#333" strokeWidth="2" />
                 <circle cx={cx} cy={LINE_Y0} r="5" fill="#333" />
                 <circle cx={cx} cy={LINE_Y1} r="15" fill="#333" />
                 <text x={cx} y={LINE_Y1 + 5} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>
                 <rect x={x} y={20} width={GATE_W} height={140} fill="transparent" />
               </g>
             );
          }

          return (
            // ★ pointerEvents: "auto" を追加
            <g key={g.id} onClick={() => removeGate(i)} style={{ cursor: "pointer", pointerEvents: "auto" }}>
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
    </div>
  );
}