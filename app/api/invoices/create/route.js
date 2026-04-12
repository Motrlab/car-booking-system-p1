import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import crypto from "crypto";

function generateTLVBase64(sellerName, vatNumber, timestamp, total, tax) {
  const getBytes = (str) => new TextEncoder().encode(str);

  const buildTag = (tagNumber, value) => {
    const valueBytes = getBytes(String(value));
    return Uint8Array.from([tagNumber, valueBytes.length, ...valueBytes]);
  };

  const tags = [
    buildTag(1, sellerName),
    buildTag(2, vatNumber),
    buildTag(3, timestamp),
    buildTag(4, total),
    buildTag(5, tax),
  ];

  const totalLength = tags.reduce((sum, tag) => sum + tag.length, 0);
  const buffer = new Uint8Array(totalLength);

  let offset = 0;
  for (const tag of tags) {
    buffer.set(tag, offset);
    offset += tag.length;
  }

  let binary = "";
  buffer.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  return btoa(binary);
}

async function generateMonthlySequence(tx) {
  const now = new Date();

  const year = now.getFullYear() % 100; // 26
  const month = now.getMonth() + 1; // 04

  let record = await tx.invoiceSequence.findFirst({
    where: { year, month },
  });

  let nextNumber = 1;

  if (!record) {
    record = await tx.invoiceSequence.create({
      data: {
        year,
        month,
        lastNumber: 1,
      },
    });
  } else {
    nextNumber = record.lastNumber + 1;

    await tx.invoiceSequence.update({
      where: { id: record.id },
      data: {
        lastNumber: nextNumber,
      },
    });
  }

  const formatted = `${String(year).padStart(2, "0")}${String(month).padStart(2, "0")}${String(nextNumber).padStart(3, "0")}`;

  return {
    invoiceSequence: nextNumber,
    invoiceSequenceFormatted: formatted,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const jobId = body.jobId?.toString();

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "jobId مطلوب" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.vehicleJob.findUnique({
        where: { id: jobId },
        include: {
          worker: true,
        },
      });

      if (!job) {
        throw new Error("JOB_NOT_FOUND");
      }

      const existingInvoice = await tx.invoice.findFirst({
        where: { jobId },
      });

      if (existingInvoice) {
        throw new Error("INVOICE_ALREADY_EXISTS");
      }

      const { invoiceSequence, invoiceSequenceFormatted } =
        await generateMonthlySequence(tx);

      const issuedAt = new Date();
      const total = Number(job.cost || 0);
      const subtotal = total / 1.15;
      const vatAmount = total - subtotal;

      const sellerName = "MotrLab";
      const vatNumber = "314671409900003";

      const qrCode = generateTLVBase64(
        sellerName,
        vatNumber,
        issuedAt.toISOString(),
        total.toFixed(2),
        vatAmount.toFixed(2)
      );

      // هذا الرقم الظاهر للعميل
      const invoiceNumber =
        job.invoiceNumber || `INV-${String(job.id).slice(0, 6).toUpperCase()}`;

      const invoice = await tx.invoice.create({
        data: {
          id: crypto.randomUUID(),
          jobId: job.id,

          invoiceNumber,
          invoiceSequence,
          invoiceSequenceFormatted,

          customerName: job.customerName,
          customerPhone: job.phone,

          carBrand: job.carBrand || null,
          carType: job.carType || null,
          plateNumber: job.plateNumber || null,
          vinLast6: job.vinLast6 || null,

          serviceDetails: job.serviceDetails || null,

          subtotal: Number(subtotal.toFixed(2)),
          vatAmount: Number(vatAmount.toFixed(2)),
          total: Number(total.toFixed(2)),

          qrCode,
          status: "issued",
          issuedAt,
        },
      });

      return invoice;
    });

    return NextResponse.json({
      success: true,
      invoice: result,
    });
  } catch (error) {
    console.error("POST /api/invoices/create error:", error);

    if (error.message === "JOB_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "العملية غير موجودة" },
        { status: 404 }
      );
    }

    if (error.message === "INVOICE_ALREADY_EXISTS") {
      return NextResponse.json(
        { success: false, message: "تم إنشاء فاتورة مسبقًا لهذه العملية" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إنشاء الفاتورة" },
      { status: 500 }
    );
  }
}