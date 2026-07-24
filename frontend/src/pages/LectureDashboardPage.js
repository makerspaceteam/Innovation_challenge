import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, getDashboardOverview, updateStudentTheme } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LectureDashboardPage.css';

const PHASE_STYLE = {
  Discover: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
  Define:   { bg: '#ede9fe', text: '#4c1d95', border: '#a78bfa' },
  Develop:  { bg: '#fce7f3', text: '#831843', border: '#f472b6' },
  Deliver:  { bg: '#dbeafe', text: '#1e3a8a', border: '#3b82f6' },
};

const THEMES = [
  'VR for Education',
  'AI for Education',
  'Smart Agriculture',
  'Social Impact',
  'Health & Wellbeing',
];

const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

function ThemeRow({ student, onThemeSaved }) {
  const [value, setValue] = useState(student.theme || '');
  const [saving, setSaving] = useState(false);
  const phase = PHASE_STYLE[student.current_phase] || PHASE_STYLE.Discover;

  useEffect(() => setValue(student.theme || ''), [student.theme]);

  const save = async (next) => {
    if (next === (student.theme || '')) return;
    setValue(next);
    setSaving(true);
    try {
      const res = await updateStudentTheme(student.user_id, next);
      if (res.success) onThemeSaved(student.user_id, next || null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="student-row">
      <div className="student-identity">
        <span className="student-avatar">{getInitials(student.full_name)}</span>
        <div>
          <p className="student-name">{student.full_name || student.user_name}</p>
          <p className="student-email">{student.email}</p>
        </div>
      </div>

      <span
        className="phase-badge"
        style={{ background: phase.bg, color: phase.text, borderColor: phase.border }}
      >
        {student.current_phase}
      </span>

      <div className="student-progress">
        <div className="student-progress-track">
          <div className="student-progress-fill" style={{ width: `${student.progress_percentage}%` }} />
        </div>
        <span className="student-progress-label">{student.completed_days_count}/20</span>
      </div>

      <span className="student-badges">🏅 {student.badges_earned}</span>

      <div className="theme-input-wrap">
        <select
          className="theme-input"
          value={value}
          onChange={(e) => save(e.target.value)}
          disabled={saving}
        >
          <option value="">Unassigned</option>
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {saving && <span className="theme-saving">Saving…</span>}
      </div>
    </div>
  );
}

function LectureDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState('All');
  const [collapsed, setCollapsed] = useState({});
  const navigate = useNavigate();
  const localUser = getUser();

  const load = useCallback(async () => {
    try {
      const res = await getDashboardOverview();
      if (res.success) setOverview(res.data);
      else setError(res.message || 'Failed to load dashboard');
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localUser?.role !== 'lecturer') {
      navigate('/');
      return;
    }
    load();
  }, [load, localUser, navigate]);

  const filteredThemes = useMemo(() => {
    if (!overview) return [];
    const q = search.trim().toLowerCase();
    return overview.themes
      .filter(t => themeFilter === 'All' || t.theme === themeFilter)
      .map(t => ({
        ...t,
        students: q
          ? t.students.filter(s =>
              (s.full_name || '').toLowerCase().includes(q) ||
              (s.email || '').toLowerCase().includes(q)
            )
          : t.students
      }))
      .filter(t => t.students.length > 0);
  }, [overview, search, themeFilter]);

  const handleThemeSaved = (userId, newTheme) => {
    setOverview(prev => {
      if (!prev) return prev;
      const students = prev.students.map(s =>
        s.user_id === userId ? { ...s, theme: newTheme } : s
      );
      const themeMap = new Map();
      for (const s of students) {
        const key = s.theme || 'Unassigned';
        if (!themeMap.has(key)) themeMap.set(key, []);
        themeMap.get(key).push(s);
      }
      const themes = Array.from(themeMap.entries())
        .map(([name, members]) => ({
          theme: name,
          student_count: members.length,
          avg_progress_percentage: Math.round(
            members.reduce((sum, m) => sum + m.progress_percentage, 0) / members.length
          ),
          students: members
        }))
        .sort((a, b) => {
          if (a.theme === 'Unassigned') return 1;
          if (b.theme === 'Unassigned') return -1;
          return a.theme.localeCompare(b.theme);
        });
      return {
        ...prev,
        students,
        themes,
        total_themes: themes.filter(t => t.theme !== 'Unassigned').length
      };
    });
  };

  const toggleCollapsed = (theme) =>
    setCollapsed(prev => ({ ...prev, [theme]: !prev[theme] }));

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Lecture Dashboard</h1>
          <p>Track student progress grouped by innovation theme.</p>
        </div>

        <div className="dashboard-stats-row">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-number">{overview.total_students}</span>
            <span className="dashboard-stat-label">Students</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-number">{THEMES.length}</span>
            <span className="dashboard-stat-label">Themes</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-number">{overview.avg_progress_percentage}%</span>
            <span className="dashboard-stat-label">Avg. Progress</span>
          </div>
        </div>

        <input
          className="dashboard-search"
          type="text"
          placeholder="Search students by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="theme-filter-row">
          <button
            className={`theme-filter-chip ${themeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setThemeFilter('All')}
          >
            All
          </button>
          {THEMES.map(t => (
            <button
              key={t}
              className={`theme-filter-chip ${themeFilter === t ? 'active' : ''}`}
              onClick={() => setThemeFilter(t)}
            >
              {t}
            </button>
          ))}
          <button
            className={`theme-filter-chip ${themeFilter === 'Unassigned' ? 'active' : ''}`}
            onClick={() => setThemeFilter('Unassigned')}
          >
            Unassigned
          </button>
        </div>

        {filteredThemes.length === 0 && (
          <p className="empty-text">No students match your search.</p>
        )}

        {filteredThemes.map(group => (
          <div className="theme-section" key={group.theme}>
            <button className="theme-section-header" onClick={() => toggleCollapsed(group.theme)}>
              <div className="theme-section-title">
                <span className={`theme-name ${group.theme === 'Unassigned' ? 'unassigned' : ''}`}>
                  {group.theme}
                </span>
                <span className="theme-count">{group.student_count} student{group.student_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="theme-section-right">
                <div className="theme-avg-track">
                  <div className="theme-avg-fill" style={{ width: `${group.avg_progress_percentage}%` }} />
                </div>
                <span className="theme-avg-label">{group.avg_progress_percentage}% avg</span>
                <span className="chevron">{collapsed[group.theme] ? '▸' : '▾'}</span>
              </div>
            </button>

            {!collapsed[group.theme] && (
              <div className="student-list">
                {group.students.map(s => (
                  <ThemeRow
                    key={s.user_id}
                    student={s}
                    onThemeSaved={handleThemeSaved}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default LectureDashboardPage;
