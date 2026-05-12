package ch.hslu.fp2.customermaster.geocoding;

import ch.hslu.fp2.customermaster.api.dto.GeocodeCandidateDto;

import java.util.List;

public interface GeocodingClient {
    List<GeocodeCandidateDto> suggest(String addressQuery);
}
