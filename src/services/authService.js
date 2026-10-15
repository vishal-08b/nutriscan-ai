// NutriScan AI - Authentication & Session Service
import { getUserPreferences, setUserPreferences } from './preferencesService';

const AUTH_USER_KEY = 'nutriscan_auth_user';
const REGISTERED_USERS_KEY = 'nutriscan_registered_users';

/**
 * Get currently authenticated user session
 * @returns {object|null}
 */
export function getAuthenticatedUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse auth user:', e);
    return null;
  }
}

/**
 * Get all registered user accounts from local store
 * @returns {Array}
 */
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Authenticate existing user with email and password
 */
export function loginUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail) {
    return { success: false, message: 'Please enter your email address.' };
  }
  if (!cleanPass) {
    return { success: false, message: 'Please enter your password.' };
  }

  const users = getRegisteredUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!existingUser) {
    // If user is logging in with demo credentials or for the first time
    if (cleanEmail === 'demo@nutriscan.ai' || cleanPass.length >= 4) {
      // Auto-register friendly new user
      const newUser = {
        id: 'usr_' + Date.now(),
        name: cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1),
        email: cleanEmail,
        password: cleanPass,
        goal: 'Fat Loss & Lean Muscle',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      
      return setAuthSession(newUser);
    }
    return { success: false, message: 'Account not found. Please click "Sign Up" to create an account.' };
  }

  if (existingUser.password !== cleanPass) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  return setAuthSession(existingUser);
}

/**
 * Register a new user account
 */
export function registerUser({ name, email, password, goal }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const userGoal = goal || 'Fat Loss & Lean Muscle';

  if (!cleanName) {
    return { success: false, message: 'Please enter your full name.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, message: 'Password must be at least 4 characters.' };
  }

  const users = getRegisteredUsers();
  const alreadyExists = users.some((u) => u.email.toLowerCase() === cleanEmail);

  if (alreadyExists) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
    goal: userGoal,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  return setAuthSession(newUser);
}

/**
 * 1-Click Guest / Instant Demo login
 */
export function loginAsGuest(name = 'Guest Explorer', goal = 'Fat Loss & Lean Muscle') {
  const guestUser = {
    id: 'guest_' + Date.now(),
    name: name || 'Guest Explorer',
    email: 'guest@nutriscan.ai',
    goal: goal || 'Balanced Indian Nutrition',
    isGuest: true,
    createdAt: new Date().toISOString(),
  };

  return setAuthSession(guestUser);
}

/**
 * Sets session and syncs preferences
 */
function setAuthSession(user) {
  try {
    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      goal: user.goal || 'Fat Loss & Lean Muscle',
      isGuest: Boolean(user.isGuest),
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionPayload));

    // Sync with app user preferences
    setUserPreferences({
      userName: user.name,
      userGoal: user.goal || 'Fat Loss & Lean Muscle',
    });

    return { success: true, user: sessionPayload };
  } catch (e) {
    console.error('Failed to set auth session:', e);
    return { success: false, message: 'Failed to save login session to this device.' };
  }
}

/**
 * Log out current user
 */
export function logoutUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    return true;
  } catch (e) {
    console.error('Logout error:', e);
    return false;
  }
}
