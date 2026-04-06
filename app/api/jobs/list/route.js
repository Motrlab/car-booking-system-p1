import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.vehicleJob.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        worker: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("GET jobs error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}