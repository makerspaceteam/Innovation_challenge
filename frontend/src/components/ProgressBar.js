import React from 'react';
import './ProgressBar.css';

const PHASES = [
  { name: 'Discover', start: 1,  end: 5,  color: '#fbbf24' },
  { name: 'Define',   start: 6,  end: 10, color: '#a78bfa' },
  { name: 'Develop',  start: 11, end: 15, color: '#f472b6' },
  { name: 'Deliver',  start: 16, end: 20, color: '#3b82f6' },
];

function ProgressBar({ completed = 0, total = 20, showLabel = true, showPhases = true }) {
  const safeCompleted = Math.max(0, Math.min(completed, total));
  const percentage = Math.round((safeCompleted / total) * 100);

  return (
    <div className="progress-info">
      {showLabel && <h2>Your Journey Progress</h2>}

      <div className="pb-header">
        <span className="pb-count">
          <strong>{safeCompleted}</strong> of {total} days completed
        </span>
        <span className="pb-percent">{percentage}%</span>
      </div>

      <div
        className="pb-track"
        role="progressbar"
        aria-valuenow={safeCompleted}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${safeCompleted} of ${total} days completed`}
      >
        <div className="pb-fill" style={{ width: `${percentage}%` }}>
          <div className="pb-shine" />
        </div>
        {/* Phase boundary ticks at 25% / 50% / 75% */}
        {[25, 50, 75].map(tick => (
          <span key={tick} className="pb-tick" style={{ left: `${tick}%` }} />
        ))}
      </div>

      {showPhases && (
        <div className="pb-phases">
          {PHASES.map(phase => {
            const isDone = safeCompleted >= phase.end;
            const isActive = safeCompleted >= phase.start - 1 && safeCompleted < phase.end;
            return (
              <div
                key={phase.name}
                className={`pb-phase ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              >
                <span className="pb-phase-dot" style={{ background: phase.color }} />
                <span className="pb-phase-name">{phase.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
