/**
 * Client-side validation helpers for SubX authentication.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter your email address." };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@example.com)." };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Please enter your password." };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }
  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter your name." };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long." };
  }
  return { isValid: true };
}

export function validateCode(code: string): ValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter the verification code." };
  }
  if (!/^\d{6}$/.test(trimmed)) {
    return { isValid: false, error: "Verification code must be 6 digits." };
  }
  return { isValid: true };
}

export function getPasswordStrength(password: string): {
  score: number; // 0 - 3
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
} {
  if (!password) {
    return { score: 0, label: 'Weak', color: '#dc2626' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 3:
      return { score: 3, label: 'Strong', color: '#16a34a' };
    case 2:
      return { score: 2, label: 'Good', color: '#ea7a53' };
    case 1:
      return { score: 1, label: 'Fair', color: '#f59e0b' };
    default:
      return { score: 0, label: 'Weak', color: '#dc2626' };
  }
}
