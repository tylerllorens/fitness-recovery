// Turn each metric into a 0–100 score, then blend them with weights to get a final readiness
// Sleep contributes 40%, HRV contributes 30%, RHR contributes 15%, Strain contributes 15%

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
  // Final readiness score rounded to nearest integer
  return Math.round(raw);
}
