package ch.hslu.fp2.customermaster.api;

import ch.hslu.fp2.customermaster.api.dto.OptimizationRunRequest;
import ch.hslu.fp2.customermaster.api.dto.OptimizationRunSummaryDto;
import ch.hslu.fp2.customermaster.optimization.OptimizationRunService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/optimization-runs")
public class OptimizationRunController {

    private final OptimizationRunService optimizationRunService;

    public OptimizationRunController(OptimizationRunService optimizationRunService) {
        this.optimizationRunService = optimizationRunService;
    }

    @PostMapping
    public JsonNode createOptimizationRun(@RequestBody OptimizationRunRequest request) {
        return optimizationRunService.runOptimization(request);
    }

    @GetMapping
    public List<OptimizationRunSummaryDto> getRecentRuns(
            @RequestParam String weekday,
            @RequestParam(defaultValue = "3") int limit
    ) {
        return optimizationRunService.findRecentRuns(weekday, limit);
    }
}
