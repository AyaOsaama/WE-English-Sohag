// Calendar-day helpers. Days are compared as UTC midnights so streak logic is deterministic.
const DAY_MS = 86400000;

function startOfDay(d = new Date()) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
}

function diffInDays(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);
}

function addDays(d, n) {
  return new Date(startOfDay(d).getTime() + n * DAY_MS);
}

module.exports = { DAY_MS, startOfDay, diffInDays, addDays };
