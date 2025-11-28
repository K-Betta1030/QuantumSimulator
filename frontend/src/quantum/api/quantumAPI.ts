export async function applySingleGate(gate: string, state: [number, number]) {
  const res = await fetch("http://127.0.0.1:8000/api/apply_gate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gate, state }),
  });
  return await res.json();
}

export async function executeCircuit(gates: string[]) {
  const res = await fetch("http://127.0.0.1:8000/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gates }),
  });
  return await res.json();
}
