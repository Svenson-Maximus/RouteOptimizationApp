# C4 - System Context

## Purpose
Defines the system boundary, primary users, and external systems that interact with the Focus Project 2 Platform.

## Scope
This context view covers:
1. Customer and delivery data intake from Excel sources.
2. Operational usage by bakery planning staff.
3. External geocoding and routing-matrix dependency on Google Maps Platform.
4. Route publication and dispatch flow to drivers.

## Diagram
Insert the Enterprise Architect exported context diagram image here.

![C4 System Context - Focus Project 2](./images/context-view.jpg)

If you export with a different filename/path, update the image link accordingly.

## Elements
- `Bakery Planner` (Person): Maintains customers, validates addresses, verifies geolocations, and triggers optimization.
- `Delivery Drivers` (Person): Receive and follow optimized delivery routes.
- `Focus Project 2 Platform` (Software System): Bakery delivery planning and optimization platform.
- `Excel Sources` (External Software System): Tourenpläne and customer data imports.
- `Google Maps Platform` (External Software System): Provides geocoding and route matrix services.

## Relationships
1. `Bakery Planner -> Focus Project 2 Platform`: Maintains data, validates addresses, triggers optimization.
2. `Excel Sources -> Focus Project 2 Platform`: Provides customer and delivery input data.
3. `Focus Project 2 Platform -> Google Maps Platform`: Requests geocoding and route matrices.
4. `Focus Project 2 Platform -> Bakery Planner`: Publishes optimized route plan.
5. `Bakery Planner -> Delivery Drivers`: Dispatches route plan.

## Source Definition (Reference)
The diagram is based on the following C4/Structurizr model intent:

```text
workspace "Bakery Optimization Platform" "Architecture documentation for the Focus Project 2 Platform" {

    model {
        bakeryPlanner = person "Bakery Planner" "Maintains customers, validates addresses, verifies geolocations, and triggers optimization."
        deliveryDrivers = person "Delivery Drivers" "Receive and follow optimized delivery routes."

        platform = softwareSystem "Focus Project 2 Platform" "Bakery delivery planning and optimization platform."

        excelSources = softwareSystem "Excel Sources" "Tourenpläne / customer data imports."
        googleMaps = softwareSystem "Google Maps Platform" "Provides geocoding and route matrix services."

        bakeryPlanner -> platform "Maintains data, validates addresses, triggers optimization"
        excelSources -> platform "Provides customer and delivery input data"
        platform -> googleMaps "Requests geocoding and route matrices"
        platform -> bakeryPlanner "Publishes optimized route plan"
        bakeryPlanner -> deliveryDrivers "Dispatches route plan"
    }

    views {
        systemContext platform "SystemContext" {
            include *
            autolayout lr
        }

        theme default
    }

}
```
