"use client";

import { useState } from "react";
import BudgetStrip from "@/components/BudgetStrip";
import { getBudget, statusLabel, statusMessage, type Course } from "@/lib/budget";

export default function CourseCard({
  course,
  saving,
  onAbsences,
  onSessions,
  onRemove,
}: {
  course: Course;
  saving: boolean;
  onAbsences: (next: number) => void;
  onSessions: (next: number) => void;
  onRemove: () => void;
}) {
  const budget = getBudget(course.total_sessions, course.absences);
  // While the field is being edited it holds a draft; otherwise it shows the saved value.
  const [sessionsDraft, setSessionsDraft] = useState<string | null>(null);

  function commitSessions() {
    const draft = sessionsDraft;
    setSessionsDraft(null);
    if (draft === null) return;
    const n = Number.parseInt(draft, 10);
    if (!Number.isFinite(n) || n < Math.max(1, course.absences) || n > 200) return;
    if (n !== course.total_sessions) onSessions(n);
  }

  const sessionsId = `sessions-${course.id}`;

  return (
    <li className={`course-card card-${budget.status}`} data-testid="core-item">
      <div className="course-top">
        <h3 className="course-name">{course.name}</h3>
        <span className={`status status-${budget.status}`}>
          {statusLabel[budget.status]}
        </span>
      </div>

      <BudgetStrip budget={budget} />

      <p className="course-count">
        <strong>{budget.over > 0 ? `${budget.over} over.` : `${budget.left} left.`}</strong>{" "}
        {budget.used} of {budget.allowed} absences used.
      </p>
      <p className="course-message">{statusMessage(budget)}</p>

      <div className="course-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onAbsences(course.absences + 1)}
          disabled={saving || course.absences >= course.total_sessions}
        >
          I missed a class
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => onAbsences(course.absences - 1)}
          disabled={saving || course.absences === 0}
        >
          Undo
        </button>
      </div>

      <div className="course-footer">
        <label htmlFor={sessionsId} className="inline-label">
          Sessions in this course
          <input
            id={sessionsId}
            type="number"
            inputMode="numeric"
            min={Math.max(1, course.absences)}
            max={200}
            value={sessionsDraft ?? String(course.total_sessions)}
            onChange={(e) => setSessionsDraft(e.target.value)}
            onBlur={commitSessions}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            disabled={saving}
          />
        </label>
        <button
          type="button"
          className="link-danger"
          onClick={() => {
            if (window.confirm(`Remove ${course.name} and its absences?`)) onRemove();
          }}
          disabled={saving}
        >
          Remove course
        </button>
      </div>
    </li>
  );
}
