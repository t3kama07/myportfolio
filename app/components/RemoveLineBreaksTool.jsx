"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

const DEFAULT_SAMPLE_INPUT = `This is the first line.
This is the second line.

This starts a new paragraph.
This line belongs to the same paragraph.`;

function normalizeLineEndings(value) {
  return String(value || "").replace(/\r\n?/g, "\n");
}

function collapseInlineSpaces(value) {
  return value.replace(/[^\S\n]{2,}/g, " ");
}

function getTextStats(value) {
  const normalized = normalizeLineEndings(value);
  const trimmed = normalized.trim();

  return {
    chars: normalized.length,
    lines: normalized ? normalized.split("\n").length : 0,
    words: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0,
  };
}

function processText(input, options) {
  const { mode, trimLines, collapseSpaces } = options;
  let value = normalizeLineEndings(input);

  if (!value) return "";

  if (trimLines) {
    value = value
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }

  switch (mode) {
    case "remove-all":
      value = value.replace(/\n+/g, "");
      break;
    case "preserve-paragraphs":
      value = value
        .replace(/\n{3,}/g, "\n\n")
        .split(/\n\s*\n+/)
        .filter((paragraph) => paragraph.trim() !== "")
        .map((paragraph) => paragraph.replace(/\n+/g, " "))
        .join("\n\n");
      break;
    case "remove-empty":
      value = value
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n");
      break;
    default:
      value = value.replace(/\n+/g, " ");
      break;
  }

  if (collapseSpaces) {
    if (mode === "remove-empty") {
      value = value
        .split("\n")
        .map((line) => collapseInlineSpaces(line))
        .join("\n");
    } else {
      value = collapseInlineSpaces(value);
    }
  }

  return value.trim();
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

export default function RemoveLineBreaksTool({ text, hideHeader = false }) {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState("replace-space");
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [copyState, setCopyState] = useState("idle");
  const deferredInput = useDeferredValue(inputText);

  useEffect(() => {
    if (copyState !== "copied") return undefined;

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  const processedText = useMemo(
    () =>
      processText(deferredInput, {
        mode,
        trimLines,
        collapseSpaces,
      }),
    [collapseSpaces, deferredInput, mode, trimLines]
  );

  const inputStats = useMemo(() => getTextStats(inputText), [inputText]);
  const outputStats = useMemo(() => getTextStats(processedText), [processedText]);
  const isProcessing = deferredInput !== inputText;
  const hasText = inputText.trim().length > 0;

  const modeOptions = [
    {
      value: "replace-space",
      label: text.modeReplaceSpace,
      hint: text.modeReplaceSpaceHint,
    },
    {
      value: "remove-all",
      label: text.modeRemoveAll,
      hint: text.modeRemoveAllHint,
    },
    {
      value: "preserve-paragraphs",
      label: text.modePreserveParagraphs,
      hint: text.modePreserveParagraphsHint,
    },
    {
      value: "remove-empty",
      label: text.modeRemoveEmpty,
      hint: text.modeRemoveEmptyHint,
    },
  ];

  const handleCopy = async () => {
    if (!processedText) return;

    try {
      await copyText(processedText);
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
  };

  const handleSample = () => {
    setInputText(text.sampleInput || DEFAULT_SAMPLE_INPUT);
  };

  const clearAll = () => {
    setInputText("");
    setCopyState("idle");
  };

  return (
    <section
      className="section shell"
      id="remove-line-breaks"
      aria-label={hideHeader ? text.title : undefined}
    >
      <div className="glass-card text-tool-wrap">
        {!hideHeader ? (
          <>
            <h2>{text.title}</h2>
            <p className="section-subtitle">{text.subtitle}</p>

            {Array.isArray(text.highlights) && text.highlights.length ? (
              <div className="avif-trust-row" aria-label={text.highlightsLabel || text.title}>
                {text.highlights.map((item) => (
                  <span className="avif-trust-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        <div className={`text-tool-panel${hideHeader ? " is-headerless" : ""}`}>
          <div className="text-tool-editors">
            <div className="text-tool-editor">
              <div className="text-tool-editor-head">
                <div>
                  <h3>{text.inputLabel}</h3>
                  <p>{text.inputDescription}</p>
                </div>
                <div className="text-tool-stats" aria-label={text.inputLabel}>
                  <span className="text-tool-stat">
                    {inputStats.chars} {text.charsLabel}
                  </span>
                  <span className="text-tool-stat">
                    {inputStats.words} {text.wordsLabel}
                  </span>
                  <span className="text-tool-stat">
                    {inputStats.lines} {text.linesLabel}
                  </span>
                </div>
              </div>

              <textarea
                className="text-tool-textarea"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder={text.inputPlaceholder}
                spellCheck="false"
              />
            </div>

            <div className="text-tool-editor">
              <div className="text-tool-editor-head">
                <div>
                  <h3>{text.outputLabel}</h3>
                  <p>{isProcessing ? text.processing : text.outputDescription}</p>
                </div>
                <div className="text-tool-stats" aria-label={text.outputLabel}>
                  <span className="text-tool-stat">
                    {outputStats.chars} {text.charsLabel}
                  </span>
                  <span className="text-tool-stat">
                    {outputStats.words} {text.wordsLabel}
                  </span>
                  <span className="text-tool-stat">
                    {outputStats.lines} {text.linesLabel}
                  </span>
                </div>
              </div>

              <textarea
                className="text-tool-textarea is-output"
                value={processedText}
                readOnly
                placeholder={text.outputPlaceholder}
                spellCheck="false"
              />
            </div>
          </div>

          <div className="text-tool-controls-grid">
            <div className="text-tool-settings-card">
              <h3>{text.modeLabel}</h3>
              <div className="text-tool-mode-list">
                {modeOptions.map((option) => (
                  <label
                    className={`text-tool-mode-option${mode === option.value ? " is-active" : ""}`}
                    key={option.value}
                  >
                    <input
                      type="radio"
                      name="remove-line-break-mode"
                      value={option.value}
                      checked={mode === option.value}
                      onChange={(event) => setMode(event.target.value)}
                    />
                    <span>{option.label}</span>
                    <small>{option.hint}</small>
                  </label>
                ))}
              </div>
            </div>

            <div className="text-tool-settings-card">
              <h3>{text.optionsLabel}</h3>
              <div className="text-tool-toggle-list">
                <label className="text-tool-toggle">
                  <input
                    type="checkbox"
                    checked={trimLines}
                    onChange={(event) => setTrimLines(event.target.checked)}
                  />
                  <span>{text.trimLines}</span>
                </label>
                <label className="text-tool-toggle">
                  <input
                    type="checkbox"
                    checked={collapseSpaces}
                    onChange={(event) => setCollapseSpaces(event.target.checked)}
                  />
                  <span>{text.collapseSpaces}</span>
                </label>
              </div>
              <p className="text-tool-helper-note">{text.helperNote}</p>
            </div>
          </div>

          <div className="text-tool-actions">
            <button type="button" className="btn btn-secondary" onClick={handleSample}>
              {text.useSample}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCopy} disabled={!processedText}>
              {copyState === "copied" ? text.copied : text.copyResult}
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearAll} disabled={!hasText}>
              {text.clear}
            </button>
          </div>
        </div>

        {!hasText ? (
          <div className="text-tool-empty">
            <h3>{text.emptyTitle}</h3>
            <p>{text.emptySubtitle}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
