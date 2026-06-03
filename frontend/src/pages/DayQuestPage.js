import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getQuestWithUserStatus, completeDay, getUser } from '../services/api';
import './DayQuestPage.css';

function DayQuestPage() {
  const { dayNumber } = useParams();
  const [questData, setQuestData] = useState(null);
  const [questSubmitted, setQuestSubmitted] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchQuest();
  }, [dayNumber]);

  const fetchQuest = async () => {
    setLoading(true);
    const res = await getQuestWithUserStatus(dayNumber, user.user_id);
    if (res.success) {
      setQuestData(res.data);
      setQuestSubmitted(res.data.completed);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;

    setSubmitting(true);
    const res = await completeDay(user.user_id, parseInt(dayNumber));

    if (res.success) {
      setQuestSubmitted(true);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="loading">Loading quest...</div>;
  if (!questData) return <div>Quest not found</div>;

  return (
    <div className="day-quest-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">⭐</span>
            <span>Makers Innovation Quest</span>
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/journey">Journey</Link></li>
            <li>
              <button className="btn btn-primary">
                Hi, {user?.user_name?.split(' ')[0]}!
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> {' > '}
          <Link to="/journey">Journey</Link> {' > '}
          <span>{questData.phase}</span> {' > '}
          <span>Day {dayNumber}</span>
        </div>
      </div>

      <div className="container quest-container">
        <div className="quest-main">
          {/* Quest Header */}
          <div className="quest-header">
            <div className="quest-phase">{questData.phase}</div>
            <h1>{questData.title}</h1>
            <p className="quest-day">Day {dayNumber} of 20</p>
          </div>

          {/* Quest Description */}
          <div className="quest-description">
            <div className="mascot-large">🦈</div>
            <p>{questData.description}</p>
          </div>

          {/* Instructions */}
          {questData.instructions && (
            <div className="quest-section">
              <h2>How to Complete This Quest</h2>
              <ol className="instructions-list">
                {questData.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Sentence Frame */}
          {questData.sentenceFrame && (
            <div className="sentence-frame">
              <p className="frame-title">Use this sentence frame:</p>
              <div className="frame-box">{questData.sentenceFrame}</div>
            </div>
          )}

          {/* Tip */}
          {questData.tips && (
            <div className="tip-box">
              <span className="tip-icon">💡</span>
              <p><strong>Tip:</strong> {questData.tips}</p>
            </div>
          )}

          {/* Response Form */}
          <div className="quest-section">
            <h2>Your Response</h2>
            {!questSubmitted ? (
              <form className="response-form" onSubmit={handleSubmit}>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response here..."
                  rows="6"
                  className="response-textarea"
                />
                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                  <Link to="/journey" className="btn btn-secondary">Cancel</Link>
                </div>
              </form>
            ) : (
              <div className="success-message">
                <div className="success-icon">✨</div>
                <h3>Great job, {user?.full_name?.split(' ')[0]}!</h3>
                <p>You've completed Day {dayNumber}!</p>
                <div className="reward-info">
                  <span className="reward-badge">+10 Points</span>
                </div>
                <Link to="/journey" className="btn btn-primary">Continue Journey</Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="quest-sidebar">
          <div className="sidebar-card progress-card">
            <h3>Your Progress</h3>
            <div className="progress-stat">
              <span className="stat-number">{dayNumber}</span>
              <span className="stat-label">Current Day</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(dayNumber / 20) * 100}%` }}></div>
            </div>
            <p className="progress-label">{dayNumber} / 20</p>
          </div>

          <div className="sidebar-card phase-card">
            <h3>Current Phase</h3>
            <div className="phase-badge">{questData.phase}</div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Makers Innovation Quest. Keep exploring and making an impact!</p>
        </div>
      </footer>
    </div>
  );
}

export default DayQuestPage;