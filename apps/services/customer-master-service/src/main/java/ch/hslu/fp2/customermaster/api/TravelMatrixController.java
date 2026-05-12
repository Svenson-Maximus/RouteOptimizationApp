package ch.hslu.fp2.customermaster.api;

import ch.hslu.fp2.customermaster.api.dto.TravelMatrixRunResponse;
import ch.hslu.fp2.customermaster.matrix.TravelMatrixService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/travel-matrix-runs")
public class TravelMatrixController {

    private final TravelMatrixService travelMatrixService;

    public TravelMatrixController(TravelMatrixService travelMatrixService) {
        this.travelMatrixService = travelMatrixService;
    }

    @PostMapping
    public TravelMatrixRunResponse createTravelMatrixRun() {
        return travelMatrixService.createFullMatrixRun();
    }
}
