"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SUPPORTED_IMAGE_TYPES = new Set(["image/heic", "image/heif"]);

let heicConverterPromise;

function getHeicConverter() {
  if (!heicConverterPromise) {
    heicConverterPromise = import("heic2any").then((module) => module.default || module);
  }

  return heicConverterPromise;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
}

function isSupportedImageFile(file) {
  if (!file) return false;
  const type = String(file.type || "").toLowerCase();
  if (SUPPORTED_IMAGE_TYPES.has(type)) return true;
  return /\.(heic|heif)$/i.test(file.name || "");
}

function getFileBaseName(filename) {
  const safeName = String(filename || "image");
  return safeName.replace(/\.[^.]+$/, "") || "image";
}

function safeFilePart(value) {
  const normalized = String(value || "image")
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "image";
}

function revokeItemUrls(item) {
  if (!item) return;
  if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
}

function loadImageElement(blob) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(blob);

    image.onload = () => {
      resolve({
        image,
        revoke: () => URL.revokeObjectURL(sourceUrl),
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("Unable to decode image"));
    };

    image.src = sourceUrl;
  });
}

async function getBlobDimensions(blob) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);

      try {
        return {
          width: bitmap.width,
          height: bitmap.height,
        };
      } finally {
        bitmap.close();
      }
    } catch {
      // Fallback to HTMLImageElement when createImageBitmap is unavailable.
    }
  }

  const decoded = await loadImageElement(blob);

  try {
    const { image } = decoded;
    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    };
  } finally {
    decoded.revoke();
  }
}

async function convertHeicFileToPng(file) {
  const heic2any = await getHeicConverter();
  const result = await heic2any({
    blob: file,
    toType: "image/png",
  });
  const convertedBlob = Array.isArray(result) ? result[0] : result;

  if (!(convertedBlob instanceof Blob)) {
    throw new Error("PNG conversion failed");
  }

  const { width, height } = await getBlobDimensions(convertedBlob);
  return { blob: convertedBlob, width, height };
}

function getStatusLabel(status, text) {
  if (status === "converting") return text.statusConverting;
  if (status === "done") return text.statusDone;
  if (status === "error") return text.statusError;
  return text.statusReady;
}

function createUploadItem(file, id) {
  return {
    id,
    file,
    sourceSize: file.size,
    width: 0,
    height: 0,
    convertedBlob: null,
    convertedUrl: "",
    convertedSize: 0,
    status: "ready",
    error: "",
  };
}

export default function HeicToPngTool({ text, hideHeader = false }) {
  const [items, setItems] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const fileInputRef = useRef(null);
  const itemsRef = useRef(items);
  const nextIdRef = useRef(1);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeItemUrls);
    };
  }, []);

  const convertedItems = useMemo(() => items.filter((item) => item.convertedUrl), [items]);
  const hasPendingItems = useMemo(
    () => items.some((item) => !item.convertedUrl && item.status !== "converting"),
    [items]
  );

  const appendFiles = (fileList) => {
    const incomingFiles = Array.from(fileList || []);
    if (!incomingFiles.length) return;

    const validFiles = incomingFiles.filter(isSupportedImageFile);
    const hasInvalidFiles = validFiles.length !== incomingFiles.length;

    if (!validFiles.length) {
      setAlertMessage(text.invalidType);
      return;
    }

    if (hasInvalidFiles) {
      setAlertMessage(text.invalidType);
    } else {
      setAlertMessage("");
    }

    const newItems = validFiles.map((file) => {
      const id = `heic-png-${nextIdRef.current++}`;
      return createUploadItem(file, id);
    });

    setItems((prev) => [...prev, ...newItems]);
    void getHeicConverter().catch(() => null);
  };

  const clearAll = () => {
    itemsRef.current.forEach(revokeItemUrls);
    setItems([]);
    setAlertMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadItem = (item) => {
    if (!item?.convertedUrl) return;

    const fileName = `${safeFilePart(getFileBaseName(item.file?.name))}.png`;
    const link = document.createElement("a");
    link.href = item.convertedUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    convertedItems.forEach((item, index) => {
      window.setTimeout(() => {
        downloadItem(item);
      }, index * 120);
    });
  };

  const convertAll = async () => {
    if (isConverting || !hasPendingItems) return;

    setIsConverting(true);
    const queue = itemsRef.current.filter((item) => !item.convertedUrl);

    for (const queuedItem of queue) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === queuedItem.id
            ? {
                ...item,
                status: "converting",
                error: "",
              }
            : item
        )
      );

      try {
        const { blob, width, height } = await convertHeicFileToPng(queuedItem.file);
        const convertedUrl = URL.createObjectURL(blob);

        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== queuedItem.id) return item;

            if (item.convertedUrl) {
              URL.revokeObjectURL(item.convertedUrl);
            }

            return {
              ...item,
              width,
              height,
              convertedBlob: blob,
              convertedUrl,
              convertedSize: blob.size,
              status: "done",
              error: "",
            };
          })
        );
      } catch {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== queuedItem.id) return item;

            if (item.convertedUrl) {
              URL.revokeObjectURL(item.convertedUrl);
            }

            return {
              ...item,
              convertedBlob: null,
              convertedUrl: "",
              convertedSize: 0,
              status: "error",
              error: text.failedMessage,
            };
          })
        );
      }
    }

    setIsConverting(false);
  };

  return (
    <section className="section shell" id="heic-to-png" aria-label={hideHeader ? text.title : undefined}>
      <div className="glass-card webp-wrap avif-wrap">
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

        <div className={`webp-tool-panel${hideHeader ? " is-headerless" : ""}`}>
          <input
            ref={fileInputRef}
            className="webp-file-input"
            id="heic-to-png-upload"
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            multiple
            onChange={(event) => appendFiles(event.target.files)}
          />

          <label
            className={`webp-dropzone${isDragging ? " is-dragging" : ""}`}
            htmlFor="heic-to-png-upload"
            onDragEnter={() => setIsDragging(true)}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              appendFiles(event.dataTransfer?.files);
            }}
          >
            <span className="webp-drop-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M19 18H6a4 4 0 0 1-.2-8A6 6 0 0 1 17 8a4 4 0 0 1 2 7.4V18Zm-7-9-4 4h3v4h2v-4h3l-4-4Z" />
              </svg>
            </span>
            <span>{text.dropzone}</span>
          </label>

          <p className="webp-supported">{text.supported}</p>
          <p className="webp-quality-hint">{text.previewNote}</p>

          <div className="webp-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={convertAll}
              disabled={!hasPendingItems || isConverting}
            >
              {isConverting ? text.converting : text.convert}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={downloadAll}
              disabled={!convertedItems.length}
            >
              {text.downloadAll}
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearAll} disabled={!items.length}>
              {text.clear}
            </button>
          </div>

          {alertMessage ? <p className="webp-alert">{alertMessage}</p> : null}
        </div>

        {!items.length ? (
          <div className="webp-empty">
            <h3>{text.emptyTitle}</h3>
            <p>{text.emptySubtitle}</p>
          </div>
        ) : (
          <div className="webp-list">
            {items.map((item) => {
              const hasConverted = Boolean(item.convertedUrl);
              const sizeDelta = item.sourceSize - item.convertedSize;
              const changePercent =
                hasConverted && item.sourceSize > 0
                  ? Math.round((Math.abs(sizeDelta) / item.sourceSize) * 100)
                  : 0;
              const isSaved = sizeDelta >= 0;

              return (
                <article className="webp-item" key={item.id}>
                  <div className="webp-item-head">
                    <h3>{item.file.name}</h3>
                    <span className={`webp-status is-${item.status}`}>{getStatusLabel(item.status, text)}</span>
                  </div>

                  <div className="webp-item-previews">
                    <figure className="webp-preview">
                      <div className="webp-preview-placeholder">{text.originalPreviewLabel}</div>
                      <figcaption>
                        {text.original} - {formatBytes(item.sourceSize)}
                      </figcaption>
                    </figure>

                    <figure className="webp-preview">
                      {hasConverted ? (
                        <img src={item.convertedUrl} alt={`${text.converted}: ${item.file.name}`} loading="lazy" />
                      ) : (
                        <div className="webp-preview-placeholder">{getStatusLabel(item.status, text)}</div>
                      )}
                      <figcaption>
                        {text.converted} - {hasConverted ? formatBytes(item.convertedSize) : "--"}
                      </figcaption>
                    </figure>
                  </div>

                  <div className="webp-item-meta">
                    <span>
                      {item.width > 0 && item.height > 0 ? `${item.width} x ${item.height}px` : "\u00a0"}
                    </span>
                    {hasConverted ? (
                      <span className={`webp-size-delta${isSaved ? " is-saved" : " is-larger"}`}>
                        {isSaved ? `${text.saved} ${changePercent}%` : `${text.largerBy} ${changePercent}%`}
                      </span>
                    ) : null}
                  </div>

                  {item.error ? <p className="webp-item-error">{item.error}</p> : null}

                  <div className="webp-item-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => downloadItem(item)}
                      disabled={!hasConverted}
                    >
                      {text.download}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
