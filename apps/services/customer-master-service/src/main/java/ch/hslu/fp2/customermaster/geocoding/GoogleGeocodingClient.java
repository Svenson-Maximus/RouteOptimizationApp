package ch.hslu.fp2.customermaster.geocoding;

import ch.hslu.fp2.customermaster.api.dto.GeocodeCandidateDto;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Component
public class GoogleGeocodingClient implements GeocodingClient {

    private static final String PROVIDER = "GOOGLE_GEOCODING";
    private static final String GEOCODING_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

    private final RestClient restClient;
    private final String apiKey;

    public GoogleGeocodingClient(
            RestClient.Builder restClientBuilder,
            @Value("${google.maps.api-key:}") String apiKey
    ) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
    }

    @Override
    public List<GeocodeCandidateDto> suggest(String addressQuery) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GOOGLE_MAPS_API_KEY is not configured");
        }
        if (addressQuery == null || addressQuery.isBlank()) {
            return List.of();
        }

        URI uri = UriComponentsBuilder.fromUriString(GEOCODING_ENDPOINT)
                .queryParam("address", addressQuery)
                .queryParam("components", "country:CH")
                .queryParam("key", apiKey)
                .build()
                .encode()
                .toUri();

        JsonNode response = restClient.get()
                .uri(uri)
                .retrieve()
                .body(JsonNode.class);

        if (response == null) {
            return List.of();
        }

        String status = response.path("status").asText();
        if (!"OK".equals(status)) {
            throw new IllegalStateException("Google Geocoding API returned status " + status);
        }

        List<GeocodeCandidateDto> candidates = new ArrayList<>();
        for (JsonNode result : response.path("results")) {
            JsonNode location = result.path("geometry").path("location");
            if (location.path("lat").isMissingNode() || location.path("lng").isMissingNode()) {
                continue;
            }

            candidates.add(new GeocodeCandidateDto(
                    result.path("place_id").asText(),
                    result.path("formatted_address").asText(),
                    location.path("lat").asDouble(),
                    location.path("lng").asDouble(),
                    PROVIDER
            ));
        }

        return candidates;
    }
}
