import { useQuantumStore } from "../store/quantumStore";

export default function LogPanel() {
  const log = useQuantumStore((s) => s.log);

  return (
    <div
      style={{
        background: "#e9e9e9",
        padding: "10px",
        width: "400px",
        margin: "15px auto",
        borderRadius: "8px",
        fontFamily: "monospace",
        textAlign: "left",
      }}
    >
      {log.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
