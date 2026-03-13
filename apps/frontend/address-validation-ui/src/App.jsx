import { useState } from "react";
import { Header } from "./presentation/components/Header";
import { CustomersPage } from "./presentation/pages/CustomersPage";
import { GeocodingReviewPage } from "./presentation/pages/GeocodingReviewPage";
import { OptimizationStudioPage } from "./presentation/pages/OptimizationStudioPage";

export function App() {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  return (
    <div className="layout">
      <Header
        activeSection={activeSection}
        onToggleCustomers={() => toggleSection("customers")}
        onToggleReview={() => toggleSection("geocoding")}
        onToggleOptimization={() => toggleSection("route-planner")}
      />
      <main className="main-flow">
        {!activeSection && (
          <section className="section-hint card">
            <h2>Workflow Modules</h2>
            <p>
              Start with customer quality, continue with geocoding verification, then open route planner
              to simulate a run configuration and route output.
            </p>
          </section>
        )}

        {activeSection === "customers" && (
          <section className="section-card">
            <CustomersPage />
          </section>
        )}

        {activeSection === "geocoding" && (
          <section className="section-card">
            <GeocodingReviewPage />
          </section>
        )}

        {activeSection === "route-planner" && (
          <section className="section-card">
            <OptimizationStudioPage />
          </section>
        )}
      </main>
    </div>
  );
}
