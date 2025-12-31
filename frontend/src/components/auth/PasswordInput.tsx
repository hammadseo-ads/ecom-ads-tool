// src/components/auth/PasswordInput.tsx
import React, { useState } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const PasswordInput = ({
  id,
  placeholder = "Enter your password",
  value,
  onChange,
  required = false,
  className = "",
  disabled = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="pr-12 h-12 text-base placeholder:text-gray-400"
        autoComplete="current-password"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-500" />
        ) : (
          <Eye className="h-5 w-5 text-gray-500" />
        )}
      </Button>
    </div>
  );
};

export default PasswordInput;