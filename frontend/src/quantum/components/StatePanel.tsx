import React from "react";
import { Complex } from "../../types/quantum";

interface Props {
  stateVector: Complex[];
}

export default function StatePanel({ stateVector }: Props) {
  const labels = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];

  // 複素数表示フォーマッタ
  const fmt = (c: Complex) => {
    const re = c.re.toFixed(2);
    const im = c.im >= 0 ? `+${c.im.toFixed(2)}` : c.im.toFixed(2);
    return `${re}${im}i`;
  };

  return (
    <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px", fontFamily: "monospace", minWidth: "250px" }}>
      <h3>State Vector</h3>
      
      {stateVector.map((amp, i) => {
        // 確率 |c|^2
        const prob = amp.re ** 2 + amp.im ** 2;
        // 位相角 (ラジアン) -> 度数
        const phase = Math.atan2(amp.im, amp.re);
        const degrees = (phase * 180) / Math.PI;

        return (
          <div key={i} style={{ marginBottom: "12px", borderBottom: "1px solid #ddd", paddingBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            
            {/* 左側: ラベルと数値 */}
            <div>
              <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#333" }}>{labels[i]}</span>
              <div style={{ fontSize: "0.85em", color: "#555", marginTop: "4px" }}>
                {fmt(amp)} <br/>
                Prob: {(prob * 100).toFixed(1)}%
              </div>
            </div>

            {/* 右側: 位相メーター (SVG) */}
            <div style={{ textAlign: "center" }}>
               {/* 確率バー */}
               <div style={{ width: "40px", height: "4px", background: "#ddd", marginBottom: "5px" }}>
                 <div style={{ width: `${prob * 100}%`, height: "100%", background: "#4caf50" }} />
               </div>

               {/* 位相時計: 円と針 */}
               <svg width="30" height="30" viewBox="0 0 32 32">
                 <circle cx="16" cy="16" r="14" fill="#fff" stroke="#999" strokeWidth="2" />
                 {/* 針: 位相に合わせて回転 (-90度して12時を開始位置にする) */}
                 <line 
                   x1="16" y1="16" 
                   x2="16" y2="2" 
                   stroke="#f44336" 
                   strokeWidth="2" 
                   transform={`rotate(${degrees}, 16, 16)`} 
                 />
                 {/* 中心点 */}
                 <circle cx="16" cy="16" r="2" fill="#f44336" />
               </svg>
               <div style={{ fontSize: "0.7em", color: "#999" }}>{Math.round(degrees)}°</div>
            </div>

          </div>
        );
      })}
    </div>
  );
}