import bcrypt from 'bcryptjs';

export const ADMIN_EMAIL = 'who.iam232900@gmail.com';
// This is the hashed version of '****New****Tracker#2026'
// We can also hash it on the fly if we want to be dynamic,
// but for a "reset" we can ensure it's seeded.
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('****New****Tracker#2026', 10);

export interface UserAccount {
  password: string; // Hashed
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

/**
 * Ensures the admin account exists and is correct.
 * Clears old/temporary admin data.
 */
export function seedAdminAccount() {
  if (typeof window === 'undefined') return;

  try {
    const usersRaw = localStorage.getItem('users');
    let users: Record<string, UserAccount> = usersRaw ? JSON.parse(usersRaw) : {};

    // Remove old hardcoded/temporary admins if they exist in the users object
    const oldAdminEmails = ['kabenix_is_admin', 'admin@creatortracker.com'];
    let changed = false;

    oldAdminEmails.forEach((email) => {
      if (users[email]) {
        delete users[email];
        changed = true;
      }
    });

    // Ensure our new secure admin exists
    if (!users[ADMIN_EMAIL] || users[ADMIN_EMAIL].role !== 'admin') {
      users[ADMIN_EMAIL] = {
        password: ADMIN_PASSWORD_HASH,
        fullName: 'Admin Control',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      changed = true;
    }

    if (changed) {
      localStorage.setItem('users', JSON.stringify(users));
      console.debug('[auth] Admin account system rebuilt safely.');
    }
  } catch (e) {
    console.error('[auth] Failed to seed admin account', e);
  }
}

/**
 * Validates credentials and returns user data if successful.
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<UserAccount | null> {
  if (typeof window === 'undefined') return null;

  try {
    const usersRaw = localStorage.getItem('users');
    const users: Record<string, UserAccount> = usersRaw ? JSON.parse(usersRaw) : {};

    const user = users[email];
    if (!user) return null;

    // Support both hashed and plain text for backward compatibility (migration path)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain text check
      isMatch = user.password === password;
      // If it matches, we should ideally upgrade it to hashed
      if (isMatch) {
        user.password = bcrypt.hashSync(password, 10);
        localStorage.setItem('users', JSON.stringify(users));
      }
    }

    return isMatch ? user : null;
  } catch (e) {
    return null;
  }
}

/**
 * Force clear all session-related data to ensure a clean state.
 */
export function clearAllSessions() {
  if (typeof window === 'undefined') return;

  const keysToClear = ['userSession', 'auth_token', 'next-auth.session-token', 'session'];
  keysToClear.forEach((key) => localStorage.removeItem(key));

  // Also clear cookies if they were used (Next.js might use them)
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
}
