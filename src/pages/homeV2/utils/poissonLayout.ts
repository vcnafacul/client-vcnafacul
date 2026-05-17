// client-vcnafacul/src/pages/homeV2/utils/poissonLayout.ts
export interface Bbox {
  x: number; y: number; width: number; height: number;
}
export interface Point { x: number; y: number; }

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Poisson-disk-ish sampling inside a bbox.
 * Produces `count` non-overlapping points (best-effort) given seed.
 * Falls back to a regular grid spread when sampling fails.
 */
export function poissonPoints(
  bbox: Bbox,
  count: number,
  minDist: number,
  seed: number,
): Point[] {
  const rand = mulberry32(seed);
  const points: Point[] = [];
  const maxAttempts = 30;
  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let a = 0; a < maxAttempts && !placed; a++) {
      const x = bbox.x + rand() * bbox.width;
      const y = bbox.y + rand() * bbox.height;
      const ok = points.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist);
      if (ok) {
        points.push({ x, y });
        placed = true;
      }
    }
    if (!placed) {
      const cols = Math.ceil(Math.sqrt(count));
      const cellW = bbox.width / cols;
      const cellH = bbox.height / Math.ceil(count / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      points.push({
        x: bbox.x + (col + 0.5) * cellW,
        y: bbox.y + (row + 0.5) * cellH,
      });
    }
  }
  return points;
}
