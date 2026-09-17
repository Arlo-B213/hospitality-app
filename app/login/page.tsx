"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-neutral-400 text-sm">
          THE SERVICE STACK™ — leadership &amp; soft skills system.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm text-neutral-400">Email</span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-neutral-400">Password</span>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="text-neutral-300 underline">
          Create one
        </Link>
      </p>

      <p className="text-xs text-neutral-600">
        Demo accounts: lead@example.com / staff@example.com — password{" "}
        <code>password123</code>
      </p>
    </div>
  );
}
