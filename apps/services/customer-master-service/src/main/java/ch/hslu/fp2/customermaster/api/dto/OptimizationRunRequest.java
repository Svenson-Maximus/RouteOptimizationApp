package ch.hslu.fp2.customermaster.api.dto;

import java.util.UUID;

public record OptimizationRunRequest(
        String weekday,
        UUID matrixRunId,
        Integer timeLimitSeconds,
        Integer droppedStopPenalty,
        Boolean allowWaiting,
        String firstSolutionStrategy,
        String localSearchMetaheuristic,
        Integer randomSeed
) {
}
