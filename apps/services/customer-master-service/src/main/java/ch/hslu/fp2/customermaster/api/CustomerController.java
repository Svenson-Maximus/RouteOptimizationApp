package ch.hslu.fp2.customermaster.api;

import ch.hslu.fp2.customermaster.api.dto.CustomerRowDto;
import ch.hslu.fp2.customermaster.api.dto.UpdateCustomerAddressRequest;
import ch.hslu.fp2.customermaster.service.CustomerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/customers")
    public List<CustomerRowDto> getCustomers() {
        return customerService.getCustomers();
    }

    @GetMapping("/customers/validation-queue")
    public List<CustomerRowDto> getValidationQueue() {
        return customerService.getValidationQueue();
    }

    @PostMapping("/customers/{customerId}/address")
    public CustomerRowDto updateCustomerAddress(
            @PathVariable UUID customerId,
            @RequestBody UpdateCustomerAddressRequest request
    ) {
        return customerService.updateCustomerAddress(customerId, request);
    }
}
