import { useEffect, useMemo, useState } from "react";
import { getAllCustomersUseCase } from "../../application/usecases/getAllCustomersUseCase";

function fakeRun(config, customers) {
  const eligible = customers.filter((c) => {
    if (c.validationStatus !== "VALIDATED") {
      return false;
    }
    if (config.routeGroup !== "all" && c.routeGroup !== config.routeGroup) {
      return false;
    }
    if (!config.includeTk && c.tourType === "TK") {
      return false;
    }
    return true;
  }).length;
  return {
    runId: `run-${Date.now()}`,
    objectiveValue: 25596,
    totalDurationMinutes: 471,
    vehiclesUsed: Number(config.vehicles),
    eligibleStops: eligible,
    droppedStops: Math.max(0, eligible - 38),
    routeSummary: [
      { vehicle: "Vehicle 0", stops: 17, etaReturn: "07:25" },
      { vehicle: "Vehicle 1", stops: 21, etaReturn: "09:06" },
    ],
  };
}

export function OptimizationStudioPage() {
  const [customers, setCustomers] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [config, setConfig] = useState({
    day: "monday",
    vehicles: 2,
    includeTk: true,
    objective: "time_windows_first",
    routeGroup: "all",
  });

  useEffect(() => {
    getAllCustomersUseCase().then(setCustomers);
  }, []);

  const readyCount = useMemo(
    () => customers.filter((c) => c.validationStatus === "VALIDATED").length,
    [customers]
  );

  const runSimulation = async () => {
    setRunning(true);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setResult(fakeRun(config, customers));
    setRunning(false);
  };

  return (
    <section>
      <div className="section-head">
        <h2>Route Planner (UI Preview)</h2>
        <p>Future orchestration flow: configure run, trigger optimization, inspect route output.</p>
      </div>

      <div className="optimization-grid">
        <div className="card config-card">
          <h3>Run Configuration</h3>
          <label>
            Delivery Day
            <select value={config.day} onChange={(e) => setConfig((p) => ({ ...p, day: e.target.value }))}>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
          </label>

          <label>
            Route Group
            <select value={config.routeGroup} onChange={(e) => setConfig((p) => ({ ...p, routeGroup: e.target.value }))}>
              <option value="all">All</option>
              <option value="ZH1 See">ZH1 See</option>
              <option value="ZH2 Stadt">ZH2 Stadt</option>
            </select>
          </label>

          <label>
            Vehicles
            <input
              type="number"
              min="1"
              max="10"
              value={config.vehicles}
              onChange={(e) => setConfig((p) => ({ ...p, vehicles: e.target.value }))}
            />
          </label>

          <label>
            Objective Mode
            <select
              value={config.objective}
              onChange={(e) => setConfig((p) => ({ ...p, objective: e.target.value }))}
            >
              <option value="time_windows_first">Time windows first</option>
              <option value="balanced_routes">Balanced routes</option>
              <option value="min_distance">Min distance</option>
            </select>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={config.includeTk}
              onChange={(e) => setConfig((p) => ({ ...p, includeTk: e.target.checked }))}
            />
            Include TK customers
          </label>

          <button className="primary" onClick={runSimulation} disabled={running || readyCount === 0}>
            {running ? "Calculating..." : "Calculate Best Tour"}
          </button>
        </div>

        <div className="card readiness-card">
          <h3>Readiness Gate</h3>
          <p><strong>{readyCount}</strong> validated customers ready for optimization.</p>
          <ul>
            <li>Address status must be `VALIDATED`</li>
            <li>Geocoding confirmation should exist</li>
            <li>Time-window constraints must be defined for the selected day</li>
          </ul>
        </div>
      </div>

      {result && (
        <div className="card result-card">
          <h3>Optimization Result (Preview)</h3>
          <div className="result-kpis">
            <article><span>Run ID</span><strong>{result.runId}</strong></article>
            <article><span>Objective</span><strong>{result.objectiveValue}</strong></article>
            <article><span>Total Duration</span><strong>{result.totalDurationMinutes} min</strong></article>
            <article><span>Dropped Stops</span><strong>{result.droppedStops}</strong></article>
          </div>

          <div className="route-preview">
            {result.routeSummary.map((route) => (
              <article key={route.vehicle}>
                <h4>{route.vehicle}</h4>
                <p>Stops: {route.stops}</p>
                <p>Return ETA: {route.etaReturn}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
