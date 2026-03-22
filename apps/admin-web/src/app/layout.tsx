import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Web Queue",
  description: "Staff Dashboard for Smart Queue",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
