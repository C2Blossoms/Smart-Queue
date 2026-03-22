import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Queue Ticket",
  description: "Join the queue via your mobile device",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">{children}</body>
    </html>
  );
}
