import React from "react";
import { Complex } from "../../types/quantum";

interface Props {
  stateVector: [Complex, Complex];
}

export default function StatePanel({ stateVector }: Props) {
  const [alpha, beta] = stateVector;

  // 確率
  const p0 = (alpha.re ** 2 + alpha.im ** 2).toFixed(3);
  const p1 = (beta.re ** 2 + beta.im ** 2).toFixed(3);

  const fmt = (c: Complex) => {
    const re = c.re.toFixed(3);
    const im = c.im >= 0 ? `+${c.im.toFixed(3)}` : c.im.toFixed(3)
    return `${re}${im}i`
  }

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
        |ψ⟩ = ({fmt(alpha)})|0⟩ + <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;({fmt(beta)})|1⟩
      </div>

      <div>
        <b>Amplitude</b><br />
        α = {fmt(alpha)}<br />
        β = {fmt(beta)}
      </div>

      <div style={{ marginTop: "10px" }}>
        <b>Probability</b><br />
        P(0) = {p0}<br />
        P(1) = {p1}
      </div>
    </div>
  );
}
