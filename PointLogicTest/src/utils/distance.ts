// 제곱 거리: sqrt 없이 임계 비교
export function distanceSq(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const dx = p1.x - p2.x,
    dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

export function pointToSegmentDistanceSq(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
) {
  const vx = w.x - v.x,
    vy = w.y - v.y;
  const l2 = vx * vx + vy * vy;
  if (l2 === 0) return distanceSq(p, v);

  // t = ((p - v) · (w - v)) / ||w - v||^2, clamp to [0,1]
  let t = ((p.x - v.x) * vx + (p.y - v.y) * vy) / l2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;

  const proj = { x: v.x + t * vx, y: v.y + t * vy };
  return distanceSq(p, proj);
}
