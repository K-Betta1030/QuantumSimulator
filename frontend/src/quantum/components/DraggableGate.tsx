import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  gateName: string; // "H", "X", "CNOT" など
  label: string;    // "H", "CX" など表示用
}

export default function DraggableGate({ gateName, label }: Props) {
  // useDraggable フックを使って、ドラッグ機能を持たせる
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${gateName}`, // 一意のID
    data: { gateName },        // ドロップ時に渡すデータ
  });

  // ドラッグ中の移動スタイル (transform)
  const style = {
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    padding: "10px 15px",
    fontSize: "16px",
    fontFamily: "monospace",
    fontWeight: "bold",
    minWidth: "45px",
    width: "max-content",
    background: isDragging ? "#ffe19a" : "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    // CNOTだけ少し色を変える
    backgroundColor: gateName === "CNOT" ? "#e0f7fa" : undefined
  };

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {label}
    </button>
  );
}