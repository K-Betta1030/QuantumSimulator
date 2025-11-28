from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import asyncio
from typing import List

app = FastAPI()

# React開発環境からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ゲート定義
GATES = {
    "X": np.array([[0, 1], [1, 0]]),
    "Z": np.array([[1, 0], [0, -1]]),
    "H": (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]]),
}

#リクエストモデル
class CircuitRequest(BaseModel):
    gates: list[str]    #例: ["H", "Z"]

@app.post("/api/execute")
def execute_circuit(req: CircuitRequest):
    state = np.array([[1], [0]], dtype=complex) # |0> 初期状態
    for gate_name in req.gates:
        if gate_name not in GATES:
            return {"error": f"Unknown gate: {gate_name}"}
        state = np.dot(GATES[gate_name], state)

    probs = np.abs(state.flatten()) ** 2    #各状態の確立
    return {
        "state_vector": [complex(x).real for x in state.flatten()],
        "probabilities": probs.tolist(),
    }

@app.websocket("/ws/execute")
async def websocket_execute(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        gates = data.get("gates", [])
        state = np.array([[1], [0]], dtype=complex)  # |0>

        for gate_name in gates:
            if gate_name not in GATES:
                await websocket.send_json({"error": f"Unknown gate: {gate_name}"})
                return
            state = np.dot(GATES[gate_name], state)
            probs = np.abs(state.flatten()) ** 2
            # 状態をフロントへ逐次送信
            await websocket.send_json({
                "gate": gate_name,
                "state_vector": [float(x.real) for x in state.flatten()],
                "probabilities": probs.tolist(),
            })
            await asyncio.sleep(0.6)  # ステップごとに0.6秒待つ

        await websocket.send_json({"status": "complete"})
    except Exception as e:
        await websocket.send_json({"error": str(e)})

class SingleGateRequest(BaseModel):
    gate: str           # 例: "H"
    state: List[float]  # 例: [1, 0] （α, β）
    

@app.post("/api/apply_gate")
def apply_gate(req: SingleGateRequest):
    # 現在の状態ベクトル
    alpha, beta = req.state
    state = np.array([[alpha], [beta]], dtype=complex)

    # ゲート名のチェック
    if req.gate not in GATES:
        return {"error": f"Unknown gate: {req.gate}"}

    # ゲート適用
    gate_matrix = GATES[req.gate]
    new_state = np.dot(gate_matrix, state)

    # 新しい状態の取得
    alpha2 = float(new_state[0][0].real)
    beta2 = float(new_state[1][0].real)

    # 確率
    probs = np.abs(new_state.flatten()) ** 2

    return {
        "state_vector": [alpha2, beta2],
        "probabilities": probs.tolist(),
    }

@app.websocket("/ws/step")
async def websocket_step(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        gate = data.get("gate")
        state = np.array(data.get("state"), dtype=complex).reshape((2, 1))

        if gate not in GATES:
            await websocket.send_json({"error": f"Unknown gate: {gate}"})
            return

        # 1ゲートだけ適用
        state = np.dot(GATES[gate], state)
        probs = np.abs(state.flatten()) ** 2

        await websocket.send_json({
            "gate": gate,
            "state_vector": [float(x.real) for x in state.flatten()],
            "probabilities": probs.tolist(),
        })

    except Exception as e:
        await websocket.send_json({"error": str(e)})
