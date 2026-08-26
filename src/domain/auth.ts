const AUTH_EMAIL_DOMAIN = 'family-fund.local';

// Supabase Auth requires an email; usernames are a UX layer on top of it —
// the sign-in screen only ever asks for a username, and this appends the
// fixed internal domain before calling the Auth API.
export function usernameToAuthEmail(usernameOrEmail: string): string {
  const trimmed = usernameOrEmail.trim();
  return trimmed.includes('@') ? trimmed : `${trimmed}@${AUTH_EMAIL_DOMAIN}`;
}
