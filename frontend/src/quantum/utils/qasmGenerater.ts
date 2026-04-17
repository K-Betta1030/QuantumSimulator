// src/quantum/utils/qasmGenerator.ts
import { CircuitGate } from "../../types/quantum";

export const generateQASM = (gates: CircuitGate[], numQubits: number = 2): string => {
  let qasm = `OPENQASM 2.0;\n`;
  qasm += `include "qelib1.inc";\n\n`;
  qasm += `qreg q[${numQubits}];\n`;
  qasm += `creg c[${numQubits}];\n\n`;

  gates.forEach((gate) => {
    const gateName = gate.name.toLowerCase();
    const targetQubit = gate.target; // wire から target に修正

    if (gateName === "cnot" || gateName === "cx") {
      // 現在の2量子ビット仕様に合わせ、targetの反対側を制御ビットとして扱う
      const control = targetQubit === 0 ? 1 : 0; 
      qasm += `cx q[${control}], q[${targetQubit}];\n`;
    } 
    else if (gateName === "sdg") {
      qasm += `sdg q[${targetQubit}];\n`;
    }
    else if (gateName === "tdg") {
      qasm += `tdg q[${targetQubit}];\n`;
    }
    else {
      // H, X, Y, Z, S, T など一般的な1量子ビットゲート
      qasm += `${gateName} q[${targetQubit}];\n`;
    }
  });

  // 実機で実行するために、最後に測定（Measurement）を追加
  qasm += `\n// Measurement\n`;
  for (let i = 0; i < numQubits; i++) {
    qasm += `measure q[${i}] -> c[${i}];\n`;
  }

  return qasm;
};