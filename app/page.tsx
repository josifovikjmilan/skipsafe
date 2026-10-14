import Link from "next/link";
import BudgetStrip from "@/components/BudgetStrip";
import { getBudget, POLICY_URL } from "@/lib/budget";

export default function Home() {
  const example = getBudget(30, 4);

  return (
    <main>
      <section className="wrap hero">
        <div className="hero-copy">
          <h1>Know how many classes you can still miss.</h1>
          <p className="lede">
            SkipSafe is an absence tracker for IE University bachelor students.
            Add your courses, log every absence, and always see how far you are
            from the 80% attendance limit that fails you.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary btn-large">
              Sign up free
            </Link>
            <p className="hero-note">
              Takes 30 seconds. Already have an account?{" "}
              <Link href="/login">Log in</Link>
            </p>
          </div>
        </div>

        <figure className="hero-demo" aria-label="Example of a course in SkipSafe">
          <div className="course-card demo-card">
            <div className="course-top">
              <h2 className="course-name">Recommendation Engines</h2>
              <span className="status status-careful">Careful</span>
            </div>
            <p className="course-sessions">30 sessions, so 6 absences allowed</p>
            <BudgetStrip budget={example} animate />
            <p className="course-count">
              <strong>2 left.</strong> 4 of 6 absences used.
            </p>
          </div>
          <figcaption>Each square is one absence you are allowed.</figcaption>
        </figure>
      </section>

      <section className="wrap steps" aria-labelledby="how">
        <h2 id="how">How it works</h2>
        <ol>
          <li>
            <strong>Add each course</strong> with the number of sessions in its
            syllabus.
          </li>
          <li>
            <strong>Tap “I missed a class”</strong> every time you are absent.
          </li>
          <li>
            <strong>See what is left</strong> for every course in one list, before
            Program Management tells you it is too late.
          </li>
        </ol>
      </section>

      <section className="wrap rule" aria-labelledby="rule">
        <h2 id="rule">The rule SkipSafe counts for you</h2>
        <p>
          Under the IE University bachelor attendance policy for 2026/27,
          attendance below 80% of a course gives a 0.0 in both the ordinary and
          the extraordinary call. A 30 session course allows 6 absences. A 15
          session course allows 3.
        </p>
        <p>
          Justified absences that you file on the Virtual Help Desk within 7 days
          do not count toward the limit, so only log the ones that do.{" "}
          <a href={POLICY_URL} target="_blank" rel="noreferrer">
            Read the official policy
          </a>
          .
        </p>
      </section>

      <footer className="wrap site-footer">
        <p>Made by an IE University student. Not an official IE University tool.</p>
      </footer>
    </main>
  );
}
