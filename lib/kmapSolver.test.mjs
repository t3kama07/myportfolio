import assert from "node:assert/strict";
import test from "node:test";
import { solveKMap } from "./kmapSolver.mjs";

function assertSameTerms(actual, expected) {
  assert.deepEqual(actual.split(" + ").sort(), expected.split(" + ").sort());
}

test("simplifies a basic pair", () => {
  const result = solveKMap(2, [0, 1], []);
  assert.equal(result.expression, "A'");
});

test("simplifies a group of four", () => {
  const result = solveKMap(3, [0, 1, 2, 3], []);
  assert.equal(result.expression, "A'");
});

test("supports a four-corner group on a 4-variable map", () => {
  const result = solveKMap(4, [0, 2, 8, 10], []);
  assert.equal(result.expression, "B'D'");
});

test("supports wrapping groups across opposite K-map edges", () => {
  const result = solveKMap(3, [0, 2], []);
  assert.equal(result.expression, "A'C'");
});

test("chooses overlapping groups when needed for a compact cover", () => {
  const result = solveKMap(3, [0, 1, 2, 5, 6, 7], []);
  assertSameTerms(result.expression, "A'C' + AB + B'C");
});

test("uses don't-care cells for optimisation", () => {
  const result = solveKMap(4, [1, 3, 7], [5]);
  assert.equal(result.expression, "A'D");
});
