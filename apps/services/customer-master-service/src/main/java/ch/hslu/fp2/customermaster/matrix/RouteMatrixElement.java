package ch.hslu.fp2.customermaster.matrix;

import java.util.UUID;

public record RouteMatrixElement(
        UUID originLocationId,
        UUID destinationLocationId,
        Integer durationSeconds,
        Integer distanceMeters,
        String status
) {
}
