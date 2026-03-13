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
        <h1>Bakery Optimization Platform</h1>
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
