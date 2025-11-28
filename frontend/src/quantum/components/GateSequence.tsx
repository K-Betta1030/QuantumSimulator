import { useQuantumStore } from "../store/quantumStore";

export default function GateSequence({ gates }: { gates: string[] }) {
  const removeGate = useQuantumStore((s) => s.removeGate);
  const currentStep = useQuantumStore((s) => s.currentStep);

  return (
    <div style={{ padding: "10px 0" }}>
      {/* --- ワイヤーライン --- */}
      <div
        style={{
          height: "4px",
          background: "#333",
          marginTop: "35px",
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "25px",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {gates.map((g, i) => {
          const isActive = i === currentStep;

          return (
            <div
              key={i}
              style={{
                width: "50px",
                height: "50px",
                border: "2px solid #444",
                borderRadius: "6px",
                background: isActive ? "#ffe19a" : "white",
                boxShadow: isActive
                  ? "0 0 12px rgba(255,165,0,0.9)"
                  : "0 2px 5px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
                cursor: "pointer",
                position: "relative",
                transition: "0.2s ease",
              }}
            >
              {g}

              {/* 削除ボタン */}
              <button
                onClick={() => removeGate(i)}
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  background: "#e74c3c",
                  border: "none",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
