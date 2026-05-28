export function detectAnomalies(expenses, threshold = 2.5) {
  if (!expenses || expenses.length < 5) return expenses || [];

  const amounts = expenses.map(e => Number(e.amount)).filter(a => !isNaN(a));

  const mean =
    amounts.reduce((sum, v) => sum + v, 0) / amounts.length;

  const variance =
    amounts.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    amounts.length;

  const stdDev = Math.sqrt(variance);

  return expenses.map(exp => {
    const zScore =
      stdDev === 0 ? 0 : (exp.amount - mean) / stdDev;

    return {
      ...exp,
      isAnomaly: Math.abs(zScore) > threshold,
      anomalyScore: Number(zScore.toFixed(2)),
    };
  });
}
