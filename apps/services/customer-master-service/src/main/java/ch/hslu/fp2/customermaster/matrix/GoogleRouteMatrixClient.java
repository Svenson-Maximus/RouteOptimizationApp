package ch.hslu.fp2.customermaster.matrix;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class GoogleRouteMatrixClient {

    static final String PROVIDER = "GOOGLE_ROUTES";
    static final String TRAVEL_MODE = "DRIVE";

    private static final String FIELD_MASK = "originIndex,destinationIndex,duration,distanceMeters,status,condition";

    private final RestClient restClient;
    private final String apiKey;
    private final String endpoint;
    private final String routingPreference;

    public GoogleRouteMatrixClient(
            RestClient.Builder restClientBuilder,
            @Value("${google.maps.api-key:}") String apiKey,
            @Value("${google.routes.matrix-endpoint:https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix}") String endpoint,
            @Value("${google.routes.routing-preference:}") String routingPreference
    ) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.routingPreference = routingPreference == null ? "" : routingPreference.trim();
    }

    public List<RouteMatrixElement> computeBatch(
            List<RouteLocation> origins,
            List<RouteLocation> destinations,
            Instant departureTime
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GOOGLE_MAPS_API_KEY is not configured");
        }

        JsonNode response = restClient.post()
                .uri(endpoint)
                .header("Content-Type", "application/json")
                .header("X-Goog-Api-Key", apiKey)
                .header("X-Goog-FieldMask", FIELD_MASK)
                .body(buildRequest(origins, destinations, departureTime, routingPreference))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.isArray()) {
            throw new IllegalStateException("Google Routes API returned an empty or invalid matrix response");
        }

        List<RouteMatrixElement> elements = new ArrayList<>();
        for (JsonNode node : response) {
            int originIndex = node.path("originIndex").asInt();
            int destinationIndex = node.path("destinationIndex").asInt();
            RouteLocation origin = origins.get(originIndex);
            RouteLocation destination = destinations.get(destinationIndex);

            String status = matrixStatus(node);
            Integer durationSeconds = parseDurationSeconds(node.path("duration").asText(null));
            Integer distanceMeters = node.has("distanceMeters") ? node.path("distanceMeters").asInt() : null;
            if (origin.id().equals(destination.id())) {
                durationSeconds = 0;
                distanceMeters = 0;
            }
            if (durationSeconds != null && durationSeconds == 0 && distanceMeters == null) {
                distanceMeters = 0;
            }

            elements.add(new RouteMatrixElement(
                    origin.id(),
                    destination.id(),
                    durationSeconds,
                    distanceMeters,
                    status
            ));
        }

        return elements;
    }

    private static Map<String, Object> buildRequest(
            List<RouteLocation> origins,
            List<RouteLocation> destinations,
            Instant departureTime,
            String routingPreference
    ) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("origins", origins.stream().map(GoogleRouteMatrixClient::waypoint).toList());
        request.put("destinations", destinations.stream().map(GoogleRouteMatrixClient::waypoint).toList());
        request.put("travelMode", TRAVEL_MODE);
        if (routingPreference != null && !routingPreference.isBlank()) {
            request.put("routingPreference", routingPreference);
        }
        if (departureTime != null) {
            request.put("departureTime", departureTime.toString());
        }
        return request;
    }

    private static Map<String, Object> waypoint(RouteLocation location) {
        Map<String, Object> latLng = new LinkedHashMap<>();
        latLng.put("latitude", location.latitude().doubleValue());
        latLng.put("longitude", location.longitude().doubleValue());

        Map<String, Object> locationBody = new LinkedHashMap<>();
        locationBody.put("latLng", latLng);

        Map<String, Object> waypoint = new LinkedHashMap<>();
        waypoint.put("location", locationBody);

        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("waypoint", waypoint);
        return wrapper;
    }

    private static String matrixStatus(JsonNode node) {
        String condition = node.path("condition").asText("");
        if (!condition.isBlank()) {
            return condition;
        }

        JsonNode status = node.path("status");
        String code = status.path("code").asText("");
        if (!code.isBlank()) {
            return code;
        }

        return "OK";
    }

    private static Integer parseDurationSeconds(String duration) {
        if (duration == null || duration.isBlank()) {
            return null;
        }
        String seconds = duration.endsWith("s") ? duration.substring(0, duration.length() - 1) : duration;
        return BigDecimal.valueOf(Double.parseDouble(seconds))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }
}
