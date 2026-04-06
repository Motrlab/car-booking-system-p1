"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const carOptions = {
  "تويوتا": ["كامري", "كورولا", "يارس", "هايلكس", "راف فور", "لاندكروزر", "برادو", "فورتشنر"],
  "نيسان": ["صني", "التيما", "ماكسيما", "باترول", "نافارا", "إكس تريل"],
  "هيونداي": ["أكسنت", "إلنترا", "سوناتا", "توسان", "كريتا", "باليسيد"],
  "كيا": ["بيجاس", "سيراتو", "K5", "سبورتاج", "سورينتو", "سيلتوس"],
  "لكزس": ["ES", "LS", "RX", "LX", "NX"],
  "فورد": ["توروس", "إيفرست", "إكسبلورر", "F-150"],
  "شفروليه": ["ماليبو", "تاهو", "سوبربان", "كابتيفا"],
  "جي إم سي": ["يوكن", "تيرين", "سييرا"],
  "مازدا": ["مازدا 3", "مازدا 6", "CX-5", "CX-9"],
  "هوندا": ["أكورد", "سيفيك", "CR-V", "بايلوت"],
  "جيب": ["جراند شيروكي", "رانجلر", "كومباس"],
  "دودج": ["تشارجر", "تشالنجر", "دورانجو"],
  "مرسيدس": ["C-Class", "E-Class", "S-Class", "GLE", "G-Class"],
  "بي إم دبليو": ["3 Series", "5 Series", "7 Series", "X5", "X7"],
  "أودي": ["A4", "A6", "Q5", "Q7"],
  "جينيسيس": ["G70", "G80", "G90", "GV70", "GV80"],
  "MG": ["MG5", "MG6", "ZS", "HS", "RX5"],
  "شانجان": ["السفن", "إيدو", "CS35", "CS75", "UNI-K"],
  "هافال": ["H6", "Jolion", "H9"],
  "تسلا": ["Model 3", "Model Y", "Model S", "Model X"],
};

export default function NewVehicleJobPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    carBrand: "",
    carType: "",
    plateNumber: "",
    carColor: "",
    carYear: "",
    odometer: "",
    serviceDetails: "",
    cost: "",
    workerId: "",
    expectedExitAt: "",
    notes: "",
  });

  const [files, setFiles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const availableModels = useMemo(() => {
    return formData.carBrand ? carOptions[formData.carBrand] || [] : [];
  }, [formData.carBrand]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch("/api/workers");
        const data = await res.json();

        if (data.success) {
          setWorkers(data.workers || []);
        }
      } catch (error) {
        console.error("failed to fetch workers", error);
      }
    };

    fetchWorkers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "carBrand") {
      setFormData((prev) => ({
        ...prev,
        carBrand: value,
        carType: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const convertArabicDigitsToEnglish = (value) => {
    return value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    const cleanedPhone = convertArabicDigitsToEnglish(formData.phone).replace(/\D/g, "");

    if (!/^05\d{8}$/.test(cleanedPhone)) {
      setErrorMessage("رقم الجوال غير صحيح");
      return;
    }

    if (!formData.customerName.trim()) {
      setErrorMessage("اسم العميل مطلوب");
      return;
    }

    if (!formData.workerId) {
      setErrorMessage("يرجى اختيار اسم العامل المسؤول");
      return;
    }

    if (!formData.carBrand.trim()) {
      setErrorMessage("شركة السيارة مطلوبة");
      return;
    }

    if (!formData.carType.trim()) {
      setErrorMessage("نوع السيارة مطلوب");
      return;
    }

    if (!formData.plateNumber.trim()) {
      setErrorMessage("رقم اللوحة مطلوب");
      return;
    }

    if (!formData.serviceDetails.trim()) {
      setErrorMessage("تفاصيل العمل مطلوبة");
      return;
    }

    if (!formData.cost || Number(formData.cost) <= 0) {
      setErrorMessage("التكلفة غير صحيحة");
      return;
    }

    try {
      setIsSubmitting(true);

      const body = new FormData();

      Object.entries({
        ...formData,
        phone: cleanedPhone,
      }).forEach(([key, value]) => {
        body.append(key, value ?? "");
      });

      files.forEach((file) => {
        body.append("images", file);
      });

const res = await fetch("/api/jobs", {
  method: "POST",
  body,
});

const text = await res.text();
console.log("jobs raw response:", text);

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error(text || "الرد ليس JSON");
}

if (!res.ok) {
  throw new Error(data.message || "فشل حفظ السجل");
}

      setSuccessMessage("تم تسجيل السيارة وحفظ الصور بنجاح");
      setFormData({
        customerName: "",
        phone: "",
        carBrand: "",
        carType: "",
        plateNumber: "",
        carColor: "",
        carYear: "",
        odometer: "",
        serviceDetails: "",
        cost: "",
        workerId: "",
        expectedExitAt: "",
        notes: "",
      });
      setFiles([]);
    } catch (error) {
      setErrorMessage(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page} dir="rtl">
      <div style={styles.card}>
        <h1 style={styles.title}>تسجيل دخول سيارة</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.rowTwo}>
            <input
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="اسم العميل"
              style={styles.input}
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="رقم الجوال"
              style={styles.input}
              inputMode="numeric"
            />
          </div>

          <div style={styles.rowTwo}>
            <select
              name="carBrand"
              value={formData.carBrand}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">شركة السيارة</option>
              {Object.keys(carOptions).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <select
              name="carType"
              value={formData.carType}
              onChange={handleChange}
              style={styles.input}
              disabled={!formData.carBrand}
            >
              <option value="">نوع السيارة</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.rowThree}>
            <input
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              placeholder="رقم اللوحة"
              style={styles.input}
            />
            <input
              name="carColor"
              value={formData.carColor}
              onChange={handleChange}
              placeholder="اللون"
              style={styles.input}
            />
            <input
              name="carYear"
              value={formData.carYear}
              onChange={handleChange}
              placeholder="سنة الصنع"
              style={styles.input}
              inputMode="numeric"
            />
          </div>

          <div style={styles.rowThree}>
            <input
              name="odometer"
              value={formData.odometer}
              onChange={handleChange}
              placeholder="العداد"
              style={styles.input}
              inputMode="numeric"
            />
            <input
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="التكلفة"
              type="number"
              style={styles.input}
            />
            <select
              name="workerId"
              value={formData.workerId}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">العامل المسؤول</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.fullName} - {worker.technicianType}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.rowSingle}>
            <input
              name="expectedExitAt"
              value={formData.expectedExitAt}
              onChange={handleChange}
              type="datetime-local"
              style={styles.input}
            />
          </div>

          <div style={styles.rowSingle}>
            <textarea
              name="serviceDetails"
              value={formData.serviceDetails}
              onChange={handleChange}
              placeholder="العمل المطلوب / الخدمات"
              style={styles.textarea}
            />
          </div>

          <div style={styles.rowSingle}>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="ملاحظات"
              style={styles.textarea}
            />
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>صور الدخول / التلفيات</label>

            <div style={styles.uploadButtonsRow}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => cameraInputRef.current?.click()}
              >
                التقاط صور من الكاميرا
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => galleryInputRef.current?.click()}
              >
                اختيار صور من الجهاز
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />

            {files.length > 0 && (
              <div style={styles.fileCount}>عدد الصور المختارة: {files.length}</div>
            )}

            {files.length > 0 && (
              <div style={styles.previewGrid}>
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} style={styles.previewCard}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={styles.previewImage}
                    />
                    <div style={styles.previewFooter}>
                      <div style={styles.previewName}>{file.name}</div>
                      <button
                        type="button"
                        style={styles.removeButton}
                        onClick={() => removeFile(index)}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ السجل"}
          </button>

          {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}
          {successMessage ? <div style={styles.success}>{successMessage}</div> : null}
        </form>
      </div>
    </main>
  );
}

const styles = {
  page: {
    padding: "24px",
    background: "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  card: {
    maxWidth: "860px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    marginTop: 0,
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  rowSingle: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  rowTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  rowThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
  },
  input: {
    minHeight: "46px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "15px",
    boxSizing: "border-box",
    width: "100%",
    background: "#fff",
  },
  textarea: {
    minHeight: "90px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
    width: "100%",
  },
  uploadBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "14px",
    background: "#fafafa",
  },
  uploadLabel: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  },
  uploadButtonsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "12px",
  },
  secondaryButton: {
    minHeight: "44px",
    border: "1px solid #111",
    borderRadius: "10px",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  fileCount: {
    marginTop: "8px",
    color: "#555",
    fontSize: "14px",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "10px",
    marginTop: "12px",
  },
  previewCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
    display: "block",
  },
  previewFooter: {
    padding: "8px",
    display: "grid",
    gap: "6px",
  },
  previewName: {
    fontSize: "12px",
    color: "#444",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  removeButton: {
    minHeight: "32px",
    border: "none",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  button: {
    minHeight: "48px",
    border: "none",
    borderRadius: "10px",
    background: "#111",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
  },
  success: {
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
  },
};