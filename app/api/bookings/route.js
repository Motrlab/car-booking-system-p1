import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        bookingDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "تعذر جلب الحجوزات" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { success: false, message: "بيانات غير مكتملة" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id: body.id },
      data: { status: body.status },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, message: "خطأ في تحديث الحالة" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const bookingDate = new Date(body.date);
    bookingDate.setSeconds(0, 0);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        bookingDate,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الموعد محجوز مسبقًا",
        },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        customerName: body.customerName,
        phone: body.phone,
        carType: body.carType,
        service: body.service,
        bookingDate,
      },
    });
    console.log("bookingDate : " || bookingDate.getDate());
      // تحويل الرقم إلى صيغة دولية
      const phone = booking.phone.startsWith("0")
        ? "966" + booking.phone.substring(1)
        : booking.phone;

      try {
        const bookingDate = new Date(body.date);

        const formattedDate = bookingDate.toLocaleDateString(
          body.lang === "en" ? "en-US" : "ar-SA"      );

        const formattedTime = bookingDate.toLocaleTimeString(
          body.lang === "en" ? "en-US" : "ar-SA",
          {
            timeZone:"Asia/Riyadh",
            hour: "2-digit",
            minute: "2-digit",
          }
        );
  const message =
          body.lang === "en"
            ? `Hello ${body.customerName} 👋

        Your booking has been confirmed at MotrLab 🚗

        Service: ${body.service}
        Date: ${formattedDate}
        Time: ${formattedTime}

        Thank you 🙏`
            : `مرحبا ${body.customerName} 👋

        تم تأكيد حجزك في MotrLab 🚗

        الخدمة: ${body.service}
        التاريخ: ${formattedDate}
        الوقت: ${formattedTime}

        شكراً لثقتك 🙏`;
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:+${phone}`,
    body: message
  });
  console.log("WhatsApp sent successfully");
} catch (whatsErr) {
  console.error("WhatsApp error:", whatsErr);
}

console.log("Original phone:", body.phone);
console.log("Formatted phone:", phone);
    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حفظ الحجز",
      },
      { status: 500 }
    );
  }
}