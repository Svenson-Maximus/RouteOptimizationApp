package ch.hslu.fp2.customermaster.api.dto;

import java.time.Instant;
import java.util.UUID;

public record OptimizationRunSummaryDto(
        UUID id,
        Instant createdAt,
        String weekday,
        UUID matrixRunId,
        String status,
        Long objectiveValue,
        Integer eligibleCustomerCount,
        Integer servedCustomerCount,
        Integer droppedCustomerCount,
        Integer vehiclesUsed,
        Integer totalReturnDurationSeconds,
        Integer totalRouteDurationSeconds,
        Integer totalDistanceMeters,
        Integer timeLimitSeconds,
        Integer droppedStopPenalty,
        Boolean allowWaiting,
        String firstSolutionStrategy,
        String localSearchMetaheuristic,
        Integer randomSeed
) {
}
