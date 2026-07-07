// Read-only users configuration
// Users in this list will have view-only access to the admin dashboard
// They can see all pages and data but cannot perform any CRUD operations

export const READ_ONLY_USERS: string[] = [
  "test@gmail.com",
  // Add more read-only user emails here
];

/**
 * Check if a user email is in the read-only list
 * @param email - User's email address
 * @returns true if user is read-only, false otherwise
 */
export const isReadOnlyUser = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return READ_ONLY_USERS.includes(email.toLowerCase());
};

/**
 * Check if a user can perform CRUD operations
 * @param email - User's email address
 * @param role - User's role
 * @returns true if user can perform CRUD operations, false otherwise
 */
export const canPerformCRUD = (
  email: string | undefined | null,
  role: string | undefined | null
): boolean => {
  // Only admins can perform CRUD operations
  if (role !== "admin") return false;

  // Check if admin is in read-only list
  return !isReadOnlyUser(email);
};
