interface Props {
  onSave: () => void;
  onReset: () => void;
  threshold: number;
  setThreshold: (val: number) => void;
  showMyPoints: boolean;
  setShowMyPoints: (val: boolean) => void;
}

const ControlPanel: React.FC<Props> = ({
  onSave,
  onReset,
  threshold,
  setThreshold,
  showMyPoints,
  setShowMyPoints,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div>
        <label>
          Threshold:{" "}
          <input
            type="number"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ width: "80px", marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div>
        <label>
          내 좌표 같이 보기{" "}
          <input
            type="checkbox"
            checked={showMyPoints}
            onChange={e => setShowMyPoints(e.target.checked)}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={onSave}>저장</button>
        <button onClick={onReset}>초기화</button>
      </div>
    </div>
  );
};

export default ControlPanel;
