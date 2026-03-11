package ch.hslu.fp2.customermaster.api;

import ch.hslu.fp2.customermaster.api.dto.CustomerRowDto;
import ch.hslu.fp2.customermaster.service.CustomerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
