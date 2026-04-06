import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const customerName = formData.get("customerName")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const carBrand = formData.get("carBrand")?.toString() || "";
    const carType = formData.get("carType")?.toString() || "";
    const plateNumber = formData.get("plateNumber")?.toString() || "";
    const carColor = formData.get("carColor")?.toString() || "";
    const carYear = formData.get("carYear")?.toString() || "";
    const odometer = formData.get("odometer")?.toString() || "";
    const serviceDetails = formData.get("serviceDetails")?.toString() || "";
    const cost = Number(formData.get("cost") || 0);
    const workerId = formData.get("workerId")?.toString() || "";
    const expectedExitAtRaw = formData.get("expectedExitAt")?.toString() || "";
    const notes = formData.get("notes")?.toString() || "";

    if (
      !customerName ||
      !phone ||
      !carBrand ||
      !carType ||
      !plateNumber ||
      !serviceDetails ||
      !cost
    ) {
      return NextResponse.json(
        { success: false, message: "بيانات غير مكتملة" },
        { status: 400 }
      );
    }

    const expectedExitAt = expectedExitAtRaw ? new Date(expectedExitAtRaw) : null;
    const files = formData.getAll("images");

    const job = await prisma.vehicleJob.create({
      data: {
        customerName,
        phone,
        carBrand,
        carType,
        plateNumber,
        carColor: carColor || null,
        carYear: carYear || null,
        odometer: odometer || null,
        serviceDetails,
        cost,
        workerId: workerId || null,
        expectedExitAt,
        notes: notes || null,
        status: "received",
      },
    });

    for (const file of files) {
      if (typeof file === "object" && file && "arrayBuffer" in file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await prisma.vehicleImage.create({
          data: {
            jobId: job.id,
            fileName: file.name || "image",
            mimeType: file.type || "application/octet-stream",
            category: "general",
            data: buffer,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
    });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء حفظ السجل" },
      { status: 500 }
    );
  }
}