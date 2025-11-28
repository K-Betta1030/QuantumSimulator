# quantum_simulator_p1_w3.py

import numpy as np
from collections import Counter

class QuantumSimulator:
    """
    n量子ビットの状態をシミュレーションするクラス
    """

    def __init__(self, n_qubits):
        """
        シミュレータを初期化する
        :param n_qubits: このシミュレータが扱う量子ビットの数
        """
        if n_qubits <= 0:
            raise ValueError("量子ビット数は1以上でなければなりません。")
        self.n_qubits = n_qubits
        # 状態ベクトルを |0...0> で初期化
        # 状態ベクトルのサイズは 2^n
        self.state_vector = np.zeros(2**n_qubits, dtype=complex)
        self.state_vector[0] = 1 + 0j

    def _get_operator(self, gate, target_qubit):
        """
        特定の量子ビットに作用するゲートの、システム全体の演算子（行列）を生成する
        :param gate: 1量子ビットゲートの行列 (2x2)
        :param target_qubit: ゲートを適用する量子ビットのインデックス (0から)
        :return: システム全体に作用する行列 (2^n x 2^n)
        """
        # I (Identity) ゲート
        gate_i = np.identity(2, dtype=complex)

        # 1番目の演算子を決定
        if target_qubit == 0:
            operator = gate
        else:
            operator = gate_i
        
        # テンソル積を繰り返して全体の演算子を構築
        for i in range(1, self.n_qubits):
            current_gate = gate if i == target_qubit else gate_i
            operator = np.kron(operator, current_gate)
            
        return operator

    def apply_gate(self, gate, target_qubit):
        """
        指定した量子ビットに1量子ビットゲートを適用する
        """
        if target_qubit < 0 or target_qubit >= self.n_qubits:
            raise ValueError("ターゲット量子ビットのインデックスが範囲外です。")
            
        # システム全体の演算子を取得
        operator = self._get_operator(gate, target_qubit)
        
        # 状態ベクトルに演算子を適用
        self.state_vector = np.dot(operator, self.state_vector)

    def measure(self, shots=1):
        """
        現在の状態ベクトルに基づいて測定を行う
        :param shots: 測定を繰り返す回数
        :return: 測定結果のリスト
        """
        # 各基底状態が観測される確率を計算 (確率 = |振幅|^2)
        probabilities = np.abs(self.state_vector)**2
        
        # 測定結果のラベル (0, 1, 2, ..., 2^n - 1)
        outcomes = np.arange(2**self.n_qubits)
        
        # 確率分布に従ってランダムに結果を選択
        results_decimal = np.random.choice(outcomes, size=shots, p=probabilities)
        
        # 10進数の結果を2進数の文字列に変換
        # 例: 3量子ビットで結果が 5 -> '101'
        results_binary = [format(res, f'0{self.n_qubits}b') for res in results_decimal]
        
        return results_binary

# --- メインの実行ブロック ---
if __name__ == "__main__":
    
    # 3量子ビットのシミュレータを作成
    N_QUBITS = 3
    sim = QuantumSimulator(N_QUBITS)

    # 1量子ビットゲートの定義
    gate_h = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
    gate_x = np.array([[0, 1], [1, 0]])

    print(f"{N_QUBITS}量子ビットシミュレータを開始します。")
    print(f"初期状態: |000>")

    # --- 量子回路の構築 ---
    # 1. 0番目のqubitにHゲートを適用
    sim.apply_gate(gate_h, 0)
    print("\nステップ1: 0番目の量子ビットにHゲートを適用...")
    
    # 2. 2番目のqubitにXゲートを適用
    sim.apply_gate(gate_x, 2)
    print("ステップ2: 2番目の量子ビットにXゲートを適用...")
    
    print("\n回路実行後の状態ベクトル (最初の4成分のみ表示):")
    print(sim.state_vector[:4])
    # この時点での状態は 1/√2 * (|001> + |101>) となっているはず
    # |001>は1番目、|101>は5番目の要素に対応
    
    # --- 測定 ---
    N_SHOTS = 1000
    print(f"\n{N_SHOTS}回測定を実行します...")
    measurements = sim.measure(shots=N_SHOTS)
    
    # 結果を集計して表示
    counts = Counter(measurements)
    print("\n測定結果:")
    for result, count in sorted(counts.items()):
        print(f"  '{result}': {count}回 ({(count/N_SHOTS)*100:.1f}%)")