"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import CourseCard from "@/components/CourseCard";
import { getBudget, type Course } from "@/lib/budget";
import { getSupabase } from "@/lib/supabase";

const DEFAULT_SESSIONS = 30;
const COLUMNS = "id, name, total_sessions, absences, created_at";

export default function AppPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [sessions, setSessions] = useState(String(DEFAULT_SESSIONS));
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("courses")
      .select(COLUMNS)
      .order("created_at", { ascending: true });
    if (error) setError(`Could not load your courses: ${error.message}`);
    else setCourses(data ?? []);
    setLoading(false);
  }, []);

  // Only logged-in users may stay on /app.
  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setReady(true);
      load();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) router.replace("/login");
    });
    return () => data.subscription.unsubscribe();
  }, [router, load]);

  async function addCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Type the course name first.");
      return;
    }
    const parsed = Number.parseInt(sessions, 10);
    const total =
      Number.isFinite(parsed) && parsed >= 1 && parsed <= 200 ? parsed : DEFAULT_SESSIONS;

    setAdding(true);
    setError(null);
    const { data, error } = await getSupabase()
      .from("courses")
      .insert({ name: trimmed.slice(0, 120), total_sessions: total })
      .select(COLUMNS)
      .single();
    setAdding(false);

    if (error) {
      setError(`Could not add the course: ${error.message}`);
      return;
    }
    setCourses((prev) => [...prev, data as Course]);
    setName("");
    setSessions(String(DEFAULT_SESSIONS));
  }

  async function updateCourse(id: string, patch: Partial<Pick<Course, "absences" | "total_sessions">>) {
    const before = courses;
    setSavingId(id);
    setError(null);
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const { data, error } = await getSupabase()
      .from("courses")
      .update(patch)
      .eq("id", id)
      .select(COLUMNS)
      .single();
    setSavingId(null);
    if (error) {
      setCourses(before);
      setError(`Could not save the change: ${error.message}`);
      return;
    }
    setCourses((prev) => prev.map((c) => (c.id === id ? (data as Course) : c)));
  }

  async function removeCourse(id: string) {
    const before = courses;
    setSavingId(id);
    setError(null);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    const { error } = await getSupabase().from("courses").delete().eq("id", id);
    setSavingId(null);
    if (error) {
      setCourses(before);
      setError(`Could not remove the course: ${error.message}`);
    }
  }

  const summary = useMemo(() => {
    if (courses.length === 0) return null;
    const ranked = courses
      .map((c) => ({ c, b: getBudget(c.total_sessions, c.absences) }))
      .sort((a, b) => a.b.left - a.b.over - (b.b.left - b.b.over));
    const tightest = ranked[0];
    const atRisk = ranked.filter((r) => r.b.status !== "safe").length;
    return { tightest, atRisk };
  }, [courses]);

  if (!ready) {
    return (
      <main className="wrap app">
        <p className="muted">Checking your session…</p>
      </main>
    );
  }

  return (
    <main className="wrap app">
      <div className="app-head">
        <h1>Your courses</h1>
        {summary && (
          <p className="summary">
            {summary.atRisk === 0
              ? "Every course is on track."
              : `${summary.atRisk} of ${courses.length} ${courses.length === 1 ? "course needs" : "courses need"} attention.`}{" "}
            Tightest: <strong>{summary.tightest.c.name}</strong>,{" "}
            {summary.tightest.b.over > 0
              ? `${summary.tightest.b.over} over the limit.`
              : `${summary.tightest.b.left} ${summary.tightest.b.left === 1 ? "absence" : "absences"} left.`}
          </p>
        )}
      </div>

      <form className="add-form" onSubmit={addCourse}>
        <div className="field field-name">
          <label htmlFor="course-name">Course name</label>
          <input
            id="course-name"
            type="text"
            placeholder="e.g. Microeconomics"
            autoComplete="off"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="core-input"
          />
        </div>
        <div className="field field-sessions">
          <label htmlFor="course-sessions">Sessions</label>
          <input
            id="course-sessions"
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            value={sessions}
            onChange={(e) => setSessions(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={adding}
          data-testid="core-submit"
        >
          {adding ? "Adding…" : "Add course"}
        </button>
        <p className="hint field-hint">
          Use the number of sessions in the syllabus. You can change it later.
        </p>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading your courses…</p>
      ) : courses.length === 0 ? (
        <div className="empty">
          <h2>No courses yet</h2>
          <p>
            Add your first course above. Then tap “I missed a class” each time
            you are absent (or “Missed a double class” for a double block), and
            SkipSafe shows how many absences you have left.
          </p>
        </div>
      ) : (
        <ul className="course-list">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              saving={savingId === course.id}
              onAbsences={(n) => updateCourse(course.id, { absences: n })}
              onSessions={(n) => updateCourse(course.id, { total_sessions: n })}
              onRemove={() => removeCourse(course.id)}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
