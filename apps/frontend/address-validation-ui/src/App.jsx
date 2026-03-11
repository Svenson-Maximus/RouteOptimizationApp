import { useState } from "react";
import { Header } from "./presentation/components/Header";
import { CustomersPage } from "./presentation/pages/CustomersPage";
import { GeocodingReviewPage } from "./presentation/pages/GeocodingReviewPage";
import { OptimizationStudioPage } from "./presentation/pages/OptimizationStudioPage";

export function App() {
  const [showCustomers, setShowCustomers] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);

  return (
    <div className="layout">
      <Header
        showCustomers={showCustomers}
        showReview={showReview}
        showOptimization={showOptimization}
        onToggleCustomers={() => setShowCustomers((prev) => !prev)}
        onToggleReview={() => setShowReview((prev) => !prev)}
        onToggleOptimization={() => setShowOptimization((prev) => !prev)}
      />
      <main className="main-flow">
        {!showCustomers && !showReview && !showOptimization && (
          <section className="section-hint card">
            <h2>Workflow Modules</h2>
            <p>
              Start with customer quality, continue with geocoding verification, then open optimization studio
              to simulate a run configuration and route output.
            </p>
          </section>
        )}

        {showCustomers && (
          <section className="section-card">
            <CustomersPage />
          </section>
        )}

        {showReview && (
          <section className="section-card">
            <GeocodingReviewPage />
          </section>
        )}

        {showOptimization && (
          <section className="section-card">
            <OptimizationStudioPage />
          </section>
        )}
      </main>
    </div>
  );
}
