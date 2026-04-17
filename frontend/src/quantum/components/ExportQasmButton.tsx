// src/quantum/components/ExportQasmButton.tsx
import React, { useState } from "react";
import { useQuantumStore } from "../store/quantumStore";
import { generateQASM } from "../utils/qasmGenerater";

export default function ExportQasmButton() {
  const gates = useQuantumStore((state) => state.gates);
  const [qasmCode, setQasmCode] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const code = generateQASM(gates, 2);
    setQasmCode(code);
    setShowModal(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qasmCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後に「Copied!」を戻す
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      <button 
        onClick={handleExport}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          background: "#00913c",
          color: "white",
          fontWeight: "bold" as const, // TSの型合わせ
        }}
      >
        &#128203; Export OpenQASM
      </button>

      {/* コード表示用モーダル（簡易版） */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
        }}>
          <div style={{
            background: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "400px", border: "1px solid #444"
          }}>
            <h3 style={{ color: "white", marginTop: 0 }}>OpenQASM Code</h3>
            <textarea 
              readOnly 
              value={qasmCode} 
              style={{
                width: "100%", height: "200px", backgroundColor: "#000", color: "#00ff00",
                fontFamily: "monospace", padding: "10px", boxSizing: "border-box", borderRadius: "4px"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 16px", cursor: "pointer" }}>Close</button>
              <button onClick={handleCopy} style={{ padding: "8px 16px", backgroundColor: "#61dafb", color: "#000", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}