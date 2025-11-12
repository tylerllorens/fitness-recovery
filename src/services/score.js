// Simple readiness score (0-100). Tune weights later.
export async function computeReadiness({ sleepHours, rhr, hrv, strain }) {
  const weights = { sleep: 0.4, hrv: 0.3, rhr: 0.15, strain: 0.15 };
  const sleepScore = Math.min((sleepHours / 8) * 100, 100); // 8h target
  const hrvScore = Math.min((hrv / 80) * 100, 100); // 80ms target baseline
  const rhrScore = 100 - Math.min(Math.max((rhr - 50) * 2, 0), 100); // best near 50 bpm
  const strainScore = 100 - Math.min((strain / 21) * 100, 100); // less strain → more readiness
  const raw =
    sleepScore * weights.sleep +
    hrvScore * weights.hrv +
    rhrScore * weights.rhr +
    strainScore * weights.strain;
  return Math.round(raw);
}
