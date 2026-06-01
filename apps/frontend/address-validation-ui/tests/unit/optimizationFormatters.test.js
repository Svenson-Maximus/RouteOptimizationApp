import assert from "node:assert/strict";
import {
  formatDistance,
  formatDuration,
  formatOptionalDistance,
  formatOptionalDuration,
  formatRemainingCapacity,
} from "../../src/presentation/pages/optimizationFormatters.js";

function testFormatDuration() {
  assert.equal(formatDuration(0), "0 min");
  assert.equal(formatDuration(60), "1 min");
  assert.equal(formatDuration(3660), "1 h 1 min");
  assert.equal(formatOptionalDuration(null), "-");
}

function testFormatDistance() {
  assert.equal(formatDistance(0), "0 km");
  assert.equal(formatDistance(9150), "9.15 km");
  assert.equal(formatDistance(45700), "45.7 km");
  assert.equal(formatOptionalDistance(undefined), "-");
}

function testFormatRemainingCapacity() {
  assert.equal(
    formatRemainingCapacity(
      { capacityUnits: 100 },
      { loadBeforeService: 1, loadAfterService: 2 },
    ),
    "99 to 98 / 100",
  );
}

testFormatDuration();
testFormatDistance();
testFormatRemainingCapacity();

console.log("optimization formatter unit tests passed");
