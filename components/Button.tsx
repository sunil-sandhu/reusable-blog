"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
