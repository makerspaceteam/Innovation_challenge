import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getUserStats } from '../services/api';

const UserProgressContext = createContext();

export const UserProgressProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const isFetchingRef = useRef(false);   // ← Prevent multiple calls

  const refreshStats = useCallback(async (userId) => {
    if (!userId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const res = await getUserStats(userId);
      if (res.success) {
        setStats(res.data);
        localStorage.setItem('userStats', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to fetch latest stats');
      const saved = JSON.parse(localStorage.getItem('userStats'));
      if (saved) setStats(saved);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  return (
    <UserProgressContext.Provider value={{ stats, refreshStats }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => useContext(UserProgressContext);