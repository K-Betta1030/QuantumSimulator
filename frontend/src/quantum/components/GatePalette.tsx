import { useState } from "react";
import { useQuantumStore } from "../store/quantumStore";

export default function GatePalette() {
  const addGate = useQuantumStore((s) => s.addGate);
  
  // ★追加: 現在選択中のターゲットQubit (0 or 1)
  const [selectedTarget, setSelectedTarget] = useState<number>(0);

  const gateIds = ["H", "X", "Y", "Z", "S", "Sdg", "T", "Tdg", "CNOT"];

  const getLabel = (id: string) => {
    if (id === "Sdg") return "S†";
    if (id === "Tdg") return "T†";
    if (id === "CNOT") return "CX";
    return id;
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      {/* ターゲット切り替えスイッチ */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>Target Qubit:</span>
        <label>
          <input 
            type="radio" 
            name="target" 
            checked={selectedTarget === 0} 
            onChange={() => setSelectedTarget(0)} 
          /> 
          Qubit 0 (Upper)
        </label>
        <label>
          <input 
            type="radio" 
            name="target" 
            checked={selectedTarget === 1} 
            onChange={() => setSelectedTarget(1)} 
          /> 
          Qubit 1 (Lower)
        </label>
      </div>

      {/* ゲートボタン群 */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {gateIds.map((g) => (
          <button
            key={g}
            // ★変更: 選択中のターゲットを指定して追加
            onClick={() => addGate(g, selectedTarget)}
            style={{ 
              padding: "10px 15px", 
              fontSize: "16px", 
              cursor: "pointer",
              fontFamily: "monospace",
              fontWeight: "bold",
              minWidth: "45px",
              // CNOTだけはターゲット関係ないので（仕様上固定）、少し色を変えるなどしても良い
              background: g === "CNOT" ? "#e0f7fa" : undefined 
            }}
          >
            {getLabel(g)}
          </button>
        ))}
      </div>
    </div>
  );
}