export const VARIABLE_NAMES = ["A", "B", "C", "D"];

const GRAY_CODES = {
  1: ["0", "1"],
  2: ["00", "01", "11", "10"],
};

function countBits(value) {
  let count = 0;
  let current = value;

  while (current > 0) {
    count += current & 1;
    current >>= 1;
  }

  return count;
}

function uniqueSorted(values) {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function isSetSubset(subset, superset) {
  return subset.every((value) => superset.includes(value));
}

export function getMaxMinterm(variableCount) {
  return 2 ** variableCount - 1;
}

export function parseTermList(input, variableCount) {
  const max = getMaxMinterm(variableCount);
  const rawParts = String(input || "")
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const values = [];
  const duplicates = [];
  const invalid = [];
  const seen = new Set();

  rawParts.forEach((part) => {
    if (!/^\d+$/.test(part)) {
      invalid.push(part);
      return;
    }

    const value = Number(part);
    if (!Number.isInteger(value) || value < 0 || value > max) {
      invalid.push(part);
      return;
    }

    if (seen.has(value)) {
      duplicates.push(value);
      return;
    }

    seen.add(value);
    values.push(value);
  });

  return {
    values: uniqueSorted(values),
    duplicates: uniqueSorted(duplicates),
    invalid,
  };
}

export function validateKMapInput(variableCount, minterms, dontCares) {
  const max = getMaxMinterm(variableCount);
  const overlap = minterms.filter((term) => dontCares.includes(term));

  return {
    max,
    overlap: uniqueSorted(overlap),
    isValid: overlap.length === 0,
  };
}

export function getKMapLayout(variableCount) {
  const rowBits = variableCount === 4 ? 2 : 1;
  const columnBits = variableCount - rowBits;
  const rows = GRAY_CODES[rowBits];
  const columns = GRAY_CODES[columnBits];

  return {
    rowVariables: VARIABLE_NAMES.slice(0, rowBits),
    columnVariables: VARIABLE_NAMES.slice(rowBits, variableCount),
    rows,
    columns,
    cells: rows.map((row) =>
      columns.map((column) => {
        const bits = `${row}${column}`;
        return {
          bits,
          minterm: Number.parseInt(bits, 2),
          row,
          column,
        };
      })
    ),
  };
}

function getCoveredTerms(variableCount, fixedValue, freeMask) {
  const max = getMaxMinterm(variableCount);
  const covered = [];

  for (let term = 0; term <= max; term += 1) {
    if ((term & ~freeMask) === fixedValue) {
      covered.push(term);
    }
  }

  return covered;
}

function getTermExpression(variableCount, fixedValue, freeMask) {
  const parts = [];
  const constantVariables = [];

  for (let index = 0; index < variableCount; index += 1) {
    const bitPosition = variableCount - index - 1;
    const bitMask = 1 << bitPosition;

    if (freeMask & bitMask) continue;

    const name = VARIABLE_NAMES[index];
    const value = fixedValue & bitMask ? 1 : 0;
    parts.push(value ? name : `${name}'`);
    constantVariables.push({
      name,
      value,
      label: value ? `${name} = 1` : `${name} = 0`,
    });
  }

  return {
    expression: parts.length ? parts.join("") : "1",
    constantVariables,
    literalCount: parts.length,
  };
}

function createAllValidGroups(variableCount, minterms, dontCares) {
  const allowedTerms = uniqueSorted([...minterms, ...dontCares]);
  const groups = [];

  // A group is a Boolean cube: fixed variables plus free variables.
  // If every cell in that cube is either 1 or X, it is a valid K-map group,
  // including wraparound groups and corner groups.
  for (let freeMask = 0; freeMask < 2 ** variableCount; freeMask += 1) {
    const coveredTemplate = getCoveredTerms(variableCount, 0, freeMask);
    const groupSize = coveredTemplate.length;

    for (let fixedValue = 0; fixedValue < 2 ** variableCount; fixedValue += 1) {
      if ((fixedValue & freeMask) !== 0) continue;

      const coveredTerms = getCoveredTerms(variableCount, fixedValue, freeMask);
      const coveredMinterms = coveredTerms.filter((term) => minterms.includes(term));
      const coveredDontCares = coveredTerms.filter((term) => dontCares.includes(term));

      if (!coveredMinterms.length) continue;
      if (!isSetSubset(coveredTerms, allowedTerms)) continue;

      const termInfo = getTermExpression(variableCount, fixedValue, freeMask);
      groups.push({
        id: `${fixedValue}-${freeMask}`,
        fixedValue,
        freeMask,
        size: groupSize,
        coveredTerms,
        coveredMinterms,
        coveredDontCares,
        expression: termInfo.expression,
        constantVariables: termInfo.constantVariables,
        literalCount: termInfo.literalCount,
      });
    }
  }

  return groups;
}

function getPrimeGroups(groups) {
  return groups.filter((group) => {
    return !groups.some((candidate) => {
      if (candidate.id === group.id) return false;
      if (candidate.size <= group.size) return false;
      return isSetSubset(group.coveredTerms, candidate.coveredTerms);
    });
  });
}

function chooseBestCover(groups, minterms) {
  if (!minterms.length) return [];
  if (!groups.length) return [];

  let bestCover = null;
  const groupCount = groups.length;
  const maxMask = 1 << groupCount;

  // n <= 4 means at most 16 cells, so a brute-force cover search is small,
  // deterministic, and easier to trust than a complex heuristic.
  for (let mask = 1; mask < maxMask; mask += 1) {
    const selected = [];
    const covered = new Set();

    for (let index = 0; index < groupCount; index += 1) {
      if (!(mask & (1 << index))) continue;
      selected.push(groups[index]);
      groups[index].coveredMinterms.forEach((term) => covered.add(term));
    }

    if (!minterms.every((term) => covered.has(term))) continue;

    const score = {
      groupCount: selected.length,
      literalCount: selected.reduce((sum, group) => sum + group.literalCount, 0),
      coveredCells: selected.reduce((sum, group) => sum + group.coveredTerms.length, 0),
    };

    if (
      !bestCover ||
      score.groupCount < bestCover.score.groupCount ||
      (score.groupCount === bestCover.score.groupCount && score.literalCount < bestCover.score.literalCount) ||
      (score.groupCount === bestCover.score.groupCount &&
        score.literalCount === bestCover.score.literalCount &&
        score.coveredCells > bestCover.score.coveredCells)
    ) {
      bestCover = { selected, score };
    }
  }

  return bestCover ? bestCover.selected : [];
}

function sortGroupsForDisplay(groups) {
  return [...groups].sort((a, b) => {
    if (b.size !== a.size) return b.size - a.size;
    if (a.literalCount !== b.literalCount) return a.literalCount - b.literalCount;
    return Math.min(...a.coveredTerms) - Math.min(...b.coveredTerms);
  });
}

export function solveKMap(variableCount, mintermsInput, dontCaresInput = []) {
  const minterms = uniqueSorted(mintermsInput);
  const dontCares = uniqueSorted(dontCaresInput);
  const validation = validateKMapInput(variableCount, minterms, dontCares);

  if (!validation.isValid) {
    return {
      expression: "",
      groups: [],
      errors: validation.overlap.map((term) => `Term ${term} cannot be both a minterm and a don't-care.`),
    };
  }

  if (!minterms.length) {
    return {
      expression: "0",
      groups: [],
      errors: [],
    };
  }

  if (minterms.length === 2 ** variableCount) {
    return {
      expression: "1",
      groups: [
        {
          id: "all-cells",
          fixedValue: 0,
          freeMask: getMaxMinterm(variableCount),
          size: 2 ** variableCount,
          coveredTerms: Array.from({ length: 2 ** variableCount }, (_, index) => index),
          coveredMinterms: minterms,
          coveredDontCares: [],
          expression: "1",
          constantVariables: [],
          literalCount: 0,
        },
      ],
      errors: [],
    };
  }

  const validGroups = createAllValidGroups(variableCount, minterms, dontCares);
  const primeGroups = getPrimeGroups(validGroups);
  const selectedGroups = sortGroupsForDisplay(chooseBestCover(primeGroups, minterms));

  return {
    expression: selectedGroups.map((group) => group.expression).join(" + ") || "0",
    groups: selectedGroups,
    errors: [],
  };
}

export function valuesToTermList(values) {
  return uniqueSorted(values).join(", ");
}

export function createCellValues(variableCount, minterms = [], dontCares = []) {
  const cellCount = 2 ** variableCount;
  return Array.from({ length: cellCount }, (_, minterm) => {
    if (minterms.includes(minterm)) return "1";
    if (dontCares.includes(minterm)) return "X";
    return "0";
  });
}
