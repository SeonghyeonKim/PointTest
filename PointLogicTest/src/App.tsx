import { useState } from "react";
import CanvasArea from "./components/CanvasArea";
import ControlPanel from "./components/ControlPanel";
import CoordinateList from "./components/CoordinateList";
import WaySelector from "./components/WaySelector";

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
      setMyPoints(prev => [...prev, { x, y, seq: prev.length + 1 }]);
    } else {
      setWays(prev =>
        prev.map(w =>
          w.id === selectedWay
            ? {
                ...w,
                points: [
                  ...w.points,
                  { x, y, seq: w.points.length + 1, wayNum: w.id },
                ],
              }
            : w
        )
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
        <WaySelector
          selectedWay={selectedWay}
          setSelectedWay={setSelectedWay}
        />
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
        />
      </div>
    </div>
  );
}

export default App;
