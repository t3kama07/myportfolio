export const PAGE_REPLACEMENT_ALGORITHMS = [
  {
    id: "fifo",
    name: "FIFO",
    label: "First In First Out",
  },
  {
    id: "lru",
    name: "LRU",
    label: "Least Recently Used",
  },
  {
    id: "optimal",
    name: "Optimal",
    label: "Optimal Page Replacement",
  },
  {
    id: "clock",
    name: "Clock",
    label: "Second Chance / Clock",
  },
  {
    id: "lfu",
    name: "LFU",
    label: "Least Frequently Used",
  },
  {
    id: "lifo",
    name: "LIFO",
    label: "Last In First Out",
  },
];

const ALGORITHM_IDS = new Set(PAGE_REPLACEMENT_ALGORITHMS.map((algorithm) => algorithm.id));

export function parseReferenceString(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createStep({ index, page, before, after, frameCount, fault, evicted = null, reason }) {
  return {
    step: index + 1,
    page,
    before,
    after,
    slots: Array.from({ length: frameCount }, (_, slotIndex) => after[slotIndex] ?? ""),
    fault,
    evicted,
    reason,
  };
}

function getOptimalEvictionIndex(frames, references, currentIndex) {
  let farthestNextUse = -1;
  let selectedIndex = 0;

  frames.forEach((page, frameIndex) => {
    const nextUse = references.indexOf(page, currentIndex + 1);

    if (nextUse === -1) {
      selectedIndex = frameIndex;
      farthestNextUse = Number.POSITIVE_INFINITY;
      return;
    }

    if (nextUse > farthestNextUse) {
      farthestNextUse = nextUse;
      selectedIndex = frameIndex;
    }
  });

  return selectedIndex;
}

function getLeastRecentlyUsedIndex(frames, lastUsed) {
  return frames.reduce(
    (selectedIndex, page, frameIndex) =>
      (lastUsed.get(page) ?? -1) < (lastUsed.get(frames[selectedIndex]) ?? -1) ? frameIndex : selectedIndex,
    0
  );
}

function getLeastFrequentlyUsedIndex(frames, frequency, loadedAt) {
  return frames.reduce((selectedIndex, page, frameIndex) => {
    const selectedPage = frames[selectedIndex];
    const pageFrequency = frequency.get(page) ?? 0;
    const selectedFrequency = frequency.get(selectedPage) ?? 0;

    if (pageFrequency < selectedFrequency) {
      return frameIndex;
    }

    if (pageFrequency === selectedFrequency && (loadedAt.get(page) ?? 0) < (loadedAt.get(selectedPage) ?? 0)) {
      return frameIndex;
    }

    return selectedIndex;
  }, 0);
}

export function simulatePageReplacement(references, frameCount, algorithmId) {
  const normalizedReferences = Array.isArray(references) ? references.map(String).filter(Boolean) : [];
  const normalizedFrameCount = Number(frameCount);
  const selectedAlgorithm = ALGORITHM_IDS.has(algorithmId) ? algorithmId : "fifo";

  if (!Number.isInteger(normalizedFrameCount) || normalizedFrameCount < 1) {
    throw new Error("Frame count must be a positive integer.");
  }

  const frames = [];
  const steps = [];
  const fifoQueue = [];
  const lifoStack = [];
  const lastUsed = new Map();
  const frequency = new Map();
  const loadedAt = new Map();
  const referenceBits = new Map();
  let clockPointer = 0;
  let hits = 0;
  let faults = 0;

  normalizedReferences.forEach((page, index) => {
    const before = [...frames];
    const hitIndex = frames.indexOf(page);
    const isHit = hitIndex !== -1;
    let evicted = null;
    let reason = "";

    if (isHit) {
      hits += 1;

      if (selectedAlgorithm === "lru") {
        lastUsed.set(page, index);
      }

      if (selectedAlgorithm === "lfu") {
        frequency.set(page, (frequency.get(page) ?? 0) + 1);
      }

      if (selectedAlgorithm === "clock") {
        referenceBits.set(page, 1);
      }

      reason = `${page} is already in memory, so this reference is a hit.`;
    } else {
      faults += 1;

      if (frames.length < normalizedFrameCount) {
        frames.push(page);
        fifoQueue.push(page);
        lifoStack.push(page);
        lastUsed.set(page, index);
        frequency.set(page, (frequency.get(page) ?? 0) + 1);
        loadedAt.set(page, index);
        referenceBits.set(page, 1);
        reason = `Free frame available, so ${page} is loaded without evicting another page.`;
      } else {
        let evictIndex = 0;

        if (selectedAlgorithm === "fifo") {
          evicted = fifoQueue.shift();
          evictIndex = frames.indexOf(evicted);
          reason = `${evicted} entered memory first, so FIFO evicts it.`;
        } else if (selectedAlgorithm === "lru") {
          evictIndex = getLeastRecentlyUsedIndex(frames, lastUsed);
          evicted = frames[evictIndex];
          reason = `${evicted} was used least recently, so LRU evicts it.`;
        } else if (selectedAlgorithm === "optimal") {
          evictIndex = getOptimalEvictionIndex(frames, normalizedReferences, index);
          evicted = frames[evictIndex];
          reason = `${evicted} is used farthest in the future, or never again, so Optimal evicts it.`;
        } else if (selectedAlgorithm === "clock") {
          while (referenceBits.get(frames[clockPointer]) === 1) {
            referenceBits.set(frames[clockPointer], 0);
            clockPointer = (clockPointer + 1) % normalizedFrameCount;
          }

          evictIndex = clockPointer;
          evicted = frames[evictIndex];
          reason = `${evicted} has reference bit 0 when the clock hand reaches it, so Clock evicts it.`;
        } else if (selectedAlgorithm === "lfu") {
          evictIndex = getLeastFrequentlyUsedIndex(frames, frequency, loadedAt);
          evicted = frames[evictIndex];
          reason = `${evicted} has the lowest frequency count, so LFU evicts it.`;
        } else if (selectedAlgorithm === "lifo") {
          evicted = lifoStack.pop();
          evictIndex = frames.indexOf(evicted);
          reason = `${evicted} was loaded most recently, so LIFO evicts it.`;
        }

        frames[evictIndex] = page;
        fifoQueue.push(page);
        lifoStack.push(page);
        lastUsed.delete(evicted);
        lastUsed.set(page, index);
        frequency.delete(evicted);
        frequency.set(page, 1);
        loadedAt.delete(evicted);
        loadedAt.set(page, index);
        referenceBits.delete(evicted);
        referenceBits.set(page, 1);

        if (selectedAlgorithm === "clock") {
          clockPointer = (clockPointer + 1) % normalizedFrameCount;
        }
      }
    }

    steps.push(
      createStep({
        index,
        page,
        before,
        after: [...frames],
        frameCount: normalizedFrameCount,
        fault: !isHit,
        evicted,
        reason,
      })
    );
  });

  const totalReferences = normalizedReferences.length;
  const uniquePages = new Set(normalizedReferences).size;

  return {
    algorithm: PAGE_REPLACEMENT_ALGORITHMS.find((algorithm) => algorithm.id === selectedAlgorithm),
    frameCount: normalizedFrameCount,
    references: normalizedReferences,
    steps,
    hits,
    faults,
    totalReferences,
    uniquePages,
    hitRate: totalReferences ? hits / totalReferences : 0,
    missRate: totalReferences ? faults / totalReferences : 0,
  };
}

export function comparePageReplacementAlgorithms(references, frameCount) {
  return PAGE_REPLACEMENT_ALGORITHMS.map((algorithm) => simulatePageReplacement(references, frameCount, algorithm.id));
}
