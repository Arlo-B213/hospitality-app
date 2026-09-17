import { prisma } from "@/lib/prisma";
import { getAllScenarios } from "@/prisma/scenarios";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// One-time production seed, gated by SEED_SECRET. Safe to leave deployed —
// without the correct secret it just 403s. Re-running it resets the quiz
// bank and demo accounts, so only call it once per environment.
export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const outlet = await prisma.outlet.upsert({
    where: { id: "outlet-demo" },
    update: {},
    create: { id: "outlet-demo", name: "Demo Outlet", tier: "QSR" },
  });

  await prisma.user.upsert({
    where: { email: "lead@example.com" },
    update: {},
    create: { name: "Shift Lead Demo", email: "lead@example.com", passwordHash, role: "LEAD", outletId: outlet.id },
  });
  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: { name: "Staff Demo", email: "staff@example.com", passwordHash, role: "STAFF", outletId: outlet.id },
  });
  await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: { name: "Manager Demo", email: "manager@example.com", passwordHash, role: "MANAGER", outletId: outlet.id },
  });

  await prisma.quizAttempt.deleteMany({});
  await prisma.quizScenario.deleteMany({});
  const scenarios = getAllScenarios();
  await prisma.quizScenario.createMany({ data: scenarios });

  return NextResponse.json({ ok: true, outlet: outlet.name, scenarios: scenarios.length });
}
