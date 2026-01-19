import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  qubitId: number;
  height: number;
  top: number;
}

export default function DroppableZone({ qubitId, height, top }: Props) {
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
        top: top + 10, // 上下位置を調整
        height: height - 20, // 高さを調整してワイヤー付近に限定
        
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
      {isOver && `Drop on Q${qubitId}`}
    </div>
  );
}