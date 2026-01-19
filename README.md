# 量子計算体験シミュレーター 開発仕様書 (Ver 1.0)

## 1. プロジェクト概要
量子計算の基礎概念（量子ビット、量子ゲート、重ね合わせ、干渉、もつれ）を、ブラウザ上で直感的に体験できるインタラクティブな学習ツール。
特に「数式だけでは理解しづらい振幅や位相の干渉」を視覚的に理解させることを主眼とし、**2量子ビット回路（4状態）** までのシミュレーションを完全サポートする。

* **ターゲット:** 量子コンピュータ初学者、学生、エンジニア
* **コンセプト:** アクセスして即座に実験開始

## 2. 実装ステータス概要 (Current Status)

* [x] **アーキテクチャ:** React (Frontend) + Python (Backend)
* [x] **通信:** WebSocketによるリアルタイム双方向通信
* [x] **操作:** Drag & Drop による直感的なゲート配置 (`@dnd-kit`)
* [x] **計算エンジン:** NumPyによる2量子ビット（4x4行列）シミュレーション
* [x] **可視化:**
    * 部分トレースを用いたブロッホ球（混合状態の可視化）
    * 位相（Phase）を色相と時計アイコンで表現した確率分布グラフ
* [x] **プリセット:** Bell状態, スーパーデンス・コーディング, Groverのアルゴリズム
* [ ] **課題モード:** 自動採点機能付きの学習コース（Next Step）

## 3. システムアーキテクチャ

### 構成図
```mermaid
graph TD
    User[ユーザー (Browser)] -->|Drag & Drop操作| FE[Frontend (React/Vite)]
    FE -->|WebSocket (JSON)| BE[Backend (Python/FastAPI)]
    
    subgraph Frontend
        Store[Zustand (State Management)]
        DnD[dnd-kit (Circuit Editor)]
        Vis[SVG Visualization (Bloch/Probs)]
    end
    
    subgraph Backend
        Sim[Quantum Simulator (NumPy)]
        Logic[Unitary Matrix Calculation]
    end
    
    BE -->|状態ベクトル・確率| FE
