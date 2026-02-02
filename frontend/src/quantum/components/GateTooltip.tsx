import React from "react";
import { useQuantumStore } from "../store/quantumStore";
import { GATE_INFO } from "../data/gateInfo";

export default function GateTooltip() {
  const hoveredGate = useQuantumStore((s) => s.hoveredGate);

  if (!hoveredGate) return null;

  const key = hoveredGate.replace("palette-", "").replace("wire-", "");
  const info = GATE_INFO[key];

  if (!info) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "300px",
      minHeight: "350px",
      background: "rgba(30, 30, 30, 0.95)",
      color: "white",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      zIndex: 1000,
      backdropFilter: "blur(10px)",
      border: "1px solid #555",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      animation: "slideIn 0.2s ease-out",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* 上部: タイトルと説明 */}
      <div>
        <h3 style={{ 
          margin: "0 0 15px 0", 
          color: "#61dafb", 
          fontSize: "1.4em", 
          borderBottom: "1px solid #555",
          paddingBottom: "10px"
        }}>
          {info.name}
        </h3>
        
        <p style={{ 
          fontSize: "0.95em", 
          lineHeight: "1.6", 
          margin: "0 0 20px 0", 
          color: "#ddd" 
        }}>
          {info.description}
        </p>
      </div>

      {/* 下部: 行列表示 */}
      <div style={{ 
        background: "rgba(0,0,0,0.6)", 
        padding: "20px", 
        borderRadius: "8px", 
        textAlign: "center",
        border: "1px solid #444",
        marginTop: "auto"
      }}>
        <div style={{ 
          fontSize: "0.85em", 
          color: "#aaa", 
          marginBottom: "10px", 
          textTransform: "uppercase", 
          letterSpacing: "1px"
        }}>
          Matrix
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: "1.3em" }}>
          {info.multiplier && <span style={{ marginRight: "12px", color: "#88c0d0" }}>{info.multiplier}</span>}
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${info.matrix.length}, 1fr)`,
            gap: "10px 20px",
            borderLeft: "2px solid white",
            borderRight: "2px solid white",
            padding: "0 10px",
            borderRadius: "6px"
          }}>
            {info.matrix.flat().map((val, i) => (
              <div key={i}>{val}</div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}