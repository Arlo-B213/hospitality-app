"use client";

import { useActionState, useState } from "react";
import { signup } from "./actions";

export default function SignupForm({
  outlets,
}: {
  outlets: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(signup, undefined);
  const [outletMode, setOutletMode] = useState<"existing" | "new">(
    outlets.length > 0 ? "existing" : "new"
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm text-neutral-400">Name</span>
        <input name="name" required className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-neutral-400">Email</span>
        <input type="email" name="email" required className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-neutral-400">Password (min 8 chars)</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className={inputClass}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-neutral-400">Role</span>
        <select name="role" defaultValue="STAFF" className={inputClass}>
          <option value="STAFF">Staff</option>
          <option value="LEAD">Shift Lead</option>
          <option value="MANAGER">Manager</option>
        </select>
      </label>

      <div className="space-y-2">
        <span className="text-sm text-neutral-400">Outlet</span>
        <div className="flex gap-4 text-sm">
          {outlets.length > 0 && (
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="outletMode"
                value="existing"
                checked={outletMode === "existing"}
                onChange={() => setOutletMode("existing")}
              />
              Join existing
            </label>
          )}
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="outletMode"
              value="new"
              checked={outletMode === "new"}
              onChange={() => setOutletMode("new")}
            />
            Create new
          </label>
        </div>

        {outletMode === "existing" ? (
          <select name="outletId" className={inputClass}>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input
              name="newOutletName"
              placeholder="Outlet name"
              className={inputClass}
            />
            <select name="newOutletTier" defaultValue="QSR" className={inputClass}>
              <option value="QSR">QSR / Food Court</option>
              <option value="CASUAL">Casual Dining</option>
              <option value="FINE_DINING">Fine Dining</option>
            </select>
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm";
