package ch.hslu.fp2.customermaster.matrix;

import ch.hslu.fp2.customermaster.api.dto.TravelMatrixRunResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Service
public class TravelMatrixService {

    private static final ZoneId REFERENCE_ZONE = ZoneId.of("Europe/Zurich");
    private static final String REFERENCE_WEEKDAY = "TUESDAY";

    private final TravelMatrixRepository travelMatrixRepository;
    private final GoogleRouteMatrixClient googleRouteMatrixClient;
    private final int chunkSize;
    private final String routingPreference;
    private final int elementsPerMinuteLimit;

    public TravelMatrixService(
            TravelMatrixRepository travelMatrixRepository,
            GoogleRouteMatrixClient googleRouteMatrixClient,
            @Value("${google.routes.chunk-size:10}") int chunkSize,
            @Value("${google.routes.routing-preference:}") String routingPreference,
            @Value("${google.routes.elements-per-minute-limit:2900}") int elementsPerMinuteLimit
    ) {
        this.travelMatrixRepository = travelMatrixRepository;
        this.googleRouteMatrixClient = googleRouteMatrixClient;
        this.chunkSize = chunkSize;
        this.routingPreference = routingPreference == null ? "" : routingPreference.trim();
        this.elementsPerMinuteLimit = elementsPerMinuteLimit;
    }

    public TravelMatrixRunResponse createFullMatrixRun() {
        if (chunkSize < 1 || chunkSize > 10) {
            throw new IllegalStateException("google.routes.chunk-size must be between 1 and 10");
        }
        if (elementsPerMinuteLimit < 1) {
            throw new IllegalStateException("google.routes.elements-per-minute-limit must be positive");
        }

        List<RouteLocation> locations = travelMatrixRepository.findRouteLocationsForFullMatrix();
        if (locations.size() < 2) {
            throw new IllegalStateException("At least depot and one customer route location are required");
        }

        Instant departureTime = usesTrafficAwareRouting() ? nextRepresentativeDepartureTime() : null;
        UUID runId = travelMatrixRepository.createRun(
                GoogleRouteMatrixClient.PROVIDER,
                departureTime,
                departureTime == null ? "NOT_APPLICABLE" : REFERENCE_ZONE.getId(),
                departureTime == null ? "NOT_APPLICABLE" : REFERENCE_WEEKDAY,
                GoogleRouteMatrixClient.TRAVEL_MODE,
                routingPreferenceLabel(),
                locations.size()
        );

        try {
            RateWindow rateWindow = new RateWindow();
            for (int originStart = 0; originStart < locations.size(); originStart += chunkSize) {
                List<RouteLocation> origins = locations.subList(originStart, Math.min(originStart + chunkSize, locations.size()));
                for (int destinationStart = 0; destinationStart < locations.size(); destinationStart += chunkSize) {
                    List<RouteLocation> destinations = locations.subList(destinationStart, Math.min(destinationStart + chunkSize, locations.size()));
                    rateWindow.waitForCapacity(origins.size() * destinations.size(), elementsPerMinuteLimit);
                    List<RouteMatrixElement> entries = googleRouteMatrixClient.computeBatch(origins, destinations, departureTime);
                    travelMatrixRepository.insertEntries(runId, entries);
                }
            }
        } catch (RuntimeException ex) {
            travelMatrixRepository.deleteRun(runId);
            throw ex;
        }

        int entryCount = travelMatrixRepository.countEntries(runId);
        return new TravelMatrixRunResponse(
                runId,
                GoogleRouteMatrixClient.PROVIDER,
                departureTime,
                departureTime == null ? "NOT_APPLICABLE" : REFERENCE_ZONE.getId(),
                departureTime == null ? "NOT_APPLICABLE" : REFERENCE_WEEKDAY,
                GoogleRouteMatrixClient.TRAVEL_MODE,
                routingPreferenceLabel(),
                locations.size(),
                entryCount
        );
    }

    private boolean usesTrafficAwareRouting() {
        return routingPreference.startsWith("TRAFFIC_AWARE");
    }

    private String routingPreferenceLabel() {
        return routingPreference.isBlank() ? "DEFAULT_TRAFFIC_UNAWARE" : routingPreference;
    }

    private static Instant nextRepresentativeDepartureTime() {
        ZonedDateTime now = ZonedDateTime.now(REFERENCE_ZONE);
        ZonedDateTime candidate = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.TUESDAY))
                .withHour(8)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        if (!candidate.isAfter(now)) {
            candidate = now.with(TemporalAdjusters.next(DayOfWeek.TUESDAY))
                    .withHour(8)
                    .withMinute(0)
                    .withSecond(0)
                    .withNano(0);
        }

        return candidate.toInstant();
    }

    private static final class RateWindow {
        private Instant windowStartedAt = Instant.now();
        private int elementsInWindow = 0;

        void waitForCapacity(int nextElementCount, int limit) {
            Instant now = Instant.now();
            if (Duration.between(windowStartedAt, now).toSeconds() >= 60) {
                windowStartedAt = now;
                elementsInWindow = 0;
            }

            if (elementsInWindow + nextElementCount > limit) {
                long elapsedMillis = Duration.between(windowStartedAt, now).toMillis();
                long sleepMillis = Math.max(0, 61_000 - elapsedMillis);
                sleep(sleepMillis);
                windowStartedAt = Instant.now();
                elementsInWindow = 0;
            }

            elementsInWindow += nextElementCount;
        }

        private static void sleep(long millis) {
            try {
                Thread.sleep(millis);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for Google Routes quota window", ex);
            }
        }
    }
}
