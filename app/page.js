"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    carType: "",
    service: "",
    date: null,
  });

  const [bookedDates, setBookedDates] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date();

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const getMinTime = () => {
  const selected = formData.date ? new Date(formData.date) : new Date();

  const workStart = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate(),
    9,
    0
  );

  // إذا اليوم الحالي، خذ الأكبر بين الآن و 9 صباحًا
  if (isSameDay(selected, now)) {
    return now > workStart ? now : workStart;
  }

  // الأيام القادمة تبدأ من 9 صباحًا
  return workStart;
};

const getMaxTime = () => {
  const selected = formData.date ? new Date(formData.date) : new Date();

  return new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate(),
    23,
    0
  );
};

  const fetchBookings = async () => {
  try {
    setBookingsLoading(true);

    const res = await fetch("/api/bookings");
    const data = await res.json();

    if (data.success) {
      setBookedDates(data.bookings || []);
    }
  } catch (error) {
    console.error("failed to fetch bookings:", error);
  } finally {
    setBookingsLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };



const isTimeAvailable = (time) => {
  const now = new Date();

  // إذا ما اختار المستخدم تاريخًا بعد، اعتبر اليوم الحالي
  const selected = formData.date ? new Date(formData.date) : new Date();

  const isToday =
    selected.getFullYear() === now.getFullYear() &&
    selected.getMonth() === now.getMonth() &&
    selected.getDate() === now.getDate();

  // منع الأوقات الماضية لليوم الحالي
  if (isToday) {
    if (time.getHours() < now.getHours()) return false;

    if (
      time.getHours() === now.getHours() &&
      time.getMinutes() < now.getMinutes()
    ) {
      return false;
    }
  }

  // منع الأوقات المحجوزة
  return !bookedDates.some((booking) => {
    const booked = new Date(booking.bookingDate);

    return (
      booked.getFullYear() === selected.getFullYear() &&
      booked.getMonth() === selected.getMonth() &&
      booked.getDate() === selected.getDate() &&
      booked.getHours() === time.getHours() &&
      booked.getMinutes() === time.getMinutes()
    );
  });
};  

  const handleSubmit = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");
       // ✅ التحقق من الحقول
        if (!formData.customerName.trim()) {
          setErrorMessage("اسم العميل مطلوب");
          return;
        }

        if (!formData.phone.trim()) {
          setErrorMessage("رقم الجوال مطلوب");
          return;
        }

        if (!formData.date) {
          setErrorMessage("يرجى اختيار التاريخ والوقت");
          return;
        }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("تم الحجز بنجاح ✅");
        setErrorMessage("");

        await fetchBookings();

        setFormData({
          customerName: "",
          phone: "",
          carType: "",
          service: "",
          date: null,
        });
      } else {
        setErrorMessage(data.message || "حدث خطأ ❌");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("submit error:", error);
      setErrorMessage("فيه خطأ أثناء الإرسال");
      setSuccessMessage("");
    }
  };

  return (
    <main
      style={{
        fontFamily: "Arial",
        background: "#f4f6f9",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>
          نظام حجز مواعيد العناية بالسيارات
        </h1>

        <p style={{ textAlign: "center", color: "#666" }}>احجز موعدك بسهولة</p>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <input
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="اسم العميل"
            style={inputStyle}
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="رقم الجوال"
            style={inputStyle}
          />

          <input
            name="carType"
            value={formData.carType}
            onChange={handleChange}
            placeholder="نوع السيارة"
            style={inputStyle}
          />

          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">اختر الخدمة</option>
            <option value="تلميع">تلميع</option>
            <option value="تظليل">تظليل</option>
            <option value="PPF">PPF</option>
            <option value="تنظيف تفصيلي">تنظيف تفصيلي</option>
          </select>

          <div style={{ position: "relative" }}>
            <DatePicker
              minDate={new Date()}
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              showTimeSelect
              timeIntervals={30}
              dateFormat="EEEE, dd MMMM yyyy - hh:mm aa"
              placeholderText="اختر التاريخ والوقت"
              className="custom-date-input"
              wrapperClassName="full-width"
              filterTime={isTimeAvailable}
               minTime={getMinTime()}
               maxTime={getMaxTime()}
              
            />

            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#666",
                fontSize: "12px",
              }}
            >
              ▼
            </span>
          </div>

          <button
            style={{
              background: "#111",
              color: "#fff",
              padding: "12px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            type="button"
            onClick={handleSubmit}
          >
            حجز الموعد
          </button>

          {successMessage && (
            <div
              style={{
                background: "#ecfdf3",
                color: "#166534",
                border: "1px solid #bbf7d0",
                padding: "12px",
                borderRadius: "6px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                padding: "12px",
                borderRadius: "6px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "14px",
  width: "100%",
};



