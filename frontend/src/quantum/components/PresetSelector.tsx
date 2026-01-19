import React from "react";
import { useQuantumStore } from "../store/quantumStore";
import { CircuitGate } from "../../types/quantum";
import { v4 as uuidv4 } from 'uuid';

// uuidがない場合の簡易ID生成 (Storeと同じもの)
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PresetSelector() {
  const setGates = useQuantumStore((s) => s.setGates);
  const reset = useQuantumStore((s) => s.reset);
  const pushLog = useQuantumStore((s) => s.pushLog);

  // --- プリセット定義 ---
  
  const loadBellState = () => {
    const gates: CircuitGate[] = [
      { id: generateId(), name: "H", target: 0 },
      { id: generateId(), name: "CNOT", target: 0 }, // Targetは便宜上0 (UI表示用)
    ];
    applyPreset("Bell State", gates);
  };

  const loadSwap = () => {
    // SWAP = CNOT(0,1) -> CNOT(1,0) -> CNOT(0,1)
    // ただし今のシミュレータは CNOT(0->1) 固定なので、
    // 上下逆のCNOTを実現するには H-CNOT-H の恒等式を使う必要がありますが、
    // ここでは簡易的に「CNOTを3回かけるとSWAPっぽくなる」という挙動（厳密には逆CNOTが必要）
    // を再現するのは難しいので、
    // 「Superdense Coding (11送信)」をプリセットにします。
    
    // Superdense Coding (Send '11')
    const gates: CircuitGate[] = [
      // 1. 準備 (Bell Pair)
      { id: generateId(), name: "H", target: 0 },
      { id: generateId(), name: "CNOT", target: 0 },
      // 2. エンコード (11を送るため Z -> X)
      { id: generateId(), name: "Z", target: 0 },
      { id: generateId(), name: "X", target: 0 },
      // 3. デコード
      { id: generateId(), name: "CNOT", target: 0 },
      { id: generateId(), name: "H", target: 0 },
    ];
    applyPreset("Superdense Coding (11)", gates);
  };

  const loadGrover = () => {
    // Grover's Algorithm for target |11>
    // 1. 全状態重ね合わせ
    const gates: CircuitGate[] = [
      { id: generateId(), name: "H", target: 0 },
      { id: generateId(), name: "H", target: 1 },
      
      // 2. Oracle (Mark |11>) -> Controlled-Z needs to be built?
      // ここでは簡易的に H -> CNOT -> H で CZ を作ります
      { id: generateId(), name: "H", target: 1 },
      { id: generateId(), name: "CNOT", target: 0 },
      { id: generateId(), name: "H", target: 1 },

      // 3. Amplitude Amplification (Diffuser)
      { id: generateId(), name: "H", target: 0 },
      { id: generateId(), name: "H", target: 1 },
      { id: generateId(), name: "Z", target: 0 },
      { id: generateId(), name: "Z", target: 1 },
      { id: generateId(), name: "H", target: 1 },
      { id: generateId(), name: "CNOT", target: 0 },
      { id: generateId(), name: "H", target: 1 },
      { id: generateId(), name: "H", target: 0 },
      { id: generateId(), name: "H", target: 1 },
    ];
    applyPreset("Grover Search (|11>)", gates);
  };

  // --- 共通処理 ---
  const applyPreset = (name: string, gates: CircuitGate[]) => {
    reset(); // まずリセット
    // 少し待ってからゲートセット (Reactの状態更新タイミング調整)
    setTimeout(() => {
        setGates(gates);
        pushLog(`📂 Loaded Preset: ${name}`);
    }, 50);
  };

  const btnStyle = {
    padding: "8px 12px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginRight: "10px"
  };

  return (
    <div style={{ marginBottom: "20px", padding: "10px", background: "#eef", borderRadius: "8px" }}>
      <span style={{ fontWeight: "bold", marginRight: "10px", color: "#555" }}>Presets:</span>
      <button onClick={loadBellState} style={btnStyle}>Bell State</button>
      <button onClick={loadSwap} style={btnStyle}>Superdense (11)</button>
      <button onClick={loadGrover} style={btnStyle}>Grover (|11&gt;)</button>
    </div>
  );
}