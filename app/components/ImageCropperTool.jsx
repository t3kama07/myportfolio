"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const ASPECT_OPTIONS = [
  { id: "free", ratio: null },
  { id: "square", ratio: 1 },
  { id: "portrait", ratio: 4 / 5 },
  { id: "landscape", ratio: 16 / 9 },
  { id: "story", ratio: 9 / 16 },
  { id: "classic", ratio: 3 / 2 },
];

const EXPORT_OPTIONS = [
  { id: "png", mime: "image/png", extension: "png" },
  { id: "jpg", mime: "image/jpeg", extension: "jpg" },
  { id: "webp", mime: "image/webp", extension: "webp" },
];

const MIN_CROP_SIZE = 48;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fitAspectInside(width, height, ratio, inset = 1) {
  const safeWidth = Math.max(0, width * inset);
  const safeHeight = Math.max(0, height * inset);

  if (!ratio || safeWidth <= 0 || safeHeight <= 0) {
    return { width: safeWidth, height: safeHeight };
  }

  let nextWidth = safeWidth;
  let nextHeight = nextWidth / ratio;

  if (nextHeight > safeHeight) {
    nextHeight = safeHeight;
    nextWidth = nextHeight * ratio;
  }

  return {
    width: nextWidth,
    height: nextHeight,
  };
}

function getNormalizedAspectRatio(aspectRatio, imageWidth, imageHeight) {
  if (!aspectRatio || !imageWidth || !imageHeight) {
    return null;
  }

  return aspectRatio * (imageHeight / imageWidth);
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

function getAspectRatioById(id) {
  return ASPECT_OPTIONS.find((option) => option.id === id)?.ratio ?? null;
}

function getExportOption(id) {
  return EXPORT_OPTIONS.find((option) => option.id === id) || EXPORT_OPTIONS[0];
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

function isSupportedImageFile(file) {
  if (!file) return false;

  const fileType = String(file.type || "").toLowerCase();
  const fileName = String(file.name || "");

  if (fileType.startsWith("image/")) {
    return !/(svg|heic|heif)/i.test(fileType);
  }

  return /\.(avif|bmp|gif|jpe?g|png|webp)$/i.test(fileName);
}

function createDefaultCrop(aspectRatio, imageWidth = 1, imageHeight = 1) {
  if (!aspectRatio) {
    return {
      x: 0.08,
      y: 0.08,
      width: 0.84,
      height: 0.84,
    };
  }

  const normalizedAspectRatio = getNormalizedAspectRatio(aspectRatio, imageWidth, imageHeight);
  const fit = fitAspectInside(1, 1, normalizedAspectRatio, 0.86);

  return {
    x: (1 - fit.width) / 2,
    y: (1 - fit.height) / 2,
    width: fit.width,
    height: fit.height,
  };
}

function adaptCropToAspect(crop, aspectRatio, imageWidth = 1, imageHeight = 1) {
  if (!aspectRatio) {
    return crop;
  }

  const normalizedAspectRatio = getNormalizedAspectRatio(aspectRatio, imageWidth, imageHeight);
  const centerX = crop.x + crop.width / 2;
  const centerY = crop.y + crop.height / 2;
  const availableWidth = Math.min(centerX * 2, (1 - centerX) * 2);
  const availableHeight = Math.min(centerY * 2, (1 - centerY) * 2);
  const fit = fitAspectInside(availableWidth, availableHeight, normalizedAspectRatio);
  const targetArea = Math.max(crop.width * crop.height, 0.01);
  const fitArea = Math.max(fit.width * fit.height, 0.01);
  const scale = clamp(Math.sqrt(targetArea / fitArea), 0.48, 1);
  const width = fit.width * scale;
  const height = fit.height * scale;

  return {
    x: clamp(centerX - width / 2, 0, 1 - width),
    y: clamp(centerY - height / 2, 0, 1 - height),
    width,
    height,
  };
}

function normalizedCropToPixels(crop, imageRect) {
  if (!imageRect) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  return {
    x: crop.x * imageRect.width,
    y: crop.y * imageRect.height,
    width: crop.width * imageRect.width,
    height: crop.height * imageRect.height,
  };
}

function pixelsToNormalizedCrop(pixelCrop, imageRect) {
  if (!imageRect || imageRect.width <= 0 || imageRect.height <= 0) {
    return createDefaultCrop(null);
  }

  return {
    x: clamp(pixelCrop.x / imageRect.width, 0, 1),
    y: clamp(pixelCrop.y / imageRect.height, 0, 1),
    width: clamp(pixelCrop.width / imageRect.width, 0.02, 1),
    height: clamp(pixelCrop.height / imageRect.height, 0.02, 1),
  };
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";

    image.onload = () => {
      resolve({
        image,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };

    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = url;
  });
}

async function loadImageFile(file) {
  const url = URL.createObjectURL(file);

  try {
    const loaded = await loadImageFromUrl(url);
    return {
      url,
      ...loaded,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas export failed"));
        }
      },
      mime,
      quality
    );
  });
}

async function renderCroppedImage({ image, crop, width, height, format, quality }) {
  const exportOption = getExportOption(format);
  const pixelWidth = Math.max(1, Math.round(crop.width * width));
  const pixelHeight = Math.max(1, Math.round(crop.height * height));
  const sourceX = clamp(Math.round(crop.x * width), 0, Math.max(0, width - pixelWidth));
  const sourceY = clamp(Math.round(crop.y * height), 0, Math.max(0, height - pixelHeight));
  const canvas = document.createElement("canvas");
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const context = canvas.getContext("2d", { alpha: exportOption.id !== "jpg" });

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  if (exportOption.id === "jpg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pixelWidth, pixelHeight);
  }

  context.drawImage(image, sourceX, sourceY, pixelWidth, pixelHeight, 0, 0, pixelWidth, pixelHeight);

  const blob = await canvasToBlob(
    canvas,
    exportOption.mime,
    exportOption.id === "png" ? undefined : quality
  );

  return {
    blob,
    width: pixelWidth,
    height: pixelHeight,
    url: URL.createObjectURL(blob),
    extension: exportOption.extension,
  };
}

async function rotateImage(image, direction) {
  const canvas = document.createElement("canvas");
  const rotateRight = direction === "right";
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  canvas.width = height;
  canvas.height = width;

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  if (rotateRight) {
    context.translate(height, 0);
    context.rotate(Math.PI / 2);
  } else {
    context.translate(0, width);
    context.rotate(-Math.PI / 2);
  }

  context.drawImage(image, 0, 0);

  const blob = await canvasToBlob(canvas, "image/png");
  const url = URL.createObjectURL(blob);

  try {
    const loaded = await loadImageFromUrl(url);
    return {
      url,
      ...loaded,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function getLocalPointer(event, workspaceElement, imageRect) {
  const bounds = workspaceElement?.getBoundingClientRect();

  if (!bounds || !imageRect) {
    return { x: 0, y: 0 };
  }

  return {
    x: event.clientX - bounds.left - imageRect.x,
    y: event.clientY - bounds.top - imageRect.y,
  };
}

function getMinCropPixels(imageRect) {
  if (!imageRect) {
    return MIN_CROP_SIZE;
  }

  return Math.max(32, Math.min(MIN_CROP_SIZE, imageRect.width * 0.18, imageRect.height * 0.18));
}

function resizeFreeCrop(startCrop, handle, deltaX, deltaY, imageRect) {
  const minSize = getMinCropPixels(imageRect);
  let left = startCrop.x;
  let top = startCrop.y;
  let right = startCrop.x + startCrop.width;
  let bottom = startCrop.y + startCrop.height;

  if (handle.includes("w")) {
    left = clamp(startCrop.x + deltaX, 0, right - minSize);
  }

  if (handle.includes("e")) {
    right = clamp(startCrop.x + startCrop.width + deltaX, left + minSize, imageRect.width);
  }

  if (handle.includes("n")) {
    top = clamp(startCrop.y + deltaY, 0, bottom - minSize);
  }

  if (handle.includes("s")) {
    bottom = clamp(startCrop.y + startCrop.height + deltaY, top + minSize, imageRect.height);
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

function resizeLockedCrop(startCrop, handle, pointer, imageRect, aspectRatio) {
  const minSize = getMinCropPixels(imageRect);
  const signX = handle.includes("e") ? 1 : -1;
  const signY = handle.includes("s") ? 1 : -1;
  const anchorX = signX === 1 ? startCrop.x : startCrop.x + startCrop.width;
  const anchorY = signY === 1 ? startCrop.y : startCrop.y + startCrop.height;
  const maxWidth = signX === 1 ? imageRect.width - anchorX : anchorX;
  const maxHeight = signY === 1 ? imageRect.height - anchorY : anchorY;
  const rawWidth = Math.max(minSize, signX === 1 ? pointer.x - anchorX : anchorX - pointer.x);
  const rawHeight = Math.max(minSize, signY === 1 ? pointer.y - anchorY : anchorY - pointer.y);
  const preferredByWidth = {
    width: rawWidth,
    height: rawWidth / aspectRatio,
  };
  const preferredByHeight = {
    width: rawHeight * aspectRatio,
    height: rawHeight,
  };

  let width;
  let height;

  if (preferredByWidth.height <= rawHeight) {
    width = preferredByWidth.width;
    height = preferredByWidth.height;
  } else {
    width = preferredByHeight.width;
    height = preferredByHeight.height;
  }

  const maxFit = fitAspectInside(maxWidth, maxHeight, aspectRatio);

  if (width > maxFit.width || height > maxFit.height) {
    width = maxFit.width;
    height = maxFit.height;
  }

  if (width < minSize || height < minSize) {
    const minWidth = aspectRatio >= 1 ? Math.max(minSize, minSize * aspectRatio) : minSize;
    const minHeight = aspectRatio >= 1 ? minSize : Math.max(minSize, minSize / aspectRatio);
    const minFit = fitAspectInside(maxFit.width, maxFit.height, aspectRatio);

    width = clamp(Math.max(width, minWidth), 0, minFit.width || width);
    height = width / aspectRatio;

    if (height < minHeight) {
      height = clamp(Math.max(height, minHeight), 0, minFit.height || height);
      width = height * aspectRatio;
    }
  }

  return {
    x: signX === 1 ? anchorX : anchorX - width,
    y: signY === 1 ? anchorY : anchorY - height,
    width,
    height,
  };
}

export default function ImageCropperTool({ text, hideHeader = false }) {
  const [asset, setAsset] = useState(null);
  const [crop, setCrop] = useState(() => createDefaultCrop(null));
  const [activePreset, setActivePreset] = useState("free");
  const [exportFormat, setExportFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isPreviewRendering, setIsPreviewRendering] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const fileInputRef = useRef(null);
  const workspaceRef = useRef(null);
  const assetRef = useRef(asset);
  const currentImageRef = useRef(null);
  const originalAssetRef = useRef(null);
  const previewRef = useRef(null);
  const interactionRef = useRef(null);

  const aspectRatio = useMemo(() => getAspectRatioById(activePreset), [activePreset]);

  function measureWorkspace() {
    const workspaceElement = workspaceRef.current;

    if (!workspaceElement) {
      return;
    }

    const nextWidth = workspaceElement.clientWidth;
    const nextHeight = workspaceElement.clientHeight;

    if (nextWidth <= 0 || nextHeight <= 0) {
      return;
    }

    setWorkspaceSize((currentSize) => {
      if (currentSize.width === nextWidth && currentSize.height === nextHeight) {
        return currentSize;
      }

      return {
        width: nextWidth,
        height: nextHeight,
      };
    });
  }

  useEffect(() => {
    assetRef.current = asset;
  }, [asset]);

  useEffect(() => {
    const workspaceElement = workspaceRef.current;
    let frameId = 0;

    const scheduleMeasure = () => {
      if (typeof window === "undefined") {
        measureWorkspace();
        return;
      }

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        measureWorkspace();
      });
    };

    scheduleMeasure();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleMeasure);
    }

    if (!workspaceElement || typeof ResizeObserver === "undefined") {
      return () => {
        if (typeof window !== "undefined") {
          window.cancelAnimationFrame(frameId);
          window.removeEventListener("resize", scheduleMeasure);
        }
      };
    }

    const observer = new ResizeObserver(() => {
      scheduleMeasure();
    });

    observer.observe(workspaceElement);

    return () => {
      observer.disconnect();

      if (typeof window !== "undefined") {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", scheduleMeasure);
      }
    };
  }, [asset]);

  useEffect(() => {
    return () => {
      if (previewRef.current?.url) {
        URL.revokeObjectURL(previewRef.current.url);
      }

      const currentUrl = assetRef.current?.currentUrl;
      const originalUrl = assetRef.current?.originalUrl;

      if (currentUrl && currentUrl !== originalUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, []);

  const imageRect = useMemo(() => {
    const measuredWidth = workspaceSize.width || workspaceRef.current?.clientWidth || 0;
    const measuredHeight = workspaceSize.height || workspaceRef.current?.clientHeight || 0;

    if (!asset || measuredWidth <= 0 || measuredHeight <= 0) {
      return null;
    }

    const widthScale = measuredWidth / asset.naturalWidth;
    const heightScale = measuredHeight / asset.naturalHeight;
    const scale = Math.min(widthScale, heightScale);
    const width = Math.max(1, asset.naturalWidth * scale);
    const height = Math.max(1, asset.naturalHeight * scale);

    return {
      x: (measuredWidth - width) / 2,
      y: (measuredHeight - height) / 2,
      width,
      height,
    };
  }, [asset, workspaceSize]);

  const cropPixels = useMemo(() => normalizedCropToPixels(crop, imageRect), [crop, imageRect]);

  const cropOutput = useMemo(() => {
    if (!asset) {
      return { width: 0, height: 0 };
    }

    return {
      width: Math.max(1, Math.round(crop.width * asset.naturalWidth)),
      height: Math.max(1, Math.round(crop.height * asset.naturalHeight)),
    };
  }, [asset, crop]);

  const previewStyle = useMemo(() => {
    if (!imageRect) return null;

    return {
      left: `${imageRect.x + cropPixels.x}px`,
      top: `${imageRect.y + cropPixels.y}px`,
      width: `${cropPixels.width}px`,
      height: `${cropPixels.height}px`,
    };
  }, [cropPixels, imageRect]);

  function clearPreview() {
    if (previewRef.current?.url) {
      URL.revokeObjectURL(previewRef.current.url);
    }

    previewRef.current = null;
    setPreview(null);
  }

  function replacePreview(nextPreview) {
    if (previewRef.current?.url) {
      URL.revokeObjectURL(previewRef.current.url);
    }

    previewRef.current = nextPreview;
    setPreview(nextPreview);
  }

  function cleanupAsset() {
    const currentAsset = assetRef.current;

    if (!currentAsset) return;

    if (currentAsset.currentUrl && currentAsset.currentUrl !== currentAsset.originalUrl) {
      URL.revokeObjectURL(currentAsset.currentUrl);
    }

    if (currentAsset.originalUrl) {
      URL.revokeObjectURL(currentAsset.originalUrl);
    }

    currentImageRef.current = null;
    originalAssetRef.current = null;
    assetRef.current = null;
  }

  async function loadIncomingFile(file) {
    if (!file || !isSupportedImageFile(file)) {
      setAlertMessage(text.invalidType);
      return;
    }

    setIsBusy(true);
    setAlertMessage("");

    try {
      clearPreview();
      cleanupAsset();

      const loaded = await loadImageFile(file);
      const nextAsset = {
        name: file.name,
        currentUrl: loaded.url,
        naturalWidth: loaded.width,
        naturalHeight: loaded.height,
        originalUrl: loaded.url,
        hasEdits: false,
      };

      currentImageRef.current = loaded.image;
      originalAssetRef.current = {
        url: loaded.url,
        image: loaded.image,
        width: loaded.width,
        height: loaded.height,
      };

      assetRef.current = nextAsset;
      setAsset(nextAsset);
      setCrop(createDefaultCrop(null, nextAsset.naturalWidth, nextAsset.naturalHeight));
      setActivePreset("free");
      setExportFormat("png");
      setQuality(0.92);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setAlertMessage(text.loadError);
    } finally {
      setIsBusy(false);
      setIsDragging(false);
    }
  }

  function handleFileList(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const file = files.find(isSupportedImageFile) || files[0];
    loadIncomingFile(file);
  }

  function clearAll() {
    clearPreview();
    cleanupAsset();
    setAsset(null);
    setCrop(createDefaultCrop(null));
    setActivePreset("free");
    setExportFormat("png");
    setQuality(0.92);
    setAlertMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetEdits() {
    if (!assetRef.current || !originalAssetRef.current) return;

    const currentAsset = assetRef.current;
    const originalAsset = originalAssetRef.current;

    if (currentAsset.currentUrl && currentAsset.currentUrl !== currentAsset.originalUrl) {
      URL.revokeObjectURL(currentAsset.currentUrl);
    }

    const nextAsset = {
      ...currentAsset,
      currentUrl: originalAsset.url,
      naturalWidth: originalAsset.width,
      naturalHeight: originalAsset.height,
      hasEdits: false,
    };

    currentImageRef.current = originalAsset.image;
    assetRef.current = nextAsset;
    setAsset(nextAsset);
    setCrop(createDefaultCrop(getAspectRatioById(activePreset), nextAsset.naturalWidth, nextAsset.naturalHeight));
    setAlertMessage("");
  }

  async function rotateCurrent(direction) {
    if (!assetRef.current || !currentImageRef.current) return;

    setIsBusy(true);
    setAlertMessage("");

    try {
      const rotated = await rotateImage(currentImageRef.current, direction);
      const currentAsset = assetRef.current;

      if (currentAsset.currentUrl && currentAsset.currentUrl !== currentAsset.originalUrl) {
        URL.revokeObjectURL(currentAsset.currentUrl);
      }

      currentImageRef.current = rotated.image;

      const nextAsset = {
        ...currentAsset,
        currentUrl: rotated.url,
        naturalWidth: rotated.width,
        naturalHeight: rotated.height,
        hasEdits: true,
      };

      assetRef.current = nextAsset;
      setAsset(nextAsset);
      setCrop(createDefaultCrop(getAspectRatioById(activePreset), nextAsset.naturalWidth, nextAsset.naturalHeight));
    } catch {
      setAlertMessage(text.rotateError);
    } finally {
      setIsBusy(false);
    }
  }

  function downloadPreview() {
    if (!preview?.url) return;

    const fileName = `${safeFilePart(getFileBaseName(asset?.name))}-crop.${preview.extension}`;
    const link = document.createElement("a");
    link.href = preview.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function beginInteraction(event, mode, handle = "") {
    if (!imageRect || !asset) return;

    event.preventDefault();
    event.stopPropagation();

    interactionRef.current = {
      mode,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCrop: cropPixels,
    };

    setIsInteracting(true);
  }

  useEffect(() => {
    function handlePointerMove(event) {
      const interaction = interactionRef.current;

      if (!interaction || !imageRect || !workspaceRef.current) {
        return;
      }

      if (interaction.mode === "move") {
        const deltaX = event.clientX - interaction.startClientX;
        const deltaY = event.clientY - interaction.startClientY;
        const nextCropPixels = {
          ...interaction.startCrop,
          x: clamp(interaction.startCrop.x + deltaX, 0, imageRect.width - interaction.startCrop.width),
          y: clamp(interaction.startCrop.y + deltaY, 0, imageRect.height - interaction.startCrop.height),
        };

        setCrop(pixelsToNormalizedCrop(nextCropPixels, imageRect));
        return;
      }

      if (interaction.mode === "resize") {
        const pointer = getLocalPointer(event, workspaceRef.current, imageRect);
        const deltaX = event.clientX - interaction.startClientX;
        const deltaY = event.clientY - interaction.startClientY;

        const nextCropPixels = aspectRatio
          ? resizeLockedCrop(interaction.startCrop, interaction.handle, pointer, imageRect, aspectRatio)
          : resizeFreeCrop(interaction.startCrop, interaction.handle, deltaX, deltaY, imageRect);

        setCrop(pixelsToNormalizedCrop(nextCropPixels, imageRect));
      }
    }

    function handlePointerUp() {
      if (!interactionRef.current) return;
      interactionRef.current = null;
      setIsInteracting(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [aspectRatio, imageRect]);

  useEffect(() => {
    if (!asset || !currentImageRef.current) {
      clearPreview();
      return undefined;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsPreviewRendering(true);

      try {
        const result = await renderCroppedImage({
          image: currentImageRef.current,
          crop,
          width: asset.naturalWidth,
          height: asset.naturalHeight,
          format: exportFormat,
          quality,
        });

        if (isCancelled) {
          URL.revokeObjectURL(result.url);
          return;
        }

        replacePreview(result);
        setAlertMessage("");
      } catch {
        if (!isCancelled) {
          setAlertMessage(text.previewError);
        }
      } finally {
        if (!isCancelled) {
          setIsPreviewRendering(false);
        }
      }
    }, 90);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [asset, crop, exportFormat, quality, text.previewError]);

  const resizeHandles = aspectRatio ? ["nw", "ne", "se", "sw"] : ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

  return (
    <section className="section shell" id="image-cropper" aria-label={hideHeader ? text.title : undefined}>
      <div className="glass-card cropper-wrap">
        {!hideHeader ? (
          <>
            <h2>{text.title}</h2>
            <p className="section-subtitle">{text.subtitle}</p>
          </>
        ) : null}

        <div className={`cropper-tool-panel${hideHeader ? " is-headerless" : ""}`}>
          <input
            ref={fileInputRef}
            className="cropper-file-input"
            id="image-cropper-upload"
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif"
            onChange={(event) => handleFileList(event.target.files)}
          />

          {!asset ? (
            <>
              <label
                className={`cropper-dropzone${isDragging ? " is-dragging" : ""}`}
                htmlFor="image-cropper-upload"
                onDragEnter={() => setIsDragging(true)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFileList(event.dataTransfer?.files);
                }}
              >
                <span className="cropper-drop-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M19 18H6a4 4 0 0 1-.2-8A6 6 0 0 1 17 8a4 4 0 0 1 2 7.4V18Zm-7-9-4 4h3v4h2v-4h3l-4-4Z" />
                  </svg>
                </span>
                <span>{text.dropzone}</span>
              </label>

              <p className="cropper-supported">{text.supported}</p>
              {alertMessage ? <p className="webp-alert">{alertMessage}</p> : null}

              <div className="cropper-empty">
                <h3>{text.emptyTitle}</h3>
                <p>{text.emptySubtitle}</p>
              </div>
            </>
          ) : (
            <>
              <div className="cropper-toolbar">
                <div className="cropper-toolbar-actions">
                  <label className="btn btn-primary" htmlFor="image-cropper-upload">
                    {text.replaceImage}
                  </label>
                  <button type="button" className="btn btn-secondary" onClick={() => rotateCurrent("left")} disabled={isBusy}>
                    {text.rotateLeft}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => rotateCurrent("right")}
                    disabled={isBusy}
                  >
                    {text.rotateRight}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetEdits} disabled={isBusy}>
                    {text.resetEdits}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={clearAll} disabled={isBusy}>
                    {text.clear}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={downloadPreview}
                    disabled={!preview?.url || isPreviewRendering || isBusy}
                  >
                    {text.download}
                  </button>
                </div>
                <p className="cropper-helper-note">{text.helperNote}</p>
              </div>

              {alertMessage ? <p className="webp-alert">{alertMessage}</p> : null}

              <div className="cropper-workbench">
                <div className="cropper-editor-card">
                  <div
                    ref={workspaceRef}
                    className={`cropper-workspace${isInteracting ? " is-interacting" : ""}`}
                    aria-label={text.workspaceLabel}
                  >
                    {imageRect ? (
                      <>
                        <div
                          className="cropper-image-stage"
                          style={{
                            left: `${imageRect.x}px`,
                            top: `${imageRect.y}px`,
                            width: `${imageRect.width}px`,
                            height: `${imageRect.height}px`,
                          }}
                        >
                          <img src={asset.currentUrl} alt={asset.name} draggable="false" />
                        </div>

                        <div
                          className={`cropper-selection${aspectRatio ? " is-locked" : ""}`}
                          style={previewStyle || undefined}
                          onPointerDown={(event) => beginInteraction(event, "move")}
                        >
                          <div className="cropper-selection-grid" aria-hidden="true" />
                          <span className="cropper-selection-size">
                            {cropOutput.width} x {cropOutput.height}
                          </span>
                          {resizeHandles.map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              className={`cropper-handle is-${handle}`}
                              onPointerDown={(event) => beginInteraction(event, "resize", handle)}
                              aria-label={`${text.resizeLabel} ${handle}`}
                            />
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="cropper-stat-row">
                    <span className="cropper-stat-chip">
                      {text.originalDimensions}: {asset.naturalWidth} x {asset.naturalHeight}px
                    </span>
                    <span className="cropper-stat-chip">
                      {text.cropDimensions}: {cropOutput.width} x {cropOutput.height}px
                    </span>
                    {preview?.blob ? (
                      <span className="cropper-stat-chip">
                        {text.fileSize}: {formatBytes(preview.blob.size)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <aside className="cropper-sidebar">
                  <div className="cropper-card">
                    <div className="cropper-card-head">
                      <h3>{text.aspectLabel}</h3>
                      <p>{text.aspectHint}</p>
                    </div>

                    <div className="cropper-chip-grid">
                      {ASPECT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`cropper-chip${activePreset === option.id ? " is-active" : ""}`}
                          onClick={() => {
                            const nextRatio = getAspectRatioById(option.id);
                            setActivePreset(option.id);
                            setCrop((currentCrop) =>
                              nextRatio
                                ? adaptCropToAspect(
                                    currentCrop,
                                    nextRatio,
                                    asset?.naturalWidth,
                                    asset?.naturalHeight
                                  )
                                : currentCrop
                            );
                          }}
                        >
                          {text.presets?.[option.id] || option.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cropper-card">
                    <div className="cropper-card-head">
                      <h3>{text.exportLabel}</h3>
                      <p>{text.exportHint}</p>
                    </div>

                    <div className="cropper-format-list" role="radiogroup" aria-label={text.exportLabel}>
                      {EXPORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`cropper-format${exportFormat === option.id ? " is-active" : ""}`}
                          onClick={() => setExportFormat(option.id)}
                        >
                          {text.formats?.[option.id] || option.id.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {exportFormat === "png" ? (
                      <p className="cropper-quality-note">{text.losslessHint}</p>
                    ) : (
                      <div className="cropper-quality">
                        <label className="webp-quality-label" htmlFor="cropper-quality">
                          <span>{text.qualityLabel}</span>
                          <strong>{Math.round(quality * 100)}%</strong>
                        </label>
                        <input
                          id="cropper-quality"
                          type="range"
                          min="0.4"
                          max="1"
                          step="0.01"
                          value={quality}
                          onChange={(event) => setQuality(clamp(Number(event.target.value), 0.4, 1))}
                        />
                        <p className="webp-quality-hint">{text.qualityHint}</p>
                      </div>
                    )}
                  </div>

                  <div className="cropper-card">
                    <div className="cropper-card-head">
                      <h3>{text.previewLabel}</h3>
                      <p>{text.previewHint}</p>
                    </div>

                    <div className="cropper-preview-frame">
                      {preview?.url ? (
                        <img src={preview.url} alt={text.previewAlt} />
                      ) : (
                        <div className="cropper-preview-placeholder">{text.previewEmpty}</div>
                      )}
                    </div>

                    <div className="cropper-preview-meta">
                      <span>{isPreviewRendering ? text.previewRendering : text.previewReady}</span>
                      {preview?.blob ? <strong>{formatBytes(preview.blob.size)}</strong> : null}
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
