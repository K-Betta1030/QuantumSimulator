import { useEffect } from "react";
import { runAll, stepForward, resetCircuit, undoStep, initConnection } from "../quantum/logic/quantumOps";
import { useQuantumStore } from "../quantum/store/quantumStore";
import BlochSphere from "../quantum/components/BlochSphere";
import GateControls from "../quantum/components/GateControls";
import LogPanel from "../quantum/components/LogPanel";
import StatePanel from "../quantum/components/StatePanel";
import GatePalette from "../quantum/components/GatePalette";
import GateSequence from "../quantum/components/GateSequence";

export default function SimulatorPage() {
  const stateVector = useQuantumStore((s) => s.stateVector);
  const isRunning = useQuantumStore((s) => s.isRunning);
  const gates = useQuantumStore((s) => s.gates);

  useEffect(() => {
    initConnection();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Quantum Simulator</h1>
      
      <GatePalette />

      <div style={{ display: "flex", gap: "20px" }}>
        <GateControls
          onRun={runAll}
          onStep={stepForward}
          onUndo={undoStep}
          onReset={resetCircuit}
          isRunning={isRunning}
        />

        <GateSequence gates={gates} />
      </div>

      <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <BlochSphere stateVector={stateVector} />
        </div>

        <div style={{ flex: 1 }}>
          <StatePanel stateVector={stateVector} />
        </div>
      </div>

      <LogPanel />
    </div>
  );
}

