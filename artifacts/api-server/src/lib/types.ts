/**
 * AuthUser represents the user data stored in sessions.
 * Properties come from Replit OIDC claims stored in the users table.
 */
export interface AuthUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}
