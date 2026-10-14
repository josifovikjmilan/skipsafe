"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type AuthState = "loading" | "in" | "out";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setAuth(data.session ? "in" : "out");
      setEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session ? "in" : "out");
      setEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function logOut() {
    setBusy(true);
    await getSupabase().auth.signOut();
    setBusy(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href={auth === "in" ? "/app" : "/"} className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          SkipSafe
        </Link>

        <nav className="header-nav" aria-label="Account">
          {auth === "in" && (
            <>
              {email && <span className="header-email">{email}</span>}
              {pathname !== "/app" && (
                <Link href="/app" className="nav-link">
                  My courses
                </Link>
              )}
              <button
                type="button"
                className="btn btn-quiet"
                data-testid="logout"
                onClick={logOut}
                disabled={busy}
              >
                {busy ? "Logging out…" : "Log out"}
              </button>
            </>
          )}
          {auth === "out" &&
            (pathname === "/login" ? (
              <Link href="/signup" className="nav-link">
                Sign up
              </Link>
            ) : (
              <Link href="/login" className="nav-link">
                Log in
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
