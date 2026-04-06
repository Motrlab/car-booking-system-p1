"use client";

import { useEffect, useState } from "react";

const services = [
  "عزل حراري",
  "حماية PPF",
  "نانو سيراميك",
  "بكجات تلميع",
  "بكجات تنظيف داخلي",
];

export default function ComingSoonPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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

      await res.json();

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
      <style>{`
        @keyframes servicesMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <img src="/coming-soon.jpg" alt="MotrLab Coming Soon" style={styles.bg} />
      <div style={styles.overlay}></div>

      <div style={styles.contentWrap}>
        <div
          style={{
            ...styles.formBox,
            transform: isMobile ? "translateY(-120px)" : "translateY(-20px)",
          }}
        >
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

      <div style={styles.servicesBar}>
        <div style={styles.servicesFadeLeft}></div>
        <div style={styles.servicesFadeRight}></div>

        <div style={styles.servicesTrack}>
          {[...services, ...services, ...services].map((service, index) => (
            <div key={`${service}-${index}`} style={styles.serviceItem}>
              <span style={styles.serviceDot}></span>
              <span>{service}</span>
            </div>
          ))}
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
    padding: "24px 16px 120px",
    boxSizing: "border-box",
  },

  formBox: {
    width: "100%",
    maxWidth: "340px",
    background: "rgba(28, 28, 28, 0.58)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    minHeight: "52px",
    marginBottom: "14px",
    borderRadius: "12px",
    border: "1px solid #d9d9d9",
    background: "#fff",
    color: "#111",
    fontSize: "15px",
    outline: "none",
    textAlign: "right",
  },

  button: {
    width: "100%",
    minHeight: "54px",
    border: "none",
    borderRadius: "12px",
    background: "#d9b36b",
    color: "#fff",
    fontSize: "16px",
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

  servicesBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 3,
    overflow: "hidden",
    background: "rgba(10, 10, 10, 0.82)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 0",
  },

  servicesTrack: {
    display: "flex",
    width: "max-content",
    animation: "servicesMarquee 24s linear infinite",
  },

  serviceItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    padding: "0 22px",
  },

  serviceDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#d9b36b",
    display: "inline-block",
    flexShrink: 0,
  },

  servicesFadeLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60px",
    height: "100%",
    background: "linear-gradient(to right, rgba(10,10,10,0.95), rgba(10,10,10,0))",
    zIndex: 2,
    pointerEvents: "none",
  },

  servicesFadeRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "60px",
    height: "100%",
    background: "linear-gradient(to left, rgba(10,10,10,0.95), rgba(10,10,10,0))",
    zIndex: 2,
    pointerEvents: "none",
  },
};