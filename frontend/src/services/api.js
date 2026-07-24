const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const BASE_URL = 'http://localhost:5000/api';

// ─── TOKEN HELPERS ───────────────────────────────────────────────────
let sessionExpiredHandled = false;

export const saveToken = (token) => {
  sessionExpiredHandled = false; // fresh login → arm 401 handling again
  localStorage.setItem('token', token);
};
export const getToken = () => localStorage.getItem('token');
export const clearToken = () => localStorage.removeItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Fetch wrapper for authenticated endpoints: if the token is missing or
// expired the backend returns 401 — clear the stale session once and
// reopen the login modal (Navbar listens for 'open-login-modal').
const authFetch = async (url, options = {}) => {
  const res = await fetch(url, { ...options, headers: authHeaders() });
  if (res.status === 401 && getUser() && !sessionExpiredHandled) {
    sessionExpiredHandled = true;
    clearUser();
    // Flag survives until a Navbar is mounted — pages render without
    // the Navbar while loading, so a bare event can be missed
    sessionStorage.setItem('session_expired', '1');
    window.dispatchEvent(new Event('open-login-modal'));
  }
  return res.json();
};

// ─── USER ───────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const createOrGetUser = async (name, email) => {
  const res = await fetch(`${BASE_URL}/users/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  return res.json();
};

export const changePassword = async (userId, newPassword) => {
  return authFetch(`${BASE_URL}/users/${userId}/change-password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword })
  });
};

export const getUserById = async (userId) => {
  return authFetch(`${BASE_URL}/users/${userId}`);
};

export const getUserStats = async (userId) => {
  return authFetch(`${BASE_URL}/users/${userId}/stats`);
};

// ─── PROGRESS ───────────────────────────────────────────────────────
export const getUserProgress = async (userId) => {
  return authFetch(`${BASE_URL}/progress/${userId}`);
};

export const completeDay = async (userId, dayNumber) => {
  return authFetch(`${BASE_URL}/progress/${userId}/complete-day`, {
    method: 'POST',
    body: JSON.stringify({ dayNumber })
  });
};

// ─── QUESTS ─────────────────────────────────────────────────────────
export const getAllQuests = async () => {
  return authFetch(`${BASE_URL}/quests`);
};

export const getQuestByDay = async (dayNumber) => {
  return authFetch(`${BASE_URL}/quests/day/${dayNumber}`);
};

export const getQuestsWithProgress = async (userId) => {
  return authFetch(`${BASE_URL}/quests/user/${userId}`);
};

export const getQuestWithUserStatus = async (dayNumber, userId) => {
  return authFetch(`${BASE_URL}/quests/day/${dayNumber}/user/${userId}`);
};

export const getSchedule = async () => {
  return authFetch(`${BASE_URL}/quests/schedule`);
};

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────
export const getUserAchievements = async (userId) => {
  return authFetch(`${BASE_URL}/badges/user/${userId}`);
};

export const getUserAchievementProgress = async (userId) => {
  return authFetch(`${BASE_URL}/badges/user/${userId}/progress`);
};

// ─── DASHBOARD ──────────────────────────────────────────────────────
export const getDashboardOverview = async () => {
  return authFetch(`${BASE_URL}/dashboard/overview`);
};

export const updateStudentTheme = async (userId, theme) => {
  return authFetch(`${BASE_URL}/users/${userId}/theme`, {
    method: 'PUT',
    body: JSON.stringify({ theme })
  });
};

// ─── USER HELPERS ────────────────────────────────────────────────────
export const saveUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem('user'));
export const clearUser = () => {
  localStorage.removeItem('user');
  clearToken();
};

// ─── BADGES (updated) ────────────────────────────────────────────────
export const getAllBadges = async () => {
  return authFetch(`${BASE_URL}/badges`);
};

export const getBadgeForDay = async (dayNumber) => {
  const res = await fetch(`${BASE_URL}/badges/day/${dayNumber}`);
  return res.json();
};

export const getUserBadges = async (userId) => {
  return authFetch(`${BASE_URL}/badges/user/${userId}`);
};

export const getUserBadgeProgress = async (userId) => {
  return authFetch(`${BASE_URL}/badges/user/${userId}/progress`);
};
 