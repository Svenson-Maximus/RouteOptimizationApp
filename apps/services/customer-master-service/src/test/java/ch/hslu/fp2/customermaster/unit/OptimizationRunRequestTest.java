package ch.hslu.fp2.customermaster.unit;

import ch.hslu.fp2.customermaster.api.dto.OptimizationRunRequest;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class OptimizationRunRequestTest {

    @Test
    void keepsSearchConfigurationAndSeed() {
        UUID matrixRunId = UUID.randomUUID();

        OptimizationRunRequest request = new OptimizationRunRequest(
                "monday",
                matrixRunId,
                30,
                1_000_000,
                true,
                "SAVINGS",
                "GUIDED_LOCAL_SEARCH",
                42
        );

        assertThat(request.weekday()).isEqualTo("monday");
        assertThat(request.matrixRunId()).isEqualTo(matrixRunId);
        assertThat(request.firstSolutionStrategy()).isEqualTo("SAVINGS");
        assertThat(request.localSearchMetaheuristic()).isEqualTo("GUIDED_LOCAL_SEARCH");
        assertThat(request.randomSeed()).isEqualTo(42);
    }
}
