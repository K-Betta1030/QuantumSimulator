// src/pages/SimulatorPage.tsx
// (import等は変更なし、returnの中身のみ変更します)
import React, { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { runAll, stepForward, resetState, undoStep, initConnection, clearAll } from "../quantum/logic/quantumOps";
import { useQuantumStore } from "../quantum/store/quantumStore";
import BlochSphere from "../quantum/components/BlochSphere";
import GateControls from "../quantum/components/GateControls";
import StatePanel from "../quantum/components/StatePanel";
import GatePalette from "../quantum/components/GatePalette";
import CircuitDiagram from "../quantum/components/CircuitDiagram";
import PresetSelector from "../quantum/components/PresetSelector";

export default function SimulatorPage() {
  const stateVector = useQuantumStore((s) => s.stateVector);
  const isRunning = useQuantumStore((s) => s.isRunning);
  const addGate = useQuantumStore((s) => s.addGate);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => { initConnection(); }, []);

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const gateName = active.data.current?.gateName;
    const targetQubit = over.data.current?.target;
    if (gateName && (targetQubit === 0 || targetQubit === 1)) {
      addGate(gateName, targetQubit);
    }
  };

  const getLabel = (id: string) => {
    const name = id.replace("palette-", "");
    if (name === "Sdg") return "S†";
    if (name === "Tdg") return "T†";
    if (name === "CNOT") return "CX";
    return name;
  };

  // --- スタイル定義 ---
  const pageStyle = {
    background: "#f4f7f6", // 全体の背景色（薄いグレー）
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: "#333"
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const headerStyle = {
    marginBottom: "20px",
    textAlign: "center" as const
  };

  // カード風のコンテナスタイル
  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    padding: "20px",
    marginBottom: "20px"
  };

  const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: "15px",
    fontSize: "1.1em",
    color: "#555",
    borderBottom: "2px solid #eee",
    paddingBottom: "8px"
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div style={pageStyle}>
        <div style={containerStyle}>
          
          {/* 1. Header */}
          <header style={headerStyle}>
            <h1 style={{ margin: 0, color: "#2c3e50" }}>Quantum Simulator</h1>
            <p style={{ margin: "5px 0 0", color: "#7f8c8d" }}>Interactive 2-Qubit Circuit Composer</p>
          </header>

          {/* 2. Control Panel (Presets & Palette) */}
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>Tools</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <PresetSelector />
              <GatePalette />
            </div>
          </div>

          {/* 3. Circuit Editor */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{...sectionTitleStyle, borderBottom: "none", marginBottom: 0}}>Circuit Diagram</h3>
              {/* Controlsを回路の右上に配置してアクセスしやすくする */}
              <GateControls
                onRun={runAll}
                onStep={stepForward}
                onUndo={undoStep}
                onReset={resetState}
                onClear={clearAll}
                isRunning={isRunning}
              />
            </div>
            <div style={{ overflowX: "auto" }}>
              <CircuitDiagram />
            </div>
          </div>

          {/* 4. Analysis (Bloch & Probabilities) */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            
            {/* 左: ブロッホ球 */}
            <div style={{ ...cardStyle, flex: 1, minWidth: "300px", marginBottom: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{...sectionTitleStyle, width: "100%"}}>Bloch Sphere (Qubit 0)</h3>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BlochSphere stateVector={stateVector} />
              </div>
              <p style={{ fontSize: "0.85em", color: "#999", marginTop: "10px" }}>
                *Reduced density matrix representation
              </p>
            </div>

            {/* 右: 確率グラフ (StatePanel) */}
            <div style={{ flex: 1, minWidth: "300px" }}>
              {/* StatePanel自体がカードスタイルを持っているので、そのまま配置 */}
              <StatePanel stateVector={stateVector} />
            </div>
          </div>

        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "auto",
              padding: "10px 15px",
              fontSize: "16px",
              fontFamily: "monospace",
              fontWeight: "bold",
              minWidth: "45px",
              background: "#ffe19a",
              border: "2px solid #333",
              borderRadius: "4px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
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