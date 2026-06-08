import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getQuestWithUserStatus, completeDay, getUser, getBadgeForDay } from '../services/api';
import { useUserProgress } from '../contexts/UserProgressContext';
import './DayQuestPage.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';

function DayQuestPage() {
  const { dayNumber } = useParams();
  const [questData, setQuestData] = useState(null);
  const [questSubmitted, setQuestSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [badge, setBadge] = useState(null);         // badge for this day
  const [badgeEarned, setBadgeEarned] = useState(false); // whether user already earned it
  const [confirmed, setConfirmed] = useState(false);
  const quest = questData || {};

  const navigate = useNavigate();
  const [user] = useState(getUser);
  const { refreshStats } = useUserProgress();
  const description = questData?.description?.replace('{user_name}', user?.user_name || 'Maker');

  const fetchQuest = useCallback(async () => {
    if (!user?.user_id) return;
    setLoading(true);
    try {
      const [questRes, badgeRes] = await Promise.all([
        getQuestWithUserStatus(dayNumber, user.user_id),
        getBadgeForDay(dayNumber)
      ]);

      if (questRes.success) {
        setQuestData(questRes.data);
        setQuestSubmitted(questRes.data.completed);
        // If quest already completed, badge is already earned
        if (questRes.data.completed) setBadgeEarned(true);
      }

      if (badgeRes.success && badgeRes.data) {
        setBadge(badgeRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch quest:', err);
    } finally {
      setLoading(false);
    }
  }, [dayNumber, user?.user_id]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchQuest();
  }, [fetchQuest, navigate, user]);

  const handleSubmit = async () => {
    if (!confirmed) {
      alert('Please confirm that you have submitted your work on the form');
      return;
    }

    setSubmitting(true);

    try {
      const res = await completeDay(user.user_id, parseInt(dayNumber));

      if (res.success) {
        setQuestSubmitted(true);
        setBadgeEarned(true); // mark badge as just earned
        await refreshStats(user.user_id);

        setTimeout(() => {
          navigate('/journey', { replace: true });
        }, 800);
      } else {
        alert(`Error: ${res.message}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Something went wrong. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quest...</div>;
  if (!questData) return <div>Quest not found</div>;

  return (
    <div className="day-quest-page">
      <Navbar />

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
          <div className="quest-header">
            <div className="quest-phase" data-phase={questData.phase}>{questData.phase}</div>
            <h1>{questData.title}</h1>
            <p className="quest-day">Day {dayNumber} of 20</p>
          </div>

          <div className='div-des'>
            <div className="mascot-large">
              <img
                src="/images/sharks/shark_teach.png"
                alt="Makers Quest Shark Mascot"
                className="mascot-image"
              />
            </div>
            <p className="quest-description">
              {description}
            </p>
          </div>
          {questData?.gpt_link && (
              <div className="ai-guide-card">
                <div className="ai-guide-icon">
                  🤖
                </div>

                <div className="ai-guide-content">
                  <h3>Open your AIFFL guide here:</h3>

                  <p>
                    Your AI guide will help you complete today's quest,
                    reflect on your journey, and prepare your submission.
                  </p>

                  <a
                    href={questData.gpt_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-guide-btn"
                  >
                    🚀 Meet Your AI Guide
                  </a>
                </div>
              </div>
            )}

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

          {questData.sentenceFrame && (
            <div className="sentence-frame">
              <p className="frame-title">Use this sentence frame:</p>
              <div className="frame-box">{questData.sentenceFrame}</div>
            </div>
          )}

          {questData.tips && (
            <div className="tip-box">
              <span className="tip-icon">💡</span>
              <p><strong>Tip:</strong> {questData.tips}</p>
            </div>
          )}

          <div className="quest-section">
            <h2>Your Today's Quest</h2>
            
            {!questSubmitted ? (
              <div className="response-form">
                {/* Submission Link Button - from Backend */}
                {quest?.submit_link ? (
                  <div className="submit-card">
                    <div className="submit-card-icon">
                      📝
                    </div>

                    <div className="submit-card-content">
                      <h3>Submit Your Work</h3>
                      <p>
                        Complete the activity and upload your response through the submission form.
                      </p>

                      <a
                        href={quest.submit_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="submit-form-btn"
                      >
                        Open Submission Form →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <p>Submission link is not available yet for this day.</p>
                  </div>
                )}

                {/* Confirmation Checkbox */}
                <div className="confirmation-section mb-4">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    <span>
                      I have completed and submitted my work on the form above
                    </span>
                  </label>
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    disabled={!confirmed || submitting || !quest?.submit_link}
                    onClick={handleSubmit}
                  >
                    {submitting ? 'Marking as Completed...' : 'Mark Day as Completed'}
                  </button>
                  
                  <Link to="/journey" className="btn btn-secondary">
                    Cancel
                  </Link>
                </div>
              </div>
            ) : (
              <div className="success-message">
                <div className="success-icon">✨</div>
                <h3>Great job, {user?.user_name?.split(' ')[0] || 'Student'}!</h3>
                <p>You've completed Day {dayNumber}!</p>
                <div className="reward-info">
                  <span className="reward-badge">+10 Points</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/journey', { replace: true })}
                >
                  Continue Journey
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="quest-sidebar">
          <div className="sidebar-card progress-card">
            <h3>Your Progress</h3>
            <ProgressBar completed={parseInt(dayNumber)} total={20} showLabel={false} />
          </div>

          <div className="sidebar-card phase-card">
            <h3>Current Phase</h3>
            <div className="phase-badge" data-phase={questData.phase}>{questData.phase}</div>
          </div>

          {/* Badge Card — only shows if this day has a badge */}
          {badge && (
            <div className={`sidebar-card badge-card ${badgeEarned ? 'badge-earned' : 'badge-locked'}`}>
              <h3>Day Badge</h3>
              <div className="badge-icon-wrap">
                {badge.icon_url
                  ? <img src={badge.icon_url.replace('/upload/', '/upload/w_200,h_200,c_fit/')} alt={badge.title} className="badge-icon-img" />
                  : <span className="badge-icon-emoji">🏅</span>
                }
                {badgeEarned && <span className="badge-check">✓</span>}
              </div>
              <p className="badge-title">{badge.title}</p>
              <p className="badge-desc">{badge.description}</p>
              {badgeEarned
                ? <span className="badge-status earned">Earned!</span>
                : <span className="badge-status locked">Complete quest to earn</span>
              }
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default DayQuestPage;