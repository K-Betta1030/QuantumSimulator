import numpy as np

# ---- 状態ベクトルの定義 ----
# |0> 状態
qbit_0 = np.array([1+0j, 0+0j])

# |1> 状態
qbit_1 = np.array([0+0j, 1+0j])


# ---- 量子ゲートの定義 ----
# Xゲート
gate_x = np.array([
    [0, 1],
    [1, 0]
])

# Hゲート (アダマールゲート)
gate_h = np.array([
    [1, 1],
    [1, -1]
]) / np.sqrt(2)


# ---- ゲート操作のシミュレーション ----

print(f"初期状態 |0>: {qbit_0}")

# |0> に Xゲートを適用 -> |1> になるはず
result_x = np.dot(gate_x, qbit_0)
print(f"X|0> の結果: {result_x}") # [0.+0.j 1.+0.j] -> |1>

# |0> に Hゲートを適用 -> 重ね合わせ状態 |+> になるはず
result_h = np.dot(gate_h, qbit_0)
print(f"H|0> の結果: {result_h}") # [0.707+0.j 0.707+0.j] -> |+>

# |+> に Hゲートをもう一度適用 -> |0> に戻るはず
result_hh = np.dot(gate_h, result_h)
print(f"H(H|0>) の結果: {np.round(result_hh, 5)}") # [1.+0.j 0.+0.j] -> |0>