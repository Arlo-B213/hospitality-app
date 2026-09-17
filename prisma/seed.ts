import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getAllScenarios } from "./scenarios";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const outlet = await prisma.outlet.upsert({
    where: { id: "outlet-demo" },
    update: {},
    create: {
      id: "outlet-demo",
      name: "Demo Outlet",
      tier: "QSR",
    },
  });

  const lead = await prisma.user.upsert({
    where: { email: "lead@example.com" },
    update: {},
    create: {
      name: "Shift Lead Demo",
      email: "lead@example.com",
      passwordHash,
      role: "LEAD",
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      name: "Staff Demo",
      email: "staff@example.com",
      passwordHash,
      role: "STAFF",
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      name: "Manager Demo",
      email: "manager@example.com",
      passwordHash,
      role: "MANAGER",
      outletId: outlet.id,
    },
  });

  await prisma.quizAttempt.deleteMany({});
  await prisma.quizScenario.deleteMany({});
  const scenarios = getAllScenarios();
  await prisma.quizScenario.createMany({ data: scenarios });

  console.log("Seed complete:", {
    outlet: outlet.name,
    lead: lead.email,
    scenarios: scenarios.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
