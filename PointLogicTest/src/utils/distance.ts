// src/utils/distance.ts

export function distanceSq(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

export function pointToSegmentDistanceSq(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
) {
  const vx = w.x - v.x;
  const vy = w.y - v.y;
  const l2 = vx * vx + vy * vy;
  if (l2 === 0) return distanceSq(p, v);

  let t = ((p.x - v.x) * vx + (p.y - v.y) * vy) / l2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;

  const proj = { x: v.x + t * vx, y: v.y + t * vy };
  return distanceSq(p, proj);
}

export function pointToSegment(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
) {
  const vx = w.x - v.x;
  const vy = w.y - v.y;
  const len2 = vx * vx + vy * vy;

  // v와 w가 같은 점일 때
  if (len2 === 0) {
    return { x: v.x, y: v.y };
  }

  // 직선 vw에 대한 투영 비율
  const tRaw = ((p.x - v.x) * vx + (p.y - v.y) * vy) / len2;

  // 선분 범위로 클램프
  const t = Math.max(0, Math.min(1, tRaw));

  return {
    x: v.x + t * vx,
    y: v.y + t * vy,
  };
}
