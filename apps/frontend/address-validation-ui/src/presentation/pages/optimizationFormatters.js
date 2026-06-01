export function formatDuration(seconds) {
  const value = Number(seconds || 0);
  if (value <= 0) {
    return "0 min";
  }
  const minutes = Math.round(value / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatDistance(meters) {
  const value = Number(meters || 0);
  if (value <= 0) {
    return "0 km";
  }
  const kilometers = value / 1000;
  return `${kilometers.toFixed(kilometers >= 10 ? 1 : 2)} km`;
}

export function formatOptionalDuration(seconds) {
  return seconds == null ? "-" : formatDuration(seconds);
}

export function formatOptionalDistance(meters) {
  return meters == null ? "-" : formatDistance(meters);
}

export function formatRemainingCapacity(route, stop) {
  const capacity = Number(route.capacityUnits || 0);
  const before = capacity - Number(stop.loadBeforeService || 0);
  const after = capacity - Number(stop.loadAfterService || 0);
  return `${before} to ${after} / ${capacity}`;
}
