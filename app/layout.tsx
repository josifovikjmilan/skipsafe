import type { Metadata, Viewport } from "next";
import "@fontsource-variable/schibsted-grotesk";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "SkipSafe: know how many classes you can still miss at IE",
  description:
    "Absence tracker for IE University bachelor students. Attendance is split across Qwickly, Blackboard and SmartSeats, so SkipSafe keeps every course on one screen and shows how far you are from the 80% limit.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3F6F2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
