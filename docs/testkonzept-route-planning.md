# Testkonzept Route Planning und Kundendaten

## Umfang

Das Testkonzept deckt die bearbeitbaren Kundendaten, die Tages-Demands, die OR-Tools-Optimierung, die Route-Visualisierung und die Anzeige von Wartezeit und Kapazitaet pro Stopp ab.

## Teststufen

### Unit-Tests

- Customer Repository: Update eines Kunden schreibt Lieferadresse, Lieferadress-Notiz, Tour-Typ, Zeitfenster, Servicezeit, Wochentage, Liefer-Demand und Hol-Demand.
- Optimizer Input Loading: Fuer jeden Wochentag werden nur aktive Kunden geladen und die passenden `*_delivery_demand_units` sowie `*_pickup_demand_units` verwendet.
- Optimizer Result Mapping: Wartezeit wird als `waitingAtArrivalSeconds` am Zielstopp ausgewiesen; `departureTime` bleibt Service-Ende am vorherigen Stopp.
- Capacity Mapping: `loadBeforeService`, `loadAfterService`, `deliveryDemandUnits`, `pickupDemandUnits` und Fahrzeugkapazitaet werden konsistent ausgegeben.
- Search-Konfiguration: erlaubte First-Solution-Strategien und Local-Search-Metaheuristiken werden angenommen; ungueltige Werte brechen kontrolliert ab.

### Integrationstests

- API `GET /api/customers`: liefert alle neuen Kundenfelder.
- API `POST /api/customers/{id}/address`: speichert Kundendaten und liefert den aktualisierten Datensatz zurueck.
- API `POST /api/optimization-runs`: uebergibt `allowWaiting`, Search-Strategien und optionalen Seed an den Python-Solver.
- Datenbankmigration: `V11__add_customer_daily_demands.sql` ist idempotent und initialisiert bestehende Kunden mit Default-Demands.

### UI-Tests

- Kundenmaske: Bearbeiten, Speichern und Abbrechen fuer Adresse, Notizen, Zeitfenster, Servicezeit, Wochentage und Tages-Demands.
- Route Planner: Search-Strategien, Metaheuristik, Seed und Waiting-Slack koennen gesetzt werden.
- Ergebnisansicht: Route-Line zeigt Stopp-Reihenfolge; Tabelle zeigt Ankunft, Wartezeit, Service-Start, Abfahrt, Demand und Kapazitaet.
- Responsive Layout: Kundenformular und Routentabelle bleiben auf mobilen Breiten bedienbar.

### Szenario-Tests

- Kein Waiting erlaubt: Kunden ausserhalb erreichbarer Zeitfenster werden gedroppt oder es gibt keine Loesung.
- Waiting erlaubt: Fahrzeug faehrt frueh los, kommt vor Zeitfensterbeginn an und wartet am Zielstopp.
- Unterschiedliche Tages-Demands: Montag und Dienstag erzeugen unterschiedliche Stop-Demands fuer denselben Kunden.
- Hol-Demand: Pickup-Werte erscheinen separat in UI und Solver-Ergebnis.
- Kapazitaetsgrenze: Ein Stop oder eine Route mit zu hoher Summe aus Liefer- und Hol-Demand wird nicht einem ueberlasteten Fahrzeug zugewiesen.

## Testdaten

- Ein Depot, zwei Fahrzeuge mit kleiner Kapazitaet.
- Drei Kunden mit validierten Adressen und Matrix-Eintraegen.
- Ein Kunde mit engem Zeitfenster fuer Waiting-Tests.
- Ein Kunde mit Montag-Demand `delivery=5, pickup=0` und Dienstag-Demand `delivery=1, pickup=4`.
- Ein Kunde mit Lieferadress-Notiz und separater Profil-Notiz.

## Akzeptanzkriterien

- Kundenmodell kann ohne direkte Datenbankbearbeitung in der GUI gepflegt werden.
- Optimizer verwendet den ausgewaehlten Wochentag inklusive unterschiedlicher Liefer- und Hol-Demands.
- Route zeigt pro Stopp physische Ankunft, Wartezeit am Ziel, Service-Start, Abfahrt und Kapazitaetsentwicklung.
- Search-Strategien sind ueber die GUI konfigurierbar und im Ergebnis sichtbar.
- Build-Checks fuer Backend, Frontend und Optimizer laufen erfolgreich.
