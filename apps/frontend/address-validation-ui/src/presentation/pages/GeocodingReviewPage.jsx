import { useEffect, useMemo, useState } from "react";
import { getValidationQueueUseCase } from "../../application/usecases/getValidationQueueUseCase";
import { suggestGeocodeUseCase, confirmGeocodeUseCase } from "../../application/usecases/geocodingUseCases";
import { StatusBadge } from "../components/StatusBadge";

export function GeocodingReviewPage() {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getValidationQueueUseCase().then((items) => {
      setQueue(items);
      setSelected(items[0] || null);
    });
  }, []);

  const unresolved = useMemo(
    () => queue.filter((x) => x.validationStatus !== "VALIDATED").length,
    [queue]
  );

  const onSuggest = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const response = await suggestGeocodeUseCase(selected.id);
      setCandidates(response);
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async (candidate) => {
    if (!selected) return;
    await confirmGeocodeUseCase(selected.id, candidate);
    setQueue((items) => items.map((i) => (i.id === selected.id ? { ...i, validationStatus: "VALIDATED" } : i)));
    setSelected((prev) => (prev ? { ...prev, validationStatus: "VALIDATED" } : prev));
  };

  return (
    <section>
      <div className="section-head">
        <h2>Geocoding Desk</h2>
        <p>
          Resolve flagged addresses one by one. Current unresolved records: <strong>{unresolved}</strong>
        </p>
      </div>

      <div className="review-layout">
        <aside className="card queue-list">
          {queue.map((item) => (
            <button
              key={item.id}
              className={selected?.id === item.id ? "queue-item active" : "queue-item"}
              onClick={() => {
                setSelected(item);
                setCandidates([]);
              }}
            >
              <div>
                <strong>{item.name}</strong>
                <p>{item.fullAddressRaw || "No address"}</p>
              </div>
              <StatusBadge status={item.validationStatus} />
            </button>
          ))}
        </aside>

        <div className="card review-panel">
          {!selected && <p>Select a queued record.</p>}
          {selected && (
            <>
              <h3>{selected.name}</h3>
              <p><strong>Current:</strong> {selected.fullAddressRaw}</p>
              <button className="primary" onClick={onSuggest} disabled={loading}>
                {loading ? "Requesting..." : "Request Suggestions"}
              </button>

              <div className="candidates">
                {candidates.length === 0 && <p className="muted">No candidates loaded yet.</p>}
                {candidates.map((candidate) => (
                  <article key={candidate.placeId} className="candidate">
                    <p><strong>{candidate.formattedAddress}</strong></p>
                    <p>Place ID: {candidate.placeId}</p>
                    <p>Lat/Lng: {candidate.latitude}, {candidate.longitude}</p>
                    <button className="primary" onClick={() => onConfirm(candidate)}>
                      Confirm Candidate
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
