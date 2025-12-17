import { useQuantumStore } from "../store/quantumStore";

export default function GatePalette() {
  const addGate = useQuantumStore((s) => s.addGate);

  // バックエンドに送るID
  const gateIds = ["H", "X", "Y", "Z", "S", "Sdg", "T", "Tdg"];

  // 画面表示用のラベル変換
  const getLabel = (id: string) => {
    if (id === "Sdg") return "S†";
    if (id === "Tdg") return "T†";
    return id;
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
      {gateIds.map((g) => (
        <button
          key={g}
          onClick={() => addGate(g)}
          style={{ 
            padding: "10px 15px", 
            fontSize: "16px", 
            cursor: "pointer",
            fontFamily: "serif", // 数学記号っぽく見せるため
            minWidth: "45px"
          }}
        >
          {getLabel(g)}
        </button>
      ))}
    </div>
  );
}
