import type { MotionLandmark } from "./schema";

export function isFiniteLandmark(point: MotionLandmark | undefined): point is MotionLandmark {
  return Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));
}

export function midpoint(a: MotionLandmark, b: MotionLandmark, name = "MIDPOINT"): MotionLandmark {
  return {
    name,
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: a.z !== undefined && b.z !== undefined ? (a.z + b.z) / 2 : undefined,
    visibility:
      a.visibility !== undefined && b.visibility !== undefined
        ? (a.visibility + b.visibility) / 2
        : undefined,
  };
}

export function distance2D(a: MotionLandmark, b: MotionLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function jointAngleDeg(
  proximal: MotionLandmark,
  joint: MotionLandmark,
  distal: MotionLandmark,
): number {
  const v1x = proximal.x - joint.x;
  const v1y = proximal.y - joint.y;
  const v2x = distal.x - joint.x;
  const v2y = distal.y - joint.y;
  const denominator = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (denominator === 0) return Number.NaN;
  const cosine = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / denominator));
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function segmentInclinationFromVerticalDeg(
  proximal: MotionLandmark,
  distal: MotionLandmark,
): number {
  const dx = distal.x - proximal.x;
  const dy = distal.y - proximal.y;
  if (dx === 0 && dy === 0) return Number.NaN;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}
