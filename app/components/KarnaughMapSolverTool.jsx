"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createCellValues,
  getKMapLayout,
  parseTermList,
  solveKMap,
  valuesToTermList,
} from "@/lib/kmapSolver.mjs";

const GROUP_COLORS = ["#6eb3ff", "#7f8ef6", "#2fbf9b", "#f59e0b", "#ef6f8f", "#8b5cf6"];

function getTermsFromCells(cells, expectedValue) {
  return cells.map((value, index) => (value === expectedValue ? index : null)).filter((value) => value !== null);
}

function formatUrlParams(variableCount, minterms, dontCares) {
  const params = new URLSearchParams();
  params.set("vars", String(variableCount));
  if (minterms.length) params.set("m", minterms.join(","));
  if (dontCares.length) params.set("d", dontCares.join(","));
  return params;
}

async function copyText(value) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function KarnaughMapSolverTool({ text, hideHeader = false }) {
  const [variableCount, setVariableCount] = useState(4);
  const [mintermInput, setMintermInput] = useState("");
  const [dontCareInput, setDontCareInput] = useState("");
  const [result, setResult] = useState(null);
  const [copyState, setCopyState] = useState("idle");
  const [shareState, setShareState] = useState("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vars = Number(params.get("vars"));
    const nextVariableCount = [2, 3, 4].includes(vars) ? vars : 4;
    setVariableCount(nextVariableCount);
    setMintermInput(params.get("m") || "");
    setDontCareInput(params.get("d") || "");
  }, []);

  const parsedMinterms = useMemo(() => parseTermList(mintermInput, variableCount), [mintermInput, variableCount]);
  const parsedDontCares = useMemo(() => parseTermList(dontCareInput, variableCount), [dontCareInput, variableCount]);

  const validationMessages = useMemo(() => {
    const messages = [];
    const overlappingTerms = parsedMinterms.values.filter((term) => parsedDontCares.values.includes(term));

    if (parsedMinterms.invalid.length) {
      messages.push(text.invalidMinterms.replace("{values}", parsedMinterms.invalid.join(", ")));
    }

    if (parsedDontCares.invalid.length) {
      messages.push(text.invalidDontCares.replace("{values}", parsedDontCares.invalid.join(", ")));
    }

    if (parsedMinterms.duplicates.length) {
      messages.push(text.duplicateMinterms.replace("{values}", parsedMinterms.duplicates.join(", ")));
    }

    if (parsedDontCares.duplicates.length) {
      messages.push(text.duplicateDontCares.replace("{values}", parsedDontCares.duplicates.join(", ")));
    }

    if (overlappingTerms.length) {
      messages.push(text.overlapError.replace("{values}", overlappingTerms.join(", ")));
    }

    return messages;
  }, [parsedDontCares, parsedMinterms, text]);

  const hasValidationErrors = validationMessages.length > 0;
  const activeMinterms = hasValidationErrors ? [] : parsedMinterms.values;
  const activeDontCares = hasValidationErrors ? [] : parsedDontCares.values;
  const cellValues = useMemo(
    () => createCellValues(variableCount, activeMinterms, activeDontCares),
    [activeDontCares, activeMinterms, variableCount]
  );
  const layout = useMemo(() => getKMapLayout(variableCount), [variableCount]);

  useEffect(() => {
    if (hasValidationErrors) return;

    const params = formatUrlParams(variableCount, activeMinterms, activeDontCares);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
  }, [activeDontCares, activeMinterms, hasValidationErrors, variableCount]);

  useEffect(() => {
    if (copyState === "idle" && shareState === "idle") return undefined;

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
      setShareState("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState, shareState]);

  const syncCellsToInputs = (nextCells) => {
    setMintermInput(valuesToTermList(getTermsFromCells(nextCells, "1")));
    setDontCareInput(valuesToTermList(getTermsFromCells(nextCells, "X")));
  };

  const handleVariableChange = (nextVariableCount) => {
    const max = 2 ** nextVariableCount - 1;
    const nextMinterms = parsedMinterms.values.filter((term) => term <= max);
    const nextDontCares = parsedDontCares.values.filter((term) => term <= max && !nextMinterms.includes(term));

    setVariableCount(nextVariableCount);
    setMintermInput(valuesToTermList(nextMinterms));
    setDontCareInput(valuesToTermList(nextDontCares));
    setResult(null);
  };

  const handleCellClick = (minterm) => {
    const nextCells = [...cellValues];
    const currentValue = nextCells[minterm];
    nextCells[minterm] = currentValue === "0" ? "1" : currentValue === "1" ? "X" : "0";
    syncCellsToInputs(nextCells);
    setResult(null);
  };

  const handleSolve = () => {
    if (hasValidationErrors) return;
    setResult(solveKMap(variableCount, activeMinterms, activeDontCares));
  };

  const handleReset = () => {
    setVariableCount(4);
    setMintermInput("");
    setDontCareInput("");
    setResult(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const handleCopyResult = async () => {
    if (!result?.expression) return;

    try {
      await copyText(`F(${layout.rowVariables.concat(layout.columnVariables).join(", ")}) = ${result.expression}`);
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
  };

  const handleShare = async () => {
    if (hasValidationErrors) return;

    const params = formatUrlParams(variableCount, activeMinterms, activeDontCares);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);

    try {
      await copyText(url);
      setShareState("copied");
    } catch {
      setShareState("idle");
    }
  };

  const groups = result?.groups || [];
  const expression = result?.expression || "";

  return (
    <section className="section shell" id="karnaugh-map-solver" aria-label={hideHeader ? text.title : undefined}>
      <div className="glass-card kmap-wrap">
        {!hideHeader ? (
          <>
            <h2>{text.title}</h2>
            <p className="section-subtitle">{text.subtitle}</p>
          </>
        ) : null}

        <div className={`kmap-tool-panel${hideHeader ? " is-headerless" : ""}`}>
          <div className="kmap-builder-grid">
            <div className="kmap-editor-panel">
              <section className="kmap-block">
                <h3>{text.variablesLabel}</h3>
                <div className="kmap-variable-switch" aria-label={text.variablesLabel}>
                  {[2, 3, 4].map((count) => (
                    <button
                      className={`kmap-variable-button${variableCount === count ? " is-active" : ""}`}
                      key={count}
                      type="button"
                      onClick={() => handleVariableChange(count)}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </section>

              <section className="kmap-block">
                <h3>{text.inputSection}</h3>
                <div className="invoice-form-grid">
                  <label className="invoice-field">
                    <span>{text.mintermsLabel}</span>
                    <input
                      type="text"
                      value={mintermInput}
                      placeholder={text.mintermsPlaceholder}
                      onChange={(event) => {
                        setMintermInput(event.target.value);
                        setResult(null);
                      }}
                    />
                  </label>
                  <label className="invoice-field">
                    <span>{text.dontCaresLabel}</span>
                    <input
                      type="text"
                      value={dontCareInput}
                      placeholder={text.dontCaresPlaceholder}
                      onChange={(event) => {
                        setDontCareInput(event.target.value);
                        setResult(null);
                      }}
                    />
                  </label>
                </div>
                <p className="text-tool-helper-note">{text.inputHint}</p>

                {validationMessages.length ? (
                  <div className="kmap-validation-list" role="alert">
                    {validationMessages.map((message) => (
                      <p className="webp-alert" key={message}>
                        {message}
                      </p>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="kmap-block">
                <h3>{text.actionsLabel}</h3>
                <div className="kmap-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSolve} disabled={hasValidationErrors}>
                    {text.solve}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCopyResult} disabled={!expression}>
                    {copyState === "copied" ? text.copied : text.copyResult}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleShare} disabled={hasValidationErrors}>
                    {shareState === "copied" ? text.shareCopied : text.shareLink}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    {text.reset}
                  </button>
                </div>
              </section>
            </div>

            <div className="kmap-map-panel">
              <div className="kmap-map-head">
                <div>
                  <h3>{text.mapTitle}</h3>
                  <p>{text.mapHint}</p>
                </div>
                <span className="webp-status is-done">
                  {variableCount} {text.variablesShort}
                </span>
              </div>

              <div className={`kmap-grid kmap-grid-${variableCount}`}>
                <div className="kmap-axis-corner">
                  <span>{layout.rowVariables.join("")}</span>
                  <span>{layout.columnVariables.join("")}</span>
                </div>
                {layout.columns.map((column) => (
                  <div className="kmap-axis-label" key={`col-${column}`}>
                    {column}
                  </div>
                ))}
                {layout.cells.map((row, rowIndex) => (
                  <div className="kmap-row-fragment" key={layout.rows[rowIndex]}>
                    <div className="kmap-axis-label">{layout.rows[rowIndex]}</div>
                    {row.map((cell) => {
                      const value = cellValues[cell.minterm];
                      const cellGroups = groups
                        .map((group, groupIndex) => (group.coveredTerms.includes(cell.minterm) ? groupIndex : null))
                        .filter((groupIndex) => groupIndex !== null);

                      return (
                        <button
                          className={`kmap-cell is-${value.toLowerCase()}`}
                          key={cell.minterm}
                          type="button"
                          onClick={() => handleCellClick(cell.minterm)}
                        >
                          <span className="kmap-cell-term">m{cell.minterm}</span>
                          <strong>{value}</strong>
                          {cellGroups.length ? (
                            <span className="kmap-cell-groups" aria-hidden="true">
                              {cellGroups.map((groupIndex) => (
                                <i
                                  key={groupIndex}
                                  style={{ backgroundColor: GROUP_COLORS[groupIndex % GROUP_COLORS.length] }}
                                />
                              ))}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <aside className="kmap-result-panel">
              <div className="kmap-result-card">
                <h3>{text.resultTitle}</h3>
                <p className="kmap-expression">{expression ? `F = ${expression}` : text.resultPlaceholder}</p>
              </div>

              <div className="kmap-result-card">
                <h3>{text.groupsTitle}</h3>
                {groups.length ? (
                  <ol className="kmap-group-list">
                    {groups.map((group, index) => {
                      const constants = group.constantVariables.length
                        ? group.constantVariables.map((item) => item.label).join(", ")
                        : text.noConstants;
                      const dcText = group.coveredDontCares.length
                        ? ` ${text.includesDontCares.replace("{values}", group.coveredDontCares.join(", "))}`
                        : "";

                      return (
                        <li className="kmap-group-item" key={group.id}>
                          <span
                            className="kmap-group-swatch"
                            style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }}
                          />
                          <div>
                            <h4>{text.groupLabel.replace("{number}", String(index + 1))}</h4>
                            <p>
                              {text.groupCovers
                                .replace("{size}", String(group.size))
                                .replace("{values}", group.coveredMinterms.join(", "))}
                              {dcText}
                            </p>
                            <p>
                              {text.groupConstants.replace("{constants}", constants)} {text.groupTerm.replace("{term}", group.expression)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-tool-helper-note">{result ? text.noGroups : text.solvePrompt}</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
