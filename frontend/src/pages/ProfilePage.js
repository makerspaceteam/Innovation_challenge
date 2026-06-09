import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUser,
  getUserById,
  getUserStats,
  getUserAchievementProgress,
  getQuestsWithProgress,
  getUserAchievements,
  getSchedule
} from '../services/api';
//import { useUserProgress } from '../contexts/UserProgressContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';
import './ProfilePage.css';

const PHASES = [
  { name: 'Discover', days: [1,2,3,4,5],   color: '#fbbf24', bg: '#fef3c7', text: '#92400e' },
  { name: 'Define',   days: [6,7,8,9,10],  color: '#a78bfa', bg: '#ede9fe', text: '#4c1d95' },
  { name: 'Develop',  days: [11,12,13,14,15], color: '#f472b6', bg: '#fce7f3', text: '#831843' },
  { name: 'Deliver',  days: [16,17,18,19,20], color: '#3b82f6', bg: '#dbeafe', text: '#1e3a8a' },
];

function ProfilePage() {
  const navigate  = useNavigate();
  const localUser = useMemo(() => getUser(), []);

  const [profile,  setProfile]  = useState(null);
  const [stats,    setStats]    = useState(null);
  const [badges,   setBadges]   = useState([]);
  const [quests,   setQuests]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (!localUser?.user_id) { navigate('/'); return; }

    (async () => {
      try {
        const [profileRes, statsRes, badgesRes, questsRes, secheduleRes] = await Promise.all([
          getUserById(localUser.user_id),
          getUserStats(localUser.user_id),
          getUserAchievements(localUser.user_id),
          getQuestsWithProgress(localUser.user_id),
          getSchedule(),
        ]);
        if (profileRes.success) setProfile(profileRes.data);
        if (statsRes.success)   setStats(statsRes.data);
        if (badgesRes.success)  setBadges(badgesRes.data || []);
        if (questsRes.success)  setQuests(questsRes.data || []);
        if (secheduleRes.success) setSchedule(schedule.data.schedule || []);
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [localUser?.user_id, navigate]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="loading">Profile not found.</div>;

  const completedDays = stats?.total_days_completed || 0;
  //const currentDay    = stats?.current_day || 1;

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const statusColor = profile.status === 'active' ? '#10b981' : '#94a3b8';

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">

        {/* ── Profile Card ── */}
        <div className="profile-card">
          <div className="profile-avatar">
            {getInitials(profile.full_name)}
          </div>
          <div className="profile-info">
            <h1>{profile.full_name}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-meta">
              <span className="meta-tag">
                🎓 ID: {profile.student_id || '—'}
              </span>
              <span className="meta-tag status-tag" style={{ color: statusColor, borderColor: statusColor }}>
                ● {profile.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-number">{completedDays}</span>
            <span className="stat-label">Days Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{20 - completedDays}</span>
            <span className="stat-label">Days Remaining</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{badges.length}</span>
            <span className="stat-label">Badges Earned</span>
          </div>
        </div>

        {/* ── Progress Section ── */}
        <div className="section-card">
          <h2>Learning Progress</h2>
          <div className="progress-header">
            <span>{completedDays} / 20 days completed</span>
            <span>{Math.round((completedDays / 20) * 100)}%</span>
          </div>
          <ProgressBar completed={completedDays} total={20} showLabel={false} />

          <div className="phase-progress">
            {PHASES.map(phase => {
              const pCompleted = phase.days.filter(d =>
                quests.find(q => q.day === d && q.completed)
              ).length;
              const pPct = Math.round((pCompleted / 5) * 100);
              return (
                <div className="phase-row" key={phase.name}>
                  <span
                    className="phase-name-tag"
                    style={{ background: phase.bg, color: phase.text, borderColor: phase.color }}
                  >
                    {phase.name}
                  </span>
                  <div className="phase-bar-wrap">
                    <div
                      className="phase-bar-fill"
                      style={{ width: `${pPct}%`, background: phase.color }}
                    />
                  </div>
                  <span className="phase-count">{pCompleted}/5</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Badges Section ── */}
        <div className="section-card">
          <h2>Badges Earned</h2>
          {badges.length === 0 ? (
            <div className="empty-badges">
              <span>🏅</span>
              <p>Complete quests to earn badges!</p>
            </div>
          ) : (
            <div className="badges-grid">
              {badges.map((badge, i) => (
                <div className="badge-card" key={i}>
                  <div className="badge-icon-wrap">
                    {badge.icon_url
                      ? <img
                          src={badge.icon_url.replace('/upload/', '/upload/w_120,h_120,c_fit/')}
                          alt={badge.title}
                          className="badge-img"
                        />
                      : <span className="badge-emoji">🏅</span>
                    }
                  </div>
                  <p className="badge-name">{badge.title}</p>
                  <p className="badge-day">Day {badge.day_number}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quest History ── */}
        <div className="section-card">
          <h2>Quest History</h2>
          <div className="quest-list">
            {quests.length === 0 ? (
              <p className="empty-text">No quests started yet.</p>
            ) : (
              quests.map((q) => {
                const phase = PHASES.find(p => p.days.includes(q.day));
                const daySchedule = schedule.find(s => s.day === q.day);
                const isLocked = !daySchedule?.unlocked;
                return (
                  <div
                    className={`quest-row ${q.completed ? 'completed' : 'pending'}`}
                    key={q.day}
                    //onClick={() => navigate(`/quest/day/${q.day}`)}
                  >
                    <span
                      className="quest-day-badge"
                      style={{ background: phase?.bg, color: phase?.text, borderColor: phase?.color }}
                    >
                      Day {q.day}
                    </span>
                    <span className="quest-title">{q.title}</span>
                    <span className="quest-status-tag">
                      {q.completed ? '✓ Done' : isLocked ? '🔒' : '→ Go'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default ProfilePage;