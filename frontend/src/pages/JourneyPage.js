import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getQuestsWithProgress, getSchedule, getUser } from '../services/api';
import { useUserProgress } from '../contexts/UserProgressContext';
import './JourneyPage.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';

function JourneyPage() {
  const [quests, setQuests]     = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [phases, setPhases]     = useState([
    { id: 1, name: 'Discover', color: '#fbbf24', textColor: '#92400e', startDay: 1,  endDay: 5,  dateRange: '' },
    { id: 2, name: 'Define',   color: '#a78bfa', textColor: '#4c1d95', startDay: 6,  endDay: 10, dateRange: '' },
    { id: 3, name: 'Develop',  color: '#f472b6', textColor: '#831843', startDay: 11, endDay: 15, dateRange: '' },
    { id: 4, name: 'Deliver',  color: '#3b82f6', textColor: '#1e3a8a', startDay: 16, endDay: 20, dateRange: '' },
  ]);
  const [loading, setLoading]   = useState(true);
  const [tooltip, setTooltip]   = useState(null);

  const navigate = useNavigate();
  const svgRef   = useRef(null);
  const location = useLocation();
  const user     = useMemo(() => getUser(), []);
  const { stats, refreshStats } = useUserProgress();

  const fetchData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const [questsRes, scheduleRes] = await Promise.all([
        getQuestsWithProgress(userId),
        getSchedule(),
      ]);
      if (questsRes.success) setQuests(questsRes.data);
      if (scheduleRes.success) {
        setSchedule(scheduleRes.data.schedule);
        setPhases(prev => prev.map(ph => {
          const found = scheduleRes.data.phases.find(p => p.name === ph.name);
          return found ? { ...ph, dateRange: found.dateRange } : ph;
        }));
      }
    } catch (err) {
      console.error('Failed to fetch journey data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Main data loading when route changes
  useEffect(() => {
    if (!user?.user_id) { navigate('/'); return; }
    fetchData(user.user_id);
    refreshStats(user.user_id);
  }, [location.pathname, user?.user_id, fetchData, refreshStats, navigate]);

  // 2. Refresh when user returns to the tab/page
  useEffect(() => {
    if (!user?.user_id) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshStats(user.user_id);
        fetchData(user.user_id);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.user_id, refreshStats, fetchData]);

  // 3. Bubble animation — runs after loading finishes so .hero is in DOM
  useEffect(() => {
    if (loading) return;

    const existing = document.getElementById('bubble-canvas');
    if (existing) existing.remove();

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bubble-canvas';
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let bubbles = [], W, H, animId;

    const resize = () => {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    };

    const makeBubble = (startY) => ({
      x: Math.random() * W, y: startY ?? H + 20,
      r: 4 + Math.random() * 18, speed: 0.4 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.5, opacity: 0.15 + Math.random() * 0.35,
      wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.03,
    });

    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 28; i++) bubbles.push(makeBubble(Math.random() * H));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      bubbles.forEach((b, i) => {
        b.y -= b.speed; b.wobble += b.wobbleSpeed;
        b.x += b.drift + Math.sin(b.wobble) * 0.4;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${b.opacity + 0.2})`; ctx.lineWidth = 1; ctx.stroke();
        const grd = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05, b.x, b.y, b.r);
        grd.addColorStop(0, `rgba(255,255,255,${b.opacity * 0.9})`);
        grd.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        if (b.y + b.r < 0) bubbles[i] = makeBubble();
      });
      if (Math.random() < 0.04 && bubbles.length < 40) bubbles.push(makeBubble());
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, [loading]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const completedDays = stats?.total_days_completed || 0;
  const currentDay    = stats?.current_day || 1;

  const getDaySchedule = (dayNum) => schedule.find(s => s.day === dayNum) || {};

  const getDayStatus = (dayNum) => {
    const quest = quests.find(q => q.day === dayNum);
    const s     = getDaySchedule(dayNum);
    if (!s.unlocked) return 'locked';
    if (quest?.completed) return 'completed';
    if (dayNum === currentDay) return 'current';
    return 'available';
  };

  // ─── SVG diamond layout ────────────────────────────────────────────────────
  const D1 = { cx: 170, cy: 140, hw: 160, hh: 140 };
  const D2 = { cx: 450, cy: 140, hw: 160, hh: 140 };

  const edgePoint = (diamond, edge, t) => {
    const { cx, cy, hw, hh } = diamond;
    const tips     = { UL: { x: cx - hw, y: cy }, LL: { x: cx - hw, y: cy }, UR: { x: cx + hw, y: cy }, LR: { x: cx + hw, y: cy } };
    const vertices = { UL: { x: cx, y: cy - hh }, LL: { x: cx, y: cy + hh }, UR: { x: cx, y: cy - hh }, LR: { x: cx, y: cy + hh } };
    const from = tips[edge], to = vertices[edge];
    return { x: from.x + t * (to.x - from.x), y: from.y + t * (to.y - from.y) };
  };

  const tOuter = [0, 0.35, 0.35, 0.72, 0.72];
  const dayPositions = [];

  for (let i = 0; i < 5; i++) {
    const pt = i === 0 ? { x: D1.cx - D1.hw, y: D1.cy } : edgePoint(D1, i % 2 === 1 ? 'UL' : 'LL', tOuter[i]);
    dayPositions.push({ day: i + 1, x: pt.x, y: pt.y, phase: phases[0] });
  }

  const day2 = dayPositions.find(d => d.day === 2);
  const day3 = dayPositions.find(d => d.day === 3);
  const day4 = dayPositions.find(d => d.day === 4);
  const day5 = dayPositions.find(d => d.day === 5);

  dayPositions.push({ day: 6,  x: 2 * D1.cx - day4.x, y: day4.y, phase: phases[1] });
  dayPositions.push({ day: 7,  x: 2 * D1.cx - day5.x, y: day5.y, phase: phases[1] });
  dayPositions.push({ day: 8,  x: 2 * D1.cx - day2.x, y: day2.y, phase: phases[1] });
  dayPositions.push({ day: 9,  x: 2 * D1.cx - day3.x, y: day3.y, phase: phases[1] });
  dayPositions.push({ day: 10, x: D1.cx + D1.hw,       y: D1.cy,  phase: phases[1] });

  for (let i = 0; i < 5; i++) {
    const pt = i === 0 ? { x: D2.cx - D2.hw, y: D2.cy } : edgePoint(D2, i % 2 === 1 ? 'UL' : 'LL', tOuter[i]);
    dayPositions.push({ day: i + 11, x: pt.x, y: pt.y, phase: phases[2] });
  }

  const day12 = dayPositions.find(d => d.day === 12);
  const day13 = dayPositions.find(d => d.day === 13);
  const day14 = dayPositions.find(d => d.day === 14);
  const day15 = dayPositions.find(d => d.day === 15);

  dayPositions.push({ day: 16, x: 2 * D2.cx - day14.x, y: day14.y, phase: phases[3] });
  dayPositions.push({ day: 17, x: 2 * D2.cx - day15.x, y: day15.y, phase: phases[3] });
  dayPositions.push({ day: 18, x: 2 * D2.cx - day12.x, y: day12.y, phase: phases[3] });
  dayPositions.push({ day: 19, x: 2 * D2.cx - day13.x, y: day13.y, phase: phases[3] });
  dayPositions.push({ day: 20, x: D2.cx + D2.hw,        y: D2.cy,  phase: phases[3] });

  const pathPoints = dayPositions.map(d => `${d.x},${d.y}`).join(' ');

  const handleDotEnter = (e, dp) => {
    const status = getDayStatus(dp.day);
    const s = getDaySchedule(dp.day);

    const svg = e.currentTarget.closest('svg');
    const vb = svg.viewBox.baseVal;

    setTooltip({
      // percentage of SVG viewBox — works at any screen size
      xPct: (dp.x / vb.width)  * 100,
      yPct: (dp.y / vb.height) * 100,
      day: dp.day,
      phase: dp.phase.name,
      status,
      dateLabel: s.dateLabel || '',
      unlockMessage: !s.unlocked && s.dateLabel ? `Unlocks on ${s.dateLabel}` : '',
    });
  };
  const handleDotLeave = () => setTooltip(null);

  const dotStyle = (status, phase) => ({
    fill:            status === 'completed' ? phase.color : '#ffffff',
    stroke:          status === 'locked'    ? '#cbd5e1'   : phase.color,
    strokeWidth:     status === 'current'   ? 2.5         : 1.5,
    strokeDasharray: status === 'locked'    ? '2 2'       : 'none',
  });

  if (loading) return <div className="loading">Loading your journey...</div>;

  const currentQuest = quests.find(q => q.day === currentDay);

  return (
    <div className="journey-page">
      <Navbar />
      <section className="hero">
        <div className="waves-container">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>

        <div className="container">
          {/* Header */}
          <section className="journey-header">
            <h1>20-Day Design Thinking Journey</h1>
            <p>Track your progress through each phase</p>
          </section>

          {/* Progress */}
          <section className="progress-section">
            <ProgressBar completed={completedDays} total={20} />
          </section>

          {/* Diamond Map */}
          <section className="diamond-map-section">
            <div className="diamond-map-wrapper">
              <div className="phase-labels">
                {phases.map((ph, idx) => (
                  <div key={ph.id} className="phase-label-group" style={{ left: `${idx * 25}%`, width: '25%' }}>
                    <span className="phase-badge" style={{ background: ph.color + '22', color: ph.textColor, border: `1px solid ${ph.color}` }}>
                      {ph.name}
                    </span>
                    {ph.dateRange
                      ? <span className="phase-range">{ph.dateRange}</span>
                      : <span className="phase-range">Days {ph.startDay}–{ph.endDay}</span>
                    }
                  </div>
                ))}
              </div>

              <div className="svg-container">
                <svg ref={svgRef} viewBox="0 0 620 290" xmlns="http://www.w3.org/2000/svg" className="journey-svg" aria-label="20-day design thinking journey map">
                  <polygon points={`${D1.cx-D1.hw},${D1.cy} ${D1.cx},${D1.cy-D1.hh} ${D1.cx},${D1.cy+D1.hh}`} fill="#fbbf24" fillOpacity="0.35" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.6" />
                  <polygon points={`${D1.cx+D1.hw},${D1.cy} ${D1.cx},${D1.cy-D1.hh} ${D1.cx},${D1.cy+D1.hh}`} fill="#a78bfa" fillOpacity="0.35" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.6" />
                  <polygon points={`${D2.cx-D2.hw},${D2.cy} ${D2.cx},${D2.cy-D2.hh} ${D2.cx},${D2.cy+D2.hh}`} fill="#f472b6" fillOpacity="0.35" stroke="#f472b6" strokeWidth="1.5" strokeOpacity="0.6" />
                  <polygon points={`${D2.cx+D2.hw},${D2.cy} ${D2.cx},${D2.cy-D2.hh} ${D2.cx},${D2.cy+D2.hh}`} fill="#3b82f6" fillOpacity="0.35" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.6" />
                  <polyline points={pathPoints} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" />

                  {dayPositions.map((dp) => {
                    const status = getDayStatus(dp.day);
                    const r      = (dp.day === 1 || dp.day === 10 || dp.day === 11 || dp.day === 20) ? 11 : 10;
                    const ds     = dotStyle(status, dp.phase);
                    return (
                      <g key={dp.day} className={`day-dot-group status-${status}`}
                        onClick={() => { if (status !== 'locked') navigate(`/quest/day/${dp.day}`); }}
                        onMouseEnter={(e) => handleDotEnter(e, dp)}
                        onMouseLeave={handleDotLeave}
                        style={{ cursor: status === 'locked' ? 'not-allowed' : 'pointer' }}
                      >
                        {status === 'current' && (
                          <circle cx={dp.x} cy={dp.y} r={r + 5} fill="none" stroke={dp.phase.color} strokeWidth="1.5" className="pulse-ring" />
                        )}
                        <circle cx={dp.x} cy={dp.y} r={r} {...ds} />
                        {status === 'current' && <circle cx={dp.x} cy={dp.y} r={4} fill={dp.phase.color} />}
                        {status === 'completed' && (
                          <text x={dp.x} y={dp.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="600" fill="white" style={{ pointerEvents: 'none', userSelect: 'none' }}>✓</text>
                        )}
                        {(status === 'locked' || status === 'available') && (
                          <text x={dp.x} y={dp.y} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="500"
                            fill={status === 'available' ? dp.phase.color : '#94a3b8'}
                            style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {dp.day}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {tooltip && (
                  <div
                    className="day-tooltip"
                    style={{
                      position: 'absolute',
                      left: `${tooltip.xPct}%`,
                      top: `${tooltip.yPct}%`,
                      transform: 'translate(-50%, calc(-100% - 10px))', // above the dot, centered
                      zIndex: 9999,
                      pointerEvents: 'none',
                    }}
                  >
                    <strong>Day {tooltip.day}</strong>
                    {tooltip.dateLabel && <span className="tooltip-date">{tooltip.dateLabel}</span>}
                    <span>{tooltip.phase}</span>
                    {tooltip.unlockMessage && <span className="tooltip-unlock">{tooltip.unlockMessage}</span>}
                    <span className={`tooltip-status ${tooltip.status}`}>
                      {tooltip.status === 'completed' ? '✓ Completed'
                        : tooltip.status === 'current'   ? '● Today'
                        : tooltip.status === 'available' ? '↩ Catch up'
                        : '🔒 Locked'}
                    </span>
                  </div>
                )}
              </div>

              <div className="dot-legend">
                <div className="legend-item"><span className="legend-circle completed-ex" />Completed</div>
                <div className="legend-item"><span className="legend-circle current-ex" />Today</div>
                <div className="legend-item"><span className="legend-circle available-ex" />Available (catch up)</div>
                <div className="legend-item"><span className="legend-circle locked-ex" />Locked</div>
              </div>
            </div>
          </section>

          {/* Current Quest Card */}
          {currentQuest && getDayStatus(currentDay) !== 'locked' && (
            <section className="current-quest">
              <div className="quest-card">
                <div className="quest-mascot">
                  <img src="/images/sharks/shark_idea.png" alt="Makers Quest Shark Mascot" className="mascot-image" />
                </div>
                <div className="quest-content">
                  <div className="quest-badge">Day {currentDay}</div>
                  <h2>{currentQuest.title}</h2>
                  <p>Start your journey for today's challenge. Discover, think, and create as you move through the innovation quest.</p>
                  <Link to={`/quest/day/${currentDay}`} className="btn btn-primary">Start Quest →</Link>
                </div>
              </div>
            </section>
          )}

          {/* Locked Day Message */}
          {currentQuest && getDayStatus(currentDay) === 'locked' && (
            <section className="current-quest locked-message">
              <div className="quest-card">
                <div className="quest-mascot">
                  <img src="/images/sharks/shark_sleep.png" alt="Makers Quest Shark Mascot" className="mascot-image" />
                </div>
                <div className="quest-content">
                  <div className="quest-badge">Day {currentDay}</div>
                  <h2>Day is Locked</h2>
                  <p>Come back later when this day unlocks.</p>
                  {getDaySchedule(currentDay).dateLabel && (
                    <p className="unlock-time">Unlocks on: <strong>{getDaySchedule(currentDay).dateLabel}</strong></p>
                  )}
                  <button className="btn btn-secondary" onClick={() => navigate('/journey')}>Back to Journey</button>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default JourneyPage;