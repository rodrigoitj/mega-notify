function calcPercentage(
  msRemainingTo: number,
  secondsToFromStart: number,
): number {
  const secondsRemainingTo = Math.round(msRemainingTo / 1000);
  const secondsPassed = secondsToFromStart - secondsRemainingTo;
  const pct = ((secondsPassed / secondsToFromStart) * 100).toFixed(2);
  return Number(pct);
}
export { calcPercentage };
