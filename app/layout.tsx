import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Service Stack",
  description: "Hospitality Leadership & Soft Skills Development System",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/pre-shift", label: "Pre-Shift Builder" },
  { href: "/daily-audit", label: "Daily Audit" },
  { href: "/quiz", label: "Situational Quiz" },
  { href: "/assessment", label: "Skills Assessment" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 px-6 py-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              THE SERVICE STACK<span className="align-super text-xs">™</span>
            </Link>
            {user && (
              <nav className="flex items-center gap-5 text-sm text-neutral-400">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-neutral-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <span className="text-neutral-600">|</span>
                <span className="text-neutral-300">
                  {user.name} · {user.outlet.name}
                </span>
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="hover:text-neutral-100 transition-colors"
                  >
                    Log out
                  </button>
                </form>
              </nav>
            )}
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
