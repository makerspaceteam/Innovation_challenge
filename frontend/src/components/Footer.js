import React from 'react';
import './Footer.css';

function Footer({ message, feedbackUrl }) {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* Brand */}
        <div className="footer-brand">
          <span className="footer-logo">⭐ Makers Innovation Quest</span>
          <p>{message || '© 2026 Makers Innovation Quest, By Makerspace.'}</p>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li>📧 <a href="mailto:makerspace@cadt.edu.kh">makerspace@cadt.edu.kh</a></li>
            <li>📍 CADT, Phnom Penh, Cambodia</li>
            <li>🌐 <a href="https://cadt.edu.kh" target="_blank" rel="noopener noreferrer">cadt.edu.kh</a></li>
          </ul>
        </div>

        {/* Feedback */}
        <div className="footer-section">
          <h4>Feedback</h4>
          <p>Help us improve the quest experience.</p>
          <a
            href={feedbackUrl || 'https://docs.google.com/forms/d/e/1FAIpQLSdwigkUleCjM4scBhwVxmbUd8GrAW7Ry4JCiOMcXq0QG2ZP2g/viewform?usp=header'}
            target="_blank"
            rel="noopener noreferrer"
            className="feedback-btn"
          >
            📝 Give Feedback
          </a>
        </div>

      </div>

      <div className="footer-bottom">
        Made by Makerspace Team · CADT
      </div>
    </footer>
  );
}

export default Footer;