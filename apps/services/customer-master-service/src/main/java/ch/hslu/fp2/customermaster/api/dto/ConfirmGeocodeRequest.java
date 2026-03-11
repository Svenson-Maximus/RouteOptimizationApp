package ch.hslu.fp2.customermaster.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConfirmGeocodeRequest(
        @NotBlank String placeId,
        @NotBlank String formattedAddress,
        @NotNull Double latitude,
        @NotNull Double longitude,
        @NotBlank String provider
) {
}
