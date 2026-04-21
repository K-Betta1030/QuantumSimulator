import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  qubitId: number;
  height: number;
  top: number;
  hasGate?: boolean;
}

export default function DroppableZone({ qubitId, height, top, hasGate }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `wire-${qubitId}`,
    data: { target: qubitId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: 60, // 開始位置をゲートに合わせる (START_X)
        right: 10, // 少し余白
        top: top,
        height: height,
        
        // ★スタイル変更: 破線の枠を表示
        border: isOver ? "2px dashed #333" : "2px dashed transparent",
        backgroundColor: isOver ? "rgba(255, 225, 154, 0.3)" : "transparent", // 薄いオレンジ
        
        zIndex: 0,
        borderRadius: "4px",
        transition: "all 0.2s",
        // プレビューの文字
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: "20px",
        color: isOver ? "#333" : "transparent",
        fontWeight: "bold",
        pointerEvents: "none" // 文字が邪魔しないように
      }}
    >
      {/* ★ ゲートが1つも無い時だけテキストを表示する */}
      {!hasGate && (
        <span
          style={{
            position: "absolute",
            left: "20px",  // ワイヤーの開始位置の少し右に配置
            top: "10px",   // 中央ではなく、領域の上部に寄せて線との重なりを回避
            color: "#aaa", // 目立ちすぎない薄い色
            fontSize: "14px",
            fontWeight: "bold",
            pointerEvents: "none", // テキスト自体がドロップ操作の邪魔にならないようにする
          }}
        >
          Drop on q{qubitId}
        </span>
      )}
    </div>
  );
}