import React from "react";

interface Props {
  stateVector: [number, number];  // [a, b]
}

export default function StatePanel({ stateVector }: Props) {
  const [a, b] = stateVector;

  // 確率
  const p0 = (a * a).toFixed(3);
  const p1 = (b * b).toFixed(3);

  // Bloch sphere angles（θ, φ）
  // a = cos(θ/2)
  // b = e^{iφ} sin(θ/2)
  const theta = 2 * Math.acos(a);  // θ
  const phi = 0; // 今は実数のため φ = 0

  const deg = (rad: number) => (rad * 180 / Math.PI).toFixed(1);

  return (
    <div
      style={{
        background: "#f3f3f3",
        padding: "20px",
        borderRadius: "10px",
        fontFamily: "monospace",
        textAlign: "left",
      }}
    >
      <h3>State</h3>

      <div style={{ marginBottom: "10px" }}>
        |ψ⟩ = {a.toFixed(3)}|0⟩ + {b.toFixed(3)}|1⟩
      </div>

      <div>
        <b>Amplitude</b><br />
        a = {a.toFixed(3)}<br />
        b = {b.toFixed(3)}
      </div>

      <div style={{ marginTop: "10px" }}>
        <b>Probability</b><br />
        P(0) = {p0}<br />
        P(1) = {p1}
      </div>

      <div style={{ marginTop: "10px" }}>
        <b>Bloch Sphere</b><br />
        θ = {deg(theta)}°<br />
        φ = {deg(phi)}°
      </div>
    </div>
  );
}
