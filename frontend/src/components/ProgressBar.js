import React from 'react';
import './ProgressBar.css';

function ProgressBar({ completed = 0, total = 20, showLabel = true }) {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="progress-info">
      {showLabel && <h2>Your Journey Progress</h2>}
      <div className="pb-track">
        <div 
          className="pb-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="progress-text">
        {completed} / {total} Days Completed
      </p>
    </div>
  );
}

export default ProgressBar;