import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        fullName: "asc",
      },
      select: {
        id: true,
        fullName: true,
        technicianType: true,
      },
    });

    return NextResponse.json({
      success: true,
      workers,
    });
  } catch (error) {
    console.error("GET /api/workers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر جلب العاملين",
      },
      { status: 500 }
    );
  }
}