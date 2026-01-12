export function normalizeShotEntry(entry: any) {
  const normalized = { ...entry };

  if (normalized["Pass Direction"] === "N/A Off Dribble") {
    normalized["Pass Direction"] = "Off the Dribble";
  }

  if (normalized["Off Dribble Hand"] === "N/A") {
    normalized["Off Dribble Hand"] = "Catch & Shoot";
  }

  return normalized;
}
