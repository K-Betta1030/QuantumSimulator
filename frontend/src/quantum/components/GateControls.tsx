import React from "react";

interface Props {
  onRun: () => void;
  onStep: () => void;
  onUndo: () => void;
  onReset: () => void;  // これは "State Reset" に使います
  onClear: () => void;  // ★追加: "Clear Circuit"
  isRunning: boolean;
}

export default function GateControls({ onRun, onStep, onUndo, onReset, onClear, isRunning }: Props) {
  const btnStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    background: "#007bff",
    color: "white",
    fontWeight: "bold" as const, // TSの型合わせ
  };

  const secondaryBtn = {
    ...btnStyle,
    background: "#6c757d",
  };
  
  const dangerBtn = {
    ...btnStyle,
    background: "#dc3545", // 赤色
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
      <button onClick={onRun} disabled={isRunning} style={{ ...btnStyle, opacity: isRunning ? 0.5 : 1 }}>
        {isRunning ? "Running..." : "▶ Run All"}
      </button>

      <button onClick={onStep} disabled={isRunning} style={secondaryBtn}>
        Step ➔
      </button>

      <button onClick={onUndo} disabled={isRunning} style={secondaryBtn}>
        ⎌ Undo
      </button>

      <div style={{ width: "10px" }} /> {/* スペーサー */}

      <button onClick={onReset} disabled={isRunning} style={secondaryBtn}>
        ⏮ Rewind
      </button>

      <button onClick={onClear} disabled={isRunning} style={dangerBtn}>
        🗑 Clear
      </button>
    </div>
  );
}