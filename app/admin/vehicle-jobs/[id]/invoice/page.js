"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id;

  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      const res = await fetch(`/api/jobs/list/${id}`);
      const data = await res.json();
      if (data.success) setJob(data.job);
    };

    fetchJob();
  }, [id]);

  if (!job) return <div style={{ padding: 40 }}>جاري التحميل...</div>;

  const vatRate = 0.15;
  const total = Number(job.cost || 0);
  const subtotal = total / (1 + vatRate);
  const vat = total - subtotal;

  const invoiceNumber = `INV-${job.id.slice(0, 6).toUpperCase()}`;
  const date = new Date(job.createdAt);

  const qrData = `
Seller: MotrLab
VAT: 123456789
Date: ${date.toISOString()}
Total: ${total}
VAT: ${vat}
  `;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <main style={styles.page} dir="rtl">
      <style>{printStyle}</style>

      {/* زر الطباعة */}
      <div className="no-print" style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => window.print()} style={styles.printBtn}>
          🖨 طباعة الفاتورة
        </button>
      </div>

      <div style={styles.invoice}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.logoSection}>
            <img src="/logo.png" style={styles.logo} />
            <div>
              <div style={styles.company}>MotrLab</div>
              <div style={styles.small}>المملكة العربية السعودية</div>
              <div style={styles.small}>info@motrlab.com</div>
              <div style={styles.small}>الرقم الضريبي: 123456789</div>
            </div>
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={styles.title}>فاتورة ضريبية مبسطة</div>
            <div style={styles.titleEn}>Simplified Tax Invoice</div>

            <div style={styles.metaBox}>
              <div>رقم الفاتورة: {invoiceNumber}</div>
              <div>التاريخ: {date.toLocaleDateString("en-GB")}</div>
            </div>
          </div>
        </div>

        {/* CUSTOMER */}
        <div style={styles.customer}>
          <div>
            <div style={styles.label}>العميل</div>
            <div style={styles.customerName}>{job.customerName}</div>
          </div>

          <div style={styles.phone}>{job.phone}</div>
        </div>

        {/* INFO */}
        <div style={styles.infoGrid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>السيارة</div>
            <div>🚗 {job.carBrand} - {job.carType}</div>
            <div>🔢 {job.plateNumber}</div>
            <div>🎨 {job.carColor || "-"}</div>
            <div>📅 {job.carYear || "-"}</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>الخدمة</div>
            <div>👨‍🔧 {job.worker?.fullName || "-"}</div>
            <div>⚙️ {job.worker?.technicianType || "-"}</div>
            <div>📊 {job.status}</div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>الوصف</div>
          <div style={styles.description}>{job.serviceDetails}</div>
        </div>

        {/* TABLE */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th>الوصف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{job.serviceDetails}</td>
              <td>1</td>
              <td>{subtotal.toFixed(2)}</td>
              <td>{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* TOTALS + QR */}
        <div style={styles.bottom}>
          <div>
            <img src={qrUrl} style={styles.qr} />
          </div>

          <div style={styles.totals}>
            <div>قبل الضريبة: {subtotal.toFixed(2)} ريال</div>
            <div>الضريبة: {vat.toFixed(2)} ريال</div>
            <div style={styles.totalBig}>
              الإجمالي: {total.toFixed(2)} ريال
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>ملاحظات</div>
          <div style={styles.notes}>{job.notes || "لا يوجد"}</div>
        </div>

        {/* SIGN */}
        <div style={styles.sign}>
          <div>توقيع العميل</div>
          <div>توقيع الموظف</div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          شكراً لتعاملكم معنا
        </div>

      </div>
    </main>
  );
}

/* ================== STYLES ================== */

const styles = {
  page: {
    background: "#f3f4f6",
    padding: 30,
    fontFamily: "Arial"
  },

  invoice: {
    maxWidth: 900,
    margin: "auto",
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    border: "1px solid #ddd"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "2px solid #eee",
    paddingBottom: 20,
    marginBottom: 20
  },

  logoSection: {
    display: "flex",
    gap: 15
  },

  logo: {
    width: 70,
    height: 70,
    objectFit: "contain"
  },

  company: {
    fontWeight: "bold",
    fontSize: 18
  },

  small: {
    fontSize: 13,
    color: "#666"
  },

  title: {
    fontSize: 20,
    fontWeight: "bold"
  },

  titleEn: {
    fontSize: 13,
    color: "#888"
  },

  metaBox: {
    marginTop: 10,
    fontSize: 13
  },

  customer: {
    background: "#f9fafb",
    padding: 15,
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20
  },

  label: {
    fontSize: 12,
    color: "#777"
  },

  customerName: {
    fontSize: 18,
    fontWeight: "bold"
  },

  phone: {
    fontSize: 14
  },

  infoGrid: {
    display: "flex",
    gap: 10,
    marginBottom: 20
  },

  card: {
    flex: 1,
    background: "#f9fafb",
    padding: 15,
    borderRadius: 10
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10
  },

  section: {
    marginBottom: 20
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8
  },

  description: {
    background: "#f9fafb",
    padding: 15,
    borderRadius: 10
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 20
  },

  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  qr: {
    width: 120
  },

  totals: {
    textAlign: "left"
  },

  totalBig: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },

  notes: {
    background: "#f9fafb",
    padding: 10,
    borderRadius: 10
  },

  sign: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 30
  },

  footer: {
    textAlign: "center",
    marginTop: 30,
    color: "#666"
  },

  printBtn: {
    background: "#111",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer"
  }
};

const printStyle = `
@media print {
  .no-print { display: none !important; }
  body { margin: 0; }
}
`;