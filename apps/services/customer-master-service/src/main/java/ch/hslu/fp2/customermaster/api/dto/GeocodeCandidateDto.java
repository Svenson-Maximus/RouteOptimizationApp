package ch.hslu.fp2.customermaster.api.dto;

public record GeocodeCandidateDto(
        String placeId,
        String formattedAddress,
        double latitude,
        double longitude,
        String provider
) {
}
