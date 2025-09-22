import { useState } from "react";
import CanvasArea from "./components/CanvasArea";
import WaySelector from "./components/WaySelector";
import CoordinateList from "./components/CoordinateList";
import ControlPanel from "./components/ControlPanel";

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

  const handleAddPoint = (x: number, y: number) => {
    if (selectedWay === "me") {
      setMyPoints(prev => [
        ...prev,
        { x, y, seq: prev.length + 1 }
      ]);
    } else {
      setWays(prev =>
        prev.map(w =>
          w.id === selectedWay
            ? {
              ...w,
              points: [
                ...w.points,
                { x, y, seq: w.points.length + 1, wayNum: w.id, weight: 0 }
              ]
            }
            : w
        )
      );
    }
  };

  const handleUndo = () => {
    if (selectedWay === "me") {
      setMyPoints(prev => {
        if (prev.length === 0) return prev;
        const newArr = prev.slice(0, prev.length - 1);
        // seq 재정렬
        return newArr.map((p, idx) => ({ ...p, seq: idx + 1 }));
      });
    } else {
      setWays(prev =>
        prev.map(w => {
          if (w.id !== selectedWay) return w;
          if (w.points.length === 0) return w;
          const newPts = w.points.slice(0, w.points.length - 1);
          // seq 재정렬
          const reseq = newPts.map((p, idx) => ({
            ...p,
            seq: idx + 1
          }));
          return {
            ...w,
            points: reseq
          };
        })
      );
    }
  };

  const handleSave = () => {
    console.log("저장된 데이터:", { myPoints, ways });
  };

  const handleReset = () => {
    setMyPoints([]);
    setWays(ways.map(w => ({ ...w, points: [] })));
  };

  return (
    <div style={{ display: "flex", padding: "1rem" }}>
      <CanvasArea
        myPoints={myPoints}
        ways={ways}
        selectedWay={selectedWay}
        threshold={threshold}
        showMyPoints={showMyPoints}
        onAddPoint={handleAddPoint}
      />
      <div style={{ marginLeft: "1rem" }}>
        <WaySelector selectedWay={selectedWay} setSelectedWay={setSelectedWay} />
        <CoordinateList
          myPoints={myPoints}
          ways={ways}
        // selectedWay={selectedWay}
        // showMyPoints={showMyPoints}
        />
        <ControlPanel
          onSave={handleSave}
          onReset={handleReset}
          threshold={threshold}
          setThreshold={setThreshold}
          showMyPoints={showMyPoints}
          setShowMyPoints={setShowMyPoints}
          onUndo={handleUndo}
          canUndo={
            selectedWay === "me"
              ? myPoints.length > 0
              : ways.find(w => w.id === selectedWay)?.points.length > 0
          }
        />
      </div>
    </div>
  );
}

export default App;
