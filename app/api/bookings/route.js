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
      }
    });
    console.log("bookingDate : " || bookingDate.getDate());
      // تحويل الرقم إلى صيغة دولية
      const phone = booking.phone.startsWith("0")
        ? "966" + booking.phone.substring(1)
        : booking.phone;
      let whatsappSent = false;
      try {
        const bookingDate = new Date(body.date);

        const formattedDate = bookingDate.toLocaleDateString(
          body.lang === "en" ? "en-US" : "ar-SA"
        );

        const formattedTime = bookingDate.toLocaleTimeString(
          body.lang === "en" ? "en-US" : "ar-SA",
          {
            timeZone:"Asia/Riyadh",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );

        const serviceName =
          body.lang === "en"
            ? {
                "تلميع": "Polishing",
                "تظليل": "Window Tinting",
                "PPF": "PPF",
                "تنظيف تفصيلي": "Detailing",
              }[body.service] || body.service
            : body.service;

        let phone = String(body.phone).replace(/\D/g, "");
        if (phone.startsWith("05")) {
          phone = "966" + phone.substring(1);
        }

        const contentSid =
          body.lang === "en"
            ? process.env.TWILIO_TEMPLATE_EN
            : process.env.TWILIO_TEMPLATE_AR;

        await client.messages.create({
          from: "whatsapp:+14155238886",
          to: `whatsapp:+${phone}`,
          contentSid,
          contentVariables: JSON.stringify({
            "1": body.customerName,
            "2": serviceName,
            "3": formattedDate,
            "4": formattedTime,
          }),
        });
        console.log("WhatsApp sent successfully");
        whatsappSent = true;
    } catch (err) {
      console.error("WhatsApp error:", err);
    }

      console.log("Original phone:", body.phone);
      console.log("Formatted phone:", phone);
          return NextResponse.json({
            success: true,
            booking,
            whatsappSent,
          });
        }catch (error) {
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
        /*

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
  */
