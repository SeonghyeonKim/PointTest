// src/App.tsx

import { useState } from "react";
import CanvasArea from "./components/CanvasArea";
import ControlPanel from "./components/ControlPanel";
import CoordinateList from "./components/CoordinateList";

export interface MyPoint {
  x: number;
  y: number;
  seq: number;
}

export interface WayPoint {
  x: number;
  y: number;
  seq: number;
  wayNum: number;
  weight: number;
  color: "gray" | "red" | "blue" | "green";
}

function App() {
  const [myPoints, setMyPoints] = useState<MyPoint[]>([]);
  const [ways, setWays] = useState<{ id: number; points: WayPoint[] }[]>([
    { id: 1, points: [] },
    { id: 2, points: [] },
    { id: 3, points: [] },
    { id: 4, points: [] },
    { id: 5, points: [] },
  ]);
  const [selectedWay, setSelectedWay] = useState<"me" | number>("me");
  const [threshold, setThreshold] = useState<number>(50);
  const [showMyPoints, setShowMyPoints] = useState<boolean>(false);
  const [forceMyDotMode, setForceMyDotMode] = useState<boolean>(false);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [greenThreshold, setGreenThreshold] = useState<number>(0.05);

  const handleAddPoint = (x: number, y: number) => {
    if (forceMyDotMode || selectedWay === "me") {
      // 내 좌표 찍기
      setMyPoints(prev => [...prev, { x, y, seq: prev.length + 1 }]);
    } else {
      // way에 점 추가
      setWays(prev =>
        prev.map(w =>
          w.id === selectedWay
            ? {
                ...w,
                points: [
                  ...w.points,
                  {
                    x,
                    y,
                    seq: w.points.length + 1,
                    wayNum: w.id,
                    weight: 0,
                    color: "gray",
                  },
                ],
              }
            : w
        )
      );
    }
  };

  const handleUndo = () => {
    if (forceMyDotMode || selectedWay === "me") {
      setMyPoints(prev => {
        if (prev.length === 0) return prev;
        const newArr = prev.slice(0, prev.length - 1);
        return newArr.map((p, idx) => ({ ...p, seq: idx + 1 }));
      });
    } else {
      setWays(prev =>
        prev.map(w => {
          if (w.id !== selectedWay) return w;
          if (w.points.length === 0) return w;
          const newPts = w.points.slice(0, w.points.length - 1);
          const reseq = newPts.map((p, idx) => ({ ...p, seq: idx + 1 }));
          return { ...w, points: reseq };
        })
      );
    }
  };

  const handleSave = () => {
    console.log("저장된 데이터", { myPoints, ways });
    // 여기서 서버 저장 등 동작 추가 가능
  };

  const handleReset = () => {
    if (selectedWay === "me") setMyPoints([]);
    else
      setWays(
        ways.map(w => {
          if (w.id !== selectedWay) return w;
          return { ...w, points: [] };
        })
      );
  };

  const handleExecute = () => {
    setHasExecuted(true);
  };

  const handleResetColors = () => {
    // 색 다시 회색으로
    setWays(prev =>
      prev.map(w => ({
        ...w,
        points: w.points.map(p => ({
          ...p,
          color: "gray",
        })),
      }))
    );
    setHasExecuted(false);
  };

  const canUndo = () => {
    if (forceMyDotMode || selectedWay === "me") {
      return myPoints.length > 0;
    } else {
      const way = ways.find(w => w.id === selectedWay);
      return way !== undefined && way.points.length > 0;
    }
  };

  return (
    <div style={{ display: "flex", padding: "1rem" }}>
      <CanvasArea
        myPoints={myPoints}
        ways={ways}
        selectedWay={selectedWay}
        threshold={threshold}
        greenThreshold={greenThreshold}
        showMyPoints={showMyPoints}
        forceMyDotMode={forceMyDotMode}
        hasExecuted={hasExecuted}
        onAddPoint={handleAddPoint}
      />
      <div style={{ marginLeft: "1rem" }}>
        <div>
          <button onClick={() => setSelectedWay("me")}>내 좌표</button>
          {[1, 2, 3, 4, 5].map(id => (
            <button key={id} onClick={() => setSelectedWay(id)}>
              way {id}
            </button>
          ))}
        </div>
        <CoordinateList
          myPoints={myPoints}
          ways={ways}
          // selectedWay={selectedWay}
          // showMyPoints={showMyPoints}
        />
        <ControlPanel
          onSave={handleSave}
          onUndo={handleUndo}
          onReset={handleReset}
          onExecute={handleExecute}
          onResetColors={handleResetColors}
          threshold={threshold}
          setThreshold={setThreshold}
          showMyPoints={showMyPoints}
          setShowMyPoints={setShowMyPoints}
          forceMyDotMode={forceMyDotMode}
          setForceMyDotMode={setForceMyDotMode}
          canUndo={canUndo()}
          greenThreshold={greenThreshold}
          setGreenThreshold={setGreenThreshold}
        />
      </div>
    </div>
  );
}

export default App;
