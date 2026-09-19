/**
 * Translates Clerk authentication error codes and objects into user-friendly,
 * brand-native messages without any generic "Clerk" terminology.
 */

export interface ClerkErrorItem {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: Record<string, unknown>;
}

export interface ClerkErrorResponse {
  errors?: ClerkErrorItem[];
  message?: string;
}

const ERROR_CODE_MAP: Record<string, string> = {
  form_identifier_not_found: "We couldn't find an account with that email address.",
  form_password_incorrect: "The password you entered is incorrect. Please try again.",
  form_identifier_exists: "An account with this email address already exists. Please sign in instead.",
  form_password_length_too_short: "Your password must be at least 8 characters long.",
  form_password_pwned: "This password has been flagged in public security breaches. For your protection, please choose a stronger, unique password.",
  form_password_size_in_bytes_exceeded: "Your password is too long. Please choose a shorter password.",
  form_code_incorrect: "The verification code is incorrect. Please check the code and try again.",
  verification_expired: "This verification code has expired. Please request a new one.",
  verification_failed: "Verification was unsuccessful. Please check the code and try again.",
  too_many_requests: "Too many attempts. For your security, please wait a few moments before trying again.",
  session_exists: "You already have an active session. Refreshing your account...",
  network_error: "Unable to connect to the server. Please check your internet connection and try again.",
  identifier_already_signed_in: "You are already signed in with this account.",
  form_param_format_invalid: "Please check your input and ensure the format is valid.",
  form_param_nil: "Please fill out all required fields.",
};

export function getAuthErrorMessage(error: unknown, fallbackMessage = "Something went wrong. Please try again."): string {
  if (!error) return fallbackMessage;

  if (typeof error === "string") {
    return error;
  }

  const clerkErr = error as ClerkErrorResponse;

  if (Array.isArray(clerkErr.errors) && clerkErr.errors.length > 0) {
    const firstErr = clerkErr.errors[0];
    if (firstErr.code && ERROR_CODE_MAP[firstErr.code]) {
      return ERROR_CODE_MAP[firstErr.code];
    }
    if (firstErr.longMessage) {
      return sanitizeMessage(firstErr.longMessage);
    }
    if (firstErr.message) {
      return sanitizeMessage(firstErr.message);
    }
  }

  if (clerkErr.message) {
    return sanitizeMessage(clerkErr.message);
  }

  return fallbackMessage;
}

function sanitizeMessage(msg: string): string {
  return msg
    .replace(/clerk/gi, "account")
    .replace(/Clerk/g, "SubX")
    .trim();
}
