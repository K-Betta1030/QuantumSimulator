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
    "X": np.array([[0, 1], [1, 0]], dtype=complex),
    "Z": np.array([[1, 0], [0, -1]], dtype=complex),
    "H": (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex),
    "Y": np.array([[0, -1j],[1j, 0]], dtype=complex),
    "S": np.array([[1, 0], [0, 1j]], dtype=complex),
    "T": np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=complex),
    # -1j は -i を意味する
    "Sdg": np.array([[1, 0], [0, -1j]], dtype=complex),
    
    # exp(-i * pi/4)
    "Tdg": np.array([[1, 0], [0, np.exp(-1j * np.pi / 4)]], dtype=complex),
}

# 複素数を辞書型に変換するヘルパー
def to_c_dict(c: complex):
    return {"re": float(c.real), "im": float(c.imag)}

# --- Pydantic モデル ---

class ComplexNum(BaseModel):
    re: float
    im: float

class CircuitRequest(BaseModel):
    gates: list[str]

class SingleGateRequest(BaseModel):
    gate: str
    state: List[ComplexNum]  # [ {re, im}, {re, im} ]

@app.post("/api/execute")
def execute_circuit(req: CircuitRequest):
    # 初期状態 |0> = [1+0j, 0+0j]
    state = np.array([[1+0j], [0+0j]], dtype=complex)

    for gate_name in req.gates:
        if gate_name not in GATES:
            return {"error": f"Unknown gate: {gate_name}"}
        state = np.dot(GATES[gate_name], state)

    probs = np.abs(state.flatten()) ** 2    #各状態の確立
    return {
        "state_vector": [to_c_dict(x) for x in state.flatten()],
        "probabilities": probs.tolist(),
    }

@app.websocket("/ws/execute")
async def websocket_execute(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        gates = data.get("gates", [])
        state = np.array([[1], [0]], dtype=complex)

        for gate_name in gates:
            if gate_name not in GATES:
                await websocket.send_json({"error": f"Unknown gate: {gate_name}"})
                return
            
            state = np.dot(GATES[gate_name], state)
            probs = np.abs(state.flatten()) ** 2

            # 状態をフロントへ逐次送信
            await websocket.send_json({
                "gate": gate_name,
                "state_vector": [to_c_dict(x) for x in state.flatten()],
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
    try:
        alpha = complex(req.state[0].re, req.state[0].im)
        beta = complex(req.state[1].re, req.state[1].im)
    except IndexError:
        return {"error": "Invalid state vector format"}
    
    state = np.array([[alpha], [beta]], dtype=complex)

    # ゲート名のチェック
    if req.gate not in GATES:
        return {"error": f"Unknown gate: {req.gate}"}

    # ゲート適用
    gate_matrix = GATES[req.gate]
    new_state = np.dot(gate_matrix, state)

    # 確率
    probs = np.abs(new_state.flatten()) ** 2

    return {
        "state_vector": [to_c_dict(x) for x in new_state.flatten()],
        "probabilities": probs.tolist(),
    }

@app.websocket("/ws/step")
async def websocket_step(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        gate = data.get("gate")
        raw_state = data.get("state", [])
        alpha = complex(raw_state[0]["re"], raw_state[0]["im"])
        beta = complex(raw_state[1]["re"], raw_state[1]["im"])
        state = np.array([[alpha], [beta]], dtype=complex)

        if gate not in GATES:
            await websocket.send_json({"error": f"Unknown gate: {gate}"})
            return

        # 1ゲートだけ適用
        state = np.dot(GATES[gate], state)
        probs = np.abs(state.flatten()) ** 2

        await websocket.send_json({
            "gate": gate,
            "state_vector": [to_c_dict(x) for x in state.flatten()],
            "probabilities": probs.tolist(),
        })

    except Exception as e:
        print(f"Error: {e}") # デバッグ用ログ
        await websocket.send_json({"error": str(e)})
