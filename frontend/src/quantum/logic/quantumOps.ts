import { useQuantumStore } from "../store/quantumStore";
import { Complex } from "../../types/quantum";

// --- モジュールレベル変数 ---
let socket: WebSocket | null = null;
let pendingResolve: (() => void) | null = null;

// --- 接続管理 ---

export function initConnection() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket("ws://127.0.0.1:8000/ws/session");

  socket.onopen = () => {
    console.log("✅ WS Connected (3-Qubit Mode)");
  };

  socket.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    const { pushLog, updateFromBackend, pushHistory, nextStep } = useQuantumStore.getState();

    if (data.error) {
      pushLog("❌ Error: " + data.error);
      if (pendingResolve) { pendingResolve(); pendingResolve = null; }
      return;
    }

    // ★ Backendからは長さ8の配列が返ってくる
    const newVec = data.state_vector as Complex[];
    const newProbs = data.probabilities as number[];

    pushHistory(newVec);
    updateFromBackend(newVec, newProbs);
    nextStep();

    // ログには簡易的に確率を表示 (8状態分: 000~111)
    const pStr = newProbs.map(p => p.toFixed(2)).join(", ");
    pushLog(`→ Probs: [${pStr}]`);

    // 待機解除
    if (pendingResolve) {
      pendingResolve();
      pendingResolve = null;
    }
  };

  socket.onclose = () => {
    console.log("⚠️ WS Disconnected");
    socket = null;
  };
}

/* =========================================================
   StepForward
   ========================================================= */

// ... import等はそのまま ...
// stepForward 関数のみ修正します

export async function stepForward() {
  const { gates, currentStep, stateVector, pushLog } = useQuantumStore.getState();

  if (currentStep >= gates.length) {
    pushLog("No more gates to apply");
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    pushLog("⚠️ Reconnecting...");
    initConnection();
    await new Promise(r => setTimeout(r, 500)); 
  }

  // ★変更: gates[currentStep] はオブジェクトになりました
  const gateObj = gates[currentStep];
  const gateName = gateObj.name;
  const targetIndex = gateObj.target;
  const controls = gateObj.controls || [];

  // CNOTの場合は特例処理（今は0->1固定なのでtarget=0として送るか、バックエンドの仕様に合わせる）
  // バックエンドの仕様では CNOT(CX) は target指定に関わらず 0->1 で実装されているので
  // ここではそのまま送りますが、ログは見やすくします。
  
  if (gateName === "CNOT") {
      pushLog(`🧩 Step: CNOT (Control:0 -> Target:1)`);
  } else {
      pushLog(`🧩 Step: ${gateName} on Qubit ${targetIndex}`);
  }// ログの出し分け（CNOTやCCXのときは制御ビットも表示してかっこよくする）
  if (controls.length > 0) {
      pushLog(`🧩 Step: ${gateName} (Ctrl:[${controls.join(",")}] -> Target:${targetIndex})`);
  } else {
      pushLog(`🧩 Step: ${gateName} on Qubit ${targetIndex}`);
  }

  return new Promise<void>((resolve) => {
    pendingResolve = resolve;

    socket!.send(
      JSON.stringify({
        gate: gateName,
        target: targetIndex,
        controls: controls,
        state: stateVector,
      })
    );
  });
}

// runAll などは変更不要（stepForwardを呼んでいるだけなので）

/* =========================================================
   RunAll
   ========================================================= */

export async function runAll() {
  const { gates, currentStep, pushLog, setIsRunning } = useQuantumStore.getState();

  if (gates.length === 0) {
    pushLog("No gates to run.");
    return;
  }

  pushLog("▶️ Run All: Starting");
  setIsRunning(true);

  for (let i = currentStep; i < gates.length; i++) {
    if (!useQuantumStore.getState().isRunning) break;

    await stepForward();
    await new Promise((r) => setTimeout(r, 300));
  }

  pushLog("✅ Run All: Complete");
  setIsRunning(false);
}

// Undo / Reset
export function undoStep() {
  const { popHistory, prevStep, pushLog } = useQuantumStore.getState();
  const result = popHistory();
  if (!result) {
    pushLog("Cannot undo");
    return;
  }
  prevStep();
  pushLog("Undo: Returned to previous state");
}

export function resetState() { // 名前はわかりやすく resetState として export
  const { resetState, pushLog } = useQuantumStore.getState();
  resetState();
  pushLog("Rewind: Back to start");
}

export function clearAll() {
  const { clearCircuit, pushLog } = useQuantumStore.getState();
  clearCircuit();
  pushLog("🗑️ Circuit Cleared");
}