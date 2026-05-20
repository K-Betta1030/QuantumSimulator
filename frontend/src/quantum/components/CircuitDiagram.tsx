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

  const LINE_Y0 = 50;
  const LINE_Y1 = 120;
  const LINE_Y2 = 190; 
  const SVG_HEIGHT = 240; 

  const requiredWidth = START_X + gates.length * STEP_WIDTH + 100;

  // ★ 追加：量子ビット番号からY座標を取得するヘルパー関数
  const getY = (qubitIndex: number) => {
    if (qubitIndex === 0) return LINE_Y0;
    if (qubitIndex === 1) return LINE_Y1;
    return LINE_Y2;
  };

  return (
    <div style={{ position: "relative", overflowX: "auto", background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }}>
      
      <DroppableZone qubitId={0} top={25} height={70} hasGate={gates.some(g => g.target === 0 || g.controls?.includes(0))} />
      <DroppableZone qubitId={1} top={95} height={70} hasGate={gates.some(g => g.target === 1 || g.controls?.includes(1))} />
      <DroppableZone qubitId={2} top={165} height={70} hasGate={gates.some(g => g.target === 2 || g.controls?.includes(2))} />

      <svg 
        style={{ minWidth: "100%", width: requiredWidth, position: "relative", zIndex: 1, pointerEvents: "none" }} 
        height={SVG_HEIGHT}
      >
        <text x="10" y={LINE_Y0 + 5} fontFamily="monospace" fontWeight="bold">q0</text>
        <text x="10" y={LINE_Y1 + 5} fontFamily="monospace" fontWeight="bold">q1</text>
        <text x="10" y={LINE_Y2 + 5} fontFamily="monospace" fontWeight="bold">q2</text>

        <line x1="40" y1={LINE_Y0} x2="100%" y2={LINE_Y0} stroke="#333" strokeWidth="2" />
        <line x1="40" y1={LINE_Y1} x2="100%" y2={LINE_Y1} stroke="#333" strokeWidth="2" />
        <line x1="40" y1={LINE_Y2} x2="100%" y2={LINE_Y2} stroke="#333" strokeWidth="2" />

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
          const targetY = getY(g.target);
          
          // ★ 変更：CNOTとCCX（複数ビットにまたがるゲート）の動的描画
          if (g.name === "CNOT" || g.name === "CX" || g.name === "CCX") {
             const cx = x + GATE_W / 2;
             
             // 制御ビットのY座標リストを取得（未定義なら空配列）
             const controls = g.controls || [];
             const controlYs = controls.map(getY);
             
             // 縦線を引くための「一番上のY」と「一番下のY」を計算
             const allYs = [targetY, ...controlYs];
             const minY = Math.min(...allYs);
             const maxY = Math.max(...allYs);

             return (
               <g key={g.id} onMouseEnter={() => setHoveredGate(g.name)} onMouseLeave={() => setHoveredGate(null)} style={{ cursor: "pointer", pointerEvents: "auto" }} onClick={() => removeGate(i)}>
                 
                 {/* 縦線（一番上のビットから一番下のビットまで） */}
                 <line x1={cx} y1={minY} x2={cx} y2={maxY} stroke="#333" strokeWidth="2" />
                 
                 {/* 制御ビットの黒丸（複数対応） */}
                 {controlYs.map((cy, idx) => (
                   <circle key={`ctrl-${idx}`} cx={cx} cy={cy} r="6" fill="#333" />
                 ))}

                 {/* ターゲットの⊕記号 */}
                 <circle cx={cx} cy={targetY} r="14" fill="#333" />
                 <text x={cx} y={targetY + 5} fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">+</text>
                 
                 {/* 当たり判定用の透明な四角（ゲート全体の高さをカバー） */}
                 <rect x={x} y={minY - 15} width={GATE_W} height={maxY - minY + 30} fill="transparent" />
               </g>
             );
          }

          // 通常の1量子ビットゲート
          return (
            <g key={g.id} onMouseEnter={() => setHoveredGate(g.name)} onMouseLeave={() => setHoveredGate(null)} style={{ cursor: "pointer", pointerEvents: "auto" }} onClick={() => removeGate(i)}>
              <rect
                x={x}
                y={targetY - GATE_H / 2}
                width={GATE_W}
                height={GATE_H}
                fill={i === currentStep ? "#ffe19a" : "white"}
                stroke="#333"
                strokeWidth="2"
                rx="4"
              />
              <text
                x={x + GATE_W / 2}
                y={targetY + 5}
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