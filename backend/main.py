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
P0 = np.array([[1, 0], [0, 0]], dtype=complex) # 射影演算子 |0><0|
P1 = np.array([[0, 0], [0, 1]], dtype=complex) # 射影演算子 |1><1|

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

# --- ヘルパー関数 ---

def to_c_dict(c: complex):
    return {"re": float(c.real), "im": float(c.imag)}

def parse_complex_list(raw_list):
    """[{re, im}, ...] -> np.array"""
    return np.array([complex(x["re"], x["im"]) for x in raw_list], dtype=complex).reshape(-1, 1)

# --- ★ 新しい動的ゲート拡張ロジック ---

def expand_single_gate(gate_matrix, target: int, n_qubits: int = 3):
    """1量子ビットゲートを n_qubits 全体の空間 (8x8など) に拡張する"""
    res = np.eye(1, dtype=complex) # 初期値はスカラーの1
    for i in reversed(range(n_qubits)):
        if i == target:
            res = np.kron(res, gate_matrix)
        else:
            res = np.kron(res, I)
    return res

def expand_mcx(controls: list, target: int, n_qubits: int = 3):
    """
    任意の数の制御ビットを持つマルチコントロールXゲート（CNOT, CCX等）を動的生成
    式: MCX = I_total - (P1_controls * I_target) + (P1_controls * X_target)
    """
    def make_term(op_dict):
        """指定された量子ビットに特定の演算子を配置し、それ以外はIとするテンソル積を計算"""
        res = np.eye(1, dtype=complex)
        for i in reversed(range(n_qubits)):
            op = op_dict.get(i, I)
            res = np.kron(res, op)
        return res

    # 全体の単位行列
    I_total = np.eye(2**n_qubits, dtype=complex)
    
    # 制御ビットがすべて |1> である部分空間を抽出する射影演算子 (P1)
    op_dict_I = {c: P1 for c in controls}
    
    # 制御ビットがすべて |1> で、かつターゲットに X をかける演算子
    op_dict_X = {c: P1 for c in controls}
    op_dict_X[target] = SINGLE_GATES["X"]
    
    # MCX = 全体 - (該当部分空間の何もしない操作) + (該当部分空間にXをかける操作)
    return I_total - make_term(op_dict_I) + make_term(op_dict_X)

def expand_gate(gate_name: str, target: int, controls: list = None, n_qubits: int = 3):
    """ゲート名と適用先から、全体のユニタリ行列を生成する"""
    if controls is None:
        controls = []

    if gate_name in ["CNOT", "CX"]:
        if not controls:
            controls = [0 if target != 0 else 1] # 暫定
        return expand_mcx(controls, target, n_qubits)
        
    elif gate_name == "CCX":
        if len(controls) < 2:
            # 制御ビットが2つ指定されていない場合の暫定フォールバック（残り2つを割り当て）
            available = [i for i in range(n_qubits) if i != target]
            controls = available[:2]
        return expand_mcx(controls, target, n_qubits)
    
    if gate_name not in SINGLE_GATES:
        raise ValueError(f"Unknown gate: {gate_name}")

    return expand_single_gate(SINGLE_GATES[gate_name], target, n_qubits)

# --- APIのエンドポイント部分の修正 ---

@app.websocket("/ws/session")
async def websocket_session(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            gate_name = data.get("gate")
            target_idx = data.get("target", 0)
            # ★ 変更: "control" (単数) ではなく "controls" (配列) として受け取る
            controls = data.get("controls", []) 
            
            raw_state = data.get("state", [])
            N_STATES = 8 
            
            if not raw_state:
                state = np.zeros((N_STATES, 1), dtype=complex)
                state[0, 0] = 1+0j
            else:
                state = parse_complex_list(raw_state)
                if state.shape[0] != N_STATES:
                    state = np.zeros((N_STATES, 1), dtype=complex)
                    state[0, 0] = 1+0j

            try:
                # ★ expand_gateにcontrols配列を渡すように変更
                full_matrix = expand_gate(gate_name, target_idx, controls, n_qubits=3)
                new_state = np.dot(full_matrix, state)
                probs = np.abs(new_state.flatten()) ** 2
                
                await websocket.send_json({
                    "gate": gate_name,
                    "target": target_idx,
                    "state_vector": [to_c_dict(x) for x in new_state.flatten()],
                    "probabilities": probs.tolist(),
                })

            except ValueError as e:
                await websocket.send_json({"error": str(e)})
                continue

    except Exception as e:
        print(f"WS Error: {e}")