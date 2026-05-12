package ch.hslu.fp2.customermaster.optimization;

import ch.hslu.fp2.customermaster.api.dto.OptimizationRunRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class OptimizationRunService {

    private static final Set<String> WEEKDAYS = Set.of(
            "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    );

    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    private final String pythonExecutable;
    private final String solverScript;
    private final String databaseUrl;
    private final Duration processTimeout;

    public OptimizationRunService(
            NamedParameterJdbcTemplate jdbc,
            ObjectMapper objectMapper,
            @Value("${optimizer.python-executable:../../../.conda/envs/route-optimizer/python.exe}") String pythonExecutable,
            @Value("${optimizer.solver-script:../../optimizer/route-optimization-engine/src/main.py}") String solverScript,
            @Value("${optimizer.database-url:postgresql://fp2:fp2_dev_password@localhost:5432/FocusProject2}") String databaseUrl,
            @Value("${optimizer.process-timeout-seconds:120}") int processTimeoutSeconds
    ) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
        this.pythonExecutable = pythonExecutable;
        this.solverScript = solverScript;
        this.databaseUrl = databaseUrl;
        this.processTimeout = Duration.ofSeconds(processTimeoutSeconds);
    }

    public JsonNode runOptimization(OptimizationRunRequest request) {
        String weekday = normalizeWeekday(request.weekday());
        UUID matrixRunId = request.matrixRunId() == null ? findLatestMatrixRunId() : request.matrixRunId();
        int timeLimitSeconds = boundedInt(request.timeLimitSeconds(), 30, 1, 300);
        int droppedStopPenalty = boundedInt(request.droppedStopPenalty(), 100_000, 1, 10_000_000);
        boolean allowWaiting = Boolean.TRUE.equals(request.allowWaiting());

        Path pythonPath = Path.of(pythonExecutable).toAbsolutePath().normalize();
        Path scriptPath = Path.of(solverScript).toAbsolutePath().normalize();
        ArrayList<String> command = new ArrayList<>();
        command.add(pythonPath.toString());
        command.add(scriptPath.toString());
        command.add("--weekday");
        command.add(weekday);
        command.add("--matrix-run-id");
        command.add(matrixRunId.toString());
        command.add("--database-url");
        command.add(databaseUrl);
        command.add("--time-limit-seconds");
        command.add(Integer.toString(timeLimitSeconds));
        command.add("--dropped-stop-penalty");
        command.add(Integer.toString(droppedStopPenalty));
        if (allowWaiting) {
            command.add("--allow-waiting");
        }

        try {
            Process process = new ProcessBuilder(command).start();
            CompletableFuture<String> stdout = readStream(process.getInputStream());
            CompletableFuture<String> stderr = readStream(process.getErrorStream());
            boolean completed = process.waitFor(processTimeout.toSeconds(), TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Optimization solver timed out");
            }

            String output = stdout.join();
            String error = stderr.join();
            if (process.exitValue() != 0) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Optimization solver failed: " + firstNonBlank(error, output)
                );
            }
            return objectMapper.readTree(output);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not run optimization solver", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Optimization solver was interrupted", ex);
        }
    }

    private UUID findLatestMatrixRunId() {
        String sql = """
                SELECT id
                FROM travel_matrix_runs
                ORDER BY calculated_at DESC
                LIMIT 1
                """;
        return jdbc.query(sql, Map.of(), (rs, __) -> rs.getObject("id", UUID.class))
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No travel matrix run exists yet"
                ));
    }

    private static String normalizeWeekday(String value) {
        String weekday = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (!WEEKDAYS.contains(weekday)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported weekday: " + value);
        }
        return weekday;
    }

    private static int boundedInt(Integer value, int defaultValue, int min, int max) {
        int resolved = value == null ? defaultValue : value;
        if (resolved < min || resolved > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Value must be between " + min + " and " + max);
        }
        return resolved;
    }

    private static CompletableFuture<String> readStream(java.io.InputStream stream) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException ex) {
                throw new IllegalStateException("Could not read solver stream", ex);
            }
        });
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first.trim();
        }
        return second == null ? "" : second.trim();
    }
}
