/**
 * Compute readiness score (0-100) from available metrics
 * Handles missing/null values gracefully by calculating weighted average
 * of only the metrics that are present
 */
export async function computeReadiness({ sleepHours, rhr, hrv, strain }) {
  // Default weights - will be customizable per user later
  const weights = {
    sleep: 0.4,
    hrv: 0.3,
    rhr: 0.15,
    strain: 0.15,
  };

  // Calculate individual scores (null if metric missing)
  const sleepScore =
    sleepHours != null ? Math.min((sleepHours / 8) * 100, 100) : null;

  const hrvScore = hrv != null ? Math.min((hrv / 80) * 100, 100) : null;

  const rhrScore =
    rhr != null ? Math.max(0, Math.min(100 - (rhr - 50) * 2, 100)) : null;

  const strainScore =
    strain != null ? Math.max(0, 100 - (strain / 21) * 100) : null;

  // Collect available scores with their weights
  const availableScores = [
    { score: sleepScore, weight: weights.sleep },
    { score: hrvScore, weight: weights.hrv },
    { score: rhrScore, weight: weights.rhr },
    { score: strainScore, weight: weights.strain },
  ].filter((item) => item.score !== null);

  // If no metrics at all, return 0
  if (availableScores.length === 0) return 0;

  // Calculate weighted average using only available metrics
  const totalWeight = availableScores.reduce(
    (sum, item) => sum + item.weight,
    0
  );
  const weightedSum = availableScores.reduce(
    (sum, item) => sum + item.score * item.weight,
    0
  );

  return Math.round(weightedSum / totalWeight);
}
