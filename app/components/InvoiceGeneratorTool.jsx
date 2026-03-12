"use client";

import { useMemo, useRef, useState } from "react";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function parseAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampNonNegative(value) {
  return Math.max(0, parseAmount(value));
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatRate(value) {
  const rounded = roundCurrency(value);
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded).replace(/(\.\d*?[1-9])0+$|\.0+$/g, "$1");
}

let nextItemId = 1;

const CURRENCY_OPTIONS = ["EUR", "USD", "GBP", "INR", "SEK", "NOK"];

const CURRENCY_UNITS = {
  EUR: ["euro", "euros"],
  USD: ["dollar", "dollars"],
  GBP: ["pound", "pounds"],
  INR: ["rupee", "rupees"],
  SEK: ["krona", "kronor"],
  NOK: ["krone", "kroner"],
};

const SMALL_NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS_NUMBERS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function numberToWords(num) {
  const value = Math.floor(Math.abs(num));

  if (value < 20) {
    return SMALL_NUMBERS[value];
  }

  if (value < 100) {
    const tens = TENS_NUMBERS[Math.floor(value / 10)];
    const remainder = value % 10;
    return remainder ? `${tens}-${SMALL_NUMBERS[remainder]}` : tens;
  }

  if (value < 1000) {
    const hundreds = SMALL_NUMBERS[Math.floor(value / 100)];
    const remainder = value % 100;
    return remainder ? `${hundreds} hundred ${numberToWords(remainder)}` : `${hundreds} hundred`;
  }

  if (value < 1000000) {
    const thousands = Math.floor(value / 1000);
    const remainder = value % 1000;
    return remainder
      ? `${numberToWords(thousands)} thousand ${numberToWords(remainder)}`
      : `${numberToWords(thousands)} thousand`;
  }

  if (value < 1000000000) {
    const millions = Math.floor(value / 1000000);
    const remainder = value % 1000000;
    return remainder
      ? `${numberToWords(millions)} million ${numberToWords(remainder)}`
      : `${numberToWords(millions)} million`;
  }

  const billions = Math.floor(value / 1000000000);
  const remainder = value % 1000000000;
  return remainder
    ? `${numberToWords(billions)} billion ${numberToWords(remainder)}`
    : `${numberToWords(billions)} billion`;
}

function currencyUnitLabel(code, amountInteger) {
  const [singular, plural] = CURRENCY_UNITS[code] || ["unit", "units"];
  return amountInteger === 1 ? singular : plural;
}

function amountToWords(amount, currencyCode) {
  const absolute = roundCurrency(Math.abs(amount));
  let integerPart = Math.floor(absolute);
  let cents = Math.round((absolute - integerPart) * 100);
  if (cents === 100) {
    integerPart += 1;
    cents = 0;
  }
  const integerWords = toTitleCase(numberToWords(integerPart));
  const integerLabel = currencyUnitLabel(currencyCode, integerPart);
  const centsWords = cents > 0 ? ` and ${numberToWords(cents)} cents` : "";
  const prefix = amount < 0 ? "Minus " : "";

  return `${prefix}${integerWords} ${integerLabel}${centsWords} only`;
}

function safeFilePart(value) {
  const normalized = String(value || "invoice")
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "invoice";
}

function createItem() {
  return {
    id: `item-${nextItemId++}`,
    description: "",
    qty: "1",
    price: "0",
  };
}

function createDefaultState(defaultCurrency) {
  const year = new Date().getFullYear();

  return {
    companyLogo: "",
    companyLogoName: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    invoiceNumber: `INV-${year}-001`,
    issueDate: getTodayDateString(),
    dueDate: "",
    currency: defaultCurrency,
    taxRate: "0",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    terms: "",
    items: [createItem()],
  };
}

function formatDate(value, locale) {
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  const localeTag = locale === "fi" ? "fi-FI" : "en-US";
  return new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(parsed);
}

export default function InvoiceGeneratorTool({ locale, text }) {
  const defaultCurrency = text.currency || "EUR";
  const [form, setForm] = useState(() => createDefaultState(defaultCurrency));
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const fileInputRef = useRef(null);

  const formatCurrency = useMemo(() => {
    const localeTag = locale === "fi" ? "fi-FI" : "en-US";

    return (value) =>
      new Intl.NumberFormat(localeTag, {
        style: "currency",
        currency: form.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
  }, [locale, form.currency]);

  const calculatedItems = useMemo(
    () =>
      form.items.map((item) => {
        const qty = clampNonNegative(item.qty);
        const price = clampNonNegative(item.price);
        const lineTotal = roundCurrency(qty * price);

        return {
          ...item,
          qty,
          price,
          lineTotal,
        };
      }),
    [form.items]
  );

  const totals = useMemo(() => {
    const subtotal = roundCurrency(
      calculatedItems.reduce((sum, item) => {
        return sum + item.lineTotal;
      }, 0)
    );

    const taxRate = clampNonNegative(form.taxRate);
    const tax = roundCurrency((subtotal * taxRate) / 100);
    const total = roundCurrency(subtotal + tax);

    return { subtotal, taxRate, tax, total };
  }, [calculatedItems, form.taxRate]);

  const taxRateLabel = useMemo(() => formatRate(totals.taxRate), [totals.taxRate]);

  const amountInWords = useMemo(() => amountToWords(totals.total, form.currency), [totals.total, form.currency]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (itemId, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createItem()],
    }));
  };

  const removeItem = (itemId) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      };
    });
  };

  const clearAll = () => {
    setForm(createDefaultState(defaultCurrency));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setLogoFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({
        ...prev,
        companyLogo: result,
        companyLogoName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    setLogoFile(file);
  };

  const handleLogoDrop = (event) => {
    event.preventDefault();
    setIsDraggingLogo(false);
    const file = event.dataTransfer?.files?.[0];
    setLogoFile(file);
  };

  const removeLogo = () => {
    setForm((prev) => ({
      ...prev,
      companyLogo: "",
      companyLogoName: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadPdf = async () => {
    if (isDownloadingPdf) return;

    setIsDownloadingPdf(true);

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 44;
      const rightColStartX = pageWidth - 214;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.setTextColor(23, 26, 36);
      doc.text((text.invoiceTitle || "Invoice").toUpperCase(), pageWidth - marginX, 54, { align: "right" });

      doc.setDrawColor(127, 142, 246);
      doc.setLineWidth(2);
      doc.line(pageWidth - 184, 66, pageWidth - marginX, 66);

      let companyTextX = marginX;
      const companyBlockTop = 82;

      if (form.companyLogo) {
        try {
          const imageMatch = form.companyLogo.match(/^data:image\/(png|jpe?g|webp);/i);
          const formatRaw = imageMatch?.[1]?.toUpperCase() || "PNG";
          const format = formatRaw === "JPG" ? "JPEG" : formatRaw;
          doc.addImage(form.companyLogo, format, marginX, 82, 72, 54, undefined, "FAST");
          companyTextX = marginX + 84;
        } catch {
          companyTextX = marginX;
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 90, 156);
      doc.text((text.from || "From").toUpperCase(), companyTextX, companyBlockTop);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(19);
      doc.setTextColor(47, 53, 104);
      doc.text(form.companyName || text.companyName, companyTextX, companyBlockTop + 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(95, 101, 144);
      const companyLines = [form.companyEmail || "-", form.companyPhone || "-", form.companyAddress || "-"];
      let companyLineY = companyBlockTop + 36;
      companyLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 240);
        doc.text(wrapped, companyTextX, companyLineY);
        companyLineY += wrapped.length * 12;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 85, 116);
      doc.text(`${text.invoiceNumber}:`, rightColStartX, 104);
      doc.text(`${text.issueDate}:`, rightColStartX, 124);
      doc.text(`${text.dueDate}:`, rightColStartX, 144);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(95, 101, 144);
      doc.text(form.invoiceNumber || "-", rightColStartX + 86, 104);
      doc.text(formatDate(form.issueDate, locale), rightColStartX + 86, 124);
      doc.text(formatDate(form.dueDate, locale), rightColStartX + 86, 144);

      const billToTop = Math.max(companyLineY, 172);
      doc.setDrawColor(224, 230, 246);
      doc.setLineWidth(1);
      doc.line(marginX, billToTop, pageWidth - marginX, billToTop);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(79, 90, 156);
      doc.text((text.billTo || "Bill To").toUpperCase(), marginX, billToTop + 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(47, 53, 104);
      doc.text(form.clientName || text.emptyClientName, marginX, billToTop + 38);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(95, 101, 144);
      const clientLines = [form.clientEmail || "-", form.clientPhone || "-", form.clientAddress || "-"];
      let clientLineY = billToTop + 54;
      clientLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 260);
        doc.text(wrapped, marginX, clientLineY);
        clientLineY += wrapped.length * 12;
      });

      const itemRows = calculatedItems.map((item) => {
        return [
          item.description || text.placeholderDescription,
          String(item.qty),
          formatCurrency(item.price),
          formatCurrency(item.lineTotal),
        ];
      });

      autoTable(doc, {
        startY: clientLineY + 10,
        head: [[text.itemDescription, text.itemQty, text.itemPrice, text.total]],
        body: itemRows,
        margin: { left: marginX, right: marginX },
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [63, 72, 104],
          lineColor: [226, 232, 247],
          lineWidth: 0.8,
          cellPadding: { top: 7, right: 10, bottom: 7, left: 10 },
        },
        headStyles: {
          fillColor: [236, 244, 255],
          textColor: [63, 72, 120],
          fontStyle: "bold",
          lineColor: [210, 220, 244],
          lineWidth: 1,
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
        },
      });

      let cursorY = doc.lastAutoTable.finalY + 18;

      const totalsBoxWidth = 226;
      const totalsBoxX = pageWidth - marginX - totalsBoxWidth;
      doc.setFillColor(243, 247, 255);
      doc.setDrawColor(214, 223, 245);
      doc.roundedRect(totalsBoxX, cursorY, totalsBoxWidth, 96, 10, 10, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(79, 85, 116);
      doc.text(`${text.subtotal}:`, totalsBoxX + 12, cursorY + 24);
      doc.text(`${text.tax} (${taxRateLabel}%):`, totalsBoxX + 12, cursorY + 44);
      doc.text(formatCurrency(totals.subtotal), totalsBoxX + totalsBoxWidth - 12, cursorY + 24, {
        align: "right",
      });
      doc.text(formatCurrency(totals.tax), totalsBoxX + totalsBoxWidth - 12, cursorY + 44, {
        align: "right",
      });

      doc.setDrawColor(210, 220, 244);
      doc.line(totalsBoxX + 12, cursorY + 56, totalsBoxX + totalsBoxWidth - 12, cursorY + 56);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(47, 53, 104);
      doc.text(`${text.total}:`, totalsBoxX + 12, cursorY + 78);
      doc.text(formatCurrency(totals.total), totalsBoxX + totalsBoxWidth - 12, cursorY + 78, {
        align: "right",
      });

      cursorY += 110;

      doc.setFillColor(239, 244, 255);
      doc.setDrawColor(200, 213, 243);
      doc.roundedRect(marginX, cursorY, pageWidth - marginX * 2, 40, 8, 8, "FD");
      doc.setDrawColor(127, 142, 246);
      doc.setLineWidth(3);
      doc.line(marginX + 1.5, cursorY + 2, marginX + 1.5, cursorY + 38);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(66, 77, 116);
      doc.text(`${text.amountInWords}: ${amountInWords}`, marginX + 12, cursorY + 24);

      cursorY += 56;

      if (form.bankName || form.bankAccountNumber || form.bankAccountName) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(79, 90, 156);
        doc.text((text.bankSection || "Bank Details").toUpperCase(), marginX, cursorY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(95, 101, 144);
        doc.text(`${text.bankName}: ${form.bankName || "-"}`, marginX, cursorY + 16);
        doc.text(`${text.bankAccountNumber}: ${form.bankAccountNumber || "-"}`, marginX, cursorY + 30);
        doc.text(`${text.bankAccountName}: ${form.bankAccountName || "-"}`, marginX, cursorY + 44);
        cursorY += 58;
      }

      if (form.terms) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(79, 90, 156);
        doc.text((text.terms || "Terms").toUpperCase(), marginX, cursorY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(95, 101, 144);
        const termsLines = doc.splitTextToSize(form.terms, pageWidth - marginX * 2);
        doc.text(termsLines, marginX, cursorY + 14);
        cursorY += 14 + termsLines.length * 12;
      }

      const footerY = Math.max(cursorY + 14, pageHeight - 54);
      doc.setDrawColor(210, 220, 244);
      doc.setLineWidth(1);
      doc.line(marginX, footerY - 14, pageWidth - marginX, footerY - 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(63, 75, 122);
      doc.text(text.thankYou, pageWidth / 2, footerY, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(105, 113, 154);
      if (text.footerNote) {
        doc.text(text.footerNote, pageWidth / 2, footerY + 14, { align: "center" });
      }

      doc.save(`${safeFilePart(form.invoiceNumber)}.pdf`);
    } catch (error) {
      if (typeof window !== "undefined") {
        window.alert("Unable to generate PDF right now. Please try again.");
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <section className="section shell" id="invoice-generator">
      <div className="glass-card invoice-wrap">
        <h2>{text.title}</h2>
        <p className="section-subtitle">{text.subtitle}</p>

        <div className="invoice-builder-grid">
          <div className="invoice-editor-panel">
            <section className="invoice-block">
              <h3>{text.companySection}</h3>

              <div className="invoice-logo-upload">
                <input
                  ref={fileInputRef}
                  className="invoice-logo-input"
                  id="company-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <label
                  className={`invoice-logo-dropzone${isDraggingLogo ? " is-dragging" : ""}`}
                  htmlFor="company-logo-upload"
                  onDragEnter={() => setIsDraggingLogo(true)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={handleLogoDrop}
                >
                  <span className="invoice-upload-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M19 18H6a4 4 0 0 1-.2-8A6 6 0 0 1 17 8a4 4 0 0 1 2 7.4V18Zm-7-9-4 4h3v4h2v-4h3l-4-4Z" />
                    </svg>
                  </span>
                  <span>{form.companyLogoName ? form.companyLogoName : text.uploadLogo}</span>
                </label>
                {form.companyLogo ? (
                  <button
                    type="button"
                    className="btn btn-secondary invoice-logo-remove-btn"
                    onClick={removeLogo}
                  >
                    {text.removeLogo}
                  </button>
                ) : null}
              </div>

              <div className="invoice-form-grid">
                <label className="invoice-field">
                  <span>{text.companyName}</span>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.companyEmail}</span>
                  <input
                    type="email"
                    value={form.companyEmail}
                    onChange={(event) => updateField("companyEmail", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.companyPhone}</span>
                  <input
                    type="text"
                    value={form.companyPhone}
                    onChange={(event) => updateField("companyPhone", event.target.value)}
                  />
                </label>

                <label className="invoice-field invoice-field-full">
                  <span>{text.companyAddress}</span>
                  <textarea
                    rows="2"
                    value={form.companyAddress}
                    onChange={(event) => updateField("companyAddress", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="invoice-block">
              <h3>{text.clientSection}</h3>
              <div className="invoice-form-grid">
                <label className="invoice-field">
                  <span>{text.clientName}</span>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(event) => updateField("clientName", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.clientEmail}</span>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(event) => updateField("clientEmail", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.clientPhone}</span>
                  <input
                    type="text"
                    value={form.clientPhone}
                    onChange={(event) => updateField("clientPhone", event.target.value)}
                  />
                </label>

                <label className="invoice-field invoice-field-full">
                  <span>{text.clientAddress}</span>
                  <textarea
                    rows="2"
                    value={form.clientAddress}
                    onChange={(event) => updateField("clientAddress", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="invoice-block">
              <h3>{text.metaSection}</h3>
              <div className="invoice-form-grid">
                <label className="invoice-field">
                  <span>{text.invoiceNumber}</span>
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={(event) => updateField("invoiceNumber", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.issueDate}</span>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(event) => updateField("issueDate", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.dueDate}</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => updateField("dueDate", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.currencyLabel}</span>
                  <select
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value)}
                  >
                    {CURRENCY_OPTIONS.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="invoice-field">
                  <span>{text.taxRate}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.taxRate}
                    onChange={(event) => updateField("taxRate", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="invoice-block">
              <h3>{text.itemsSection}</h3>

              <div className="invoice-items-list">
                {form.items.map((item) => (
                  <div className="invoice-item-row" key={item.id}>
                    <input
                      type="text"
                      aria-label={text.itemDescription}
                      placeholder={text.itemDescription}
                      value={item.description}
                      onChange={(event) => updateItem(item.id, "description", event.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      aria-label={text.itemQty}
                      placeholder={text.itemQty}
                      value={item.qty}
                      onChange={(event) => updateItem(item.id, "qty", event.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      aria-label={text.itemPrice}
                      placeholder={text.itemPrice}
                      value={item.price}
                      onChange={(event) => updateItem(item.id, "price", event.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary invoice-remove-btn"
                      onClick={() => removeItem(item.id)}
                      disabled={form.items.length <= 1}
                    >
                      {text.remove}
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="btn btn-secondary invoice-add-btn" onClick={addItem}>
                + {text.addItem}
              </button>
            </section>

            <section className="invoice-block">
              <h3>{text.bankSection}</h3>
              <div className="invoice-form-grid">
                <label className="invoice-field">
                  <span>{text.bankName}</span>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(event) => updateField("bankName", event.target.value)}
                  />
                </label>

                <label className="invoice-field">
                  <span>{text.bankAccountNumber}</span>
                  <input
                    type="text"
                    value={form.bankAccountNumber}
                    onChange={(event) => updateField("bankAccountNumber", event.target.value)}
                  />
                </label>

                <label className="invoice-field invoice-field-full">
                  <span>{text.bankAccountName}</span>
                  <input
                    type="text"
                    value={form.bankAccountName}
                    onChange={(event) => updateField("bankAccountName", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="invoice-block">
              <h3>{text.termsSection}</h3>
              <label className="invoice-field invoice-field-full">
                <span>{text.terms}</span>
                <textarea
                  rows="4"
                  value={form.terms}
                  placeholder={text.termsPlaceholder}
                  onChange={(event) => updateField("terms", event.target.value)}
                />
              </label>
            </section>

            <div className="invoice-actions">
              <button
                type="button"
                className="btn btn-primary invoice-download-btn"
                onClick={downloadPdf}
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? `${text.downloadPdf}...` : text.downloadPdf}
              </button>
              <button type="button" className="btn btn-secondary invoice-clear-btn" onClick={clearAll}>
                {text.clear}
              </button>
            </div>
          </div>

          <aside className="invoice-preview-panel">
            <div className="invoice-preview-head">
              <h3>{text.livePreview}</h3>
            </div>

            <div className="invoice-preview-doc" id="invoice-print-root">
              <header className="invoice-preview-top">
                <div className="invoice-preview-company">
                  {form.companyLogo ? (
                    <img
                      className="invoice-preview-logo"
                      src={form.companyLogo}
                      alt={form.companyLogoName || text.companyName}
                    />
                  ) : null}
                  <div>
                    <p className="invoice-label">{text.from}</p>
                    <h4 className="invoice-company-title">{form.companyName || text.companyName}</h4>
                    <p>{form.companyEmail || "-"}</p>
                    <p>{form.companyPhone || "-"}</p>
                    <p>{form.companyAddress || "-"}</p>
                  </div>
                </div>
                <div className="invoice-preview-doc-meta">
                  <p className="invoice-doc-title">{text.invoiceTitle}</p>
                  <div className="invoice-doc-title-underline" />
                  <p>
                    <strong>{text.invoiceNumber}:</strong> {form.invoiceNumber || "-"}
                  </p>
                  <p>
                    <strong>{text.issueDate}:</strong> {formatDate(form.issueDate, locale)}
                  </p>
                  <p>
                    <strong>{text.dueDate}:</strong> {formatDate(form.dueDate, locale)}
                  </p>
                </div>
              </header>

              <section className="invoice-preview-client">
                <p className="invoice-label">{text.billTo}</p>
                <h4>{form.clientName || text.emptyClientName}</h4>
                <p>{form.clientEmail || "-"}</p>
                <p>{form.clientPhone || "-"}</p>
                <p>{form.clientAddress || "-"}</p>
              </section>

              <section className="invoice-preview-items">
                <table>
                  <thead>
                    <tr>
                      <th>{text.itemDescription}</th>
                      <th>{text.itemQty}</th>
                      <th>{text.itemPrice}</th>
                      <th>{text.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedItems.map((item) => {
                      return (
                        <tr key={`preview-${item.id}`}>
                          <td>{item.description || text.placeholderDescription}</td>
                          <td>{item.qty}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              <section className="invoice-preview-totals">
                <p>
                  <span>{text.subtotal}</span>
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </p>
                <p>
                  <span>
                    {text.tax} ({taxRateLabel}%)
                  </span>
                  <strong>{formatCurrency(totals.tax)}</strong>
                </p>
                <p className="invoice-total-line">
                  <span>{text.total}</span>
                  <strong>{formatCurrency(totals.total)}</strong>
                </p>
              </section>

              <section className="invoice-preview-amount-words">
                <p>
                  <strong>{text.amountInWords}:</strong> {amountInWords}
                </p>
              </section>

              {form.bankName || form.bankAccountName || form.bankAccountNumber ? (
                <section className="invoice-preview-bank">
                  <p className="invoice-label">{text.bankSection}</p>
                  <p>
                    <strong>{text.bankName}:</strong> {form.bankName || "-"}
                  </p>
                  <p>
                    <strong>{text.bankAccountNumber}:</strong> {form.bankAccountNumber || "-"}
                  </p>
                  <p>
                    <strong>{text.bankAccountName}:</strong> {form.bankAccountName || "-"}
                  </p>
                </section>
              ) : null}

              {form.terms ? (
                <section className="invoice-preview-notes">
                  <p className="invoice-label">{text.terms}</p>
                  <p>{form.terms}</p>
                </section>
              ) : null}

              <footer className="invoice-preview-footer">
                <p>{text.thankYou}</p>
                {text.footerNote ? <span>{text.footerNote}</span> : null}
              </footer>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
