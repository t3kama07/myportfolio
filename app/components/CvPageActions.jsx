"use client";

import { useState } from "react";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 28;
const HERO_HEIGHT = 136;
const COLUMN_GAP = 16;
const SIDEBAR_WIDTH = 176;
const CONTENT_TOP = MARGIN + HERO_HEIGHT + 16;
const CONTENT_HEIGHT = PAGE_HEIGHT - CONTENT_TOP - MARGIN;
const MAIN_WIDTH = PAGE_WIDTH - (MARGIN * 2) - SIDEBAR_WIDTH - COLUMN_GAP;
const SIDEBAR_X = MARGIN;
const MAIN_X = SIDEBAR_X + SIDEBAR_WIDTH + COLUMN_GAP;
const HERO_X = MARGIN;
const HERO_Y = MARGIN;
const HERO_WIDTH = PAGE_WIDTH - (MARGIN * 2);

function fillPageBackground(doc) {
  doc.setFillColor(244, 242, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
}

function roundedCard(doc, x, y, width, height, fillColor, borderColor) {
  doc.setFillColor(...fillColor);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(x, y, width, height, 16, 16, "FD");
}

function drawWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function getWrappedTextHeight(doc, text, maxWidth, lineHeight) {
  return doc.splitTextToSize(text, maxWidth).length * lineHeight;
}

async function loadImageAsDataUrl(src) {
  const response = await fetch(src);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function createCircularImageDataUrl(src) {
  const sourceDataUrl = await loadImageAsDataUrl(src);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = Math.min(image.width, image.height);
      const offsetX = (image.width - size) / 2;
      const offsetY = (image.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      context.drawImage(image, offsetX, offsetY, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = sourceDataUrl;
  });
}

async function buildCvPdf(pageText, cvData, locale) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const photoDataUrl = await createCircularImageDataUrl(cvData.photo.src).catch(() => "");

  fillPageBackground(doc);
  roundedCard(doc, HERO_X, HERO_Y, HERO_WIDTH, HERO_HEIGHT, [247, 244, 255], [210, 220, 245]);
  roundedCard(doc, SIDEBAR_X, CONTENT_TOP, SIDEBAR_WIDTH, CONTENT_HEIGHT, [245, 248, 255], [210, 220, 245]);
  roundedCard(doc, MAIN_X, CONTENT_TOP, MAIN_WIDTH, CONTENT_HEIGHT, [255, 255, 255], [210, 220, 245]);

  let heroY = HERO_Y + 24;
  doc.setTextColor(93, 105, 170);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(pageText.kicker.toUpperCase(), HERO_X + 22, heroY);

  heroY += 26;
  doc.setTextColor(47, 53, 104);
  doc.setFontSize(25);
  doc.text(cvData.name, HERO_X + 22, heroY);

  heroY += 22;
  doc.setTextColor(68, 81, 137);
  doc.setFontSize(13);
  doc.text(cvData.role, HERO_X + 22, heroY);

  heroY += 18;
  doc.setTextColor(95, 101, 144);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  drawWrappedText(doc, cvData.summary, HERO_X + 22, heroY, HERO_WIDTH - 44, 14);

  let sideY = CONTENT_TOP + 22;

  if (photoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.circle(SIDEBAR_X + 88, sideY + 60, 64, "F");
    doc.addImage(photoDataUrl, "PNG", SIDEBAR_X + 28, sideY, 120, 120, undefined, "MEDIUM");
    doc.setDrawColor(210, 220, 245);
    doc.setLineWidth(1);
    doc.circle(SIDEBAR_X + 88, sideY + 60, 60, "S");
    sideY += 138;
  }

  doc.setTextColor(47, 53, 104);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(pageText.contactTitle, SIDEBAR_X + 18, sideY);
  sideY += 18;

  cvData.contact.forEach((item) => {
    doc.setTextColor(89, 101, 157);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(item.label.toUpperCase(), SIDEBAR_X + 18, sideY);
    sideY += 11;

    doc.setTextColor(66, 80, 135);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    sideY = drawWrappedText(doc, item.value, SIDEBAR_X + 18, sideY, SIDEBAR_WIDTH - 36, 12);
    sideY += 6;
  });

  sideY += 10;
  doc.setTextColor(47, 53, 104);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(pageText.skillsTitle, SIDEBAR_X + 18, sideY);
  sideY += 18;

  cvData.skillGroups.forEach((group) => {
    doc.setFontSize(10);
    doc.text(group.label, SIDEBAR_X + 18, sideY);
    sideY += 12;

    doc.setTextColor(95, 101, 144);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    sideY = drawWrappedText(doc, group.items.join(" - "), SIDEBAR_X + 18, sideY, SIDEBAR_WIDTH - 36, 12);
    sideY += 10;
    doc.setTextColor(47, 53, 104);
    doc.setFont("helvetica", "bold");
  });

  let mainY = CONTENT_TOP + 24;
  const drawMainSection = (title, body) => {
    doc.setTextColor(47, 53, 104);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, MAIN_X + 18, mainY);
    mainY += 16;
    body();
    mainY += 18;
  };

  drawMainSection(pageText.aboutTitle, () => {
    doc.setTextColor(95, 101, 144);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    mainY = drawWrappedText(doc, cvData.about, MAIN_X + 18, mainY, MAIN_WIDTH - 36, 14);
  });

  drawMainSection(pageText.educationTitle, () => {
    cvData.education.forEach((item) => {
      const titleX = MAIN_X + 18;
      const titleRightX = MAIN_X + MAIN_WIDTH - 18;

      doc.setTextColor(47, 53, 104);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const dateWidth = doc.getTextWidth(item.dates);
      const degreeLines = doc.splitTextToSize(
        item.degree,
        Math.max(120, MAIN_WIDTH - 36 - dateWidth - 18)
      );
      doc.text(degreeLines, titleX, mainY);

      doc.setTextColor(93, 105, 170);
      doc.setFontSize(8);
      doc.text(item.dates, titleRightX, mainY, { align: "right" });
      mainY += Math.max(degreeLines.length * 13, 13);

      doc.setTextColor(95, 101, 144);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      mainY = drawWrappedText(doc, item.school, titleX, mainY, MAIN_WIDTH - 36, 13);
      mainY += 8;
    });
  });

  const estimateProjectHeight = (project, width) => {
    let total = 13;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    if (project.subtitle) {
      total += getWrappedTextHeight(doc, project.subtitle, width - 36, 12);
    }

    if (project.links?.length) {
      total += getWrappedTextHeight(
        doc,
        project.links.map((link) => `${link.label}: ${link.href}`).join("   "),
        width - 36,
        10
      );
    }

    project.highlights.forEach((highlight) => {
      total += getWrappedTextHeight(doc, highlight, width - 46, 12);
    });

    return total + 6;
  };

  drawMainSection(pageText.projectsTitle, () => {
    cvData.projects.forEach((project) => {
      doc.setTextColor(47, 53, 104);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(project.title, MAIN_X + 18, mainY);
      mainY += 13;

      if (project.subtitle) {
        doc.setTextColor(68, 81, 137);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        mainY = drawWrappedText(doc, project.subtitle, MAIN_X + 18, mainY, MAIN_WIDTH - 36, 12);
      }

      if (project.links?.length) {
        doc.setTextColor(66, 98, 184);
        doc.setFontSize(8);
        mainY = drawWrappedText(
          doc,
          project.links.map((link) => `${link.label}: ${link.href}`).join("   "),
          MAIN_X + 18,
          mainY,
          MAIN_WIDTH - 36,
          10
        );
      }

      project.highlights.forEach((highlight) => {
        doc.setTextColor(95, 101, 144);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("-", MAIN_X + 18, mainY);
        mainY = drawWrappedText(doc, highlight, MAIN_X + 28, mainY, MAIN_WIDTH - 46, 12);
      });

      mainY += 6;
    });
  });

  sideY += 6;
  doc.setTextColor(47, 53, 104);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(pageText.extraTitle, SIDEBAR_X + 18, sideY);
  sideY += 18;

  cvData.extras.forEach((item) => {
    doc.setTextColor(95, 101, 144);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("-", SIDEBAR_X + 18, sideY);
    sideY = drawWrappedText(doc, item, SIDEBAR_X + 28, sideY, SIDEBAR_WIDTH - 46, 12);
    sideY += 4;
  });

  doc.save(`Manjula-Karunanayaka-CV-${locale}.pdf`);
}

export default function CvPageActions({ pageText, cvData, locale }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await buildCvPdf(pageText, cvData, locale);
    } catch {
      if (typeof window !== "undefined") {
        window.alert(pageText.pdfError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button className="btn btn-primary" type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? pageText.downloadingPdf : pageText.downloadPdf}
    </button>
  );
}
