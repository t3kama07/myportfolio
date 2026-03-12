"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

function clampQuality(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0.85;
  if (parsed < 0.1) return 0.1;
  if (parsed > 1) return 1;
  return parsed;
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
  return /\.(jpe?g|png)$/i.test(file.name || "");
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
  if (item.sourceUrl) URL.revokeObjectURL(item.sourceUrl);
  if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);

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

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("WebP conversion failed"));
        }
      },
      "image/webp",
      quality
    );
  });
}

async function convertImageFileToWebp(file, quality) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);

    try {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      context.drawImage(bitmap, 0, 0);
      const blob = await canvasToWebpBlob(canvas, quality);
      return { blob, width: canvas.width, height: canvas.height };
    } finally {
      bitmap.close();
    }
  }

  const decoded = await loadImageElement(file);

  try {
    const { image } = decoded;
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    context.drawImage(image, 0, 0);
    const blob = await canvasToWebpBlob(canvas, quality);
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    decoded.revoke();
  }
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
    sourceUrl: URL.createObjectURL(file),
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

export default function ImageToWebpTool({ text }) {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(0.85);
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
      const id = `webp-${nextIdRef.current++}`;
      return createUploadItem(file, id);
    });

    setItems((prev) => [...prev, ...newItems]);
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

    const fileName = `${safeFilePart(getFileBaseName(item.file?.name))}.webp`;
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
    if (isConverting || !itemsRef.current.length) return;

    setIsConverting(true);
    const qualityValue = clampQuality(quality);
    const queue = [...itemsRef.current];

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
        const { blob, width, height } = await convertImageFileToWebp(queuedItem.file, qualityValue);
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
          prev.map((item) =>
            item.id === queuedItem.id
              ? {
                  ...item,
                  status: "error",
                  error: text.failedMessage,
                }
              : item
          )
        );
      }
    }

    setIsConverting(false);
  };

  return (
    <section className="section shell" id="image-to-webp">
      <div className="glass-card webp-wrap">
        <h2>{text.title}</h2>
        <p className="section-subtitle">{text.subtitle}</p>

        <div className="webp-tool-panel">
          <input
            ref={fileInputRef}
            className="webp-file-input"
            id="image-to-webp-upload"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            multiple
            onChange={(event) => appendFiles(event.target.files)}
          />

          <label
            className={`webp-dropzone${isDragging ? " is-dragging" : ""}`}
            htmlFor="image-to-webp-upload"
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

          <div className="webp-settings">
            <label className="webp-quality-label" htmlFor="webp-quality">
              <span>{text.qualityLabel}</span>
              <strong>{Math.round(clampQuality(quality) * 100)}%</strong>
            </label>
            <input
              id="webp-quality"
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={quality}
              onChange={(event) => setQuality(clampQuality(event.target.value))}
            />
            <p className="webp-quality-hint">{text.qualityHint}</p>
          </div>

          <div className="webp-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={convertAll}
              disabled={!items.length || isConverting}
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
                      <img src={item.sourceUrl} alt={`${text.original}: ${item.file.name}`} loading="lazy" />
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

