"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  name,
  id,
  autoComplete,
  required,
  minLength,
  placeholder,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id ?? name;

  return (
    <div className="block">
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="input w-full pr-12"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="password-toggle-btn absolute right-4 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#8a7f76] transition-colors hover:text-[#2b2b2b]"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Eye size={18} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
