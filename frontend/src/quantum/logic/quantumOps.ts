import { useQuantumStore } from "../store/quantumStore";
import { Complex } from "../../types/quantum";

// --- モジュールレベル変数 (シングルトン) ---
let socket: WebSocket | null = null;
let pendingResolve: (() => void) | null = null; // 返信待ちのPromiseを解決する関数

// --- 接続管理 ---

export function initConnection() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  // 新しいエンドポイント /ws/session に接続
  socket = new WebSocket("ws://127.0.0.1:8000/ws/session");

  socket.onopen = () => {
    console.log("✅ WS Connected");
  };

  socket.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    const { pushLog, updateFromBackend, pushHistory, nextStep } = useQuantumStore.getState();

    if (data.error) {
      pushLog("❌ Error: " + data.error);
      if (pendingResolve) { pendingResolve(); pendingResolve = null; }
      return;
    }

    // データの更新
    const newVec = data.state_vector as [Complex, Complex];
    const newProbs = data.probabilities as [number, number];

    pushHistory(newVec);
    updateFromBackend(newVec, newProbs);
    nextStep();

    const p0 = newProbs[0].toFixed(3);
    const p1 = newProbs[1].toFixed(3);
    pushLog(`→ |0⟩=${p0}, |1⟩=${p1}`);

    // 待機していた stepForward の Promise を解決して、次の処理へ進ませる
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
   StepForward：常時接続ソケットを使用
   ========================================================= */

export async function stepForward() {
  const { gates, currentStep, stateVector, pushLog } = useQuantumStore.getState();

  if (currentStep >= gates.length) {
    pushLog("No more gates to apply");
    return;
  }

  // ソケットが準備できていなければ再接続
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    pushLog("⚠️ Reconnecting...");
    initConnection();
    // 接続待ちの簡易ウェイト
    await new Promise(r => setTimeout(r, 500)); 
  }

  const gate = gates[currentStep];
  pushLog(`🧩 Step: Applying gate ${gate}`);

  // Promiseを生成し、resolve関数を外(pendingResolve)に出す
  // これにより、onmessage が来るまでこの関数は await で止まる
  return new Promise<void>((resolve) => {
    pendingResolve = resolve;

    // 送信
    socket!.send(
      JSON.stringify({
        gate,
        state: stateVector,
      })
    );
  });
}

/* =========================================================
   RunAll：変更なし (stepForwardがPromiseを返すのでそのまま動く)
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
    // 実行中フラグが折られたら中断 (Resetボタンなどが押された場合)
    if (!useQuantumStore.getState().isRunning) break;

    await stepForward();
    // アニメーション用ウェイト (通信が速くなったので、これがないと一瞬で終わる！)
    await new Promise((r) => setTimeout(r, 300));
  }

  pushLog("✅ Run All: Complete");
  setIsRunning(false);
}

// Undo / Reset は変更なし
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

export function resetCircuit() {
  const { reset, pushLog } = useQuantumStore.getState();
  reset();
  pushLog("Reset simulator to |0⟩");
}