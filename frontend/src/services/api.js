const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const BASE_URL = 'http://localhost:5000/api';

// ─── TOKEN HELPERS ───────────────────────────────────────────────────
export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const clearToken = () => localStorage.removeItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

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
  const res = await fetch(`${BASE_URL}/users/${userId}/change-password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ newPassword })
  });
  return res.json();
};

export const getUserById = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    headers: authHeaders()
  });
  return res.json();
};

export const getUserStats = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}/stats`, {
    headers: authHeaders()
  });
  return res.json();
};

// ─── PROGRESS ───────────────────────────────────────────────────────
export const getUserProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/progress/${userId}`, {
    headers: authHeaders()
  });
  return res.json();
};

export const completeDay = async (userId, dayNumber) => {
  const res = await fetch(`${BASE_URL}/progress/${userId}/complete-day`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ dayNumber })
  });
  return res.json();
};

// ─── QUESTS ─────────────────────────────────────────────────────────
export const getAllQuests = async () => {
  const res = await fetch(`${BASE_URL}/quests`, { headers: authHeaders() });
  return res.json();
};

export const getQuestByDay = async (dayNumber) => {
  const res = await fetch(`${BASE_URL}/quests/day/${dayNumber}`, { headers: authHeaders() });
  return res.json();
};

export const getQuestsWithProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/quests/user/${userId}`, { headers: authHeaders() });
  return res.json();
};

export const getQuestWithUserStatus = async (dayNumber, userId) => {
  const res = await fetch(`${BASE_URL}/quests/day/${dayNumber}/user/${userId}`, { headers: authHeaders() });
  return res.json();
};

export const getSchedule = async () => {
  const res = await fetch(`${BASE_URL}/quests/schedule`, { headers: authHeaders() });
  return res.json();
};

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────
export const getUserAchievements = async (userId) => {
  const res = await fetch(`${BASE_URL}/badges/user/${userId}`, { headers: authHeaders() });
  return res.json();
};

export const getUserAchievementProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/badges/user/${userId}/progress`, { headers: authHeaders() });
  return res.json();
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
  const res = await fetch(`${BASE_URL}/badges`, { headers: authHeaders() });
  return res.json();
};
 
export const getBadgeForDay = async (dayNumber) => {
  const res = await fetch(`${BASE_URL}/badges/day/${dayNumber}`);
  return res.json();
};
 
export const getUserBadges = async (userId) => {
  const res = await fetch(`${BASE_URL}/badges/user/${userId}`, { headers: authHeaders() });
  return res.json();
};
 
export const getUserBadgeProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/badges/user/${userId}/progress`, { headers: authHeaders() });
  return res.json();
};
 