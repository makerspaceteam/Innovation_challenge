import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getQuestWithUserStatus, 
  completeDay, 
  getUser, 
  getBadgeForDay, 
  getSchedule, 
  getUserBadges 
} from '../services/api';

import './DayQuestPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';

function DayQuestPage() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [questData, setQuestData] = useState(null);
  const [questSubmitted, setQuestSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [badge, setBadge] = useState(null);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [nextDaySchedule, setNextDaySchedule] = useState(null);
  const [error, setError] = useState(null);

  const quest = questData || {};

  // Optimized sequential fetching to reduce server load
  const fetchQuest = useCallback(async () => {
    if (!user?.user_id) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch quest first
      const questRes = await getQuestWithUserStatus(dayNumber, user.user_id);
      if (questRes.success) {
        setQuestData(questRes.data);
        setQuestSubmitted(questRes.data.completed);
        if (questRes.data.completed) setBadgeEarned(true);
      }

      // Fetch badge
      const badgeRes = await getBadgeForDay(dayNumber);
      if (badgeRes.success && badgeRes.data) {
        setBadge(badgeRes.data);

        // Check if user already earned this badge
        const userBadgesRes = await getUserBadges(user.user_id);
        if (userBadgesRes.success && userBadgesRes.data) {
          const alreadyEarned = userBadgesRes.data.some(
            b => b.requirement_value === badgeRes.data.requirement_value
          );
          setBadgeEarned(alreadyEarned);
        }
      }

      // Fetch schedule for next day unlock status
      const scheduleRes = await getSchedule();
      if (scheduleRes.success) {
        const next = scheduleRes.data.schedule.find(s => s.day === +dayNumber + 1);
        setNextDaySchedule(next || null);
      }
    } catch (err) {
      console.error('Failed to fetch quest:', err);
      setError('Failed to load quest. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [dayNumber, user?.user_id, navigate]);

  useEffect(() => {
    fetchQuest();
  }, [fetchQuest]);

  // Bubble Canvas Animation
  useEffect(() => {
    if (loading || !document.querySelector('.hero')) return;

    const hero = document.querySelector('.hero');
    const existing = document.getElementById('bubble-canvas');
    if (existing) existing.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'bubble-canvas';
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let bubbles = [], W, H, animId;

    const resize = () => {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    };

    const makeBubble = (startY) => ({
      x: Math.random() * W,
      y: startY ?? H + 20,
      r: 4 + Math.random() * 18,
      speed: 0.4 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: 0.15 + Math.random() * 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    });

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 28; i++) bubbles.push(makeBubble(Math.random() * H));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      bubbles.forEach((b, i) => {
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        b.x += b.drift + Math.sin(b.wobble) * 0.4;

        const grd = ctx.createRadialGradient(
          b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05,
          b.x, b.y, b.r
        );
        grd.addColorStop(0, `rgba(255,255,255,${b.opacity * 0.9})`);
        grd.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        if (b.y + b.r < 0) bubbles[i] = makeBubble();
      });

      if (Math.random() < 0.04 && bubbles.length < 40) bubbles.push(makeBubble());
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (canvas) canvas.remove();
    };
  }, [loading]);

  const handleContinue = () => {
    const nextDay = +dayNumber + 1;
    if (!nextDaySchedule?.unlocked) {
      alert(`Day ${nextDay} is not unlocked yet.`);
      return;
    }
    navigate(`/quest/day/${nextDay}`, { replace: true });
  };

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
        setBadgeEarned(true);
        setTimeout(() => {
          navigate(`/quest/day/${dayNumber}`, { replace: true });
        }, 800);
      } else {
        alert(`Error: ${res.message}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quest...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!questData) return <div>Quest not found</div>;

  const description = questData?.description?.replace('{user_name}', user?.user_name || 'Maker');

  return (
    <div className="day-quest-page">
      <Navbar />

      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> › <Link to="/journey">Journey</Link> › 
          <span>{questData.phase}</span> › Day {dayNumber}
        </div>
      </div>

      <section className="hero">
        <div className="waves-container">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>

        <div className="container quest-container">
          {/* Main Content */}
          <div className="quest-main">
            <div className="quest-header">
              <div className="quest-phase" data-phase={questData.phase}>{questData.phase}</div>
              <h1>{questData.title}</h1>
              <p className="quest-day">Day {dayNumber} of 20</p>
            </div>

            <div className="div-des">
              <div className="mascot-large">
                <img src="/images/sharks/shark_teach.png" alt="Mascot" className="mascot-image" />
              </div>
              <div className="description-container">
                <p className="quest-description">{description}</p>
                {questData.gpt_link && (
                  <a href={questData.gpt_link} target="_blank" rel="noopener noreferrer" className="ai-guide-btn">
                    🚀 Meet Your AI Guide
                  </a>
                )}
              </div>
            </div>

            {/* Instructions, Sentence Frame, Tips, etc. - Keep your existing sections */}

            <div className="quest-section">
              <h2>Your Today's Quest</h2>
              {!questSubmitted ? (
                <div className="response-form">
                  {quest.submit_link ? (
                    <div className="submit-card">
                      <div className="submit-card-icon">📝</div>
                      <div className="submit-card-content">
                        <h3>Submit Your Work</h3>
                        <p>Complete the activity and upload your response through the submission form.</p>
                        <a href={quest.submit_link} target="_blank" rel="noopener noreferrer" className="submit-form-btn">
                          Open Submission Form →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info">Submission link is not available yet.</div>
                  )}

                  <div className="confirmation-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                      />
                      <span>I have completed and submitted my work on the form above</span>
                    </label>
                  </div>

                  <div className="form-buttons">
                    <button
                      className="btn btn-primary btn-lg"
                      disabled={!confirmed || submitting || !quest.submit_link}
                      onClick={handleSubmit}
                    >
                      {submitting ? 'Marking as Completed...' : 'Mark Day as Completed'}
                    </button>
                    <Link to="/journey" className="btn btn-secondary">Cancel</Link>
                  </div>
                </div>
              ) : (
                <div className="success-message">
                  <div className="success-icon">✨</div>
                  <h3>Great job, {user?.user_name?.split(' ')[0] || 'Student'}!</h3>
                  <p>You've completed Day {dayNumber}!</p>

                  {nextDaySchedule?.unlocked ? (
                    <button className="btn btn-primary" onClick={handleContinue}>
                      Continue to Day {+dayNumber + 1}
                    </button>
                  ) : (
                    <div className="locked-next-day">🔒 Day {+dayNumber + 1} unlocks soon</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="quest-sidebar">
            <div className="sidebar-card progress-card">
              <h3>Your Progress</h3>
              <ProgressBar completed={parseInt(dayNumber)} total={20} showLabel={false} />
            </div>

            <div className="sidebar-card phase-card">
              <h3>Current Phase</h3>
              <div className="phase-badge" data-phase={questData.phase}>{questData.phase}</div>
            </div>

            {badge && (
              <div className={`sidebar-card badge-card ${badgeEarned ? 'badge-earned' : 'badge-locked'}`}>
                <h3>Day Badge</h3>
                <div className="badge-icon-wrap">
                  {badge.icon_url ? (
                    <img
                      src={badge.icon_url.replace('/upload/', '/upload/w_200,h_200,c_fit/')}
                      alt={badge.title}
                      className="badge-img"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="badge-emoji">🏅</span>
                  )}
                  {badgeEarned && <span className="badge-check">✓</span>}
                </div>
                <p className="badge-title">{badge.title}</p>
                <p className="badge-desc">{badge.description}</p>
                {badgeEarned ? (
                  <span className="badge-status earned">Earned!</span>
                ) : (
                  <span className="badge-status locked">Complete quest to earn</span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default DayQuestPage;