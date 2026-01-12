from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import asyncio
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. 基本行列の定義 (2x2) ---
I = np.array([[1, 0], [0, 1]], dtype=complex) # 単位行列 (Identity)

SINGLE_GATES = {
    "X": np.array([[0, 1], [1, 0]], dtype=complex),
    "Z": np.array([[1, 0], [0, -1]], dtype=complex),
    "Y": np.array([[0, -1j], [1j, 0]], dtype=complex),
    "H": (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex),
    "S": np.array([[1, 0], [0, 1j]], dtype=complex),
    "Sdg": np.array([[1, 0], [0, -1j]], dtype=complex),
    "T": np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=complex),
    "Tdg": np.array([[1, 0], [0, np.exp(-1j * np.pi / 4)]], dtype=complex),
}

# --- 2. 2量子ビット用行列 (4x4) ---
# CNOT (Control: 0, Target: 1)
CX = np.array([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0]
], dtype=complex)

# --- ヘルパー関数 ---

def to_c_dict(c: complex):
    return {"re": float(c.real), "im": float(c.imag)}

def parse_complex_list(raw_list):
    """[{re, im}, ...] -> np.array"""
    return np.array([complex(x["re"], x["im"]) for x in raw_list], dtype=complex).reshape(-1, 1)

# ★重要: ゲート拡張ロジック (Tensor Product)
def expand_gate(gate_name: str, target: int, n_qubits=2):
    """
    1量子ビットゲートを全体系(4x4)に拡張する。
    target: 0 or 1
    """
    if gate_name == "CNOT":
        # 今回は簡易化のため CNOT は Control=0, Target=1 固定の "CX" として扱う
        return CX
    
    if gate_name not in SINGLE_GATES:
        raise ValueError(f"Unknown gate: {gate_name}")

    gate_matrix = SINGLE_GATES[gate_name]

    # Qubit 0 (上位ビット) に適用する場合: U (x) I
    if target == 0:
        return np.kron(gate_matrix, I)
    
    # Qubit 1 (下位ビット) に適用する場合: I (x) U
    elif target == 1:
        return np.kron(I, gate_matrix)
    
    else:
        raise ValueError("Invalid target qubit index")

# --- 通信モデル ---

class GateOperation(BaseModel):
    gate: str
    target: int = 0 # デフォルトは0番ビット

# --- API ---

@app.websocket("/ws/session")
async def websocket_session(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            gate_name = data.get("gate")
            target_idx = data.get("target", 0) # 指定がなければ0番とみなす
            
            # 状態ベクトルの受信 (サイズ4になっていることを想定)
            raw_state = data.get("state", [])
            
            # 初回など空の場合は初期状態 |00> = [1, 0, 0, 0] を作る
            if not raw_state:
                state = np.zeros((4, 1), dtype=complex)
                state[0, 0] = 1+0j
            else:
                state = parse_complex_list(raw_state)
                # 万が一サイズが合わない(以前のキャッシュなど)場合のガード
                if state.shape[0] != 4:
                    state = np.zeros((4, 1), dtype=complex)
                    state[0, 0] = 1+0j

            try:
                # 4x4行列を取得して適用
                full_matrix = expand_gate(gate_name, target_idx)
                new_state = np.dot(full_matrix, state)
                probs = np.abs(new_state.flatten()) ** 2
                
                await websocket.send_json({
                    "gate": gate_name,
                    "target": target_idx,
                    # 長さ4の配列を返す
                    "state_vector": [to_c_dict(x) for x in new_state.flatten()],
                    "probabilities": probs.tolist(),
                })

            except ValueError as e:
                await websocket.send_json({"error": str(e)})
                continue

    except Exception as e:
        print(f"WS Error: {e}")

# (オプション) Run All用の一括実行APIも必要なら同様に更新が必要ですが、
# 今回はWebSocketベースのステップ実行を主力にしているため割愛します。