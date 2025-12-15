import { useQuantumStore } from "../store/quantumStore";

export default function GatePalette() {
  const addGate = useQuantumStore((s) => s.addGate);

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
      {["H", "X", "Y", "Z", "S", "T"].map((g) => (
        <button
          key={g}
          onClick={() => addGate(g)}
          style={{ padding: "10px 15px", fontSize: "16px", cursor: "pointer" }}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
