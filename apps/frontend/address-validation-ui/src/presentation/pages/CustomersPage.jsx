import { useEffect, useMemo, useState } from "react";
import {
  getAllCustomersUseCase,
  updateCustomerAddressUseCase,
} from "../../application/usecases/getAllCustomersUseCase";
import { StatusBadge } from "../components/StatusBadge";

export function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCustomersUseCase().then(setRows);
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const validated = rows.filter((r) => r.validationStatus === "VALIDATED").length;
    const flagged = rows.filter((r) => r.validationStatus !== "VALIDATED").length;
    const see = rows.filter((r) => r.routeGroup === "ZH1 See").length;
    const stadt = rows.filter((r) => r.routeGroup === "ZH2 Stadt").length;
    return { total, validated, flagged, see, stadt };
  }, [rows]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setDraft({
      fullAddressRaw: row.fullAddressRaw || "",
      street: row.street || "",
      buildingNo: row.buildingNo || "",
      postalCode: row.postalCode || "",
      city: row.city || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveAddress = async (row) => {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await updateCustomerAddressUseCase(row.id, draft);
      setRows((items) => items.map((item) => (item.id === row.id ? updated : item)));
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2>Customer Directory</h2>
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
              <p><span>Street</span>{row.street || "-"}</p>
              <p><span>Building No</span>{row.buildingNo || "-"}</p>
              <p><span>City</span>{row.city || "-"}</p>
              <p><span>Postal Code</span>{row.postalCode || "-"}</p>
              <p><span>Tour Type</span>{row.tourType || "-"}</p>
              <p><span>Route Group</span>{row.routeGroup || "-"}</p>
              <p><span>Note</span>{row.deliveryNotes || "-"}</p>
            </div>
            <div className="edit-address">
              {editingId === row.id && draft ? (
                <>
                  <label>
                    Full Address
                    <input
                      value={draft.fullAddressRaw}
                      onChange={(e) => setDraft((prev) => ({ ...prev, fullAddressRaw: e.target.value }))}
                    />
                  </label>
                  <label>
                    Street
                    <input
                      value={draft.street}
                      onChange={(e) => setDraft((prev) => ({ ...prev, street: e.target.value }))}
                    />
                  </label>
                  <label>
                    Building No
                    <input
                      value={draft.buildingNo}
                      onChange={(e) => setDraft((prev) => ({ ...prev, buildingNo: e.target.value }))}
                    />
                  </label>
                  <label>
                    Postal Code
                    <input
                      value={draft.postalCode}
                      onChange={(e) => setDraft((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </label>
                  <label>
                    City
                    <input
                      value={draft.city}
                      onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </label>
                  <div className="inline-actions">
                    <button className="primary" onClick={() => saveAddress(row)} disabled={saving}>
                      {saving ? "Saving..." : "Save Address"}
                    </button>
                    <button className="secondary" onClick={cancelEdit} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <button className="secondary" onClick={() => startEdit(row)}>
                  Edit Address
                </button>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
