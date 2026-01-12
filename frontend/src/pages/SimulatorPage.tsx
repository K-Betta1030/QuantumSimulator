// src/pages/SimulatorPage.tsx
import { useEffect } from "react";
import { runAll, stepForward, resetCircuit, undoStep, initConnection } from "../quantum/logic/quantumOps";
import { useQuantumStore } from "../quantum/store/quantumStore";
import BlochSphere from "../quantum/components/BlochSphere";
import GateControls from "../quantum/components/GateControls";
import LogPanel from "../quantum/components/LogPanel";
import StatePanel from "../quantum/components/StatePanel";
import GatePalette from "../quantum/components/GatePalette";
import CircuitDiagram from "../quantum/components/CircuitDiagram"; // ★追加

export default function SimulatorPage() {
  const stateVector = useQuantumStore((s) => s.stateVector);
  const isRunning = useQuantumStore((s) => s.isRunning);
  // gates は CircuitDiagram 内で取得するのでここでは不要になりました

  useEffect(() => {
    initConnection();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Quantum Simulator (2-Qubit)</h1>
      
      <GatePalette />

      {/* ★差し替え: GateSequence を消して CircuitDiagram を配置 */}
      <CircuitDiagram />

      <div style={{ display: "flex", gap: "20px" }}>
        <GateControls
          onRun={runAll}
          onStep={stepForward}
          onUndo={undoStep}
          onReset={resetCircuit}
          isRunning={isRunning}
        />
      </div>

      <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
        {/* ブロッホ球とパネル */}
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
  );
}