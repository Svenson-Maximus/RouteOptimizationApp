package ch.hslu.fp2.customermaster.api.dto;

public record UpdateCustomerAddressRequest(
        String fullAddressRaw,
        String street,
        String buildingNo,
        String postalCode,
        String city
) {
}
