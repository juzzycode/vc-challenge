import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Household Command Center",
  description: "Local-first household planning for chores, groceries, bills, and maintenance."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
