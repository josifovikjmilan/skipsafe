import type { Budget } from "@/lib/budget";

// One slot per allowed absence. Filled slots are absences already used.
// Absences beyond the limit appear as extra red slots.
export default function BudgetStrip({
  budget,
  animate = false,
}: {
  budget: Budget;
  animate?: boolean;
}) {
  const filled = Math.min(budget.used, budget.allowed);
  const slots = [
    ...Array.from({ length: budget.allowed }, (_, i) =>
      i < filled ? "used" : "free",
    ),
    ...Array.from({ length: budget.over }, () => "over"),
  ];

  return (
    <div
      className={`strip strip-${budget.status}${animate ? " strip-animate" : ""}`}
      role="img"
      aria-label={`${budget.used} of ${budget.allowed} allowed absences used`}
    >
      {slots.length === 0 ? (
        <span className="strip-none">No absences allowed</span>
      ) : (
        slots.map((kind, i) => (
          <span
            key={i}
            className={`slot slot-${kind}`}
            style={animate ? { animationDelay: `${150 + i * 90}ms` } : undefined}
          />
        ))
      )}
    </div>
  );
}
