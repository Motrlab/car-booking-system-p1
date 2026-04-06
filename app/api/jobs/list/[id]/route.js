import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req, context) {
  try {
    const { id } = await context.params;

    const job = await prisma.vehicleJob.findUnique({
      where: { id },
      include: {
        worker: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "السجل غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("GET /api/jobs/list/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب السجل" },
      { status: 500 }
    );
  }
}