// FormRenderer.tsx
"use client";

import { useState } from "react";
import { FormField, FormProps } from "./types";
import { baseStyles } from "./baseStyles";

export function FormRenderer({
  id,
  title,
  description,
  structure,
  settings,
  is_public,
  onSubmit,
  className = "",
  submitEndpoint = "/api/form-submissions",
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!is_public) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.error}>
          <p>This form is no longer publicly accessible.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const response = await fetch(submitEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_FORMULA_API_KEY || "",
          },
          body: JSON.stringify({
            form_id: id,
            data: formData,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit form");
        }
      }

      setIsSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to submit form"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type={field.inputType || "text"}
            className={baseStyles.input}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
            required={field.required}
            disabled={isSubmitted}
          />
        );

      case "textarea":
        return (
          <textarea
            className={baseStyles.textarea}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
            required={field.required}
            disabled={isSubmitted}
          />
        );

      case "select":
        return (
          <div className={baseStyles.radioGroup}>
            {field.options?.map((option) => (
              <div key={option.value} className={baseStyles.radioContainer}>
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  id={`${field.id}-${option.value}`}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: option.label })
                  }
                  disabled={isSubmitted}
                />
                <label htmlFor={`${field.id}-${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case "multiselect":
        return (
          <div className={baseStyles.radioGroup}>
            {field.options?.map((option) => (
              <div key={option.value} className={baseStyles.radioContainer}>
                <input
                  type="checkbox"
                  id={`${field.id}-${option.value}`}
                  className={baseStyles.checkbox}
                  onChange={(e) => {
                    const currentValues = formData[field.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.label]
                      : currentValues.filter((v: string) => v !== option.label);
                    setFormData({ ...formData, [field.id]: newValues });
                  }}
                  checked={(formData[field.id] || []).includes(option.label)}
                  disabled={isSubmitted}
                />
                <label htmlFor={`${field.id}-${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className={baseStyles.success}>
        <div className={baseStyles.successContent}>
          <h2 className="text-2xl font-semibold">Thank you!</h2>
          <p>{settings?.successMessage || "Form submitted successfully!"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseStyles.container} ${className}`}>
      <div className={baseStyles.card}>
        <div className={baseStyles.cardHeader}>
          <p className={baseStyles.cardTitle}>{title}</p>
          {/* {description && (
            <p className={baseStyles.cardDescription}>{description}</p>
          )} */}
        </div>
        <div className={baseStyles.cardContent}>
          {error && <div className={baseStyles.error}>{error}</div>}
          <form onSubmit={handleSubmit} className={baseStyles.form}>
            {structure.fields.map((field) => (
              <div key={field.id} className={baseStyles.fieldContainer}>
                <label className={baseStyles.label}>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
            <button
              type="submit"
              className={baseStyles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
        <div className="mt-2 text-center text-sm text-gray-500 border-t border-gray-200 p-2">
          <p>
            Powered by{" "}
            <a
              className="text-blue-500"
              href="https://formulatools.co"
              target="_blank"
            >
              Formula
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
