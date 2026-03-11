package ch.hslu.fp2.customermaster.api;

import ch.hslu.fp2.customermaster.api.dto.ConfirmGeocodeRequest;
import ch.hslu.fp2.customermaster.api.dto.ConfirmGeocodeResponse;
import ch.hslu.fp2.customermaster.api.dto.GeocodeCandidateDto;
import ch.hslu.fp2.customermaster.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/geocoding")
public class GeocodingController {

    private final CustomerService customerService;

    public GeocodingController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/{customerId}/suggest")
    public List<GeocodeCandidateDto> suggest(@PathVariable UUID customerId) {
        return customerService.suggestGeocodes(customerId);
    }

    @PostMapping("/{customerId}/confirm")
    public ConfirmGeocodeResponse confirm(
            @PathVariable UUID customerId,
            @Valid @RequestBody ConfirmGeocodeRequest request
    ) {
        return customerService.confirmGeocode(customerId, request);
    }
}
