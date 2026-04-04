import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const lead = await prisma.leads.create({
      data: {
        name: body.name,
        phone: body.phone,
      },
    });

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "خطأ في حفظ البيانات" },
      { status: 500 }
    );
  }
}