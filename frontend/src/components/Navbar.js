import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { getUser, clearUser, saveUser, saveToken, loginUser, changePassword, getUserStats } from '../services/api';

const TEMP_PW = 'cadt1234';

function Navbar() {
  const [user, setUser] = useState(getUser());
  const [currentDay, setCurrentDay] = useState(1); // ← Changed: start with 1
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load currentDay from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedStats = JSON.parse(localStorage.getItem('userStats'));
      setCurrentDay(savedStats?.current_day || 1);
    }
  }, [user]);

  const resetModal = useCallback(() => {
    setStep(1);
    setErrors({});
    setEmail('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  const openModal = useCallback(() => {
    resetModal();
    setShowModal(true);
  }, [resetModal]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetModal();
  }, [resetModal]);

  useEffect(() => {
    const handler = () => openModal();
    window.addEventListener('open-login-modal', handler);
    return () => window.removeEventListener('open-login-modal', handler);
  }, [openModal]);

  const handleJoinQuest = () => {
    if (user) {
      navigate('/journey');
    } else {
      openModal();
    }
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setCurrentDay(1);
    navigate('/');
  };

  const handleLogin = async () => {
    const newErrors = {};

    if (!email || !/^[^\s@]+@student\.cadt\.edu\.kh$/i.test(email))
      newErrors.email = 'Please enter a valid Gmail address (e.g. you@student.cadt.edu.kh)';
    if (!password)
      newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setErrors({});
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (!res.success) {
        setErrors({ general: res.message });
        return;
      }

      saveToken(res.token);
      saveUser(res.data);
      setUser(res.data);   // ← This will trigger the useEffect above

      const statsRes = await getUserStats(res.data.user_id);
      const day = statsRes?.data?.current_day || 1;
      
      setCurrentDay(day);
      localStorage.setItem('userStats', JSON.stringify(statsRes.data));

      if (res.requiresPasswordChange) {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors = {};
    if (newPassword.length < 8)
      newErrors.newPassword = 'Must be at least 8 characters';
    if (newPassword === TEMP_PW)
      newErrors.newPassword = 'Cannot reuse your temporary password';
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setErrors({});
    setLoading(true);

    try {
      const res = await changePassword(user.user_id, newPassword);
      if (!res.success) {
        setErrors({ general: res.message });
        return;
      }
      setStep(2);
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfile = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">⭐</span>
            <span>Makers Innovation Quest</span>
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/journey">Journey</Link></li>
            <li><Link to={`/quest/day/${currentDay}`}>Quest</Link></li>
            <li>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={handleProfile}>
                    Hi, {user.user_name?.split(' ')[0]}!
                  </button>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleJoinQuest}>
                  Join Quest
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Login Modal - unchanged */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close" onClick={closeModal}>✕</button>

            <div className="modal-header">
              <div className="modal-icon">⭐</div>
              {step === 1 && <><h2>Join the quest</h2><p>Start your 20-day design thinking journey</p></>}
              {step === 2 && <><h2>You're all set!</h2><p>Welcome to Makers Innovation Quest.</p></>}
              {step === 3 && <><h2>Change your password</h2><p>Your password is temporary. Please set a new one.</p></>}
            </div>

            <div className="step-dots">
              <span className={`dot ${step === 1 ? 'active' : ''}`}></span>
              <span className={`dot ${step === 2 ? 'active' : ''}`}></span>
              <span className={`dot ${step === 3 ? 'active' : ''}`}></span>
            </div>

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div className="field">
                  <label>Student Email</label>
                  <div className="input-wrap">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="you@student.cadt.edu.kh"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>

                <div className="field">
                  <label>Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>

                {errors.general && <p className="error-msg">{errors.general}</p>}

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Sign in →'}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="success-step">
                <div className="success-circle">✓</div>
                <p className="success-title">You're all set!</p>
                <p className="success-sub">Welcome to Makers Innovation Quest.</p>
                <button className="btn-submit" onClick={() => { closeModal(); navigate('/journey'); }}>
                  Start quest →
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="field">
                  <label>New password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  {errors.newPassword && <p className="error-msg">{errors.newPassword}</p>}
                </div>

                <div className="field">
                  <label>Confirm password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
                </div>

                {errors.general && <p className="error-msg">{errors.general}</p>}

                <button className="btn-submit" onClick={handleChangePassword} disabled={loading}>
                  {loading ? 'Saving...' : 'Set new password →'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;