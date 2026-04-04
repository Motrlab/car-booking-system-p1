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
    date: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [lang, setLang] = useState("ar");
 const isArabic = lang === "ar";
  const inputStyle = {
  padding: "14px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  fontSize: "16px",
  width: "100%",
  minHeight: "52px",
  boxSizing: "border-box",
  textAlign: isArabic ? "right" : "left",
};

  const [bookedDates, setBookedDates] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const selectedDateForLogic = formData.date ? new Date(formData.date) : new Date();


   

    const t = {
      ar: {
        title: "حجز موعد العناية بالسيارات",
        subtitle: "اختر الخدمة والوقت المناسب وأرسل طلبك بسهولة",
        customerName: "اسم العميل",
        phone:"رقم الجوال (05xxxxxxxx)",
        carType: "نوع السيارة",
        service: "اختر الخدمة",
        date: "اختر التاريخ والوقت",
        loadingDates: "جاري تحميل المواعيد...",
        bookNow: "حجز الموعد",
        requiredName: "اسم العميل مطلوب",
        requiredPhone: "رقم الجوال مطلوب",
        invalidPhone: "رقم الجوال يجب أن يكون 10 أرقام",
        requiredDate: "يرجى اختيار التاريخ والوقت",
        //requiredService: "يرجى اختيار الخدمة",
        success: "تم الحجز بنجاح ✅",
        error: "حدث خطأ ❌",
        sendingError: "فيه خطأ أثناء الإرسال",
        polishing: "تلميع",
        tinting: "تظليل",
        ppf: "PPF",
        detailing: "تنظيف تفصيلي",
        langBtn: "EN",
        submitting: "جاري الحجز...",
      },
      en: {
        title: "Car Care Appointment Booking",
        subtitle: "Choose your service and preferred time easily",
        customerName: "Customer Name",
        phone: "Mobile Number (05xxxxxxxx)",
        carType: "Car Type",
        service: "Select Service",
        date: "Select date and time",
        loadingDates: "Loading available appointments...",
        bookNow: "Book Appointment",
        requiredName: "Customer name is required",
        requiredPhone: "Mobile number is required",
        invalidPhone: "Mobile number must be 10 digits",
        requiredDate: "Please select date and time",
       // requiredService: "Please sekect a services",
        success: "Booking completed successfully ✅",
        error: "An error occurred ❌",
        sendingError: "There was an error sending the request",
        polishing: "Polishing",
        tinting: "Window Tinting",
        ppf: "PPF",
        detailing: "Detailing",
        langBtn: "AR",
        submitting: "Booking...",
      }
    };

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
    const selected = selectedDateForLogic;

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
    const selected = selectedDateForLogic;

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
    const selected = selectedDateForLogic ;

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
      /*if (!formData.service) {
        setErrorMessage(t[lang].requiredService);
        return;
      }*/
       if (isSubmitting) return;
      setSuccessMessage("");
      setErrorMessage("");
      setIsSubmitting(true);
      if (!formData.customerName.trim()) {
          setErrorMessage(t[lang].requiredName);        return;
      }
      // تحويل الأرقام العربية إلى إنجليزية
  const convertArabicToEnglish = (num) => {
      return num.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    };

    // تنظيف الرقم (إزالة المسافات)
    const cleanedPhone = convertArabicToEnglish(formData.phone).replace(/\s/g, "");

    // التحقق
    if (!cleanedPhone) {
      setErrorMessage(t[lang].requiredPhone);
      return;
    }

    if (!/^\d{10}$/.test(cleanedPhone)) {
      setErrorMessage(t[lang].invalidPhone);
      return;
    }



      if (!formData.phone.trim()) {
      setErrorMessage(t[lang].requiredPhone);
        return;
      }

      if (!formData.date) {
      setErrorMessage(t[lang].requiredDate);        return;
      }
      const updatedForm = {
        ...formData,
        phone: cleanedPhone,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...updatedForm,
            lang,
          }),
      });

      const data = await res.json();

     if (res.ok) {
      if (data.whatsappSent) {
        setSuccessMessage(
          lang === "en"
            ? "Booking confirmed and WhatsApp sent ✅"
            : "تم تأكيد الحجز وتم إرسال واتساب ✅"
        );
      } else {
        setSuccessMessage(
          lang === "en"
            ? "Booking confirmed but WhatsApp failed ⚠️"
            : "تم الحجز لكن فشل إرسال واتساب ⚠️"
        );
      }

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
        //setErrorMessage(data.message || "حدث خطأ ❌");
          setErrorMessage(data.message || t[lang].error);console.error("submit response:", data);
      }
    } catch (error) {
      console.error("submit error:", error);
          setErrorMessage(t[lang].sendingError);      setSuccessMessage("");
    }
    finally{ 
      setIsSubmitting(false);
    }
  };

  return (
    <main className="booking-page"
     dir={isArabic ? "rtl" : "ltr"}
     >
      <div className="booking-card">
        <div className="lang-switcher">
          <button
            type="button"
            className="lang-button"
            onClick={() => setLang(isArabic ? "en" : "ar")}
          >
            {t[lang].langBtn}
          </button>
        </div>
        <div className="booking-header">
          <img
          src="/logo.png"
          alt="Motrlab Logo"
          width={180}
          height={90}
          className="logo"
          property/>
          <h1>{t[lang].title}</h1>
          <p>{t[lang].subtitle}</p>
        </div>

        <form className="booking-form">
          <input
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder={t[lang].customerName}
            style={inputStyle}
          />

         <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t[lang].phone}
            style={inputStyle}
            inputMode="numeric"
          />

          <input
            name="carType"
            value={formData.carType}
            onChange={handleChange}
            placeholder={t[lang].carType}
            style={inputStyle}
          />
      <select
  name="service"
  value={formData.service}
  onChange={handleChange}
  style={inputStyle}
>
  <option value="">{t[lang].service}</option>
  <option value="تلميع">{t[lang].polishing}</option>
  <option value="تظليل">{t[lang].tinting}</option>
  <option value="PPF">{t[lang].ppf}</option>
  <option value="تنظيف تفصيلي">{t[lang].detailing}</option>
</select>

  {/* <div className="services-section">
        <label className="services-label">{t[lang].service}</label>

        <div className="services-grid">
          <button
            type="button"
            className={`service-card ${formData.service === "تلميع" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, service: "تلميع" })}
          >
            <span className="service-icon">✨</span>
            <span className="service-title">{t[lang].polishing}</span>
          </button>

          <button
            type="button"
            className={`service-card ${formData.service === "تظليل" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, service: "تظليل" })}
          >
            <span className="service-icon">🕶️</span>
            <span className="service-title">{t[lang].tinting}</span>
          </button>

          <button
            type="button"
            className={`service-card ${formData.service === "PPF" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, service: "PPF" })}
          >
            <span className="service-icon">🛡️</span>
            <span className="service-title">{t[lang].ppf}</span>
          </button>

          <button
            type="button"
            className={`service-card ${formData.service === "تنظيف تفصيلي" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, service: "تنظيف تفصيلي" })}
          >
            <span className="service-icon">🧼</span>
            <span className="service-title">{t[lang].detailing}</span>
          </button>
        </div>
      </div> 
      */}

          <div className="date-wrapper">
            <DatePicker
              minDate={new Date()}
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              showTimeSelect
              timeIntervals={30}
              dateFormat="EEEE, dd MMMM yyyy - hh:mm aa"
             placeholderText={
                  bookingsLoading ? t[lang].loadingDates : t[lang].date
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
            disabled={isSubmitting}
          >
            <span className="button-content">
              {isSubmitting && <span className="button-spinner"></span>}
              <span>{isSubmitting ? t[lang].submitting : t[lang].bookNow}</span>
            </span>
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

