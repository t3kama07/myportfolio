import assert from "node:assert/strict";
import test from "node:test";
import { parseReferenceString, simulatePageReplacement } from "./pageReplacementAlgorithms.mjs";

const classicReferences = parseReferenceString("7 0 1 2 0 3 0 4 2 3 0 3 2");

test("parses comma, space, and semicolon separated references", () => {
  assert.deepEqual(parseReferenceString("7,0 1;2"), ["7", "0", "1", "2"]);
});

test("calculates FIFO faults for a common reference string", () => {
  const result = simulatePageReplacement(classicReferences, 3, "fifo");
  assert.equal(result.faults, 10);
  assert.equal(result.hits, 3);
});

test("calculates LRU faults for a common reference string", () => {
  const result = simulatePageReplacement(classicReferences, 3, "lru");
  assert.equal(result.faults, 9);
  assert.equal(result.hits, 4);
});

test("calculates Optimal faults for a common reference string", () => {
  const result = simulatePageReplacement(classicReferences, 3, "optimal");
  assert.equal(result.faults, 7);
  assert.equal(result.hits, 6);
});

test("calculates Clock without changing the reference count", () => {
  const result = simulatePageReplacement(classicReferences, 3, "clock");
  assert.equal(result.totalReferences, classicReferences.length);
  assert.equal(result.steps.length, classicReferences.length);
});
