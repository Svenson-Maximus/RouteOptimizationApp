import { useEffect, useMemo, useState } from "react";
import { getAllCustomersUseCase } from "../../application/usecases/getAllCustomersUseCase";
import { StatusBadge } from "../components/StatusBadge";

export function CustomersPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getAllCustomersUseCase().then(setRows);
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const validated = rows.filter((r) => r.validationStatus === "VALIDATED").length;
    const flagged = rows.filter((r) => r.validationStatus !== "VALIDATED").length;
    const see = rows.filter((r) => r.sourceSheet === "ZH1 See").length;
    const stadt = rows.filter((r) => r.sourceSheet === "ZH2 Stadt").length;
    return { total, validated, flagged, see, stadt };
  }, [rows]);

  return (
    <section>
      <div className="section-head">
        <h2>Customer Directory</h2>
        <p>Cards are collapsed by default. Expand only the records you need to inspect.</p>
      </div>

      <div className="mini-stats mini-stats-5">
        <article><strong>{stats.total}</strong><span>Total</span></article>
        <article><strong>{stats.validated}</strong><span>Validated</span></article>
        <article><strong>{stats.flagged}</strong><span>Open Flags</span></article>
        <article><strong>{stats.see}</strong><span>ZH1 See</span></article>
        <article><strong>{stats.stadt}</strong><span>ZH2 Stadt</span></article>
      </div>

      <div className="accordion-list">
        {rows.map((row) => (
          <details key={row.id} className="accordion-item">
            <summary>
              <div>
                <strong>{row.name}</strong>
                <p>{row.companyIndex}</p>
              </div>
              <StatusBadge status={row.validationStatus} />
            </summary>
            <div className="detail-grid">
              <p><span>Address</span>{row.fullAddressRaw || "-"}</p>
              <p><span>City</span>{row.city || "-"}</p>
              <p><span>Postal Code</span>{row.postalCode || "-"}</p>
              <p><span>Tour Type</span>{row.tourType || "-"}</p>
              <p><span>Tour Sheet</span>{row.sourceSheet || "-"}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
