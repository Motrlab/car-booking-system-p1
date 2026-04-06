"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function VehicleJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs/list");
      const data = await res.json();

      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("failed to fetch vehicle jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMeta = (status) => {
    if (status === "received") {
      return {
        label: "مستلمة",
        bg: "#fff7ed",
        color: "#c2410c",
        border: "#fdba74",
      };
    }

    if (status === "in_progress") {
      return {
        label: "قيد العمل",
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "#93c5fd",
      };
    }

    if (status === "ready") {
      return {
        label: "جاهزة",
        bg: "#ecfdf5",
        color: "#15803d",
        border: "#86efac",
      };
    }

    if (status === "delivered") {
      return {
        label: "تم التسليم",
        bg: "#f3f4f6",
        color: "#374151",
        border: "#d1d5db",
      };
    }

    return {
      label: status || "غير معروف",
      bg: "#f9fafb",
      color: "#111827",
      border: "#e5e7eb",
    };
  };

  const filteredJobs = useMemo(() => {
    if (activeFilter === "all") return jobs;
    return jobs.filter((job) => job.status === activeFilter);
  }, [jobs, activeFilter]);

  const receivedCount = useMemo(
    () => jobs.filter((job) => job.status === "received").length,
    [jobs]
  );

  const inProgressCount = useMemo(
    () => jobs.filter((job) => job.status === "in_progress").length,
    [jobs]
  );

  const readyCount = useMemo(
    () => jobs.filter((job) => job.status === "ready").length,
    [jobs]
  );

  const deliveredCount = useMemo(
    () => jobs.filter((job) => job.status === "delivered").length,
    [jobs]
  );

  return (
    <main style={styles.page} dir="rtl">
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>سجلات السيارات</h1>
            <p style={styles.subtitle}>
              متابعة السيارات المستلمة وحالة العمل والعامل المسؤول
            </p>
          </div>

          <div style={styles.headerActions}>
            <Link href="/admin/jobs/new">
              <button style={styles.primaryButton}>+ تسجيل سيارة جديدة</button>
            </Link>

            <button onClick={fetchJobs} style={styles.secondaryButton}>
              تحديث البيانات
            </button>
          </div>
        </div>

        <div style={styles.cardsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{jobs.length}</div>
            <div style={styles.statLabel}>إجمالي السجلات</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{receivedCount}</div>
            <div style={styles.statLabel}>مستلمة</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{inProgressCount}</div>
            <div style={styles.statLabel}>قيد العمل</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{readyCount}</div>
            <div style={styles.statLabel}>جاهزة</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{deliveredCount}</div>
            <div style={styles.statLabel}>تم التسليم</div>
          </div>
        </div>

        <div style={styles.filtersRow}>
          <button
            style={activeFilter === "all" ? styles.activeFilterButton : styles.filterButton}
            onClick={() => setActiveFilter("all")}
          >
            الكل
          </button>

          <button
            style={activeFilter === "received" ? styles.activeFilterButton : styles.filterButton}
            onClick={() => setActiveFilter("received")}
          >
            مستلمة
          </button>

          <button
            style={activeFilter === "in_progress" ? styles.activeFilterButton : styles.filterButton}
            onClick={() => setActiveFilter("in_progress")}
          >
            قيد العمل
          </button>

          <button
            style={activeFilter === "ready" ? styles.activeFilterButton : styles.filterButton}
            onClick={() => setActiveFilter("ready")}
          >
            جاهزة
          </button>

          <button
            style={activeFilter === "delivered" ? styles.activeFilterButton : styles.filterButton}
            onClick={() => setActiveFilter("delivered")}
          >
            تم التسليم
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyBox}>جاري تحميل السجلات...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={styles.emptyBox}>لا توجد سجلات في هذا القسم</div>
        ) : (
          <div style={styles.tableCard}>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>العميل</th>
                    <th style={styles.th}>السيارة</th>
                    <th style={styles.th}>اللوحة</th>
                    <th style={styles.th}>العامل</th>
                    <th style={styles.th}>التكلفة</th>
                    <th style={styles.th}>الحالة</th>
                    <th style={styles.th}>تاريخ الدخول</th>
                    <th style={styles.th}>إجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map((job) => {
                    const statusMeta = getStatusMeta(job.status);

                    return (
                      <tr key={job.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.mainText}>{job.customerName}</div>
                          <div style={styles.subText}>{job.phone}</div>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.mainText}>
                            {job.carBrand} {job.carType}
                          </div>
                          <div style={styles.subText}>
                            {job.carColor || "-"} / {job.carYear || "-"}
                          </div>
                        </td>

                        <td style={styles.td}>{job.plateNumber}</td>

                        <td style={styles.td}>
                          <div style={styles.mainText}>
                            {job.worker?.fullName || "-"}
                          </div>
                          <div style={styles.subText}>
                            {job.worker?.technicianType || ""}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.priceBadge}>{job.cost} ريال</span>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              borderColor: statusMeta.border,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {new Date(job.createdAt).toLocaleDateString("ar-SA")}
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button style={styles.viewButton}>تفاصيل</button>
                            <button style={styles.smallActionButton}>تحديث الحالة</button>
                            <Link href={`/admin/vehicle-jobs/${job.id}/invoice`}>
                            <button>🖨 فاتورة</button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f6fb",
    padding: "24px",
    fontFamily: "Arial",
  },
  wrapper: {
    maxWidth: "1300px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  secondaryButton: {
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
    border: "1px solid #eef2f7",
  },
  statNumber: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "6px",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },
  filtersRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  filterButton: {
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  activeFilterButton: {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
    border: "1px solid #eef2f7",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
  },
  tableHeadRow: {
    background: "#111827",
  },
  th: {
    color: "#fff",
    padding: "16px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  tr: {
    borderBottom: "1px solid #eef2f7",
  },
  td: {
    padding: "16px 12px",
    textAlign: "center",
    fontSize: "14px",
    color: "#111827",
    verticalAlign: "middle",
  },
  mainText: {
    fontWeight: "bold",
    marginBottom: "4px",
  },
  subText: {
    color: "#6b7280",
    fontSize: "12px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "bold",
  },
  priceBadge: {
    display: "inline-block",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    padding: "6px 12px",
    fontWeight: "bold",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  viewButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  smallActionButton: {
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  emptyBox: {
    background: "#fff",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
  },
};