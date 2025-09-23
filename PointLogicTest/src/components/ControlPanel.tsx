// src/components/ControlPanel.tsx

import React from "react";

interface Props {
  onSave: () => void;
  onUndo: () => void;
  onReset: () => void;
  onExecute: () => void;
  onResetColors: () => void;
  threshold: number;
  setThreshold: (val: number) => void;
  showMyPoints: boolean;
  setShowMyPoints: (val: boolean) => void;
  forceMyDotMode: boolean;
  setForceMyDotMode: (val: boolean) => void;
  canUndo: boolean;
  greenThreshold: number;
  setGreenThreshold: (val: number) => void;
}

const ControlPanel: React.FC<Props> = ({
  onSave,
  onUndo,
  onReset,
  onExecute,
  onResetColors,
  threshold,
  setThreshold,
  showMyPoints,
  setShowMyPoints,
  forceMyDotMode,
  setForceMyDotMode,
  canUndo,
  greenThreshold,
  setGreenThreshold,
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
          Green 기준값:{" "}
          <input
            type="number"
            step="0.01"
            value={greenThreshold}
            onChange={e => setGreenThreshold(Number(e.target.value))}
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
      <div>
        <label>
          내 좌표 찍기 모드{" "}
          <input
            type="checkbox"
            checked={forceMyDotMode}
            onChange={e => setForceMyDotMode(e.target.checked)}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={onExecute}>실행</button>
        <button onClick={onResetColors}>색초기화</button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={onSave}>저장</button>
        <button onClick={onUndo} disabled={!canUndo}>
          이전
        </button>
        <button onClick={onReset}>초기화</button>
      </div>
    </div>
  );
};

export default ControlPanel;
