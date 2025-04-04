// Types
export interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "multiselect";
  label: string;
  required?: boolean;
  placeholder?: string;
  inputType?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FormStructure {
  fields: FormField[];
}

export interface FormProps {
  id: string;
  title: string;
  description?: string;
  structure: FormStructure;
  settings?: {
    successMessage?: string;
  };
  is_public: boolean;
  // Optional callback for custom submission handling
  onSubmit?: (formData: Record<string, any>) => Promise<void>;
  // Optional styling overrides
  className?: string;
  // Optional API endpoint override
  submitEndpoint?: string;
}
