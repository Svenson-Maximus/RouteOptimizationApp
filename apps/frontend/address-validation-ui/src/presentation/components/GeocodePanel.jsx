export function GeocodePanel({ customer, candidates, loading, onSuggest, onConfirm }) {
  if (!customer) {
    return <div className="card">Select a customer from the queue.</div>;
  }

  return (
    <div className="card panel">
      <h3>{customer.name}</h3>
      <p><strong>Raw:</strong> {customer.fullAddressRaw}</p>
      <p><strong>Status:</strong> {customer.validationStatus}</p>
      <button onClick={onSuggest} disabled={loading}>
        {loading ? "Loading..." : "Suggest Geocode"}
      </button>

      <div className="candidates">
        {candidates.length === 0 && <p>No candidates loaded yet.</p>}
        {candidates.map((candidate) => (
          <article key={candidate.placeId} className="candidate">
            <p><strong>{candidate.formattedAddress}</strong></p>
            <p>Place ID: {candidate.placeId}</p>
            <p>Lat/Lng: {candidate.latitude}, {candidate.longitude}</p>
            <button onClick={() => onConfirm(candidate)}>Confirm</button>
          </article>
        ))}
      </div>
    </div>
  );
}
