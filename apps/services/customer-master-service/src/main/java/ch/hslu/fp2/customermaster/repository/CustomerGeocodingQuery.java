package ch.hslu.fp2.customermaster.repository;

public record CustomerGeocodingQuery(
        String companyIndex,
        String name,
        String fullAddressRaw,
        String street,
        String buildingNo,
        String postalCode,
        String city,
        String countryCode
) {
    public String toAddressQuery() {
        if (fullAddressRaw != null && !fullAddressRaw.isBlank()) {
            return fullAddressRaw.trim();
        }

        String streetLine = join(" ", street, buildingNo);
        String cityLine = join(" ", postalCode, city);
        String country = countryCode == null || countryCode.isBlank() ? "CH" : countryCode;
        return join(", ", streetLine, cityLine, country);
    }

    private static String join(String separator, String... parts) {
        StringBuilder value = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            if (!value.isEmpty()) {
                value.append(separator);
            }
            value.append(part.trim());
        }
        return value.toString();
    }
}
