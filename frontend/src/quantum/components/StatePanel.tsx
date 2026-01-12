import React from "react";
import { Complex } from "../../types/quantum";

interface Props {
  stateVector: Complex[]; // 配列に変更
}

export default function StatePanel({ stateVector }: Props) {
  // 表示用フォーマッタ
  const fmt = (c: Complex) => {
    const re = c.re.toFixed(3);
    const im = c.im >= 0 ? `+${c.im.toFixed(3)}` : c.im.toFixed(3);
    return `${re}${im}i`;
  };

  // ラベル定義 (2量子ビット用)
  const labels = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];

  return (
    <div
      style={{
        background: "#f3f3f3",
        padding: "20px",
        borderRadius: "10px",
        fontFamily: "monospace",
        textAlign: "left",
        minWidth: "250px"
      }}
    >
      <h3>State Vector (Amplitude)</h3>
      
      {stateVector.map((amp, i) => {
        // 確率 |c|^2
        const prob = (amp.re ** 2 + amp.im ** 2).toFixed(3);
        
        return (
          <div key={i} style={{ marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>
            <span style={{ fontWeight: "bold", color: "#333" }}>{labels[i] || `|${i}⟩`}</span>
            <div style={{ marginLeft: "10px", fontSize: "0.9em" }}>
              Val: {fmt(amp)} <br/>
              Prob: {prob}
            </div>
          </div>
        );
      })}
    </div>
  );
}