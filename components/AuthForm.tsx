"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

type Mode = "signup" | "login";

function friendlyError(mode: Mode, message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Wrong email or password. Check both and try again.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Log in instead.";
  }
  if (m.includes("password") && (m.includes("at least") || m.includes("short") || m.includes("weak"))) {
    return "Choose a longer password: at least 6 characters.";
  }
  if (m.includes("email not confirmed")) {
    return "This email is not confirmed yet. Check your inbox, then log in.";
  }
  if (m.includes("rate limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "Enter a valid email address.";
  }
  return mode === "signup"
    ? `Could not create your account: ${message}`
    : `Could not log you in: ${message}`;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const id = (field: string) => `${mode}-${field}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const supabase = getSupabase();

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Account created. Confirm your email, then log in.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      router.replace("/app");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(friendlyError(mode, message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap auth">
      <div className="auth-panel">
        <h1>{isSignup ? "Create your account" : "Log in"}</h1>
        <p className="auth-sub">
          {isSignup
            ? "Then add your courses and start counting absences."
            : "Your courses and absences are waiting for you."}
        </p>

        <form onSubmit={onSubmit} noValidate={false}>
          <label htmlFor={id("email")}>Email</label>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid={`${mode}-email`}
          />

          <label htmlFor={id("password")}>Password</label>
          <input
            id={id("password")}
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid={`${mode}-password`}
          />
          {isSignup && <p className="hint">At least 6 characters.</p>}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="form-info" role="status">
              {info}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy}
            data-testid={`${mode}-submit`}
          >
            {busy
              ? isSignup
                ? "Creating account…"
                : "Logging in…"
              : isSignup
                ? "Sign up"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? (
            <>
              Already have an account? <Link href="/login">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link href="/signup">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
