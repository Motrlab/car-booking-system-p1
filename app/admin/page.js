"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date();
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const cleanBookings = useMemo(() => {
    return bookings.filter((booking) => booking.customerName && booking.phone);
  }, [bookings]);

  const todayBookings = useMemo(() => {
    return cleanBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startOfToday && bookingDate <= endOfToday;
    });
  }, [cleanBookings, startOfToday, endOfToday]);

  const weekBookings = useMemo(() => {
    return cleanBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startOfWeek;
    });
  }, [cleanBookings, startOfWeek]);

  const monthBookings = useMemo(() => {
    return cleanBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startOfMonth;
    });
  }, [cleanBookings, startOfMonth]);

  const updateStatus = async (id, status) => {
  try {
    const res = await fetch("/api/bookings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();

    if (data.success) {
      fetchBookings(); // تحديث الجدول
    } else {
      alert(data.message || "فشل التحديث");
    }
  } catch (error) {
    console.error(error);
    alert("خطأ في الاتصال");
  }
};

  const upcomingBookings = useMemo(() => {
    return cleanBookings.filter((booking) => new Date(booking.bookingDate) >= now);
  }, [cleanBookings, now]);

  const previousBookings = useMemo(() => {
    return cleanBookings.filter((booking) => new Date(booking.bookingDate) < now);
  }, [cleanBookings, now]);

  const displayedBookings = useMemo(() => {
    if (activeFilter === "today") return todayBookings;
    if (activeFilter === "upcoming") return upcomingBookings;
    if (activeFilter === "previous") return previousBookings;
    return cleanBookings;
  }, [activeFilter, todayBookings, upcomingBookings, previousBookings, cleanBookings]);

  const getFilterTitle = () => {
    if (activeFilter === "today") return "حجوزات اليوم";
    if (activeFilter === "upcoming") return "الحجوزات الجديدة / القادمة";
    if (activeFilter === "previous") return "الحجوزات السابقة";
    return "كل الحجوزات";
  };

  const getStatusLabel = (status) => {
    const finalStatus = status || "pending";

    if (finalStatus === "pending") {
      return <span style={{ color: "#f59e0b", fontWeight: "bold" }}>⏳ جديد</span>;
    }

    if (finalStatus === "confirmed") {
      return <span style={{ color: "green", fontWeight: "bold" }}>✔ مؤكد</span>;
    }

    if (finalStatus === "cancelled") {
      return <span style={{ color: "red", fontWeight: "bold" }}>✖ ملغي</span>;
    }

    return <span>{finalStatus}</span>;
  };

  const getRowBackground = (status) => {
    const finalStatus = status || "pending";

    if (finalStatus === "confirmed") return "#f0fdf4";
    if (finalStatus === "cancelled") return "#fef2f2";
    return "#fffdf5";
  };

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial",
        background: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, textAlign: "center", width: "100%" }}>
            لوحة الحجوزات
          </h1>

          <button onClick={fetchBookings} style={refreshButtonStyle}>
            تحديث البيانات
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
            direction: "rtl",
          }}
        >
        <div style={cardStyle}>
            <div style={cardNumberStyle}>{todayBookings.length}</div>
            <div style={cardNumberStyle}>حجوزات اليوم</div>
          </div>

          <div style={cardStyle}>
            <div style={cardNumberStyle}>{weekBookings.length}</div>
            <div style={cardLabelStyle}>حجوزات الأسبوع</div>
          </div>

          <div style={cardStyle}>
            <div style={cardNumberStyle}>{monthBookings.length}</div>
            <div style={cardLabelStyle}>حجوزات الشهر</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <button
            style={activeFilter === "previous" ? activeTabStyle : tabStyle}
            onClick={() => setActiveFilter("previous")}
          >
            <span style={{ marginLeft: "6px" }}>⏪</span>
            السابقة
          </button>

          <button
            style={activeFilter === "today" ? activeTabStyle : tabStyle}
            onClick={() => setActiveFilter("today")}
          >
            📅 اليوم
          </button>

          <button
            style={activeFilter === "upcoming" ? activeTabStyle : tabStyle}
            onClick={() => setActiveFilter("upcoming")}
          >
            الجديدة / القادمة
            <span style={{ marginRight: "6px" }}>⏩</span>
          </button>

          <div style={{ marginLeft: "auto" }}></div>

          <button
            style={activeFilter === "all" ? activeTabStyle : tabStyle}
            onClick={() => setActiveFilter("all")}
          >
            <span style={{ marginLeft: "6px" }}>📋</span>
            الكل
          </button>
        </div>

        <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
          {getFilterTitle()}
        </h2>

        {loading ? (
          <div style={emptyStyle}>جاري تحميل الحجوزات...</div>
        ) : displayedBookings.length === 0 ? (
          <div style={emptyStyle}>لا توجد حجوزات في هذا القسم</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1000px",
              }}
            >
              <thead>
                <tr style={{ background: "#111", color: "#fff" }}>
                  <th style={thStyle}>العميل</th>
                  <th style={thStyle}>الجوال</th>
                  <th style={thStyle}>السيارة</th>
                  <th style={thStyle}>الخدمة</th>
                  <th style={thStyle}>الموعد</th>
                  <th style={thStyle}>الحالة</th>
                  <th style={thStyle}>التصنيف</th>
                  <th style={thStyle}>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {displayedBookings.map((booking) => {
                  const bookingDate = new Date(booking.bookingDate);
                  const isPrevious = bookingDate < now;
                  const finalStatus = booking.status || "pending";

                  return (
                    <tr
                      key={booking.id}
                      style={{ background: getRowBackground(finalStatus) }}
                    >
                      <td style={tdStyle}>{booking.customerName}</td>
                      <td style={tdStyle}>{booking.phone}</td>
                      <td style={tdStyle}>{booking.carType || "-"}</td>
                      <td style={tdStyle}>{booking.service || "-"}</td>
                      <td style={tdStyle}>
                        {bookingDate.toLocaleString("en-GB")}
                      </td>

                      <td style={tdStyle}>{getStatusLabel(finalStatus)}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            background: isPrevious ? "#fef2f2" : "#ecfdf3",
                            color: isPrevious ? "#991b1b" : "#166534",
                            border: isPrevious
                              ? "1px solid #fecaca"
                              : "1px solid #bbf7d0",
                          }}
                        >
                          {isPrevious ? "سابق" : "جديد / قادم"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {finalStatus === "pending" ? (
                          <>
                            <button
                              onClick={() => updateStatus(booking.id, "confirmed")}
                              style={confirmBtn}
                            >
                              ✔ تأكيد
                            </button>

                            <button
                              onClick={() => updateStatus(booking.id, "cancelled")}
                              style={cancelBtn}
                            >
                              ✖ إلغاء
                            </button>
                          </>
                        ) : finalStatus === "confirmed" ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>
                            تم التأكيد
                          </span>
                        ) : (
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            تم الإلغاء
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
};

const cardNumberStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  marginBottom: "8px",
  color: "#111",
};

const cardLabelStyle = {
  fontSize: "15px",
  textAlign: "center",
  color: "#555",
};

const tabStyle = {
  background: "#f3f4f6",
  color: "#111",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "14px",
};

const activeTabStyle = {
  background: "#111",
  color: "#fff",
  border: "1px solid #111",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "14px",
};

const refreshButtonStyle = {
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "14px",
};

const thStyle = {
  padding: "14px",
  border: "1px solid #ddd",
  textAlign: "center",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
};

const emptyStyle = {
  background: "#f8fafc",
  border: "1px dashed #cbd5e1",
  padding: "30px",
  borderRadius: "10px",
  textAlign: "center",
  color: "#666",
};

const confirmBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  marginLeft: "6px",
  borderRadius: "6px",
  cursor: "pointer",
};

const cancelBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};