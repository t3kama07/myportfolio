"use server";

import nodemailer from "nodemailer";

const DEFAULT_TO_EMAIL = "hello@manjula.live";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 5000;

let cachedTransporter;
let cachedTransportKey = "";

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSubjectValue(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getFieldErrors({ name, email, message }) {
  const fieldErrors = {};

  if (!name) {
    fieldErrors.name = "nameRequired";
  } else if (name.length > MAX_NAME_LENGTH) {
    fieldErrors.name = "nameTooLong";
  }

  if (!email) {
    fieldErrors.email = "emailRequired";
  } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    fieldErrors.email = "emailInvalid";
  }

  if (!message) {
    fieldErrors.message = "messageRequired";
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    fieldErrors.message = "messageTooLong";
  }

  return fieldErrors;
}

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secureSetting = process.env.SMTP_SECURE;
  const secure =
    typeof secureSetting === "string"
      ? secureSetting.toLowerCase() === "true"
      : port === 465;
  const from = process.env.CONTACT_FROM_EMAIL || user || DEFAULT_TO_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;

  return { host, port, user, pass, secure, from, to };
}

function getTransporter(config) {
  const transportKey = [
    config.host,
    config.port,
    config.secure,
    config.user,
    config.pass,
  ].join("|");

  if (!cachedTransporter || cachedTransportKey !== transportKey) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    cachedTransportKey = transportKey;
  }

  return cachedTransporter;
}

function buildTextBody({ name, email, message }) {
  return [
    "New portfolio contact submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

function buildHtmlBody({ name, email, message }) {
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 12px;">New portfolio contact submission</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 0 0 16px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
      <p style="margin: 0;">${safeMessage}</p>
    </div>
  `;
}

export async function submitContactForm(_previousState, formData) {
  const honeypot = toText(formData.get("company"));

  if (honeypot) {
    return {
      status: "success",
      messageKey: "success",
      fieldErrors: {},
      submittedAt: Date.now(),
    };
  }

  const submission = {
    name: toText(formData.get("name")),
    email: toText(formData.get("email")).toLowerCase(),
    message: toText(formData.get("message")),
  };

  const fieldErrors = getFieldErrors(submission);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      messageKey: "",
      fieldErrors,
      submittedAt: Date.now(),
    };
  }

  const config = getMailConfig();

  if (!config.host || !config.user || !config.pass || !Number.isFinite(config.port)) {
    console.error("Contact form is missing SMTP configuration.");

    return {
      status: "error",
      messageKey: "configError",
      fieldErrors: {},
      submittedAt: Date.now(),
    };
  }

  try {
    const transporter = getTransporter(config);

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      replyTo: submission.email,
      subject: `Portfolio contact: ${normalizeSubjectValue(submission.name)}`,
      text: buildTextBody(submission),
      html: buildHtmlBody(submission),
    });

    return {
      status: "success",
      messageKey: "success",
      fieldErrors: {},
      submittedAt: Date.now(),
    };
  } catch (error) {
    console.error("Contact form email failed.", error);

    return {
      status: "error",
      messageKey: "submitError",
      fieldErrors: {},
      submittedAt: Date.now(),
    };
  }
}
