"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function generateTLVBase64(sellerName, vatNumber, timestamp, total, tax) {
  const getBytes = (str) => new TextEncoder().encode(str);

  const buildTag = (tagNumber, value) => {
    const valueBytes = getBytes(value);
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

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id;

  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/list/${id}`);
        const data = await res.json();

        if (data.success) {
          setJob(data.job);
        }
      } catch (error) {
        console.error("failed to fetch invoice job", error);
      }
    };

    fetchJob();
  }, [id]);

  if (!job) {
    return <div style={{ padding: 40 }}>جاري تحميل الفاتورة...</div>;
  }

  const sellerName = "MotrLab";
  const vatNumber = "314671409900003";
  const invoiceNumber =
    job.invoiceNumber || `INV-${String(job.id).slice(0, 6).toUpperCase()}`;
  const issuedAt = new Date(job.createdAt);

  const total = Number(job.cost || 0);
  const subtotal = total / 1.15;
  const vatAmount = total - subtotal;

  const tlv = generateTLVBase64(
    sellerName,
    vatNumber,
    issuedAt.toISOString(),
    total.toFixed(2),
    vatAmount.toFixed(2)
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    tlv
  )}`;

  return (
    <main style={styles.page} dir="rtl">
      <style>{printStyles}</style>

      <div className="no-print" style={styles.topBar}>
        <button onClick={() => window.print()} style={styles.printButton}>
          🖨 طباعة الفاتورة
        </button>
      </div>

      <section style={styles.sheet}>
        <header style={styles.header}>
          <div style={styles.companyBlock}>
            <div style={styles.logoWrap}>
              <img src="/logo.png" alt="MotrLab Logo" style={styles.logo} />
            </div>

            <div style={styles.companyInfo}>
              <div style={styles.companyName}>MotrLab</div>
              <div style={styles.companySub}>مركز العناية الفائقة بالسيارات</div>
              <div style={styles.companyText}>المملكة العربية السعودية</div>
              <div style={styles.companyText}>info@motrlab.com</div>
              <div style={styles.companyText}>الرقم الضريبي: {vatNumber}</div>
              <div style={styles.companyText}>السجل التجاري: 7053817602</div>
            </div>
          </div>

          <div style={styles.invoiceBlock}>
            <div style={styles.invoiceTitleAr}>فاتورة ضريبية مبسطة</div>
            <div style={styles.invoiceTitleEn}>Simplified Tax Invoice</div>

            <div style={styles.metaCard}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>رقم الفاتورة</span>
                <span style={styles.metaValue}>{invoiceNumber}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>تاريخ الإصدار</span>
                <span style={styles.metaValue}>
                  {issuedAt.toLocaleDateString("en-GB")}
                </span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>وقت الإصدار</span>
                <span style={styles.metaValue}>
                  {issuedAt.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section style={styles.customerBanner}>
          <div>
            <div style={styles.bannerLabel}>اسم العميل</div>
            <div style={styles.bannerValue}>{job.customerName}</div>
          </div>

          <div>
            <div style={styles.bannerLabel}>رقم الجوال</div>
            <div style={styles.bannerValue}>{job.phone}</div>
          </div>
        </section>

        <section style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoCardTitle}>بيانات السيارة</div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>الشركة / النوع</span>
              <span style={styles.infoValue}>
                {job.carBrand} - {job.carType}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>رقم اللوحة</span>
              <span style={styles.infoValue}>{job.plateNumber}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>اللون</span>
              <span style={styles.infoValue}>{job.carColor || "-"}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>سنة الصنع</span>
              <span style={styles.infoValue}>{job.carYear || "-"}</span>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoCardTitle}>بيانات التنفيذ</div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>العامل المسؤول</span>
              <span style={styles.infoValue}>
                {job.worker?.fullName || "-"}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>نوع الفني</span>
              <span style={styles.infoValue}>
                {job.worker?.technicianType || "-"}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>الحالة</span>
              <span style={styles.infoValue}>{job.status || "-"}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>العداد</span>
              <span style={styles.infoValue}>{job.odometer || "-"}</span>
            </div>
          </div>
        </section>

        <section style={styles.descriptionSection}>
          <div style={styles.sectionHeader}>الوصف / الخدمة</div>
          <div style={styles.descriptionBox}>{job.serviceDetails}</div>
        </section>

        <section style={styles.tableSection}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thDescription}>الوصف</th>
                <th style={styles.thCenter}>الكمية</th>
                <th style={styles.thCenter}>السعر</th>
                <th style={styles.thCenter}>الإجمالي</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={styles.tdDescription}>{job.serviceDetails}</td>
                <td style={styles.tdCenter}>1</td>
                <td style={styles.tdCenter}>{subtotal.toFixed(2)}</td>
                <td style={styles.tdCenter}>{total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div style={styles.afterTableSpace}></div>

        <section style={styles.bottomGrid}>
          <div style={styles.qrCard}>
            <img src={qrUrl} alt="QR Code" style={styles.qrImage} />
            <div style={styles.qrLabel}>رمز الاستجابة السريعة</div>
          </div>

          <div style={styles.totalCard}>
            <div style={styles.totalRow}>
              <span>المجموع قبل الضريبة</span>
              <span>{subtotal.toFixed(2)} ريال</span>
            </div>

            <div style={styles.totalRow}>
              <span>ضريبة القيمة المضافة 15%</span>
              <span>{vatAmount.toFixed(2)} ريال</span>
            </div>

            <div style={styles.totalDivider}></div>

            <div style={styles.totalFinalRow}>
              <span>الإجمالي شامل الضريبة</span>
              <span>{total.toFixed(2)} ريال</span>
            </div>
          </div>
        </section>

        <section style={styles.notesSection}>
          <div style={styles.sectionHeader}>ملاحظات</div>
          <div style={styles.notesBox}>{job.notes || "لا توجد ملاحظات"}</div>
        </section>

        <section style={styles.signatures}>
          <div style={styles.signatureCard}>
            <div style={styles.signatureTitle}>توقيع العميل</div>
            <div style={styles.signatureLine}></div>
          </div>

          <div style={styles.signatureCard}>
            <div style={styles.signatureTitle}>توقيع الموظف</div>
            <div style={styles.signatureLine}></div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div>شكراً لتعاملكم معنا</div>
          <div>{invoiceNumber}</div>
        </footer>
      </section>
    </main>
  );
}

const styles = {
  page: {
    background: "#f3f5f8",
    minHeight: "100vh",
    padding: "16px",
    fontFamily: "Arial, sans-serif",
  },

  topBar: {
    maxWidth: "980px",
    margin: "0 auto 12px",
    display: "flex",
    justifyContent: "center",
  },

  printButton: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },

  sheet: {
    maxWidth: "980px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid #eef2f7",
  },

  companyBlock: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  logoWrap: {
    width: "74px",
    height: "74px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },

  logo: {
    width: "54px",
    height: "54px",
    objectFit: "contain",
  },

  companyInfo: {},

  companyName: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "3px",
  },

  companySub: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
  },

  companyText: {
    fontSize: "12px",
    color: "#4b5563",
    lineHeight: 1.6,
  },

  invoiceBlock: {
    minWidth: "250px",
    textAlign: "left",
  },

  invoiceTitleAr: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "2px",
  },

  invoiceTitleEn: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "8px",
  },

  metaCard: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "10px 12px",
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "6px",
    fontSize: "12px",
  },

  metaLabel: {
    color: "#6b7280",
  },

  metaValue: {
    fontWeight: "bold",
    color: "#111827",
  },

  customerBanner: {
    background: "#f3f4f6",
    color: "#111827",
    borderRadius: "14px",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "14px",
    border: "1px solid #e5e7eb",
  },

  bannerLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  },

  bannerValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "14px",
  },

  infoCard: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "12px",
  },

  infoCardTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "10px",
  },

  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    padding: "6px 0",
    borderBottom: "1px dashed #e5e7eb",
    fontSize: "12px",
  },

  infoLabel: {
    color: "#6b7280",
  },

  infoValue: {
    fontWeight: "bold",
    color: "#111827",
    textAlign: "left",
  },

  descriptionSection: {
    marginBottom: "12px",
  },

  sectionHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },

  descriptionBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px",
    background: "#f9fafb",
    lineHeight: 1.7,
    fontSize: "13px",
    color: "#111827",
  },

  tableSection: {
    marginTop: "6px",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "1px solid #dbe2ea",
    borderRadius: "12px",
    overflow: "hidden",
  },

  thDescription: {
    background: "#e5e7eb",
    color: "#111827",
    padding: "10px 12px",
    fontSize: "13px",
    textAlign: "right",
    width: "55%",
  },

  thCenter: {
    background: "#e5e7eb",
    color: "#111827",
    padding: "10px 12px",
    fontSize: "13px",
    textAlign: "center",
  },

  tdDescription: {
    padding: "12px",
    fontSize: "13px",
    lineHeight: 1.7,
    color: "#111827",
    textAlign: "right",
    borderTop: "1px solid #e5e7eb",
    background: "#fff",
  },

  tdCenter: {
    padding: "12px 10px",
    fontSize: "13px",
    color: "#111827",
    textAlign: "center",
    borderTop: "1px solid #e5e7eb",
    background: "#fff",
  },

  afterTableSpace: {
    height: "14px",
  },

  bottomGrid: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },

  qrCard: {
    width: "180px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "10px",
    textAlign: "center",
  },

  qrImage: {
    width: "115px",
    height: "115px",
    objectFit: "contain",
  },

  qrLabel: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "6px",
  },

  totalCard: {
    width: "300px",
    background: "#fafafa",
    border: "1px solid #dbe2ea",
    borderRadius: "14px",
    padding: "12px",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "13px",
    color: "#374151",
    marginBottom: "10px",
  },

  totalDivider: {
    borderTop: "1px solid #d1d5db",
    margin: "10px 0",
  },

  totalFinalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#111827",
  },

  notesSection: {
    marginBottom: "14px",
  },

  notesBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "10px 12px",
    lineHeight: 1.7,
    fontSize: "13px",
    color: "#111827",
  },

  signatures: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginTop: "10px",
  },

  signatureCard: {
    background: "#fff",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "12px",
    minHeight: "64px",
  },

  signatureTitle: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "14px",
  },

  signatureLine: {
    borderBottom: "1px solid #9ca3af",
    marginTop: "16px",
  },

  footer: {
    marginTop: "14px",
    paddingTop: "10px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#6b7280",
  },
};

const printStyles = `
@media print {
  .no-print {
    display: none !important;
  }

  html, body {
    background: #fff !important;
    margin: 0;
    padding: 0;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* 👇 أهم جزء */
  section {
    box-shadow: none !important;
    border: none !important;
      page-break-inside: avoid;
  }

  /* 👇 نخلي الورقة تملأ الصفحة */
  main {
    padding: 0 !important;
    background: #fff !important;
  }

  @page {
    size: A4;
    margin: 6mm; /* أقل شوي عشان تدخل صفحة وحده */
  }
}
`;