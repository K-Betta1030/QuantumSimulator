import React, { useEffect, useState } from "react";
// ★ DndKit のインポートを追加
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";

import { runAll, stepForward, resetState, undoStep, initConnection, clearAll } from "../quantum/logic/quantumOps";
import { useQuantumStore } from "../quantum/store/quantumStore";
import BlochSphere from "../quantum/components/BlochSphere";
import GateControls from "../quantum/components/GateControls";
import LogPanel from "../quantum/components/LogPanel";
import StatePanel from "../quantum/components/StatePanel";
import GatePalette from "../quantum/components/GatePalette";
import CircuitDiagram from "../quantum/components/CircuitDiagram";
import DraggableGate from "../quantum/components/DraggableGate";
import PresetSelector from "../quantum/components/PresetSelector";

export default function SimulatorPage() {
  const stateVector = useQuantumStore((s) => s.stateVector);
  const isRunning = useQuantumStore((s) => s.isRunning);
  // ★追加: ゲート追加用のアクション
  const addGate = useQuantumStore((s) => s.addGate);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    initConnection();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    // ドロップ先がない（枠外で離した）場合は何もしない
    if (!over) return;

    // active.data.current.gateName -> "H", "X" など
    // over.data.current.target     -> 0 または 1
    
    // dnd-kitの仕様上、dataへのアクセス方法に注意
    const gateName = active.data.current?.gateName;
    const targetQubit = over.data.current?.target;

    if (gateName && (targetQubit === 0 || targetQubit === 1)) {
      console.log(`Add ${gateName} to Qubit ${targetQubit}`);
      addGate(gateName, targetQubit);
    }
  };

  // IDからラベルを取得するヘルパー
  const getLabel = (id: string) => {
    const name = id.replace("palette-", "");
    if (name === "Sdg") return "S†";
    if (name === "Tdg") return "T†";
    if (name === "CNOT") return "CX";
    return name;
  };

  return (
    // ★ 全体を DndContext で囲む
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
        <h1>Quantum Simulator (2-Qubit)</h1>
        
        <PresetSelector />
        <GatePalette />

        <CircuitDiagram />

        <div style={{ display: "flex", gap: "20px" }}>
          <GateControls
            onRun={runAll}
            onStep={stepForward}
            onUndo={undoStep}
            onReset={resetState}
            onClear={clearAll}
            isRunning={isRunning}
          />
        </div>

        <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <BlochSphere stateVector={stateVector} />
            <p style={{textAlign:"center", fontSize:"0.9em", color:"#666"}}>
              *Visualizing Qubit 0 via Partial Trace
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <StatePanel stateVector={stateVector} />
          </div>
        </div>

        <LogPanel />
      </div>

      <DragOverlay>
        {activeId ? (
          // DraggableGateと同じ見た目のボタンを表示 (ドラッグ機能は不要なのでdivで模倣)
          <div
            style={{
              display: "flex",           // Flexboxにする
              justifyContent: "center",  // 横方向の中央揃え
              alignItems: "center",      // 縦方向の中央揃え
              width: "auto",
              padding: "10px 15px",
              fontSize: "16px",
              fontFamily: "monospace",
              fontWeight: "bold",
              minWidth: "30px",
              background: "#ffe19a", // ドラッグ中の色
              border: "2px solid #333", // 少し強調
              borderRadius: "4px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // 浮いている感じの影
              cursor: "grabbing",
              backgroundColor: activeId.includes("CNOT") ? "#b2ebf2" : "#ffe19a"
            }}
          >
            {getLabel(activeId)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}