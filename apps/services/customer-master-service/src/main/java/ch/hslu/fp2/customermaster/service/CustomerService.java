package ch.hslu.fp2.customermaster.service;

import ch.hslu.fp2.customermaster.api.dto.ConfirmGeocodeRequest;
import ch.hslu.fp2.customermaster.api.dto.ConfirmGeocodeResponse;
import ch.hslu.fp2.customermaster.api.dto.CustomerRowDto;
import ch.hslu.fp2.customermaster.api.dto.GeocodeCandidateDto;
import ch.hslu.fp2.customermaster.api.dto.UpdateCustomerAddressRequest;
import ch.hslu.fp2.customermaster.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerRowDto> getCustomers() {
        return customerRepository.findAllCustomers();
    }

    public List<CustomerRowDto> getValidationQueue() {
        return customerRepository.findValidationQueue();
    }

    public List<GeocodeCandidateDto> suggestGeocodes(UUID customerId) {
        return customerRepository.suggestGeocodes(customerId);
    }

    public ConfirmGeocodeResponse confirmGeocode(UUID customerId, ConfirmGeocodeRequest request) {
        GeocodeCandidateDto candidate = new GeocodeCandidateDto(
                request.placeId(),
                request.formattedAddress(),
                request.latitude(),
                request.longitude(),
                request.provider()
        );

        customerRepository.confirmGeocode(customerId, candidate);
        return new ConfirmGeocodeResponse(true, customerId.toString(), request.placeId());
    }

    public CustomerRowDto updateCustomerAddress(UUID customerId, UpdateCustomerAddressRequest request) {
        return customerRepository.updateCustomerAddress(customerId, request);
    }
}
