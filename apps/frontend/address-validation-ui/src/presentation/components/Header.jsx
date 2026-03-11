export function Header({
  showCustomers,
  showReview,
  showOptimization,
  onToggleCustomers,
  onToggleReview,
  onToggleOptimization,
}) {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Focus Project 2</p>
        <h1>Address and Optimization Console</h1>
        <p>
          End-to-end workflow preview: customer verification, geocoding review, and optimization run
          orchestration.
        </p>
      </div>

      <div className="hero-actions">
        <button className={showCustomers ? "action active" : "action"} onClick={onToggleCustomers}>
          {showCustomers ? "Hide Customers" : "Open Customers"}
        </button>
        <button className={showReview ? "action active" : "action"} onClick={onToggleReview}>
          {showReview ? "Hide Geocoding Desk" : "Open Geocoding Desk"}
        </button>
        <button className={showOptimization ? "action active" : "action"} onClick={onToggleOptimization}>
          {showOptimization ? "Hide Optimization" : "Open Optimization Studio"}
        </button>
      </div>
    </header>
  );
}
