import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const config = await prisma.brandingConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      // Return default config if not set
      return NextResponse.json({
        id: "default",
        appName: "The Service Stack",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e293b",
        accentColor: "#f97316",
        logoUrl: null,
        theme: "dark",
        fontFamily: "geist-sans",
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching branding config:", error);
    return NextResponse.json(
      { error: "Failed to fetch branding config" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    // Only admins/managers can update branding
    if (!user || (user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      appName,
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl,
      theme,
      fontFamily,
    } = body;

    const config = await prisma.brandingConfig.upsert({
      where: { id: "default" },
      update: {
        appName,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        theme,
        fontFamily,
      },
      create: {
        id: "default",
        appName,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        theme,
        fontFamily,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating branding config:", error);
    return NextResponse.json(
      { error: "Failed to update branding config" },
      { status: 500 }
    );
  }
}
