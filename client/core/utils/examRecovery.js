/**
 * Exam session recovery helpers — used after crash/kill/relaunch.
 * Merge order: server base, then offline, then local (local wins conflicts = unsynced crash data kept).
 */

export function mergeExamAnswers({ server = {}, offline = {}, local = {} } = {}) {
  const safe = (obj) => (obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {});
  return { ...safe(server), ...safe(offline), ...safe(local) };
}

/** Remaining exam seconds from submission start; never below 0. */
export function computeRemainingSeconds(startedAt, durationMinutes, now = new Date()) {
  if (!startedAt || !durationMinutes) return Math.max(0, (durationMinutes || 0) * 60);
  const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
  if (Number.isNaN(start.getTime())) return Math.max(0, durationMinutes * 60);

  const totalSeconds = durationMinutes * 60;
  const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
  return Math.max(0, totalSeconds - elapsed);
}
