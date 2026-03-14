"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LOCAL_STORAGE_KEY = "manjula-resume-builder-v1";
const TEMPLATE_IDS = new Set(["classic", "split"]);

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function splitLines(value) {
  return toText(value)
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeHref(value, fallbackProtocol = "https://") {
  const trimmed = toText(value);
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return `${fallbackProtocol}${trimmed}`;
}

function safeFilePart(value) {
  const normalized = String(value || "resume")
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "resume";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getImageMimeTypeFromDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-z0-9.+-]+);/i);
  return match?.[1]?.toLowerCase() || "";
}

function getPdfImageFormatFromDataUrl(dataUrl) {
  const mimeType = getImageMimeTypeFromDataUrl(dataUrl);

  if (mimeType.includes("png")) return "PNG";
  if (mimeType.includes("webp")) return "WEBP";
  return "JPEG";
}

async function dataUrlToArrayBuffer(dataUrl) {
  const response = await fetch(dataUrl);
  return response.arrayBuffer();
}

function loadImageElementFromFile(file) {
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
      reject(new Error("Unable to load image"));
    };

    image.src = sourceUrl;
  });
}

async function preparePhotoDataUrl(file) {
  if (!file || !String(file.type || "").toLowerCase().startsWith("image/")) {
    throw new Error("Unsupported image file");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Canvas unavailable");
  }

  const maxSide = 720;

  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);

    try {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.86);
    } finally {
      bitmap.close();
    }
  }

  const decoded = await loadImageElementFromFile(file);

  try {
    const width = decoded.image.naturalWidth || decoded.image.width;
    const height = decoded.image.naturalHeight || decoded.image.height;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    decoded.revoke();
  }
}

function createExperience() {
  return {
    id: createId("exp"),
    role: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

function createEducation() {
  return {
    id: createId("edu"),
    degree: "",
    school: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

function createLink() {
  return {
    id: createId("link"),
    label: "",
    url: "",
  };
}

function createDefaultResume() {
  return {
    template: "classic",
    personal: {
      fullName: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      photo: "",
      photoName: "",
    },
    summary: "",
    skills: [],
    experience: [createExperience()],
    education: [createEducation()],
    links: [createLink()],
  };
}

function normalizeExperienceItem(item) {
  return {
    id: toText(item?.id) || createId("exp"),
    role: toText(item?.role),
    company: toText(item?.company),
    location: toText(item?.location),
    startDate: toText(item?.startDate),
    endDate: toText(item?.endDate),
    current: Boolean(item?.current),
    description: typeof item?.description === "string" ? item.description : "",
  };
}

function normalizeEducationItem(item) {
  return {
    id: toText(item?.id) || createId("edu"),
    degree: toText(item?.degree),
    school: toText(item?.school),
    location: toText(item?.location),
    startDate: toText(item?.startDate),
    endDate: toText(item?.endDate),
    description: typeof item?.description === "string" ? item.description : "",
  };
}

function normalizeLinkItem(item) {
  return {
    id: toText(item?.id) || createId("link"),
    label: toText(item?.label),
    url: toText(item?.url),
  };
}

function normalizeSkills(value) {
  const seen = new Set();

  return toArray(value).reduce((list, item) => {
    const skill = toText(item);
    const normalizedKey = skill.toLowerCase();

    if (!skill || seen.has(normalizedKey)) {
      return list;
    }

    seen.add(normalizedKey);
    list.push(skill);
    return list;
  }, []);
}

function normalizeResumeData(value) {
  const defaults = createDefaultResume();
  const source = value && typeof value === "object" ? value : {};

  const experience = toArray(source.experience).map(normalizeExperienceItem);
  const education = toArray(source.education).map(normalizeEducationItem);
  const links = toArray(source.links).map(normalizeLinkItem);

  return {
    template: TEMPLATE_IDS.has(source.template) ? source.template : defaults.template,
    personal: {
      fullName: toText(source.personal?.fullName),
      role: toText(source.personal?.role),
      email: toText(source.personal?.email),
      phone: toText(source.personal?.phone),
      location: toText(source.personal?.location),
      website: toText(source.personal?.website),
      linkedin: toText(source.personal?.linkedin),
      github: toText(source.personal?.github),
      photo: toText(source.personal?.photo),
      photoName: toText(source.personal?.photoName),
    },
    summary: typeof source.summary === "string" ? source.summary : "",
    skills: normalizeSkills(source.skills),
    experience: experience.length ? experience : defaults.experience,
    education: education.length ? education : defaults.education,
    links: links.length ? links : defaults.links,
  };
}

function hasExperienceContent(item) {
  return Boolean(
    toText(item?.role) ||
      toText(item?.company) ||
      toText(item?.location) ||
      toText(item?.startDate) ||
      toText(item?.endDate) ||
      splitLines(item?.description).length
  );
}

function hasEducationContent(item) {
  return Boolean(
    toText(item?.degree) ||
      toText(item?.school) ||
      toText(item?.location) ||
      toText(item?.startDate) ||
      toText(item?.endDate) ||
      splitLines(item?.description).length
  );
}

function hasLinkContent(item) {
  return Boolean(toText(item?.label) || toText(item?.url));
}

function formatMonthValue(value, locale) {
  const trimmed = toText(value);

  if (!/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const [year, month] = trimmed.split("-").map(Number);
  const parsed = new Date(year, month - 1, 1);

  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateRange(startDate, endDate, current, locale, text) {
  const start = formatMonthValue(startDate, locale);
  const end = current ? text.present : formatMonthValue(endDate, locale);

  if (start && end) {
    return `${start} - ${end}`;
  }

  if (start) {
    return start;
  }

  return end;
}

function buildResumeModel(form, locale, text) {
  const personal = {
    fullName: toText(form.personal?.fullName),
    role: toText(form.personal?.role),
    email: toText(form.personal?.email),
    phone: toText(form.personal?.phone),
    location: toText(form.personal?.location),
    website: toText(form.personal?.website),
    linkedin: toText(form.personal?.linkedin),
    github: toText(form.personal?.github),
    photo: toText(form.personal?.photo),
    photoName: toText(form.personal?.photoName),
  };

  const summary = toText(form.summary);
  const skills = normalizeSkills(form.skills);
  const experience = toArray(form.experience)
    .map((item) => ({
      ...normalizeExperienceItem(item),
      bullets: splitLines(item?.description),
      dateRange: formatDateRange(item?.startDate, item?.endDate, item?.current, locale, text),
    }))
    .filter(hasExperienceContent);
  const education = toArray(form.education)
    .map((item) => ({
      ...normalizeEducationItem(item),
      bullets: splitLines(item?.description),
      dateRange: formatDateRange(item?.startDate, item?.endDate, false, locale, text),
    }))
    .filter(hasEducationContent);
  const links = toArray(form.links)
    .map((item) => ({
      ...normalizeLinkItem(item),
      href: normalizeHref(item?.url),
    }))
    .filter(hasLinkContent);
  const contactItems = [
    {
      id: "email",
      label: text.email,
      value: personal.email,
      href: personal.email ? `mailto:${personal.email}` : "",
    },
    {
      id: "phone",
      label: text.phone,
      value: personal.phone,
      href: personal.phone ? `tel:${personal.phone}` : "",
    },
    {
      id: "location",
      label: text.location,
      value: personal.location,
      href: "",
    },
    {
      id: "website",
      label: text.website,
      value: personal.website,
      href: normalizeHref(personal.website),
    },
    {
      id: "linkedin",
      label: text.linkedin,
      value: personal.linkedin,
      href: normalizeHref(personal.linkedin),
    },
    {
      id: "github",
      label: text.github,
      value: personal.github,
      href: normalizeHref(personal.github),
    },
  ].filter((item) => item.value);

  const hasContent =
    Boolean(summary) ||
    Boolean(personal.fullName) ||
    Boolean(personal.role) ||
    Boolean(personal.photo) ||
    contactItems.length > 0 ||
    skills.length > 0 ||
    experience.length > 0 ||
    education.length > 0 ||
    links.length > 0;

  return {
    template: TEMPLATE_IDS.has(form.template) ? form.template : "classic",
    personal,
    summary,
    skills,
    experience,
    education,
    links,
    contactItems,
    hasContent,
    previewName: personal.fullName || text.previewName,
    previewRole: personal.role || text.previewRole,
    summaryPreview: summary || text.emptySummary,
    fileNameBase: safeFilePart(personal.fullName || text.defaultFileName),
    exportName: personal.fullName || text.resumeTitle,
    exportRole: personal.role,
    photoDataUrl: personal.photo,
    photoName: personal.photoName,
  };
}

function drawClassicPdf(doc, model, text) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 50;
  const marginY = 54;
  const contentWidth = pageWidth - marginX * 2;
  const theme = {
    text: [42, 48, 86],
    muted: [91, 100, 140],
    accent: [120, 136, 244],
    border: [221, 228, 245],
  };

  let cursorY = marginY;
  const headerPhotoSize = model.photoDataUrl ? 86 : 0;
  const headerPhotoX = pageWidth - marginX - headerPhotoSize;
  const headerTextWidth = contentWidth - (headerPhotoSize ? headerPhotoSize + 20 : 0);

  const applyTextStyle = (size, weight = "normal", color = theme.text) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const drawContinuationHeader = () => {
    applyTextStyle(10, "bold", theme.muted);
    doc.text(model.exportName, marginX, cursorY);
    applyTextStyle(10, "normal", theme.muted);
    if (model.exportRole) {
      doc.text(model.exportRole, pageWidth - marginX, cursorY, { align: "right" });
    }
    cursorY += 10;
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 18;
  };

  const ensureSpace = (height) => {
    if (cursorY + height <= pageHeight - marginY) {
      return;
    }

    doc.addPage();
    cursorY = marginY;
    drawContinuationHeader();
  };

  const writeParagraph = (value, options = {}) => {
    const {
      size = 10.5,
      weight = "normal",
      color = theme.muted,
      lineHeight = 14,
      gapAfter = 0,
      indent = 0,
      x = marginX + indent,
      maxWidth = contentWidth - indent,
    } = options;
    const textValue = toText(value);

    if (!textValue) {
      return;
    }

    const lines = doc.splitTextToSize(textValue, maxWidth);
    ensureSpace(lines.length * lineHeight + gapAfter);
    applyTextStyle(size, weight, color);
    doc.text(lines, x, cursorY);
    cursorY += lines.length * lineHeight + gapAfter;
  };

  const writeSectionHeading = (value) => {
    ensureSpace(30);
    applyTextStyle(11, "bold", theme.accent);
    doc.text(String(value).toUpperCase(), marginX, cursorY);
    cursorY += 8;
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 16;
  };

  const contactLine = model.contactItems.map((item) => item.value).join("  |  ");

  if (model.photoDataUrl) {
    try {
      doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(headerPhotoX - 4, marginY - 4, headerPhotoSize + 8, headerPhotoSize + 8, 14, 14, "FD");
      doc.addImage(
        model.photoDataUrl,
        getPdfImageFormatFromDataUrl(model.photoDataUrl),
        headerPhotoX,
        marginY,
        headerPhotoSize,
        headerPhotoSize,
        undefined,
        "FAST"
      );
    } catch {
      // Keep PDF generation going even if the image can't be embedded.
    }
  }

  writeParagraph(model.exportName, {
    size: 28,
    weight: "bold",
    color: theme.text,
    lineHeight: 30,
    gapAfter: 4,
    maxWidth: headerTextWidth,
  });
  if (model.exportRole) {
    writeParagraph(model.exportRole, {
      size: 13,
      weight: "bold",
      color: theme.accent,
      lineHeight: 16,
      gapAfter: 4,
      maxWidth: headerTextWidth,
    });
  }
  if (contactLine) {
    writeParagraph(contactLine, {
      size: 10.5,
      color: theme.muted,
      lineHeight: 14,
      gapAfter: 10,
      maxWidth: headerTextWidth,
    });
  }

  if (headerPhotoSize) {
    cursorY = Math.max(cursorY, marginY + headerPhotoSize + 10);
  }

  if (model.summary) {
    writeSectionHeading(text.summarySection);
    writeParagraph(model.summary, { gapAfter: 10 });
  }

  if (model.experience.length) {
    writeSectionHeading(text.experienceSection);
    model.experience.forEach((item) => {
      const heading = [item.role, item.company].filter(Boolean).join(" - ");
      const meta = [item.dateRange, item.location].filter(Boolean).join(" | ");

      writeParagraph(heading || text.experienceSection, {
        size: 12,
        weight: "bold",
        color: theme.text,
        lineHeight: 16,
        gapAfter: meta ? 1 : 4,
      });
      if (meta) {
        writeParagraph(meta, {
          size: 10,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 5,
        });
      }
      item.bullets.forEach((bullet) => {
        writeParagraph(`- ${bullet}`, {
          size: 10.2,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 2,
          indent: 8,
        });
      });
      cursorY += 8;
    });
  }

  if (model.education.length) {
    writeSectionHeading(text.educationSection);
    model.education.forEach((item) => {
      const heading = [item.degree, item.school].filter(Boolean).join(" - ");
      const meta = [item.dateRange, item.location].filter(Boolean).join(" | ");

      writeParagraph(heading || text.educationSection, {
        size: 12,
        weight: "bold",
        color: theme.text,
        lineHeight: 16,
        gapAfter: meta ? 1 : 4,
      });
      if (meta) {
        writeParagraph(meta, {
          size: 10,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 5,
        });
      }
      item.bullets.forEach((bullet) => {
        writeParagraph(`- ${bullet}`, {
          size: 10.2,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 2,
          indent: 8,
        });
      });
      cursorY += 8;
    });
  }

  if (model.skills.length) {
    writeSectionHeading(text.skillsSection);
    writeParagraph(model.skills.join(" | "), { gapAfter: 10 });
  }

  if (model.links.length) {
    writeSectionHeading(text.linksSection);
    model.links.forEach((item) => {
      const label = item.label ? `${item.label}: ` : "";
      writeParagraph(`${label}${item.url}`, {
        size: 10.2,
        color: theme.muted,
        lineHeight: 13,
        gapAfter: 4,
      });
    });
  }
}

function drawSplitPdf(doc, model, text) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const headerHeight = 104;
  const sidebarX = 34;
  const sidebarWidth = 150;
  const sidebarTop = headerHeight + 28;
  const sidebarBottom = pageHeight - 36;
  const mainX = sidebarX + sidebarWidth + 28;
  const mainWidth = pageWidth - mainX - 40;
  const theme = {
    header: [56, 77, 139],
    sidebar: [240, 245, 255],
    text: [34, 41, 78],
    muted: [90, 100, 142],
    accent: [111, 129, 232],
    border: [220, 227, 243],
  };

  let cursorY = sidebarTop;
  const headerPhotoSize = model.photoDataUrl ? 60 : 0;

  const applyTextStyle = (size, weight = "normal", color = theme.text) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const drawFrame = () => {
    doc.setFillColor(theme.header[0], theme.header[1], theme.header[2]);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    doc.setFillColor(theme.sidebar[0], theme.sidebar[1], theme.sidebar[2]);
    doc.roundedRect(sidebarX, sidebarTop, sidebarWidth, sidebarBottom - sidebarTop, 18, 18, "F");

    const headerTextWidth = pageWidth - 80 - (headerPhotoSize ? headerPhotoSize + 28 : 0);

    if (model.photoDataUrl) {
      try {
        const photoX = pageWidth - 36 - headerPhotoSize;
        const photoY = 22;
        doc.setDrawColor(255, 255, 255);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(photoX - 3, photoY - 3, headerPhotoSize + 6, headerPhotoSize + 6, 12, 12, "FD");
        doc.addImage(
          model.photoDataUrl,
          getPdfImageFormatFromDataUrl(model.photoDataUrl),
          photoX,
          photoY,
          headerPhotoSize,
          headerPhotoSize,
          undefined,
          "FAST"
        );
      } catch {
        // Keep PDF generation going even if the image can't be embedded.
      }
    }

    applyTextStyle(24, "bold", [255, 255, 255]);
    const nameLines = doc.splitTextToSize(model.exportName, headerTextWidth);
    doc.text(nameLines, 40, 48);

    if (model.exportRole) {
      applyTextStyle(12, "normal", [225, 232, 255]);
      const roleLines = doc.splitTextToSize(model.exportRole, headerTextWidth);
      doc.text(roleLines, 40, 78);
    }

    let sidebarCursor = sidebarTop + 24;
    const sidebarSection = (title, rows) => {
      if (!rows.length) return;
      applyTextStyle(10, "bold", theme.accent);
      doc.text(String(title).toUpperCase(), sidebarX + 16, sidebarCursor);
      sidebarCursor += 12;

      rows.forEach((row) => {
        const lines = doc.splitTextToSize(row, sidebarWidth - 32);
        applyTextStyle(9.5, "normal", theme.muted);
        doc.text(lines, sidebarX + 16, sidebarCursor);
        sidebarCursor += lines.length * 12 + 4;
      });

      sidebarCursor += 8;
    };

    sidebarSection(text.contactSection, model.contactItems.map((item) => item.value));
    sidebarSection(text.skillsSection, model.skills);
    sidebarSection(
      text.linksSection,
      model.links.map((item) => (item.label ? `${item.label}: ${item.url}` : item.url))
    );
  };

  const drawContinuationHeader = () => {
    doc.addPage();
    drawFrame();
    cursorY = sidebarTop;
  };

  const ensureSpace = (height) => {
    if (cursorY + height <= pageHeight - 42) {
      return;
    }

    drawContinuationHeader();
  };

  const writeSectionHeading = (value) => {
    ensureSpace(30);
    applyTextStyle(11, "bold", theme.accent);
    doc.text(String(value).toUpperCase(), mainX, cursorY);
    cursorY += 8;
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    doc.line(mainX, cursorY, pageWidth - 40, cursorY);
    cursorY += 16;
  };

  const writeParagraph = (value, options = {}) => {
    const {
      size = 10.3,
      weight = "normal",
      color = theme.muted,
      lineHeight = 14,
      gapAfter = 0,
      indent = 0,
    } = options;
    const textValue = toText(value);

    if (!textValue) {
      return;
    }

    const lines = doc.splitTextToSize(textValue, mainWidth - indent);
    ensureSpace(lines.length * lineHeight + gapAfter);
    applyTextStyle(size, weight, color);
    doc.text(lines, mainX + indent, cursorY);
    cursorY += lines.length * lineHeight + gapAfter;
  };

  drawFrame();

  if (model.summary) {
    writeSectionHeading(text.summarySection);
    writeParagraph(model.summary, { gapAfter: 10 });
  }

  if (model.experience.length) {
    writeSectionHeading(text.experienceSection);
    model.experience.forEach((item) => {
      const heading = [item.role, item.company].filter(Boolean).join(" - ");
      const meta = [item.dateRange, item.location].filter(Boolean).join(" | ");

      writeParagraph(heading || text.experienceSection, {
        size: 11.8,
        weight: "bold",
        color: theme.text,
        lineHeight: 16,
        gapAfter: meta ? 1 : 4,
      });
      if (meta) {
        writeParagraph(meta, {
          size: 9.8,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 5,
        });
      }
      item.bullets.forEach((bullet) => {
        writeParagraph(`- ${bullet}`, {
          size: 10,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 2,
          indent: 8,
        });
      });
      cursorY += 8;
    });
  }

  if (model.education.length) {
    writeSectionHeading(text.educationSection);
    model.education.forEach((item) => {
      const heading = [item.degree, item.school].filter(Boolean).join(" - ");
      const meta = [item.dateRange, item.location].filter(Boolean).join(" | ");

      writeParagraph(heading || text.educationSection, {
        size: 11.8,
        weight: "bold",
        color: theme.text,
        lineHeight: 16,
        gapAfter: meta ? 1 : 4,
      });
      if (meta) {
        writeParagraph(meta, {
          size: 9.8,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 5,
        });
      }
      item.bullets.forEach((bullet) => {
        writeParagraph(`- ${bullet}`, {
          size: 10,
          color: theme.muted,
          lineHeight: 13,
          gapAfter: 2,
          indent: 8,
        });
      });
      cursorY += 8;
    });
  }
}

async function exportResumeDocx(model, text) {
  const docx = await import("docx");
  const {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    ImageRun,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    VerticalAlignTable,
    WidthType,
  } = docx;
  const noneBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: "FFFFFF",
  };
  const noTableBorders = {
    top: noneBorder,
    bottom: noneBorder,
    left: noneBorder,
    right: noneBorder,
    insideHorizontal: noneBorder,
    insideVertical: noneBorder,
  };
  const noCellBorders = {
    top: noneBorder,
    bottom: noneBorder,
    left: noneBorder,
    right: noneBorder,
    start: noneBorder,
    end: noneBorder,
  };
  const photoData = model.photoDataUrl ? await dataUrlToArrayBuffer(model.photoDataUrl) : null;

  const createSectionTitle = (title, color = "6573B2", before = 90) =>
    new Paragraph({
      children: [
        new TextRun({
          text: String(title || "").toUpperCase(),
          bold: true,
          color,
          size: 20,
        }),
      ],
      spacing: {
        before,
        after: 55,
      },
    });

  const createTextParagraph = (value, options = {}) => {
    const content = toText(value);

    if (!content && !options.allowEmpty) {
      return null;
    }

    return new Paragraph({
      alignment: options.alignment,
      spacing: options.spacing || { after: 50 },
      children: [
        new TextRun({
          text: content || " ",
          bold: Boolean(options.bold),
          italics: Boolean(options.italics),
          color: options.color,
          size: options.size,
        }),
      ],
    });
  };

  const createLinkParagraph = (item, options = {}) => {
    const label = item.label && item.url ? `${item.label}: ` : "";
    const linkText = item.url || item.label;

    if (!linkText) {
      return null;
    }

    return new Paragraph({
      spacing: { after: options.after ?? 50 },
      children: [
        ...(label
          ? [
              new TextRun({
                text: label,
                bold: true,
                color: options.labelColor || "55608F",
              }),
            ]
          : []),
        ...(item.href
          ? [
              new ExternalHyperlink({
                link: item.href,
                children: [
                  new TextRun({
                    text: linkText,
                    style: "Hyperlink",
                    color: options.linkColor || "4F62B8",
                  }),
                ],
              }),
            ]
          : [
              new TextRun({
                text: linkText,
                color: options.textColor || "55608F",
              }),
            ]),
      ],
    });
  };

  const createEntryParagraphs = (items) =>
    items.flatMap((item) => {
      const heading = [item.role || item.degree, item.company || item.school].filter(Boolean).join(" - ");
      const meta = [item.dateRange, item.location].filter(Boolean).join(" | ");
      const paragraphs = [];

      if (heading) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: meta ? 22 : 44 },
            children: [
              new TextRun({
                text: heading,
                bold: true,
                color: "2F3568",
              }),
            ],
          })
        );
      }

      if (meta) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: item.bullets.length ? 44 : 60 },
            children: [
              new TextRun({
                text: meta,
                italics: true,
                color: "6B739B",
              }),
            ],
          })
        );
      }

      item.bullets.forEach((bullet) => {
        paragraphs.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
            spacing: { after: 16 },
          })
        );
      });

      if (!item.bullets.length) {
        paragraphs.push(new Paragraph({ text: " ", spacing: { after: 35 } }));
      }

      paragraphs.push(new Paragraph({ text: " ", spacing: { after: 26 } }));
      return paragraphs;
    });

  const createClassicChildren = () => {
    const children = [];
    const contactLine = model.contactItems.map((item) => item.value).join(" | ");

    if (photoData) {
      children.push(
        new Table({
          width: {
            size: 9360,
            type: WidthType.DXA,
          },
          columnWidths: [7240, 2120],
          layout: TableLayoutType.FIXED,
          borders: noTableBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  verticalAlign: VerticalAlignTable.CENTER,
                  borders: noCellBorders,
                  margins: {
                    top: 0,
                    bottom: 60,
                    left: 0,
                    right: 120,
                  },
                  children: [
                    new Paragraph({
                      spacing: { after: 34 },
                      children: [
                        new TextRun({
                          text: model.exportName,
                          bold: true,
                          size: 34,
                          color: "2F3568",
                        }),
                      ],
                    }),
                    ...(model.exportRole
                      ? [
                          new Paragraph({
                            spacing: { after: 34 },
                            children: [
                              new TextRun({
                                text: model.exportRole,
                                bold: true,
                                size: 24,
                                color: "4F5A9C",
                              }),
                            ],
                          }),
                        ]
                      : []),
                    ...(contactLine
                      ? [
                          new Paragraph({
                            spacing: { after: 80 },
                            children: [
                              new TextRun({
                                text: contactLine,
                                color: "5C6798",
                              }),
                            ],
                          }),
                        ]
                      : []),
                  ],
                }),
                new TableCell({
                  verticalAlign: VerticalAlignTable.CENTER,
                  borders: noCellBorders,
                  margins: {
                    top: 0,
                    bottom: 60,
                    left: 0,
                    right: 0,
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new ImageRun({
                          data: photoData,
                          transformation: {
                            width: 96,
                            height: 96,
                          },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    } else {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 44 },
          children: [
            new TextRun({
              text: model.exportName,
              bold: true,
              size: 34,
              color: "2F3568",
            }),
          ],
        })
      );

      if (model.exportRole) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 44 },
            children: [
              new TextRun({
                text: model.exportRole,
                bold: true,
                size: 24,
                color: "4F5A9C",
              }),
            ],
          })
        );
      }

      if (contactLine) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: contactLine,
                color: "5C6798",
              }),
            ],
          })
        );
      }
    }

    const appendSection = (title, items) => {
      if (!items.length) {
        return;
      }

      children.push(createSectionTitle(title, "6573B2", children.length ? 90 : 0));
      children.push(...items);
    };

    appendSection(
      text.summarySection,
      model.summary
        ? [
            createTextParagraph(model.summary, {
              color: "55608F",
              spacing: { after: 70 },
            }),
          ].filter(Boolean)
        : []
    );
    appendSection(text.experienceSection, createEntryParagraphs(model.experience));
    appendSection(text.educationSection, createEntryParagraphs(model.education));
    appendSection(
      text.skillsSection,
      model.skills.length
        ? [
            createTextParagraph(model.skills.join(" | "), {
              color: "55608F",
              spacing: { after: 70 },
            }),
          ].filter(Boolean)
        : []
    );
    appendSection(
      text.linksSection,
      model.links.map((item) =>
        createLinkParagraph(item, {
          labelColor: "55608F",
          linkColor: "4F62B8",
          textColor: "55608F",
        })
      ).filter(Boolean)
    );

    return children;
  };

  const createSplitSidebarChildren = () => {
    const children = [];
    const appendSection = (title, items) => {
      if (!items.length) {
        return;
      }

      children.push(createSectionTitle(title, "6573B2", children.length ? 100 : 0));
      children.push(...items);
    };

    appendSection(
      text.contactSection,
      model.contactItems
        .map((item) =>
          item.href
            ? new Paragraph({
                spacing: { after: 45 },
                children: [
                  new ExternalHyperlink({
                    link: item.href,
                    children: [
                      new TextRun({
                        text: item.value,
                        style: "Hyperlink",
                        color: "4F62B8",
                      }),
                    ],
                  }),
                ],
              })
            : createTextParagraph(item.value, {
                color: "55608F",
                spacing: { after: 45 },
              })
        )
        .filter(Boolean)
    );

    appendSection(
      text.skillsSection,
      model.skills.map((skill) =>
        createTextParagraph(skill, {
          color: "55608F",
          spacing: { after: 36 },
        })
      ).filter(Boolean)
    );

    appendSection(
      text.linksSection,
      model.links
        .map((item) =>
          createLinkParagraph(item, {
            after: 40,
            labelColor: "55608F",
            linkColor: "4F62B8",
            textColor: "55608F",
          })
        )
        .filter(Boolean)
    );

    return children.length ? children : [createTextParagraph(" ", { allowEmpty: true })];
  };

  const createSplitMainChildren = () => {
    const children = [];
    const appendSection = (title, items) => {
      if (!items.length) {
        return;
      }

      children.push(createSectionTitle(title, "6573B2", children.length ? 100 : 0));
      children.push(...items);
    };

    appendSection(
      text.summarySection,
      model.summary
        ? [
            createTextParagraph(model.summary, {
              color: "55608F",
              spacing: { after: 60 },
            }),
          ].filter(Boolean)
        : []
    );
    appendSection(text.experienceSection, createEntryParagraphs(model.experience));
    appendSection(text.educationSection, createEntryParagraphs(model.education));

    return children.length ? children : [createTextParagraph(" ", { allowEmpty: true })];
  };

  const sections =
    model.template === "split"
      ? [
          {
            properties: {
              page: {
                margin: {
                  top: 540,
                  right: 540,
                  bottom: 540,
                  left: 540,
                },
              },
            },
            children: [
              new Table({
                width: {
                  size: 9360,
                  type: WidthType.DXA,
                },
                columnWidths: [2800, 6560],
                layout: TableLayoutType.FIXED,
                borders: noTableBorders,
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        shading: {
                          fill: "445896",
                          color: "auto",
                          type: ShadingType.CLEAR,
                        },
                        borders: noCellBorders,
                        margins: {
                          top: 220,
                          bottom: 220,
                          left: 240,
                          right: 240,
                        },
                        children: photoData
                          ? [
                              new Table({
                                width: {
                                  size: 8720,
                                  type: WidthType.DXA,
                                },
                                columnWidths: [6760, 1960],
                                layout: TableLayoutType.FIXED,
                                borders: noTableBorders,
                                rows: [
                                  new TableRow({
                                    children: [
                                      new TableCell({
                                        verticalAlign: VerticalAlignTable.CENTER,
                                        borders: noCellBorders,
                                        margins: {
                                          top: 0,
                                          bottom: 0,
                                          left: 0,
                                          right: 120,
                                        },
                                        children: [
                                          new Paragraph({
                                            spacing: { after: 36 },
                                            children: [
                                              new TextRun({
                                                text: model.exportName,
                                                bold: true,
                                                size: 34,
                                                color: "FFFFFF",
                                              }),
                                            ],
                                          }),
                                          new Paragraph({
                                            children: [
                                              new TextRun({
                                                text: model.exportRole || " ",
                                                size: 22,
                                                color: "E1E8FF",
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      new TableCell({
                                        verticalAlign: VerticalAlignTable.CENTER,
                                        borders: noCellBorders,
                                        margins: {
                                          top: 0,
                                          bottom: 0,
                                          left: 0,
                                          right: 0,
                                        },
                                        children: [
                                          new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: [
                                              new ImageRun({
                                                data: photoData,
                                                transformation: {
                                                  width: 82,
                                                  height: 82,
                                                },
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ]
                          : [
                              new Paragraph({
                                spacing: { after: 36 },
                                children: [
                                  new TextRun({
                                    text: model.exportName,
                                    bold: true,
                                    size: 34,
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: model.exportRole || " ",
                                    size: 22,
                                    color: "E1E8FF",
                                  }),
                                ],
                              }),
                            ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 2800,
                          type: WidthType.DXA,
                        },
                        verticalAlign: VerticalAlignTable.TOP,
                        shading: {
                          fill: "F4F7FF",
                          color: "auto",
                          type: ShadingType.CLEAR,
                        },
                        borders: noCellBorders,
                        margins: {
                          top: 180,
                          bottom: 180,
                          left: 180,
                          right: 180,
                        },
                        children: createSplitSidebarChildren(),
                      }),
                      new TableCell({
                        width: {
                          size: 6560,
                          type: WidthType.DXA,
                        },
                        verticalAlign: VerticalAlignTable.TOP,
                        borders: noCellBorders,
                        margins: {
                          top: 180,
                          bottom: 180,
                          left: 220,
                          right: 180,
                        },
                        children: createSplitMainChildren(),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ]
      : [
          {
            properties: {
              page: {
                margin: {
                  top: 720,
                  right: 720,
                  bottom: 720,
                  left: 720,
                },
              },
            },
            children: createClassicChildren(),
          },
        ];

  const doc = new Document({
    sections,
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${model.fileNameBase}.docx`);
}

function PreviewSection({ title, children }) {
  return (
    <section className="resume-preview-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function EmptyPreview({ children }) {
  return <p className="resume-preview-empty">{children}</p>;
}

export default function ResumeBuilderTool({ locale, text }) {
  const [form, setForm] = useState(() => createDefaultResume());
  const [skillDraft, setSkillDraft] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (rawValue) {
        const parsed = JSON.parse(rawValue);
        setForm(normalizeResumeData(parsed));
      }
    } catch {
      setForm(createDefaultResume());
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
  }, [form, hasHydrated]);

  const model = useMemo(() => buildResumeModel(form, locale, text), [form, locale, text]);

  const updateTemplate = (template) => {
    if (!TEMPLATE_IDS.has(template)) return;
    setForm((prev) => ({ ...prev, template }));
  };

  const updatePersonalField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateTopLevelField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await preparePhotoDataUrl(file);
      setForm((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          photo: dataUrl,
          photoName: file.name,
        },
      }));
    } catch {
      if (typeof window !== "undefined") {
        window.alert(text.photoError);
      }
    } finally {
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const removePhoto = () => {
    setForm((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        photo: "",
        photoName: "",
      },
    }));

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const updateExperienceItem = (itemId, field, value) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== itemId) return item;

        if (field === "current") {
          return {
            ...item,
            current: Boolean(value),
            endDate: value ? "" : item.endDate,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    }));
  };

  const updateEducationItem = (itemId, field, value) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const updateLinkItem = (itemId, field, value) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [...prev.experience, createExperience()],
    }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, createEducation()],
    }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, createLink()],
    }));
  };

  const removeExperience = (itemId) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== itemId),
    }));
  };

  const removeEducation = (itemId) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== itemId),
    }));
  };

  const removeLink = (itemId) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((item) => item.id !== itemId),
    }));
  };

  const addSkills = () => {
    const nextSkills = skillDraft
      .split(/[,\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nextSkills.length) return;

    setForm((prev) => ({
      ...prev,
      skills: normalizeSkills([...prev.skills, ...nextSkills]),
    }));
    setSkillDraft("");
  };

  const removeSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const clearAll = () => {
    if (typeof window !== "undefined" && !window.confirm(text.clearConfirm)) {
      return;
    }

    const emptyResume = createDefaultResume();
    setForm(emptyResume);
    setSkillDraft("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const downloadPdf = async () => {
    if (!model.hasContent || isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      if (model.template === "split") {
        drawSplitPdf(doc, model, text);
      } else {
        drawClassicPdf(doc, model, text);
      }

      doc.save(`${model.fileNameBase}.pdf`);
    } catch {
      if (typeof window !== "undefined") {
        window.alert(text.pdfError);
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadDocx = async () => {
    if (!model.hasContent || isDownloadingDocx) {
      return;
    }

    setIsDownloadingDocx(true);

    try {
      await exportResumeDocx(model, text);
    } catch {
      if (typeof window !== "undefined") {
        window.alert(text.docxError);
      }
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    <section className="section shell" id="resume-builder">
      <div className="glass-card resume-wrap">
        <h1>{text.title}</h1>
        <p className="section-subtitle">{text.subtitle}</p>

        <div className="resume-builder-grid">
          <div className="resume-editor-panel">
            <section className="resume-block">
              <div className="resume-template-switcher" role="tablist" aria-label={text.templateSection}>
                <button
                  type="button"
                  className={`btn ${form.template === "classic" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => updateTemplate("classic")}
                >
                  {text.templateClassic}
                </button>
                <button
                  type="button"
                  className={`btn ${form.template === "split" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => updateTemplate("split")}
                >
                  {text.templateSplit}
                </button>
              </div>
            </section>

            <section className="resume-block">
              <h3>{text.personalSection}</h3>
              <div className="resume-photo-upload">
                <input
                  ref={photoInputRef}
                  className="resume-photo-input"
                  id="resume-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />

                <div className="resume-photo-upload-card">
                  <div className="resume-photo-thumb">
                    {form.personal.photo ? (
                      <img src={form.personal.photo} alt={form.personal.photoName || text.photoLabel} />
                    ) : (
                      <span>{text.photoPlaceholder}</span>
                    )}
                  </div>

                  <div className="resume-photo-copy">
                    <strong>{text.photoLabel}</strong>
                    <p>{text.photoHint}</p>
                    {form.personal.photoName ? (
                      <span className="resume-photo-name">{form.personal.photoName}</span>
                    ) : null}
                    <div className="resume-photo-actions">
                      <label className="btn btn-secondary" htmlFor="resume-photo-upload">
                        {form.personal.photo ? text.replacePhoto : text.uploadPhoto}
                      </label>
                      {form.personal.photo ? (
                        <button type="button" className="btn btn-secondary" onClick={removePhoto}>
                          {text.removePhoto}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="resume-form-grid">
                <label className="resume-field">
                  <span>{text.fullName}</span>
                  <input
                    type="text"
                    value={form.personal.fullName}
                    onChange={(event) => updatePersonalField("fullName", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.role}</span>
                  <input
                    type="text"
                    value={form.personal.role}
                    onChange={(event) => updatePersonalField("role", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.email}</span>
                  <input
                    type="email"
                    value={form.personal.email}
                    onChange={(event) => updatePersonalField("email", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.phone}</span>
                  <input
                    type="text"
                    value={form.personal.phone}
                    onChange={(event) => updatePersonalField("phone", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.location}</span>
                  <input
                    type="text"
                    value={form.personal.location}
                    onChange={(event) => updatePersonalField("location", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.website}</span>
                  <input
                    type="text"
                    value={form.personal.website}
                    onChange={(event) => updatePersonalField("website", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.linkedin}</span>
                  <input
                    type="text"
                    value={form.personal.linkedin}
                    onChange={(event) => updatePersonalField("linkedin", event.target.value)}
                  />
                </label>

                <label className="resume-field">
                  <span>{text.github}</span>
                  <input
                    type="text"
                    value={form.personal.github}
                    onChange={(event) => updatePersonalField("github", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="resume-block">
              <h3>{text.summarySection}</h3>
              <label className="resume-field resume-field-full">
                <span>{text.summaryLabel}</span>
                <textarea
                  rows="5"
                  value={form.summary}
                  placeholder={text.summaryPlaceholder}
                  onChange={(event) => updateTopLevelField("summary", event.target.value)}
                />
              </label>
            </section>

            <section className="resume-block">
              <h3>{text.skillsSection}</h3>
              <div className="resume-skill-input-row">
                <input
                  type="text"
                  value={skillDraft}
                  placeholder={text.skillPlaceholder}
                  onChange={(event) => setSkillDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSkills();
                    }
                  }}
                />
                <button type="button" className="btn btn-secondary" onClick={addSkills}>
                  {text.addSkill}
                </button>
              </div>

              {form.skills.length ? (
                <div className="resume-skill-list">
                  {form.skills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      className="resume-skill-chip"
                      onClick={() => removeSkill(skill)}
                    >
                      <span>{skill}</span>
                      <span aria-hidden="true">x</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="resume-block-empty">{text.emptySkills}</p>
              )}
            </section>

            <section className="resume-block">
              <div className="resume-list-head">
                <h3>{text.experienceSection}</h3>
                <button type="button" className="btn btn-secondary" onClick={addExperience}>
                  + {text.addExperience}
                </button>
              </div>

              {form.experience.length ? (
                <div className="resume-entry-list">
                  {form.experience.map((item) => (
                    <article className="resume-entry-card" key={item.id}>
                      <div className="resume-entry-grid">
                        <label className="resume-field">
                          <span>{text.jobTitle}</span>
                          <input
                            type="text"
                            value={item.role}
                            onChange={(event) => updateExperienceItem(item.id, "role", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.company}</span>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(event) => updateExperienceItem(item.id, "company", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.location}</span>
                          <input
                            type="text"
                            value={item.location}
                            onChange={(event) => updateExperienceItem(item.id, "location", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.startDate}</span>
                          <input
                            type="month"
                            value={item.startDate}
                            onChange={(event) => updateExperienceItem(item.id, "startDate", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.endDate}</span>
                          <input
                            type="month"
                            value={item.endDate}
                            disabled={item.current}
                            onChange={(event) => updateExperienceItem(item.id, "endDate", event.target.value)}
                          />
                        </label>

                        <label className="resume-checkbox">
                          <input
                            type="checkbox"
                            checked={item.current}
                            onChange={(event) => updateExperienceItem(item.id, "current", event.target.checked)}
                          />
                          <span>{text.currentRole}</span>
                        </label>

                        <label className="resume-field resume-field-full">
                          <span>{text.description}</span>
                          <textarea
                            rows="4"
                            value={item.description}
                            placeholder={text.descriptionPlaceholder}
                            onChange={(event) => updateExperienceItem(item.id, "description", event.target.value)}
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary resume-remove-btn"
                        onClick={() => removeExperience(item.id)}
                      >
                        {text.remove}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="resume-block-empty">{text.emptyExperience}</p>
              )}
            </section>

            <section className="resume-block">
              <div className="resume-list-head">
                <h3>{text.educationSection}</h3>
                <button type="button" className="btn btn-secondary" onClick={addEducation}>
                  + {text.addEducation}
                </button>
              </div>

              {form.education.length ? (
                <div className="resume-entry-list">
                  {form.education.map((item) => (
                    <article className="resume-entry-card" key={item.id}>
                      <div className="resume-entry-grid">
                        <label className="resume-field">
                          <span>{text.degree}</span>
                          <input
                            type="text"
                            value={item.degree}
                            onChange={(event) => updateEducationItem(item.id, "degree", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.school}</span>
                          <input
                            type="text"
                            value={item.school}
                            onChange={(event) => updateEducationItem(item.id, "school", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.location}</span>
                          <input
                            type="text"
                            value={item.location}
                            onChange={(event) => updateEducationItem(item.id, "location", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.startDate}</span>
                          <input
                            type="month"
                            value={item.startDate}
                            onChange={(event) => updateEducationItem(item.id, "startDate", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.endDate}</span>
                          <input
                            type="month"
                            value={item.endDate}
                            onChange={(event) => updateEducationItem(item.id, "endDate", event.target.value)}
                          />
                        </label>

                        <label className="resume-field resume-field-full">
                          <span>{text.description}</span>
                          <textarea
                            rows="3"
                            value={item.description}
                            placeholder={text.educationPlaceholder}
                            onChange={(event) => updateEducationItem(item.id, "description", event.target.value)}
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary resume-remove-btn"
                        onClick={() => removeEducation(item.id)}
                      >
                        {text.remove}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="resume-block-empty">{text.emptyEducation}</p>
              )}
            </section>

            <section className="resume-block">
              <div className="resume-list-head">
                <h3>{text.linksSection}</h3>
                <button type="button" className="btn btn-secondary" onClick={addLink}>
                  + {text.addLink}
                </button>
              </div>

              {form.links.length ? (
                <div className="resume-entry-list">
                  {form.links.map((item) => (
                    <article className="resume-entry-card resume-link-card" key={item.id}>
                      <div className="resume-entry-grid">
                        <label className="resume-field">
                          <span>{text.linkLabel}</span>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(event) => updateLinkItem(item.id, "label", event.target.value)}
                          />
                        </label>

                        <label className="resume-field">
                          <span>{text.linkUrl}</span>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(event) => updateLinkItem(item.id, "url", event.target.value)}
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary resume-remove-btn"
                        onClick={() => removeLink(item.id)}
                      >
                        {text.remove}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="resume-block-empty">{text.emptyLinks}</p>
              )}
            </section>

            <div className="resume-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={downloadPdf}
                disabled={!model.hasContent || isDownloadingPdf}
              >
                {isDownloadingPdf ? `${text.downloadPdf}...` : text.downloadPdf}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={downloadDocx}
                disabled={!model.hasContent || isDownloadingDocx}
              >
                {isDownloadingDocx ? `${text.downloadDocx}...` : text.downloadDocx}
              </button>
              <button type="button" className="btn btn-secondary" onClick={clearAll}>
                {text.clear}
              </button>
            </div>
          </div>

          <aside className="resume-preview-panel">
            <div className="resume-preview-head">
              <h3>{text.livePreview}</h3>
              <span>{form.template === "classic" ? text.templateClassic : text.templateSplit}</span>
            </div>

            {form.template === "split" ? (
              <div className="resume-preview-sheet resume-preview-sheet-split">
                <header className="resume-preview-split-hero">
                  <div className="resume-preview-split-hero-copy">
                    <h2>{model.previewName}</h2>
                    <p>{model.previewRole}</p>
                  </div>
                  {model.photoDataUrl ? (
                    <div className="resume-preview-photo-frame resume-preview-photo-frame-split">
                      <img src={model.photoDataUrl} alt={model.photoName || model.previewName} />
                    </div>
                  ) : null}
                </header>

                <div className="resume-preview-split-grid">
                  <aside className="resume-preview-sidebar">
                    <PreviewSection title={text.contactSection}>
                      {model.contactItems.length ? (
                        <ul className="resume-preview-contact-list">
                          {model.contactItems.map((item) => (
                            <li key={item.id}>
                              {item.href ? (
                                <a href={item.href} target="_blank" rel="noreferrer">
                                  {item.value}
                                </a>
                              ) : (
                                <span>{item.value}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyPreview>{text.emptyContact}</EmptyPreview>
                      )}
                    </PreviewSection>

                    <PreviewSection title={text.skillsSection}>
                      {model.skills.length ? (
                        <div className="resume-preview-chip-list">
                          {model.skills.map((skill) => (
                            <span className="resume-preview-chip" key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <EmptyPreview>{text.emptySkills}</EmptyPreview>
                      )}
                    </PreviewSection>

                    <PreviewSection title={text.linksSection}>
                      {model.links.length ? (
                        <ul className="resume-preview-link-list">
                          {model.links.map((item) => (
                            <li key={item.id}>
                              {item.href ? (
                                <a href={item.href} target="_blank" rel="noreferrer">
                                  {item.label || item.url}
                                </a>
                              ) : (
                                <span>{item.label || item.url}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyPreview>{text.emptyLinks}</EmptyPreview>
                      )}
                    </PreviewSection>
                  </aside>

                  <div className="resume-preview-main">
                    <PreviewSection title={text.summarySection}>
                      <p>{model.summaryPreview}</p>
                    </PreviewSection>

                    <PreviewSection title={text.experienceSection}>
                      {model.experience.length ? (
                        <div className="resume-preview-entry-list">
                          {model.experience.map((item) => (
                            <article className="resume-preview-entry" key={item.id}>
                              <div className="resume-preview-entry-head">
                                <div>
                                  <h5>{[item.role, item.company].filter(Boolean).join(" - ")}</h5>
                                  {item.location ? <p>{item.location}</p> : null}
                                </div>
                                {item.dateRange ? <span>{item.dateRange}</span> : null}
                              </div>
                              {item.bullets.length ? (
                                <ul>
                                  {item.bullets.map((bullet) => (
                                    <li key={`${item.id}-${bullet}`}>{bullet}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyPreview>{text.emptyExperience}</EmptyPreview>
                      )}
                    </PreviewSection>

                    <PreviewSection title={text.educationSection}>
                      {model.education.length ? (
                        <div className="resume-preview-entry-list">
                          {model.education.map((item) => (
                            <article className="resume-preview-entry" key={item.id}>
                              <div className="resume-preview-entry-head">
                                <div>
                                  <h5>{[item.degree, item.school].filter(Boolean).join(" - ")}</h5>
                                  {item.location ? <p>{item.location}</p> : null}
                                </div>
                                {item.dateRange ? <span>{item.dateRange}</span> : null}
                              </div>
                              {item.bullets.length ? (
                                <ul>
                                  {item.bullets.map((bullet) => (
                                    <li key={`${item.id}-${bullet}`}>{bullet}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyPreview>{text.emptyEducation}</EmptyPreview>
                      )}
                    </PreviewSection>
                  </div>
                </div>
              </div>
            ) : (
              <div className="resume-preview-sheet resume-preview-sheet-classic">
                <header className="resume-preview-classic-header">
                  <div className="resume-preview-classic-hero">
                    <div className="resume-preview-classic-copy">
                      <h2>{model.previewName}</h2>
                      <p>{model.previewRole}</p>
                      {model.contactItems.length ? (
                        <div className="resume-preview-inline-contact">
                          {model.contactItems.map((item) => (
                            <span key={item.id}>{item.value}</span>
                          ))}
                        </div>
                      ) : (
                        <EmptyPreview>{text.emptyContact}</EmptyPreview>
                      )}
                    </div>
                    {model.photoDataUrl ? (
                      <div className="resume-preview-photo-frame">
                        <img src={model.photoDataUrl} alt={model.photoName || model.previewName} />
                      </div>
                    ) : null}
                  </div>
                </header>

                <PreviewSection title={text.summarySection}>
                  <p>{model.summaryPreview}</p>
                </PreviewSection>

                <PreviewSection title={text.experienceSection}>
                  {model.experience.length ? (
                    <div className="resume-preview-entry-list">
                      {model.experience.map((item) => (
                        <article className="resume-preview-entry" key={item.id}>
                          <div className="resume-preview-entry-head">
                            <div>
                              <h5>{[item.role, item.company].filter(Boolean).join(" - ")}</h5>
                              {item.location ? <p>{item.location}</p> : null}
                            </div>
                            {item.dateRange ? <span>{item.dateRange}</span> : null}
                          </div>
                          {item.bullets.length ? (
                            <ul>
                              {item.bullets.map((bullet) => (
                                <li key={`${item.id}-${bullet}`}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyPreview>{text.emptyExperience}</EmptyPreview>
                  )}
                </PreviewSection>

                <PreviewSection title={text.educationSection}>
                  {model.education.length ? (
                    <div className="resume-preview-entry-list">
                      {model.education.map((item) => (
                        <article className="resume-preview-entry" key={item.id}>
                          <div className="resume-preview-entry-head">
                            <div>
                              <h5>{[item.degree, item.school].filter(Boolean).join(" - ")}</h5>
                              {item.location ? <p>{item.location}</p> : null}
                            </div>
                            {item.dateRange ? <span>{item.dateRange}</span> : null}
                          </div>
                          {item.bullets.length ? (
                            <ul>
                              {item.bullets.map((bullet) => (
                                <li key={`${item.id}-${bullet}`}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyPreview>{text.emptyEducation}</EmptyPreview>
                  )}
                </PreviewSection>

                <PreviewSection title={text.skillsSection}>
                  {model.skills.length ? (
                    <div className="resume-preview-chip-list">
                      {model.skills.map((skill) => (
                        <span className="resume-preview-chip" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyPreview>{text.emptySkills}</EmptyPreview>
                  )}
                </PreviewSection>

                <PreviewSection title={text.linksSection}>
                  {model.links.length ? (
                    <ul className="resume-preview-link-list">
                      {model.links.map((item) => (
                        <li key={item.id}>
                          {item.href ? (
                            <a href={item.href} target="_blank" rel="noreferrer">
                              {item.label || item.url}
                            </a>
                          ) : (
                            <span>{item.label || item.url}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyPreview>{text.emptyLinks}</EmptyPreview>
                  )}
                </PreviewSection>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

