// IE University bachelor attendance policy 2026-2027:
// attendance below 80% of a course's sessions means a 0.0 in the ordinary
// and the extraordinary call. So a course allows at most 20% absences.
export const MIN_ATTENDANCE = 0.8;
export const POLICY_URL =
  "https://docs.ie.edu/documents/Attendance_Policy_Bachelor_Programs.pdf";

export type Course = {
  id: string;
  name: string;
  total_sessions: number;
  absences: number;
  created_at: string;
};

export type Status = "safe" | "careful" | "limit" | "over";

export type Budget = {
  allowed: number;
  used: number;
  left: number;
  over: number;
  attendance: number;
  status: Status;
};

// Largest number of absences that keeps attendance at or above 80%:
// (sessions - a) / sessions >= 0.8  <=>  a <= sessions / 5
export function allowedAbsences(totalSessions: number): number {
  return Math.floor(totalSessions / 5);
}

export function getBudget(totalSessions: number, absences: number): Budget {
  const allowed = allowedAbsences(totalSessions);
  const left = Math.max(allowed - absences, 0);
  const over = Math.max(absences - allowed, 0);
  const attendance =
    totalSessions > 0 ? (totalSessions - absences) / totalSessions : 1;

  let status: Status = "safe";
  if (over > 0) status = "over";
  else if (left === 0) status = "limit";
  else if (left <= Math.max(1, Math.floor(allowed / 3))) status = "careful";

  return { allowed, used: absences, left, over, attendance, status };
}

export const statusLabel: Record<Status, string> = {
  safe: "On track",
  careful: "Careful",
  limit: "At the limit",
  over: "Over the limit",
};

export function statusMessage(b: Budget): string {
  if (b.status === "over") {
    return "Attendance is below 80%. That means a 0.0 in the ordinary and extraordinary call. Contact Program Management now.";
  }
  if (b.status === "limit") {
    return b.allowed === 0
      ? "This course is too short to allow any absence."
      : "One more absence and you fail this course.";
  }
  return `You can miss ${b.left} more ${b.left === 1 ? "class" : "classes"}.`;
}
