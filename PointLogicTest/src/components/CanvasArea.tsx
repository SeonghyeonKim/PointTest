// src/components/CanvasArea.tsx

import React, { useEffect } from "react";
import type { MyPoint, WayPoint } from "../App";
import { distanceSq, pointToSegmentDistanceSq } from "../utils/distance";

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
    const thresholdSq = threshold * threshold;

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

        // 점들에 대해 가중치 계산 + 색 결정
        targetWay.points.forEach((p, idx) => {
          // 1) 조건1 먼저: 가장 가까운 내 좌표와의 거리 가중치
          let maxPointWeight = 0;
          myPoints.forEach(mp => {
            // 점-점 거리
            const dSq = distanceSq(mp, p);
            const d = Math.sqrt(dSq);
            if (d <= threshold) {
              // 임계값 내에 들어오면 "최대" 가중치
              maxPointWeight = Infinity; // 또는 그냥 아주 큰 값
            } else {
              const w = inverseDistance(d, 2);
              if (w > maxPointWeight) {
                maxPointWeight = w;
              }
            }
          });

          // colorToDraw 기본
          let colorToDraw: "gray" | "blue" | "green" | "red" = "gray";
          let computedWeight = 0;

          if (hasExecuted) {
            if (maxPointWeight === Infinity) {
              // 조건1 만족
              colorToDraw = "blue";
              computedWeight += computedWeight = greenThreshold;
            } else {
              // 조건2: 선분 거리 기반 가중치 누적
              let sumSegmentWeight = 0;
              myPoints.forEach(mp => {
                // 왼쪽 segment
                if (idx - 1 >= 0) {
                  const s1 = targetWay.points[idx - 1];
                  const s2 = p;
                  const dSegSq = pointToSegmentDistanceSq(mp, s1, s2);
                  const dSeg = Math.sqrt(dSegSq);
                  if (dSeg <= threshold) {
                    // 임계값 내면 최대 또는 큰 가중치?
                    sumSegmentWeight += inverseDistance(dSeg, 2);
                  }
                }
                // 오른쪽 segment
                if (idx + 1 < targetWay.points.length) {
                  const s1 = p;
                  const s2 = targetWay.points[idx + 1];
                  const dSegSq = pointToSegmentDistanceSq(mp, s1, s2);
                  const dSeg = Math.sqrt(dSegSq);
                  if (dSeg <= threshold) {
                    sumSegmentWeight += inverseDistance(dSeg, 2);
                  }
                }
              });

              computedWeight = sumSegmentWeight;

              // 특정 수치 기준 넘으면 초록
              if (sumSegmentWeight >= greenThreshold) {
                colorToDraw = "green";
              } else {
                colorToDraw = "red";
              }
            }
          } else {
            // 실행 안 했으면 회색
            colorToDraw = "gray";
          }

          // p.weight 갱신 (state 관리 가능하면, 아니면 임시로 여기서만)
          // 만약 mutable 하게 저장 가능하면:
          p.weight = computedWeight;

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
