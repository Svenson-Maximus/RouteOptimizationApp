package ch.hslu.fp2.customermaster.api.dto;

public record CustomerRowDto(
        String id,
        String companyIndex,
        String name,
        String fullAddressRaw,
        String street,
        String buildingNo,
        String city,
        String postalCode,
        String validationStatus,
        String tourType,
        String routeGroup,
        String deliveryNotes
) {
}
