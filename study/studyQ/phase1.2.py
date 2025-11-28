# quantum_simulator_p1_w2.py

import numpy as np

def print_state(state, name):
    """状態ベクトルを整形して表示する関数"""
    # 非常に小さい値を0に丸める
    state = np.round(state, 10)
    print(f"--- {name} ---")
    for i, amp in enumerate(state):
        if amp != 0:
            basis = format(i, '02b') # 2量子ビットなので2桁の2進数で表現
            print(f"  振幅: {amp:<20} |{basis}>")
    print("-" * (len(name) + 6))


# --- 1. 基本定義 (1量子ビット) ---
# 状態ベクトル
qbit_0 = np.array([1+0j, 0+0j])
qbit_1 = np.array([0+0j, 1+0j])

# 1量子ビットゲート
gate_i = np.array([[1, 0], [0, 1]]) # I (Identity) ゲート
gate_h = np.array([[1, 1], [1, -1]]) / np.sqrt(2) # H (Hadamard) ゲート


# --- 2. 2量子ビットへの拡張 ---
# CNOTゲート (Controlled-NOT)
# 1番目のqubitがコントロール、2番目がターゲット
gate_cnot = np.array([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0]
])


# --- 3. ベル状態の生成シミュレーション ---

# 初期状態 |00> を生成
# |00> = |0> ⊗ |0> (テンソル積)
initial_state = np.kron(qbit_0, qbit_0)
print_state(initial_state, "初期状態 |00>")

# ステップ1: 1番目の量子ビットにHゲートを適用する
# システム全体に作用するゲートは H ⊗ I となる
gate_h_on_q1 = np.kron(gate_h, gate_i)
state_after_h = np.dot(gate_h_on_q1, initial_state)
print_state(state_after_h, "Hゲート適用後")


# ステップ2: CNOTゲートを適用する
# 1番目をコントロール、2番目をターゲットとする
final_state = np.dot(gate_cnot, state_after_h)
print_state(final_state, "最終状態 (ベル状態)")

# --- 検算 ---
# ベル状態 1/√2 * (|00> + |11>)
# ベクトル表現は [1/√2, 0, 0, 1/√2]
expected_bell_state = np.array([1/np.sqrt(2), 0, 0, 1/np.sqrt(2)])
print(f"\nシミュレーション結果は期待されるベル状態と一致しますか？: {np.allclose(final_state, expected_bell_state)}")