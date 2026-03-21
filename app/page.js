"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    carType: "",
    service: "",
    date: new Date(),
  });

  const [bookedDates, setBookedDates] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

    if (isSameDay(selected, now)) {
      return now > workStart ? now : workStart;
    }

    return workStart;
  };

  const getMaxTime = () => {
    const selected = formData.date ? new Date(formData.date) : new Date();

    return new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
      23,
      30
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isTimeAvailable = (time) => {
    const currentNow = new Date();
    const selected = formData.date ? new Date(formData.date) : new Date();

    const isToday =
      selected.getFullYear() === currentNow.getFullYear() &&
      selected.getMonth() === currentNow.getMonth() &&
      selected.getDate() === currentNow.getDate();

    if (isToday) {
      if (time.getHours() < currentNow.getHours()) return false;

      if (
        time.getHours() === currentNow.getHours() &&
        time.getMinutes() < currentNow.getMinutes()
      ) {
        return false;
      }
    }

    return !bookedDates.some((booking) => {
      const booked = new Date(booking.bookingDate);

      return (
        booked.getFullYear() === selected.getFullYear() &&
        booked.getMonth() === selected.getMonth() &&
        booked.getDate() === selected.getDate() &&
        booked.getHours() === time.getHours() &&
        booked.getMinutes() === time.getMinutes() &&
        (booking.status || "pending") !== "cancelled"
      );
    });
  };

  const handleSubmit = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

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
          date: new Date(),
        });
      } else {
        setErrorMessage(data.message || "حدث خطأ ❌");
      }
    } catch (error) {
      console.error("submit error:", error);
      setErrorMessage("فيه خطأ أثناء الإرسال");
      setSuccessMessage("");
    }
  };

  return (
    <main className="booking-page">
      <div className="booking-card">
        <div className="booking-header">
          <img
          src="/logo.png"
          alt="Motrlab Logo"
          width={180}
          height={90}
          className="logo"
          property/>
          <h1>حجز موعد العناية بالسيارات</h1>
          <p>اختر الخدمة والوقت المناسب وأرسل طلبك بسهولة</p>
        </div>

        <form className="booking-form">
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

          <div className="date-wrapper">
            <DatePicker
              minDate={new Date()}
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              showTimeSelect
              timeIntervals={30}
              dateFormat="EEEE, dd MMMM yyyy - hh:mm aa"
              placeholderText={
                bookingsLoading ? "جاري تحميل المواعيد..." : "اختر التاريخ والوقت"
              }
              className="custom-date-input"
              wrapperClassName="full-width"
              filterTime={isTimeAvailable}
              minTime={getMinTime()}
              maxTime={getMaxTime()}
              disabled={bookingsLoading}
            />

            <span className="date-arrow">▼</span>
          </div>

          <button
            className="booking-button"
            type="button"
            onClick={handleSubmit}
          >
            حجز الموعد
          </button>

          {successMessage && (
            <div className="message-success">{successMessage}</div>
          )}

          {errorMessage && (
            <div className="message-error">{errorMessage}</div>
          )}
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "14px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  fontSize: "16px",
  width: "100%",
  minHeight: "52px",
  boxSizing: "border-box",
};