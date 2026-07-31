"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PAGE_REPLACEMENT_ALGORITHMS,
  comparePageReplacementAlgorithms,
  parseReferenceString,
  simulatePageReplacement,
} from "@/lib/pageReplacementAlgorithms.mjs";

const DEFAULT_REFERENCES = "7 0 1 2 0 3 0 4 2 3 0 3 2";
const DEFAULT_FRAMES = 3;

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
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

function formatSummary(result) {
  if (!result) return "";

  const rows = result.steps
    .map((step) => {
      const frames = step.slots.map((slot) => slot || "-").join(" | ");
      const status = step.fault ? "Fault" : "Hit";
      return `${step.step}. Page ${step.page}: ${status}; Frames: ${frames}; Evicted: ${step.evicted || "-"}`;
    })
    .join("\n");

  return [
    `Page Replacement Algorithm Calculator`,
    `Algorithm: ${result.algorithm.name}`,
    `References: ${result.references.join(" ")}`,
    `Frames: ${result.frameCount}`,
    `Page faults: ${result.faults}`,
    `Hits: ${result.hits}`,
    `Hit rate: ${formatPercent(result.hitRate)}`,
    "",
    rows,
  ].join("\n");
}

export default function PageReplacementCalculatorTool({ text, hideHeader = false }) {
  const [referenceInput, setReferenceInput] = useState(DEFAULT_REFERENCES);
  const [frameInput, setFrameInput] = useState(String(DEFAULT_FRAMES));
  const [algorithmId, setAlgorithmId] = useState("fifo");
  const [copyState, setCopyState] = useState("idle");
  const [shareState, setShareState] = useState("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refs = params.get("refs");
    const frames = params.get("frames");
    const algorithm = params.get("algorithm");

    if (refs) setReferenceInput(refs);
    if (frames) setFrameInput(frames);
    if (PAGE_REPLACEMENT_ALGORITHMS.some((item) => item.id === algorithm)) {
      setAlgorithmId(algorithm);
    }
  }, []);

  useEffect(() => {
    if (copyState === "idle" && shareState === "idle") return undefined;

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
      setShareState("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState, shareState]);

  const references = useMemo(() => parseReferenceString(referenceInput), [referenceInput]);
  const frameCount = Number(frameInput);
  const validationMessages = useMemo(() => {
    const messages = [];

    if (!references.length) {
      messages.push(text.validationReferences);
    }

    if (!Number.isInteger(frameCount) || frameCount < 1 || frameCount > 10) {
      messages.push(text.validationFrames);
    }

    if (references.length > 80) {
      messages.push(text.validationLimit);
    }

    return messages;
  }, [frameCount, references.length, text]);

  const hasValidationErrors = validationMessages.length > 0;
  const result = useMemo(() => {
    if (hasValidationErrors) return null;
    return simulatePageReplacement(references, frameCount, algorithmId);
  }, [algorithmId, frameCount, hasValidationErrors, references]);

  const comparison = useMemo(() => {
    if (hasValidationErrors) return [];
    return comparePageReplacementAlgorithms(references, frameCount);
  }, [frameCount, hasValidationErrors, references]);

  const bestFaultCount = comparison.length ? Math.min(...comparison.map((item) => item.faults)) : null;

  useEffect(() => {
    if (hasValidationErrors) return;

    const params = new URLSearchParams();
    params.set("refs", references.join(" "));
    params.set("frames", String(frameCount));
    params.set("algorithm", algorithmId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [algorithmId, frameCount, hasValidationErrors, references]);

  const handleSample = () => {
    setReferenceInput(DEFAULT_REFERENCES);
    setFrameInput(String(DEFAULT_FRAMES));
    setAlgorithmId("fifo");
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await copyText(formatSummary(result));
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const params = new URLSearchParams();
    params.set("refs", references.join(" "));
    params.set("frames", String(frameCount));
    params.set("algorithm", algorithmId);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      await copyText(url);
      setShareState("copied");
    } catch {
      setShareState("idle");
    }
  };

  return (
    <section className="section shell" id="page-replacement-calculator" aria-label={hideHeader ? text.title : undefined}>
      <div className="glass-card page-replacement-wrap">
        {!hideHeader ? (
          <>
            <h2>{text.title}</h2>
            <p className="section-subtitle">{text.subtitle}</p>
          </>
        ) : null}

        <div className="page-replacement-grid">
          <section className="page-replacement-panel page-replacement-inputs">
            <h3>{text.inputTitle}</h3>

            <label className="invoice-field">
              <span>{text.referenceLabel}</span>
              <textarea
                value={referenceInput}
                placeholder={text.referencePlaceholder}
                rows={4}
                onChange={(event) => setReferenceInput(event.target.value)}
              />
            </label>

            <div className="invoice-form-grid page-replacement-input-row">
              <label className="invoice-field">
                <span>{text.frameLabel}</span>
                <input
                  min="1"
                  max="10"
                  type="number"
                  value={frameInput}
                  onChange={(event) => setFrameInput(event.target.value)}
                />
              </label>

              <label className="invoice-field">
                <span>{text.referenceCountLabel}</span>
                <input type="text" value={references.length ? `${references.length}` : "-"} readOnly />
              </label>
            </div>

            <div className="page-replacement-algorithms" aria-label={text.algorithmLabel}>
              <span>{text.algorithmLabel}</span>
              <div className="page-replacement-tabs">
                {PAGE_REPLACEMENT_ALGORITHMS.map((algorithm) => (
                  <button
                    className={`page-replacement-tab${algorithmId === algorithm.id ? " is-active" : ""}`}
                    key={algorithm.id}
                    type="button"
                    onClick={() => setAlgorithmId(algorithm.id)}
                  >
                    <strong>{algorithm.name}</strong>
                    <small>{algorithm.label}</small>
                  </button>
                ))}
              </div>
            </div>

            {validationMessages.length ? (
              <div className="kmap-validation-list" role="alert">
                {validationMessages.map((message) => (
                  <p className="webp-alert" key={message}>
                    {message}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="kmap-actions page-replacement-actions">
              <button className="btn btn-primary" type="button" onClick={handleSample}>
                {text.loadSample}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleCopy} disabled={!result}>
                {copyState === "copied" ? text.copied : text.copyResult}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleShare} disabled={!result}>
                {shareState === "copied" ? text.shareCopied : text.shareLink}
              </button>
            </div>
          </section>

          <aside className="page-replacement-panel page-replacement-summary">
            <h3>{text.summaryTitle}</h3>
            {result ? (
              <>
                <div className="page-replacement-score-grid">
                  <div className="page-replacement-score">
                    <span>{text.faultsLabel}</span>
                    <strong>{result.faults}</strong>
                  </div>
                  <div className="page-replacement-score">
                    <span>{text.hitsLabel}</span>
                    <strong>{result.hits}</strong>
                  </div>
                  <div className="page-replacement-score">
                    <span>{text.hitRateLabel}</span>
                    <strong>{formatPercent(result.hitRate)}</strong>
                  </div>
                  <div className="page-replacement-score">
                    <span>{text.missRateLabel}</span>
                    <strong>{formatPercent(result.missRate)}</strong>
                  </div>
                </div>

                <p className="page-replacement-summary-note">
                  {text.summarySentence
                    .replace("{algorithm}", result.algorithm.name)
                    .replace("{faults}", String(result.faults))
                    .replace("{hits}", String(result.hits))
                    .replace("{references}", String(result.totalReferences))}
                </p>
              </>
            ) : (
              <p className="text-tool-helper-note">{text.emptySummary}</p>
            )}
          </aside>
        </div>

        {comparison.length ? (
          <section className="page-replacement-compare" aria-labelledby="page-replacement-compare-title">
            <div className="page-replacement-section-head">
              <h3 id="page-replacement-compare-title">{text.compareTitle}</h3>
              <p>{text.compareSubtitle}</p>
            </div>

            <div className="page-replacement-table-scroll">
              <table className="page-replacement-table">
                <thead>
                  <tr>
                    <th>{text.algorithmColumn}</th>
                    <th>{text.faultsLabel}</th>
                    <th>{text.hitsLabel}</th>
                    <th>{text.hitRateLabel}</th>
                    <th>{text.missRateLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((item) => (
                    <tr className={item.faults === bestFaultCount ? "is-best" : ""} key={item.algorithm.id}>
                      <td>
                        <strong>{item.algorithm.name}</strong>
                        <span>{item.algorithm.label}</span>
                      </td>
                      <td>{item.faults}</td>
                      <td>{item.hits}</td>
                      <td>{formatPercent(item.hitRate)}</td>
                      <td>{formatPercent(item.missRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="page-replacement-steps" aria-labelledby="page-replacement-steps-title">
            <div className="page-replacement-section-head">
              <h3 id="page-replacement-steps-title">{text.stepsTitle}</h3>
              <p>{text.stepsSubtitle.replace("{algorithm}", result.algorithm.name)}</p>
            </div>

            <div className="page-replacement-table-scroll">
              <table className="page-replacement-table page-replacement-step-table">
                <thead>
                  <tr>
                    <th>{text.stepColumn}</th>
                    <th>{text.pageColumn}</th>
                    {Array.from({ length: result.frameCount }, (_, index) => (
                      <th key={index}>{text.frameColumn.replace("{number}", String(index + 1))}</th>
                    ))}
                    <th>{text.resultColumn}</th>
                    <th>{text.evictedColumn}</th>
                    <th>{text.reasonColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step) => (
                    <tr key={step.step}>
                      <td>{step.step}</td>
                      <td>
                        <strong>{step.page}</strong>
                      </td>
                      {step.slots.map((slot, index) => (
                        <td key={`${step.step}-${index}`}>
                          <span className={slot ? "page-replacement-frame-cell" : "page-replacement-frame-cell is-empty"}>
                            {slot || "-"}
                          </span>
                        </td>
                      ))}
                      <td>
                        <span className={`page-replacement-status${step.fault ? " is-fault" : " is-hit"}`}>
                          {step.fault ? text.faultLabel : text.hitLabel}
                        </span>
                      </td>
                      <td>{step.evicted || "-"}</td>
                      <td>{step.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
