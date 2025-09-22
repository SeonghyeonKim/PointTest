import React from "react";
import type { MyPoint, WayPoint } from "../App";
import { distanceSq, pointToSegmentDistanceSq } from "../utils/distance";

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
        targetWay.points.forEach((p, idx) => {
          // 먼저 weight 초기화
          let tempWeight = 0;
          let color: "red" | "green" | "blue" = "red";
          const thresholdSq = threshold * threshold;

          for (const mp of myPoints) {
            // 조건1: 점-점 거리
            if (distanceSq(mp, p) <= thresholdSq) {
              color = "blue";
              // 파란색이면 더 이상의 체크 불필요
              break;
            }
          }

          if (color !== "blue") {
            // 조건2 누적 체크
            for (const mp of myPoints) {
              // 왼쪽 세그먼트
              if (idx - 1 >= 0) {
                const s1 = targetWay.points[idx - 1];
                const s2 = p;
                if (pointToSegmentDistanceSq(mp, s1, s2) <= thresholdSq) {
                  tempWeight += 1;
                }
              }
              // 오른쪽 세그먼트
              if (idx + 1 < targetWay.points.length) {
                const s1 = p;
                const s2 = targetWay.points[idx + 1];
                if (pointToSegmentDistanceSq(mp, s1, s2) <= thresholdSq) {
                  tempWeight += 1;
                }
              }
              // 만약 tempWeight이 충분히 커졌으면 더 검사 안 해도 됨
              if (tempWeight >= 2) break;
            }

            if (tempWeight >= 2) {
              color = "green";
            }
          }

          // draw
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
