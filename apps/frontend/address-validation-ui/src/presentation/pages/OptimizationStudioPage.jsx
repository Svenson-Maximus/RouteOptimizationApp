import { useEffect, useMemo, useState } from "react";
import {
  createOptimizationRunUseCase,
  getRecentOptimizationRunsUseCase,
} from "../../application/usecases/createOptimizationRunUseCase";
import { getAllCustomersUseCase } from "../../application/usecases/getAllCustomersUseCase";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_POINT_LIMIT = 25;

function formatDuration(seconds) {
  const value = Number(seconds || 0);
  if (value <= 0) {
    return "0 min";
  }
  const minutes = Math.round(value / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function formatDistance(meters) {
  const value = Number(meters || 0);
  if (value <= 0) {
    return "0 km";
  }
  const kilometers = value / 1000;
  return `${kilometers.toFixed(kilometers >= 10 ? 1 : 2)} km`;
}

function formatOptionalDuration(seconds) {
  return seconds == null ? "-" : formatDuration(seconds);
}

function formatOptionalDistance(meters) {
  return meters == null ? "-" : formatDistance(meters);
}

function formatCoordinate(stop) {
  if (stop.latitude == null || stop.longitude == null) {
    return null;
  }
  return `${Number(stop.latitude).toFixed(7)},${Number(stop.longitude).toFixed(7)}`;
}

function buildGoogleMapsEmbedUrl(route) {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const points = (route.stops || [])
    .map(formatCoordinate)
    .filter(Boolean);

  if (points.length < 2 || points.length > GOOGLE_MAPS_POINT_LIMIT) {
    return null;
  }

  const origin = points[0];
  const destination = points[points.length - 1];
  const waypoints = points.slice(1, -1);
  const params = new URLSearchParams({
    key: GOOGLE_MAPS_API_KEY,
    origin,
    destination,
    mode: "driving",
  });

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }

  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

function buildGoogleMapsOpenUrl(route) {
  const destination = formatCoordinate(route);
  if (!destination) {
    return null;
  }

  const params = new URLSearchParams({
    api: "1",
    travelmode: "driving",
    destination,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function formatRemainingCapacity(route, stop) {
  const capacity = Number(route.capacityUnits || 0);
  const before = capacity - Number(stop.loadBeforeService || 0);
  const after = capacity - Number(stop.loadAfterService || 0);
  return `${before} to ${after} / ${capacity}`;
}

function formatRunTime(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OptimizationStudioPage() {
  const [customers, setCustomers] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [config, setConfig] = useState({
    weekday: "monday",
    matrixRunId: "",
    timeLimitSeconds: 30,
    droppedStopPenalty: 100000,
    allowWaiting: false,
    firstSolutionStrategy: "SAVINGS",
    localSearchMetaheuristic: "GUIDED_LOCAL_SEARCH",
    randomSeed: "",
  });

  useEffect(() => {
    getAllCustomersUseCase().then(setCustomers);
  }, []);

  useEffect(() => {
    setLoadingRuns(true);
    getRecentOptimizationRunsUseCase(config.weekday, 3)
      .then(setRecentRuns)
      .catch(() => setRecentRuns([]))
      .finally(() => setLoadingRuns(false));
  }, [config.weekday]);

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
        firstSolutionStrategy: config.firstSolutionStrategy,
        localSearchMetaheuristic: config.localSearchMetaheuristic,
        randomSeed: config.randomSeed === "" ? null : Number(config.randomSeed),
      });
      setResult(response);
      const updatedRuns = await getRecentOptimizationRunsUseCase(config.weekday, 3);
      setRecentRuns(updatedRuns);
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

          <label>
            First Solution Strategy
            <select
              value={config.firstSolutionStrategy}
              onChange={(e) => setConfig((p) => ({ ...p, firstSolutionStrategy: e.target.value }))}
            >
              <option value="PATH_CHEAPEST_ARC">PATH_CHEAPEST_ARC</option>
              <option value="SAVINGS">SAVINGS</option>
              <option value="PARALLEL_SAVINGS">PARALLEL_SAVINGS</option>
              <option value="PARALLEL_CHEAPEST_INSERTION">PARALLEL_CHEAPEST_INSERTION</option>
              <option value="LOCAL_CHEAPEST_INSERTION">LOCAL_CHEAPEST_INSERTION</option>
              <option value="GLOBAL_CHEAPEST_ARC">GLOBAL_CHEAPEST_ARC</option>
              <option value="AUTOMATIC">AUTOMATIC</option>
            </select>
          </label>

          <label>
            Local Search Metaheuristic
            <select
              value={config.localSearchMetaheuristic}
              onChange={(e) => setConfig((p) => ({ ...p, localSearchMetaheuristic: e.target.value }))}
            >
              <option value="GUIDED_LOCAL_SEARCH">GUIDED_LOCAL_SEARCH</option>
              <option value="GREEDY_DESCENT">GREEDY_DESCENT</option>
              <option value="SIMULATED_ANNEALING">SIMULATED_ANNEALING</option>
              <option value="TABU_SEARCH">TABU_SEARCH</option>
              <option value="AUTOMATIC">AUTOMATIC</option>
            </select>
          </label>

          <label>
            Seed
            <input
              type="number"
              value={config.randomSeed}
              onChange={(e) => setConfig((p) => ({ ...p, randomSeed: e.target.value }))}
              placeholder="Optional"
            />
          </label>

          <button className="primary" onClick={runOptimization} disabled={running || readyCount === 0}>
            {running ? "Calculating..." : "Calculate Best Tour"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="card run-history-card">
          <h3>Recent Runs</h3>
          <p><strong>{readyCount}</strong> validated customers scheduled for {config.weekday}.</p>
          {loadingRuns ? (
            <p className="muted">Loading recent runs...</p>
          ) : recentRuns.length > 0 ? (
            <div className="run-history-table-wrap">
              <table className="run-history-table">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Result</th>
                    <th>Search</th>
                    <th>Duration</th>
                    <th>Distance</th>
                    <th>Limit</th>
                    <th>Waiting</th>
                    <th>Seed</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run) => (
                    <tr key={run.id}>
                      <td>
                        <strong>{formatRunTime(run.createdAt)}</strong>
                        <span>{run.matrixRunId}</span>
                      </td>
                      <td>
                        <strong>{run.servedCustomerCount}/{run.eligibleCustomerCount}</strong>
                        <span>{run.droppedCustomerCount} dropped / {run.vehiclesUsed} vehicles</span>
                      </td>
                      <td>
                        <strong>{run.firstSolutionStrategy}</strong>
                        <span>{run.localSearchMetaheuristic}</span>
                      </td>
                      <td>{formatOptionalDuration(run.totalRouteDurationSeconds)}</td>
                      <td>{formatOptionalDistance(run.totalDistanceMeters)}</td>
                      <td>{run.timeLimitSeconds}s</td>
                      <td>{run.allowWaiting ? "Yes" : "No"}</td>
                      <td>{run.randomSeed ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No complete saved runs for this day yet.</p>
          )}
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
            <article><span>Total Route Duration</span><strong>{formatDuration(result.totalRouteDurationSeconds)}</strong></article>
            <article><span>Total Distance</span><strong>{formatDistance(result.totalDistanceMeters)}</strong></article>
            <article><span>Matrix Run</span><strong>{result.matrixRunId}</strong></article>
            <article><span>Heuristic</span><strong>{result.heuristics?.localSearchMetaheuristic || "-"}</strong></article>
            <article><span>Search</span><strong>{result.heuristics?.firstSolutionStrategy || "-"}</strong></article>
          </div>

          {result.droppedStops?.length > 0 && (
            <div className="dropped-stops">
              <h4>Dropped Stops</h4>
              <div className="dropped-stop-list">
                {result.droppedStops.map((stop) => (
                  <article key={stop.customerId || stop.locationId}>
                    <div>
                      <strong>{stop.companyIndex}</strong>
                      <span>{stop.name}</span>
                    </div>
                    <p>{stop.address || "No address available"}</p>
                    <dl>
                      <div>
                        <dt>Window</dt>
                        <dd>{stop.timeWindowStart}-{stop.timeWindowEnd}</dd>
                      </div>
                      <div>
                        <dt>Service</dt>
                        <dd>{formatDuration(stop.serviceTimeSeconds)}</dd>
                      </div>
                      <div>
                        <dt>Demand</dt>
                        <dd>{stop.demandUnits}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="route-preview">
            {activeRoutes.map((route) => (
              <article key={route.vehicle}>
                <div className="route-card-head">
                  <div>
                    <h4>{route.vehicle}</h4>
                    <p>Stops: {route.customerStopCount}</p>
                    <p>Total Time: {formatDuration(route.totalRouteSeconds)}</p>
                    <p>Distance: {formatDistance(route.totalDistanceMeters)}</p>
                    <p>Return ETA: {route.returnTime}</p>
                  </div>
                </div>

                {buildGoogleMapsEmbedUrl(route) ? (
                  <iframe
                    className="route-map"
                    title={`${route.vehicle} Google Maps route`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={buildGoogleMapsEmbedUrl(route)}
                  />
                ) : (
                  <div className="route-map-placeholder">
                    {GOOGLE_MAPS_API_KEY
                      ? `Google route map needs 2-${GOOGLE_MAPS_POINT_LIMIT} coordinate points. This route has ${route.stops?.length || 0}.`
                      : "Set VITE_GOOGLE_MAPS_API_KEY to display the Google route map."}
                  </div>
                )}

                <div className="route-stop-table-wrap">
                  <table className="route-stop-table">
                    <thead>
                      <tr>
                        <th>Arrival</th>
                        <th>Map</th>
                        <th>Wait</th>
                        <th>Service Start</th>
                        <th>Customer</th>
                        <th>Address</th>
                        <th>Window</th>
                        <th>Service End</th>
                        <th>Depart</th>
                        <th>Next Drive</th>
                        <th>Next Distance</th>
                        <th>Demand</th>
                        <th>Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {route.stops
                        .filter((stop) => stop.customerId !== null)
                        .map((stop) => (
                          <tr key={`${route.vehicle}-${stop.customerId}`}>
                            <td>{stop.arrivalTime}</td>
                            <td>
                              {buildGoogleMapsOpenUrl(stop) ? (
                                <a
                                  className="map-icon-link"
                                  href={buildGoogleMapsOpenUrl(stop)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`Navigate to ${stop.name}`}
                                  aria-label={`Navigate to ${stop.name} in Google Maps`}
                                >
                                  <span aria-hidden="true">M</span>
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{formatDuration(stop.waitingAtArrivalSeconds)}</td>
                            <td>{stop.serviceStartTime || stop.arrivalTime}</td>
                            <td>
                              <strong>{stop.companyIndex}</strong>
                              <span>{stop.name}</span>
                            </td>
                            <td>{stop.address || "-"}</td>
                            <td>{stop.timeWindowStart}-{stop.timeWindowEnd}</td>
                            <td>{stop.serviceEndTime}</td>
                            <td>{stop.departureTime}</td>
                            <td>{formatDuration(stop.travelToNextSeconds)}</td>
                            <td>{formatDistance(stop.travelToNextDistanceMeters)}</td>
                            <td>{stop.deliveryDemandUnits ?? stop.demandUnits} out / {stop.pickupDemandUnits ?? 0} back</td>
                            <td>{formatRemainingCapacity(route, stop)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
