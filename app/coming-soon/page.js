"use client";

import { useState } from "react";

export default function ComingSoonPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertArabicDigitsToEnglish = (value) => {
    return value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  };

  const normalizeName = (value) => {
    return value.replace(/\s+/g, " ").trim();
  };

  const isValidName = (name) => {
    const cleaned = normalizeName(name);
    const validChars = /^[A-Za-z\u0600-\u06FF\s]+$/;

    if (!validChars.test(cleaned)) return false;
    if (cleaned.length < 4 || cleaned.length > 50) return false;

    const words = cleaned.split(" ").filter(Boolean);
    return words.length >= 2 || cleaned.length >= 6;
  };

  const isValidPhone = (phone) => {
    const cleaned = convertArabicDigitsToEnglish(phone).replace(/\D/g, "");
    return /^05\d{8}$/.test(cleaned);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const normalized = convertArabicDigitsToEnglish(value).replace(/[^\d٠-٩]/g, "");
      setFormData((prev) => ({
        ...prev,
        phone: normalized.slice(0, 10),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    const name = normalizeName(formData.name);
    const phone = convertArabicDigitsToEnglish(formData.phone).replace(/\D/g, "");

    if (!isValidName(name)) {
      setErrorMessage("يرجى إدخال الاسم بشكل صحيح");
      return;
    }

    if (!isValidPhone(phone)) {
      setErrorMessage("يرجى إدخال رقم جوال صحيح مكوّن من 10 خانات");
      return;
    }

    try {
      setIsSubmitting(true);

      // مؤقتًا فقط
const res = await fetch("/api/leads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name,
    phone,
  }),
});

const data = await res.json();

if (!res.ok) {
  throw new Error("failed");
}
      setSuccessMessage("تم تسجيل اهتمامك بنجاح، وسيتم التواصل معك بعد الافتتاح");
      setFormData({
        name: "",
        phone: "",
      });
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء الإرسال، حاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <img src="/coming-soon.jpg" alt="MotrLab Coming Soon" style={styles.bg} />
      <div style={styles.overlay}></div>

      <div style={styles.contentWrap}>
        <div style={styles.formBox}>
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              type="text"
              placeholder="الاسم الكامل"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              autoComplete="name"
            />

            <input
              name="phone"
              type="tel"
              placeholder="05xxxxxxxx"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              inputMode="numeric"
              autoComplete="tel"
            />

            <button type="submit" style={styles.button} disabled={isSubmitting}>
              {isSubmitting ? "جاري الإرسال..." : "سجل اهتمامك الآن"}
            </button>

            {errorMessage ? (
              <div style={styles.errorMessage}>{errorMessage}</div>
            ) : null}

            {successMessage ? (
              <div style={styles.successMessage}>{successMessage}</div>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    overflow: "hidden",
    background: "#000",
  },

  bg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center top",
    backgroundColor: "#000",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 0, 0, 0.18)",
  },

  contentWrap: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: "24px 16px 88px",
    boxSizing: "border-box",
  },

  formBox: {
    width: "100%",
    maxWidth: "340px",
    background: "rgba(28, 28, 28, 0.58)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "18px",
    padding: "14px",
    boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    minHeight: "44px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #d9d9d9",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    outline: "none",
    textAlign: "right",
  },

  button: {
    width: "100%",
    minHeight: "46px",
    border: "none",
    borderRadius: "10px",
    background: "#d9b36b",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  errorMessage: {
    marginTop: "10px",
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "10px 12px",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  successMessage: {
    marginTop: "10px",
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "10px 12px",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "13px",
    lineHeight: 1.7,
  },
};