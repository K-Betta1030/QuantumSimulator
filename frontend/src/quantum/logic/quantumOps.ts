import { useQuantumStore } from "../store/quantumStore";

/* =========================================================
   StepForward：1ゲート専用 WebSocket /ws/step を使用
   ========================================================= */

export async function stepForward() {
  const {
    gates,
    currentStep,
    stateVector,
    pushHistory,
    nextStep,
    pushLog,
    setStateVector,
  } = useQuantumStore.getState();

  if (currentStep >= gates.length) {
    pushLog("No more gates to apply");
    return;
  }

  const gate = gates[currentStep];
  pushLog(`🧩 Step: Applying gate ${gate}`);

  return new Promise<void>((resolve) => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/step");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          gate,
          state: stateVector, // 重要：現在の状態を送る
        })
      );
    };

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.error) {
        pushLog("❌ Step error: " + data.error);
        ws.close();
        return resolve();
      }

      const newVec: [number, number] = [
        data.state_vector[0],
        data.state_vector[1],
      ];

      pushHistory(newVec);
      setStateVector(newVec);
      nextStep();

      const p0 = data.probabilities[0].toFixed(3);
      const p1 = data.probabilities[1].toFixed(3);
      pushLog(`→ |0⟩=${p0}, |1⟩=${p1}`);

      ws.close();
      resolve();
    };

    ws.onerror = () => {
      pushLog("⚠️ Step WebSocket error");
      ws.close();
      resolve();
    };
  });
}

/* =========================================================
   RunAll：StepForward を順次呼び出すだけのループ
   ========================================================= */

export async function runAll() {
  const {
    gates,
    currentStep,
    pushLog,
    setIsRunning,
  } = useQuantumStore.getState();

  if (gates.length === 0) {
    pushLog("No gates to run.");
    return;
  }

  pushLog("▶️ Run All: Starting");

  setIsRunning(true);

  for (let i = currentStep; i < gates.length; i++) {
    await stepForward();
    // BlochSphere のアニメーションに合わせる（あなたの環境だと400ms前後）
    await new Promise((r) => setTimeout(r, 400));
  }

  pushLog("✅ Run All: Complete");
  setIsRunning(false);
}

/* =========================================================
   Undo / Reset はそのままでOK
   ========================================================= */

export function undoStep() {
  const { popHistory, prevStep, pushLog } = useQuantumStore.getState();

  const result = popHistory();
  if (!result) {
    pushLog("Cannot undo (already at initial state)");
    return;
  }
  prevStep();
  pushLog("Undo: Returned to previous state");
}

export function resetCircuit() {
  const { reset, pushLog } = useQuantumStore.getState();
  reset();
  pushLog("Reset simulator to |0⟩");
}
