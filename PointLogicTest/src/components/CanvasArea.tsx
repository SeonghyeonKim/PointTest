import React from "react";
import type { MyPoint, WayPoint } from "../App";
import { distance, pointToSegmentDistance } from "../utils/distance";

interface Props {
  myPoints: MyPoint[];
  ways: { id: number; points: WayPoint[] }[];
  selectedWay: "me" | number;
  threshold: number;
  showMyPoints: boolean;
  onAddPoint: (x: number, y: number) => void;
}

const CanvasArea: React.FC<Props> = ({
  myPoints,
  ways,
  selectedWay,
  threshold,
  showMyPoints,
  onAddPoint,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onAddPoint(x, y);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 800, 500);

    if (selectedWay === "me") {
      // 내 좌표만 표시
      myPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.fillText(`M-${p.seq}`, p.x + 10, p.y);
      });
    } else {
      const targetWay = ways.find(w => w.id === selectedWay);
      if (targetWay) {
        // way 좌표
        targetWay.points.forEach((p, idx) => {
          let color = "red";
          myPoints.forEach(mp => {
            if (distance(mp, p) <= threshold) color = "blue";
            if (idx < targetWay.points.length - 1) {
              const segP1 = targetWay.points[idx];
              const segP2 = targetWay.points[idx + 1];
              if (pointToSegmentDistance(mp, segP1, segP2) <= threshold) {
                color = "green";
              }
            }
          });
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.fillText(`W${p.wayNum}-${p.seq}`, p.x + 10, p.y);
        });

        // 옵션: 내 좌표도 같이 표시
        if (showMyPoints) {
          myPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();
            ctx.fillText(`M-${p.seq}`, p.x + 10, p.y);
          });
        }
      }
    }
  };

  React.useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx);
  }, [myPoints, ways, selectedWay, threshold, showMyPoints]);

  return (
    <canvas
      id="canvas"
      width={800}
      height={500}
      style={{ border: "1px solid black" }}
      onClick={handleClick}
    />
  );
};

export default CanvasArea;
