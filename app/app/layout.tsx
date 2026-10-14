import type { Metadata } from "next";

export const metadata: Metadata = { title: "My courses | SkipSafe" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
