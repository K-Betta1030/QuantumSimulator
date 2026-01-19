import React from "react";
import { Complex } from "../../types/quantum";

interface Props {
  stateVector: Complex[];
}

export default function StatePanel({ stateVector }: Props) {
  const labels = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];

  return (
    <div style={{ 
      background: "white", 
      padding: "20px", 
      borderRadius: "12px", 
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      fontFamily: "sans-serif",
      minWidth: "300px",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px", color: "#444" }}>
        Probability & Phase
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
        {stateVector.map((amp, i) => {
          // 確率計算
          const prob = amp.re ** 2 + amp.im ** 2;
          const probPercent = Math.round(prob * 100);
          
          // 位相計算 (-180度 〜 180度)
          const phase = Math.atan2(amp.im, amp.re);
          const degrees = (phase * 180) / Math.PI;
          
          // 位相を色相(0-360)に変換して色を決める
          // 0度=赤, 120度=緑, 240度=青... のようなカラーホイール
          const hue = degrees < 0 ? degrees + 360 : degrees;
          const color = prob > 0.01 ? `hsl(${hue}, 80%, 45%)` : "#e0e0e0";

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              
              {/* 1. ラベル */}
              <div style={{ 
                width: "40px", 
                fontWeight: "bold", 
                fontSize: "1.1em", 
                color: "#333",
                fontFamily: "monospace"
              }}>
                {labels[i]}
              </div>

              {/* 2. 確率バー */}
              <div style={{ flex: 1, background: "#f5f5f5", height: "28px", borderRadius: "6px", position: "relative", overflow: "hidden" }}>
                <div style={{ 
                  width: `${probPercent}%`, 
                  height: "100%", 
                  background: color, // ★ここがポイント：位相色
                  transition: "width 0.3s ease, background 0.3s ease",
                  borderRadius: "6px 0 0 6px",
                  // グラデーションや光沢を入れるとさらに綺麗に見えます
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.2), rgba(0,0,0,0.1))"
                }} />
                
                {/* 確率の数値 */}
                <span style={{ 
                  position: "absolute", 
                  right: "8px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  fontSize: "0.85em", 
                  color: probPercent > 50 ? "white" : "#888",
                  fontWeight: "bold",
                  textShadow: probPercent > 50 ? "0 1px 2px rgba(0,0,0,0.3)" : "none"
                }}>
                  {probPercent}%
                </span>
              </div>

              {/* 3. 位相メーター (色付き) */}
              <div style={{ width: "32px", height: "32px", flexShrink: 0 }}>
                 <svg width="32" height="32" viewBox="0 0 32 32">
                   {/* 外枠 */}
                   <circle cx="16" cy="16" r="14" fill="white" stroke="#eee" strokeWidth="2" />
                   
                   {prob > 0.01 && (
                     <>
                       {/* 扇形で位相の範囲を示す等の演出も可能ですが、シンプルに針と色で */}
                       <circle cx="16" cy="16" r="10" fill={color} opacity={0.2} />
                       <line 
                         x1="16" y1="16" 
                         x2="16" y2="4" 
                         stroke={color} 
                         strokeWidth="2.5" 
                         strokeLinecap="round"
                         transform={`rotate(${degrees}, 16, 16)`} 
                       />
                       <circle cx="16" cy="16" r="2.5" fill={color} />
                     </>
                   )}
                 </svg>
                 <div style={{ fontSize: "0.6em", textAlign: "center", color: "#999", marginTop: "-2px" }}>
                    {prob > 0.01 ? `${Math.round(degrees)}°` : ""}
                 </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}