import React from "react";
import DraggableGate from "./DraggableGate";

export default function GatePalette() {
  const gateIds = ["H", "X", "Y", "Z", "S", "Sdg", "T", "Tdg", "CNOT"];

  const getLabel = (id: string) => {
    if (id === "Sdg") return "S†";
    if (id === "Tdg") return "T†";
    if (id === "CNOT") return "CX";
    return id;
  };

  return (
    <div style={{ marginBottom: "15px", padding: "10px", background: "#f9f9f9", borderRadius: "8px" }}>
      <p style={{ margin: "0 0 10px 0", fontSize: "0.9em", color: "#666" }}>
        Drag gates to the circuit wires below
      </p>
      
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {gateIds.map((g) => (
          <DraggableGate key={g} gateName={g} label={getLabel(g)} />
        ))}
      </div>
    </div>
  );
}