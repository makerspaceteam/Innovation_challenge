const BASE_URL = 'http://localhost:5000/api';

// ─── USER ───────────────────────────────────────────────────────────
export const createOrGetUser = async (name, email) => {
  const res = await fetch(`${BASE_URL}/users/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  return res.json();
};

export const getUserById = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  return res.json();
};

export const getUserStats = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}/stats`);
  return res.json();
};

// ─── PROGRESS ───────────────────────────────────────────────────────
export const getUserProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/progress/${userId}`);
  return res.json();
};

export const completeDay = async (userId, dayNumber) => {
  const res = await fetch(`${BASE_URL}/progress/${userId}/complete-day`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayNumber })
  });
  return res.json();
};

// ─── QUESTS ─────────────────────────────────────────────────────────
export const getAllQuests = async () => {
  const res = await fetch(`${BASE_URL}/quests`);
  return res.json();
};

export const getQuestByDay = async (dayNumber) => {
  const res = await fetch(`${BASE_URL}/quests/day/${dayNumber}`);
  return res.json();
};

export const getQuestsWithProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/quests/user/${userId}`);
  return res.json();
};

export const getQuestWithUserStatus = async (dayNumber, userId) => {
  const res = await fetch(`${BASE_URL}/quests/day/${dayNumber}/user/${userId}`);
  return res.json();
};

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────
export const getUserAchievements = async (userId) => {
  const res = await fetch(`${BASE_URL}/badges/user/${userId}`);
  return res.json();
};

export const getUserAchievementProgress = async (userId) => {
  const res = await fetch(`${BASE_URL}/badges/user/${userId}/progress`);
  return res.json();
};

// ─── USER HELPERS ────────────────────────────────────────────────────
export const saveUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem('user'));
export const clearUser = () => localStorage.removeItem('user');