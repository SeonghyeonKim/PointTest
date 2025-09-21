import type { MyPoint, WayPoint } from "../App";

interface Props {
  myPoints: MyPoint[];
  ways: { id: number; points: WayPoint[] }[];
}

const CoordinateList: React.FC<Props> = ({ myPoints, ways }) => {
  return (
    <div
      style={{
        border: "1px solid black",
        margin: "1rem 0",
        padding: "0.5rem",
        height: "20rem",
        overflow: "auto",
      }}
    >
      <h4>전체 좌표 표시</h4>
      {myPoints.map(p => (
        <div key={p.seq}>
          내 좌표 {p.seq}: ({p.x}, {p.y})
        </div>
      ))}
      {ways.map(way => (
        <div key={way.id}>
          <b>Way {way.id}</b>
          {way.points.map(p => (
            <div key={p.seq}>
              (x: {p.x}, y: {p.y}, seq: {p.seq}, wayNum: {p.wayNum})
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CoordinateList;
