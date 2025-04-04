"use client";

import { FormRenderer } from "./FormRenderer";
import { useEffect, useState } from "react";
import { FormProps } from "./types";

// Example usage
export default function App() {
  const [form, setForm] = useState<FormProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch(
      "https://formulatools.co/api/v1/forms/52021014-6a65-4a4d-8ee2-ca9b98c8f898",
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_FORMULA_API_KEY || "",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setForm(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching form:", error);
      });
  }, []);

  const defaultForm = {
    id: "form-123",
    title: "Contact Form",
    description: "Please fill out this form",
    is_public: true,
    structure: {
      fields: [
        {
          id: "name",
          type: "text",
          label: "Name",
          required: true,
        },
        // ... more fields
      ],
    },
    settings: {
      successMessage: "Thanks for submitting!",
    },
  };

  // // Optional custom submit handler
  // const handleSubmit = async (formData: Record<string, any>) => {
  //   // Custom submission logic
  //   console.log(formData);
  // };

  if (isLoading) {
    return <div className="text-center">Loading form...</div>;
  }

  return form ? (
    <FormRenderer
      {...form}
      // onSubmit={handleSubmit}
      className="my-custom-class"
      submitEndpoint="https://formulatools.co/api/v1/forms/52021014-6a65-4a4d-8ee2-ca9b98c8f898/submissions"
    />
  ) : null;
}

// // Example usage for fetching a form
// fetch('https://yoursite.com/api/v1/forms/form_id', {
//   headers: {
//     'x-api-key': 'your-api-key'
//   }
// })

// // Example usage for submitting a form
// fetch('https://yoursite.com/api/v1/forms/form_id/submissions', {
//   method: 'POST',
//   headers: {
//     'x-api-key': 'your-api-key',
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({
//     // form data
//     name: 'John Doe',
//     email: 'john@example.com'
//   })
// })
