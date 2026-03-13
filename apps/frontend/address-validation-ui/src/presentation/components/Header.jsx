export function Header({
  activeSection,
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
        <button
          className={activeSection === "customers" ? "action active" : "action"}
          onClick={onToggleCustomers}
        >
          Customers
        </button>
        <button
          className={activeSection === "geocoding" ? "action active" : "action"}
          onClick={onToggleReview}
        >
          Geocoding Desk
        </button>
        <button
          className={activeSection === "route-planner" ? "action active" : "action"}
          onClick={onToggleOptimization}
        >
          Route Planner
        </button>
      </div>
    </header>
  );
}
