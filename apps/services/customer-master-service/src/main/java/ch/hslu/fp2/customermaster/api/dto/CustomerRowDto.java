package ch.hslu.fp2.customermaster.api.dto;

public record CustomerRowDto(
        String id,
        String companyIndex,
        String name,
        String fullAddressRaw,
        String city,
        String postalCode,
        String validationStatus,
        String tourType,
        String sourceSheet
) {
}
