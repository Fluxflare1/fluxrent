// Placeholder for auth-related helper. For MVP Google service account is used server-side.
// If you later implement OAuth, expand here.
export function getServiceAccountEmail() {
  return process.env.GOOGLE_CLIENT_EMAIL || ''
}
