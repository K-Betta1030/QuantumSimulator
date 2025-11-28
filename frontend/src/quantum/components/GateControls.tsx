interface Props {
  onRun: () => void;
  onStep: () => void;
  onUndo: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export default function GateControls({ onRun, onStep, onUndo, onReset, isRunning }: Props) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={onRun} disabled={isRunning}>▶️ Run All</button>
      <button onClick={onStep} disabled={isRunning}>⏭ Step</button>
      <button onClick={onUndo} disabled={isRunning}>⏪ Undo</button>
      <button onClick={onReset} disabled={isRunning}>🔄 Reset</button>
    </div>
  );
}
