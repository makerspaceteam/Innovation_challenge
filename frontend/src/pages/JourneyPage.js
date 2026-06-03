import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getQuestsWithProgress, getUserStats, getUser } from '../services/api';
import './JourneyPage.css';

function JourneyPage() {
  const [quests, setQuests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchData();
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    const [questsRes, statsRes] = await Promise.all([
      getQuestsWithProgress(user.user_id),
      getUserStats(user.user_id)
    ]);

    if (questsRes.success) setQuests(questsRes.data);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  };

  const phases = [
    { id: 1, name: 'Discover', color: 'discover', range: '1-5',   days: [1,2,3,4,5]     },
    { id: 2, name: 'Define',   color: 'define',   range: '6-10',  days: [6,7,8,9,10]    },
    { id: 3, name: 'Develop',  color: 'develop',  range: '11-15', days: [11,12,13,14,15] },
    { id: 4, name: 'Deliver',  color: 'deliver',  range: '16-20', days: [16,17,18,19,20] }
  ];

  const currentDay = stats?.current_day || 1;

  const getDayStatus = (dayNum) => {
    const quest = quests.find(q => q.day === dayNum);
    if (quest?.completed) return 'completed';
    if (dayNum === currentDay) return 'current';
    return 'locked';
  };

  const getDayColor = (phaseColor) => {
    const colors = {
      discover: '#fbbf24',
      define: '#a78bfa',
      develop: '#f472b6',
      deliver: '#3b82f6'
    };
    return colors[phaseColor] || '#999';
  };

  const currentQuest = quests.find(q => q.day === currentDay);

  if (loading) return <div className="loading">Loading your journey...</div>;

  return (
    <div className="journey-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">⭐</span>
            <span>Makers Innovation Quest</span>
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#badges">Badges</a></li>
            <li><a href="#journal">Journal</a></li>
            <li>
              <button className="btn btn-primary">
                Hi, {user?.user_name?.split(' ')[0]}!
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Header */}
      <section className="journey-header">
        <div className="container">
          <h1>20-Day Design Thinking Journey</h1>
          <p>Track your progress through each phase</p>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="progress-section">
        <div className="container">
          <div className="progress-info">
            <h2>Your Journey Progress</h2>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${stats?.progress_percentage || 0}%` }}></div>
            </div>
            <p className="progress-text">{stats?.total_days_completed || 0} / 20 Days Completed</p>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="phases-section">
        <div className="container">
          {phases.map((phase) => (
            <div key={phase.id} className="phase-section">
              <h3 className={`phase-title ${phase.color}`}>
                {phase.name} ({phase.range})
              </h3>
              <div className="days-dots">
                {phase.days.map((day) => {
                  const status = getDayStatus(day);
                  return (
                    <Link
                      key={day}
                      to={`/quest/day/${day}`}
                      className={`day-dot ${status}`}
                      style={status === 'completed' ? { backgroundColor: getDayColor(phase.color), color: 'white' } : {}}
                      title={`Day ${day}`}
                    >
                      {status === 'completed' && '✓'}
                      {status === 'current' && '●'}
                      {status === 'locked' && '🔒'}
                      {status === 'locked' && <span className="dot-number">{day}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Current Quest Card */}
      {currentQuest && (
        <section className="current-quest">
          <div className="container">
            <div className="quest-card">
              <div className="quest-mascot">🐟</div>
              <div className="quest-content">
                <div className="quest-badge">Day {currentDay}</div>
                <h2>{currentQuest.title}</h2>
                <p>{currentQuest.description}</p>
                <Link to={`/quest/day/${currentDay}`} className="btn btn-primary">
                  Start Quest →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Makers Innovation Quest. Keep exploring and making an impact!</p>
        </div>
      </footer>
    </div>
  );
}

export default JourneyPage;