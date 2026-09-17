import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const outlets = await prisma.outlet.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-neutral-400 text-sm">
          Join an outlet or start a new one.
        </p>
      </div>

      <SignupForm outlets={outlets} />

      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-300 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
