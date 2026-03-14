"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm } from "../actions/contact";

const INITIAL_STATE = {
  status: "idle",
  messageKey: "",
  fieldErrors: {},
  submittedAt: 0,
};

function SubmitButton({ label, pendingLabel }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function getFieldError(formText, fieldErrors, fieldName) {
  const messageKey = fieldErrors[fieldName];

  return messageKey ? formText.validation[messageKey] : "";
}

function getStatusMessage(formText, messageKey) {
  return messageKey ? formText[messageKey] : "";
}

export default function ContactForm({ formText }) {
  const [state, formAction] = useActionState(submitContactForm, INITIAL_STATE);
  const formRef = useRef(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, state.submittedAt]);

  const nameError = getFieldError(formText, state.fieldErrors, "name");
  const emailError = getFieldError(formText, state.fieldErrors, "email");
  const messageError = getFieldError(formText, state.fieldErrors, "message");
  const statusMessage = getStatusMessage(formText, state.messageKey);

  return (
    <form ref={formRef} action={formAction} className="contact-form" noValidate>
      <div className="contact-field">
        <label className="contact-label" htmlFor="contact-name">
          {formText.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={120}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "contact-name-error" : undefined}
        />
        {nameError ? (
          <p className="contact-field-error" id="contact-name-error">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="contact-field">
        <label className="contact-label" htmlFor="contact-email">
          {formText.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={160}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "contact-email-error" : undefined}
        />
        {emailError ? (
          <p className="contact-field-error" id="contact-email-error">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="contact-field contact-field-full">
        <label className="contact-label" htmlFor="contact-message">
          {formText.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          maxLength={5000}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "contact-message-error" : undefined}
        />
        {messageError ? (
          <p className="contact-field-error" id="contact-message-error">
            {messageError}
          </p>
        ) : null}
      </div>

      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {statusMessage ? (
        <p
          className={`contact-status ${state.status === "success" ? "is-success" : "is-error"}`}
          role={state.status === "success" ? "status" : "alert"}
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="contact-submit-row">
        <SubmitButton label={formText.send} pendingLabel={formText.sending} />
      </div>
    </form>
  );
}
