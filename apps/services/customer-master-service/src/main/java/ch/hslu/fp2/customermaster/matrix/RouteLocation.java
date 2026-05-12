package ch.hslu.fp2.customermaster.matrix;

import java.math.BigDecimal;
import java.util.UUID;

public record RouteLocation(
        UUID id,
        String locationType,
        String name,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
