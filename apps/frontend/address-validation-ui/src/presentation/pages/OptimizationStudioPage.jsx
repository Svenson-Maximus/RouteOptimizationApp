import { useEffect, useMemo, useState } from "react";
import { createOptimizationRunUseCase } from "../../application/usecases/createOptimizationRunUseCase";
import { getAllCustomersUseCase } from "../../application/usecases/getAllCustomersUseCase";

export function OptimizationStudioPage() {
  const [customers, setCustomers] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    weekday: "monday",
    matrixRunId: "",
    timeLimitSeconds: 30,
    droppedStopPenalty: 100000,
    allowWaiting: false,
  });

  useEffect(() => {
    getAllCustomersUseCase().then(setCustomers);
  }, []);

  const readyCount = useMemo(() => {
    return customers.filter((customer) => {
      return customer.validationStatus === "VALIDATED" && customer[config.weekday] === true;
    }).length;
  }, [config.weekday, customers]);

  const runOptimization = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const response = await createOptimizationRunUseCase({
        weekday: config.weekday,
        matrixRunId: config.matrixRunId.trim() || null,
        timeLimitSeconds: Number(config.timeLimitSeconds),
        droppedStopPenalty: Number(config.droppedStopPenalty),
        allowWaiting: config.allowWaiting,
      });
      setResult(response);
    } catch (err) {
      setError(err.message || "Optimization run failed");
    } finally {
      setRunning(false);
    }
  };

  const activeRoutes = (result?.routes || []).filter((route) => route.customerStopCount > 0);

  return (
    <section>
      <div className="section-head">
        <h2>Route Planner</h2>
      </div>

      <div className="optimization-grid">
        <div className="card config-card">
          <h3>Run Configuration</h3>
          <label>
            Delivery Day
            <select value={config.weekday} onChange={(e) => setConfig((p) => ({ ...p, weekday: e.target.value }))}>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
          </label>

          <label>
            Matrix Run ID
            <input
              value={config.matrixRunId}
              onChange={(e) => setConfig((p) => ({ ...p, matrixRunId: e.target.value }))}
              placeholder="Latest matrix run"
            />
          </label>

          <label>
            Time Limit Seconds
            <input
              type="number"
              min="1"
              max="300"
              value={config.timeLimitSeconds}
              onChange={(e) => setConfig((p) => ({ ...p, timeLimitSeconds: e.target.value }))}
            />
          </label>

          <label>
            Dropped Stop Penalty
            <input
              type="number"
              min="1"
              max="10000000"
              value={config.droppedStopPenalty}
              onChange={(e) => setConfig((p) => ({ ...p, droppedStopPenalty: e.target.value }))}
            />
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={config.allowWaiting}
              onChange={(e) => setConfig((p) => ({ ...p, allowWaiting: e.target.checked }))}
            />
            Allow waiting slack
          </label>

          <button className="primary" onClick={runOptimization} disabled={running || readyCount === 0}>
            {running ? "Calculating..." : "Calculate Best Tour"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="card readiness-card">
          <h3>Readiness Gate</h3>
          <p><strong>{readyCount}</strong> validated customers scheduled for the selected day.</p>
          <ul>
            <li>Address status must be `VALIDATED`</li>
            <li>Geocoding confirmation should exist</li>
            <li>A complete travel matrix must exist</li>
            <li>Time-window constraints come from the normalized delivery profile</li>
          </ul>
        </div>
      </div>

      {result && (
        <div className="card result-card">
          <h3>Optimization Result</h3>
          <div className="result-kpis">
            <article><span>Status</span><strong>{result.status}</strong></article>
            <article><span>Objective</span><strong>{result.objectiveValue}</strong></article>
            <article><span>Served Stops</span><strong>{result.servedCustomerCount}/{result.eligibleCustomerCount}</strong></article>
            <article><span>Dropped Stops</span><strong>{result.droppedCustomerCount}</strong></article>
            <article><span>Vehicles Used</span><strong>{activeRoutes.length}</strong></article>
            <article><span>Total Return Duration</span><strong>{Math.round((result.totalReturnDurationSeconds || 0) / 60)} min</strong></article>
            <article><span>Matrix Run</span><strong>{result.matrixRunId}</strong></article>
            <article><span>Heuristic</span><strong>{result.heuristics?.localSearchMetaheuristic || "-"}</strong></article>
          </div>

          {result.droppedStops?.length > 0 && (
            <div className="dropped-stops">
              <h4>Dropped Stops</h4>
              {result.droppedStops.map((stop) => (
                <p key={stop.customerId || stop.locationId}>
                  <strong>{stop.companyIndex}</strong> {stop.name}
                </p>
              ))}
            </div>
          )}

          <div className="route-preview">
            {activeRoutes.map((route) => (
              <article key={route.vehicle}>
                <h4>{route.vehicle}</h4>
                <p>Stops: {route.customerStopCount}</p>
                <p>Return ETA: {route.returnTime}</p>
                <ol>
                  {route.stops
                    .filter((stop) => stop.customerId !== null)
                    .map((stop) => (
                      <li key={`${route.vehicle}-${stop.customerId}`}>
                        <span>{stop.arrivalTime}</span>
                        <strong>{stop.companyIndex}</strong>
                        {stop.name}
                      </li>
                    ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
