export function calculateWormholePullVector(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  radius: number,
  strength: number,
): { x: number; y: number; intensity: number } {
  const dx = sourceX - targetX;
  const dy = sourceY - targetY;
  const distance = Math.hypot(dx, dy);

  if (distance <= 0 || distance > radius) {
    return { x: 0, y: 0, intensity: 0 };
  }

  const normalized = 1 - distance / radius;
  const intensity = Math.pow(normalized, 1.5);
  const force = strength * intensity;

  return {
    x: (dx / distance) * force,
    y: (dy / distance) * force,
    intensity,
  };
}
