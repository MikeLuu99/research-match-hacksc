export type AccountType = "student" | "faculty";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateCredentials(
  email: string,
  password: string,
  confirmation?: string,
): string | null {
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email)) ||
    normalizeEmail(email).length > 100
  ) {
    return "Enter a valid email address with at most 100 characters.";
  }
  if (confirmation !== undefined) {
    if (password.length < 12)
      return "Use at least 12 characters for your password.";
    if (password.length > 256)
      return "Use at most 256 characters for your password.";
    if (password !== password.trim())
      return "Your password cannot start or end with a space.";
    if (password !== confirmation) return "Your passwords don’t match.";
  }
  if (!password) return "Enter your password.";
  return null;
}

export function authErrorMessage(error: {
  error: string;
  minimumLength?: number;
  maximumLength?: number;
}) {
  switch (error.error) {
    case "USER_NOT_FOUND":
    case "INVALID_EMAIL_OR_PASSWORD":
      return "The email or password is incorrect. Please try again.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Try signing in.";
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Please wait a little before trying again.";
    case "PASSWORD_TOO_SHORT":
      return `Use at least ${error.minimumLength ?? 12} characters for your password.`;
    case "PASSWORD_TOO_LONG":
      return `Use at most ${error.maximumLength ?? 256} characters for your password.`;
    case "PASSWORD_TOO_COMMON":
      return "Choose a less common password or a unique passphrase.";
    case "INVALID_EMAIL":
      return "Please check your email address.";
    default:
      return "We couldn’t connect to your account. Please try again shortly.";
  }
}
