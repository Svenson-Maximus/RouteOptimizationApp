package ch.hslu.fp2.customermaster.api.dto;

import java.time.Instant;
import java.util.UUID;

public record TravelMatrixRunResponse(
        UUID runId,
        String provider,
        Instant departureTime,
        String departureTimeZone,
        String referenceWeekday,
        String travelMode,
        String routingPreference,
        int locationCount,
        int entryCount
) {
}
