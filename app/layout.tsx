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
  { href: "/training-guide", label: "Training Guide" },
];

const MANAGER_NAV = [
  { href: "/branding", label: "Branding" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        {/* Premium Header with Glassmorphism */}
        <header className="sticky top-0 z-50 glass-dark dark:glass-dark border-b border-micro-dark backdrop-blur-lg">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-6">
            <Link href="/" className="font-display text-xl tracking-tight hover:text-red-600 transition-premium">
              THE SERVICE STACK<span className="align-super text-xs ml-1">™</span>
            </Link>
            {user && (
              <nav className="flex items-center gap-8 text-sm text-neutral-400 dark:text-neutral-400">
                <div className="hidden md:flex items-center gap-8">
                  {NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-premium font-medium text-xs tracking-wide uppercase"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user.role === "MANAGER" && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-600">•</span>
                      {MANAGER_NAV.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-premium font-medium text-xs tracking-wide uppercase"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                  {user.name}
                </span>
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 transition-premium font-medium"
                  >
                    Log out
                  </button>
                </form>
              </nav>
            )}
          </div>
        </header>

        {/* Premium Main Content Area */}
        <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10 lg:py-16">
          {children}
        </main>
      </body>
    </html>
  );
}
