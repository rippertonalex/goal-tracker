// Percentage of systems completed, rounded to the nearest whole number.
export function completionPercent(completed: number, total: number): number {
  return Math.round((completed / total) * 100);
}
