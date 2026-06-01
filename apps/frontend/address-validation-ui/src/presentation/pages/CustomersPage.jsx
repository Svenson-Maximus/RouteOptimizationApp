import { useEffect, useMemo, useState } from "react";
import {
  getAllCustomersUseCase,
  updateCustomerAddressUseCase,
} from "../../application/usecases/getAllCustomersUseCase";
import { StatusBadge } from "../components/StatusBadge";

const DAY_CONFIG = [
  ["monday", "Mon"],
  ["tuesday", "Tue"],
  ["wednesday", "Wed"],
  ["thursday", "Thu"],
  ["friday", "Fri"],
  ["saturday", "Sat"],
];

function toInputTime(value) {
  return value?.slice(0, 5) || "";
}

export function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllCustomersUseCase().then(setRows);
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const validated = rows.filter((r) => r.validationStatus === "VALIDATED").length;
    const flagged = rows.filter((r) => r.validationStatus !== "VALIDATED").length;
    const locationReview = rows.filter((r) => r.needsDeliveryAddressReview).length;
    return { total, validated, flagged, locationReview };
  }, [rows]);

  const visibleRows = useMemo(() => {
    let filteredRows = rows;
    if (filter === "validated") {
      filteredRows = rows.filter((r) => r.validationStatus === "VALIDATED");
    }
    if (filter === "open") {
      filteredRows = rows.filter((r) => r.validationStatus !== "VALIDATED");
    }
    if (filter === "location-review") {
      filteredRows = rows.filter((r) => r.needsDeliveryAddressReview);
    }
    const query = search.trim().toLowerCase();
    if (!query) {
      return filteredRows;
    }
    return filteredRows.filter((row) => [
      row.companyIndex,
      row.name,
      row.fullAddressRaw,
      row.street,
      row.buildingNo,
      row.city,
      row.postalCode,
      row.tourType,
      row.deliveryAddressNote,
      row.deliveryNotes,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [filter, rows, search]);

  const filterLabel = {
    all: "All customers",
    validated: "Validated customers",
    open: "Open flags",
    "location-review": "Location review",
  }[filter];

  const startEdit = (row) => {
    setEditingId(row.id);
    setDraft({
      fullAddressRaw: row.fullAddressRaw || "",
      street: row.street || "",
      buildingNo: row.buildingNo || "",
      postalCode: row.postalCode || "",
      city: row.city || "",
      needsDeliveryAddressReview: Boolean(row.needsDeliveryAddressReview),
      deliveryAddressReviewReason: row.deliveryAddressReviewReason || "",
      deliveryAddressNote: row.deliveryAddressNote || "",
      tourType: row.tourType || "",
      timeWindowStart: toInputTime(row.timeWindowStart),
      timeWindowEnd: toInputTime(row.timeWindowEnd),
      serviceTimeMinutes: row.serviceTimeMinutes ?? 5,
      deliveryNotes: row.deliveryNotes || "",
      ...DAY_CONFIG.reduce((acc, [key]) => ({
        ...acc,
        [key]: Boolean(row[key]),
        [`${key}DeliveryDemandUnits`]: row[`${key}DeliveryDemandUnits`] ?? 1,
        [`${key}PickupDemandUnits`]: row[`${key}PickupDemandUnits`] ?? 0,
      }), {}),
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
      const payload = {
        ...draft,
        serviceTimeMinutes: toNumber(draft.serviceTimeMinutes, 5),
        needsDeliveryAddressReview: Boolean(draft.needsDeliveryAddressReview),
        deliveryAddressReviewReason: draft.needsDeliveryAddressReview
          ? draft.deliveryAddressReviewReason
          : "",
      };
      DAY_CONFIG.forEach(([key]) => {
        payload[`${key}DeliveryDemandUnits`] = toNumber(draft[`${key}DeliveryDemandUnits`], 0);
        payload[`${key}PickupDemandUnits`] = toNumber(draft[`${key}PickupDemandUnits`], 0);
      });
      const updated = await updateCustomerAddressUseCase(row.id, payload);
      setRows((items) => items.map((item) => (item.id === row.id ? updated : item)));
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (value) => value?.slice(0, 5) || "-";
  const formatWindow = (start, end) => {
    if (!start && !end) {
      return "-";
    }
    return `${formatTime(start)} - ${formatTime(end)}`;
  };
  const formatDays = (row) => [
    ["Mon", row.monday],
    ["Tue", row.tuesday],
    ["Wed", row.wednesday],
    ["Thu", row.thursday],
    ["Fri", row.friday],
    ["Sat", row.saturday],
  ].filter(([, active]) => active).map(([label]) => label).join(", ") || "-";

  const formatDemand = (row, key) => {
    const delivery = row[`${key}DeliveryDemandUnits`] ?? 0;
    const pickup = row[`${key}PickupDemandUnits`] ?? 0;
    return `${delivery} out / ${pickup} back`;
  };

  const setDraftValue = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toNumber = (value, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  return (
    <section>
      <div className="section-head">
        <h2>Customer Directory</h2>
      </div>

      <div className="mini-stats">
        <button className={filter === "all" ? "stat-tile active" : "stat-tile"} type="button" onClick={() => setFilter("all")}>
          <strong>{stats.total}</strong><span>Total</span>
        </button>
        <button className={filter === "validated" ? "stat-tile active" : "stat-tile"} type="button" onClick={() => setFilter("validated")}>
          <strong>{stats.validated}</strong><span>Validated</span>
        </button>
        <button className={filter === "open" ? "stat-tile active" : "stat-tile"} type="button" onClick={() => setFilter("open")}>
          <strong>{stats.flagged}</strong><span>Open Flags</span>
        </button>
        <button className={filter === "location-review" ? "stat-tile active" : "stat-tile"} type="button" onClick={() => setFilter("location-review")}>
          <strong>{stats.locationReview}</strong><span>Location Review</span>
        </button>
      </div>

      <div className="filter-bar">
        <span>{filterLabel}: {visibleRows.length}</span>
        <input
          className="customer-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers"
        />
        {filter !== "all" && (
          <button className="secondary compact" onClick={() => setFilter("all")}>
            Clear Filter
          </button>
        )}
      </div>

      <div className="accordion-list">
        {visibleRows.map((row) => (
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
              <p><span>Address Type</span>{row.addressType || "DELIVERY"}</p>
              <p><span>Primary Delivery</span>{row.primaryDelivery ? "Yes" : "No"}</p>
              <p>
                <span>Delivery Location Review</span>
                {row.needsDeliveryAddressReview ? row.deliveryAddressReviewReason || "Required" : "No"}
              </p>
              <p><span>Delivery Address Note</span>{row.deliveryAddressNote || "-"}</p>
              <p><span>Street</span>{row.street || "-"}</p>
              <p><span>Building No</span>{row.buildingNo || "-"}</p>
              <p><span>City</span>{row.city || "-"}</p>
              <p><span>Postal Code</span>{row.postalCode || "-"}</p>
              <p><span>Tour Type</span>{row.tourType || "-"}</p>
              <p><span>Time Window</span>{formatWindow(row.timeWindowStart, row.timeWindowEnd)}</p>
              <p><span>Raw Time Window</span>{formatWindow(row.rawTimeWindowStart, row.rawTimeWindowEnd)}</p>
              <p><span>Service Time</span>{row.serviceTimeMinutes ? `${row.serviceTimeMinutes} min` : "-"}</p>
              <p><span>Delivery Days</span>{formatDays(row)}</p>
              <p><span>Mon Demand</span>{formatDemand(row, "monday")}</p>
              <p><span>Tue Demand</span>{formatDemand(row, "tuesday")}</p>
              <p><span>Wed Demand</span>{formatDemand(row, "wednesday")}</p>
              <p><span>Thu Demand</span>{formatDemand(row, "thursday")}</p>
              <p><span>Fri Demand</span>{formatDemand(row, "friday")}</p>
              <p><span>Sat Demand</span>{formatDemand(row, "saturday")}</p>
              <p><span>Time Window Note</span>{row.timeWindowNormalizationNote || "-"}</p>
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
                  <div className="review-editor">
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={draft.needsDeliveryAddressReview}
                        onChange={(e) => {
                          setDraft((prev) => ({
                            ...prev,
                            needsDeliveryAddressReview: e.target.checked,
                            deliveryAddressReviewReason: e.target.checked
                              ? prev.deliveryAddressReviewReason
                              : "",
                          }));
                        }}
                      />
                      Keep in location review
                    </label>
                    {draft.needsDeliveryAddressReview && (
                      <label>
                        Review Reason
                        <textarea
                          value={draft.deliveryAddressReviewReason}
                          onChange={(e) => setDraftValue("deliveryAddressReviewReason", e.target.value)}
                        />
                      </label>
                    )}
                  </div>
                  <label>
                    Delivery Address Note
                    <textarea
                      value={draft.deliveryAddressNote}
                      onChange={(e) => setDraftValue("deliveryAddressNote", e.target.value)}
                    />
                  </label>
                  <div className="edit-subgrid">
                    <label>
                      Tour Type
                      <input
                        value={draft.tourType}
                        onChange={(e) => setDraftValue("tourType", e.target.value)}
                      />
                    </label>
                    <label>
                      Service Time Minutes
                      <input
                        type="number"
                        min="0"
                        value={draft.serviceTimeMinutes}
                        onChange={(e) => setDraftValue("serviceTimeMinutes", e.target.value)}
                      />
                    </label>
                    <label>
                      Time Window Start
                      <input
                        type="time"
                        value={draft.timeWindowStart}
                        onChange={(e) => setDraftValue("timeWindowStart", e.target.value)}
                      />
                    </label>
                    <label>
                      Time Window End
                      <input
                        type="time"
                        value={draft.timeWindowEnd}
                        onChange={(e) => setDraftValue("timeWindowEnd", e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="day-demand-editor">
                    {DAY_CONFIG.map(([key, label]) => (
                      <div key={key} className="day-demand-row">
                        <label className="toggle-row">
                          <input
                            type="checkbox"
                            checked={draft[key]}
                            onChange={(e) => setDraftValue(key, e.target.checked)}
                          />
                          {label}
                        </label>
                        <label>
                          Deliver
                          <input
                            type="number"
                            min="0"
                            value={draft[`${key}DeliveryDemandUnits`]}
                            onChange={(e) => setDraftValue(`${key}DeliveryDemandUnits`, e.target.value)}
                          />
                        </label>
                        <label>
                          Pickup
                          <input
                            type="number"
                            min="0"
                            value={draft[`${key}PickupDemandUnits`]}
                            onChange={(e) => setDraftValue(`${key}PickupDemandUnits`, e.target.value)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                  <label>
                    Delivery Profile Note
                    <textarea
                      value={draft.deliveryNotes}
                      onChange={(e) => setDraftValue("deliveryNotes", e.target.value)}
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
                  Edit
                </button>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
