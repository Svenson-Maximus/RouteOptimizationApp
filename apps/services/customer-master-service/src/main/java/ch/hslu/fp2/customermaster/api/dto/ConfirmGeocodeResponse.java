package ch.hslu.fp2.customermaster.api.dto;

public record ConfirmGeocodeResponse(
        boolean ok,
        String customerId,
        String placeId
) {
}
