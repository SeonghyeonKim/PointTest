// src/components/CanvasArea.tsx

import React, { useEffect } from "react";
import type { MyPoint, WayPoint } from "../App";
import { distanceSq, pointToSegment, pointToSegmentDistanceSq } from "../utils/distance";

interface Props {
  myPoints: MyPoint[];
  ways: { id: number; points: WayPoint[] }[];
  selectedWay: "me" | number;
  threshold: number;
  greenThreshold: number;
  showMyPoints: boolean;
  forceMyDotMode: boolean;
  hasExecuted: boolean;
  onAddPoint: (x: number, y: number) => void;
}

function angleBetweenVectors(ax: number, ay: number, bx: number, by: number): number {
  const dot = ax * bx + ay * by;
  const normA = Math.sqrt(ax * ax + ay * ay);
  const normB = Math.sqrt(bx * bx + by * by);
  if (normA === 0 || normB === 0) return 0;
  const cosTheta = Math.min(1, Math.max(-1, dot / (normA * normB)));
  let deg = (Math.acos(cosTheta) * 180) / Math.PI; // degree
  if (deg > 90) deg = 180 - deg; // 항상 예각으로 변환
  return deg;
}

const inverseDistance = (
  d: number,
  p: number = 2,
  eps: number = 1e-6
): number => {
  // 거리 d가 클수록 가중치 작아짐
  return 1 / (d + eps) ** p;
};

const CanvasArea: React.FC<Props> = ({
  myPoints,
  ways,
  selectedWay,
  threshold,
  greenThreshold,
  showMyPoints,
  forceMyDotMode,
  hasExecuted,
  onAddPoint,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();

    const displayWidth = rect.width;
    const displayHeight = rect.height;

    const actualWidth = canvas.width;
    const actualHeight = canvas.height;

    const scaleX = actualWidth / displayWidth;
    const scaleY = actualHeight / displayHeight;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    onAddPoint(x, y);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // 먼저 clear
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // threshold에 의한 거리의 제곱

    if (selectedWay !== "me") {
      const targetWay = ways.find(w => w.id === selectedWay);

      if (targetWay) {
        // 연결선
        if (targetWay.points.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = "gray";
          ctx.lineWidth = 1;
          const first = targetWay.points[0];
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < targetWay.points.length; i++) {
            const p = targetWay.points[i];
            ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }

        // 선 버퍼
        if (targetWay.points.length > 1 && hasExecuted) {
          ctx.beginPath();
          const first = targetWay.points[0];
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < targetWay.points.length; i++) {
            const p = targetWay.points[i];
            ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = "rgba(25, 11, 255, 0.15)";
          ctx.lineWidth = threshold * 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        targetWay.points.forEach((p, idx) => {
          // 1) 조건1 먼저: 점-점 거리 검사
          let computedWeight = 0;
          let colorToDraw: "gray" | "blue" | "green" | "red" = "gray";

          if (hasExecuted) {
            for (const mp of myPoints) {
              // 조건 1: 점-점 거리 검사
              const d = (
                Math.pow(mp.x - p.x, 2) + Math.pow(mp.y - p.y, 2)
              ) ** 0.5;

              if (d <= threshold) {
                colorToDraw = "blue";
                computedWeight += greenThreshold;
                continue;
              }

              // 다른 원에 속하는 경우 continue
              let flag = 0;
              targetWay.points.forEach((p2, idx2) => {
                if (idx2 === idx) return;
                const d2 = (
                  Math.pow(mp.x - p2.x, 2) + Math.pow(mp.y - p2.y, 2)
                ) ** 0.5;
                if (d2 <= threshold) flag = 1;
              });
              if (flag) continue;

              // 조건 2: 수선의 발 검사
              if (idx - 1 >= 0) {
                const T = pointToSegment(mp, p, targetWay.points[idx - 1]);
                const d = Math.hypot(T.x - mp.x, T.y - mp.y);

                if (d <= threshold) {
                  const totalDistance = Math.hypot(
                    p.x - targetWay.points[idx - 1].x,
                    p.y - targetWay.points[idx - 1].y
                  );
                  const dist = Math.hypot(
                    T.x - targetWay.points[idx - 1].x,
                    T.y - targetWay.points[idx - 1].y
                  );


                  // 내 좌표의 현재/이전 벡터와 way segment 벡터 각도 계산
                  if (mp.seq > 1) {
                    const prevMp = myPoints.find(m => m.seq === mp.seq - 1);
                    if (prevMp) {
                      const ux = mp.x - prevMp.x;
                      const uy = mp.y - prevMp.y;
                      const vx = p.x - targetWay.points[idx - 1].x;
                      const vy = p.y - targetWay.points[idx - 1].y;


                      const angle = angleBetweenVectors(ux, uy, vx, vy);
                      let factor = 1.0;
                      if (angle > 30 && angle <= 60) factor = 0.7;
                      else if (angle > 60 && angle <= 90) factor = 0.3;


                      computedWeight += greenThreshold * (dist / totalDistance) * factor;
                    }
                  } else {
                    computedWeight += greenThreshold * (dist / totalDistance);
                  }
                }
              }

              if (idx + 1 < targetWay.points.length) {
                const T = pointToSegment(mp, p, targetWay.points[idx + 1]);
                const d = Math.hypot(T.x - mp.x, T.y - mp.y);

                if (d <= threshold) {
                  const totalDistance = Math.hypot(
                    p.x - targetWay.points[idx + 1].x,
                    p.y - targetWay.points[idx + 1].y
                  );
                  const dist = Math.hypot(
                    T.x - targetWay.points[idx + 1].x,
                    T.y - targetWay.points[idx + 1].y
                  );

                  if (mp.seq > 1) {
                    const prevMp = myPoints.find(m => m.seq === mp.seq - 1);
                    if (prevMp) {
                      const ux = mp.x - prevMp.x;
                      const uy = mp.y - prevMp.y;
                      const vx = targetWay.points[idx + 1].x - p.x;
                      const vy = targetWay.points[idx + 1].y - p.y;


                      const angle = angleBetweenVectors(ux, uy, vx, vy);
                      let factor = 1.0;
                      if (angle > 30 && angle <= 60) factor = 0.7;
                      else if (angle > 60 && angle <= 90) factor = 0.3;

                      computedWeight += greenThreshold * (dist / totalDistance) * factor;
                    }
                  } else {
                    computedWeight += greenThreshold * (dist / totalDistance);
                  }
                }
              }

              // 만약 computedWeight 기준 초과하면 초록, 아니면 빨강
              if (colorToDraw === 'blue') {
                colorToDraw = "blue";
              }
              else if (computedWeight >= greenThreshold) {
                colorToDraw = "green";
              } else {
                colorToDraw = "red";
              }

              // p.weight 갱신
              p.weight = computedWeight;
            }

            // 반경 그리기
            ctx.beginPath();
            ctx.arc(p.x, p.y, threshold, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 11, 25, 0.08)";
            ctx.fill();

            // 점 그리기
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = colorToDraw;
            ctx.fill();

            // 텍스트: seq 및 weight
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            const wText =
              computedWeight === Infinity ? "∞" : computedWeight.toFixed(3);
            ctx.fillText(`W${p.wayNum}-${p.seq} (w:${wText})`, p.x + 10, p.y);
          }
        });

        // 내 좌표 같이 보기
        if (showMyPoints) {
          myPoints.forEach(mp => {
            ctx.beginPath();
            ctx.arc(mp.x, mp.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();
            ctx.fillText(`M-${mp.seq}`, mp.x + 10, mp.y);
          });
        }
      }
    } else {
      // selectedWay == "me" or 찍기 모드 일 경우: 내 좌표만 그리고
      myPoints.forEach(mp => {
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.fillText(`M-${mp.seq}`, mp.x + 10, mp.y);
      });
    }
  };

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      draw(ctx);
    }
  }, [
    myPoints,
    ways,
    selectedWay,
    threshold,
    showMyPoints,
    forceMyDotMode,
    hasExecuted,
  ]);

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
