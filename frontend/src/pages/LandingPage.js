import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrGetUser, saveUser, getUser } from '../services/api';
import './LandingPage.css';

function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleStart = () => {
    if (user) {
      navigate('/journey');
    } else {
      setStep(1);
      setErrors({});
      setName('');
      setEmail('');
      setShowModal(true);
    }
  };

  const handleContinue = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setLoading(true);
    const res = await createOrGetUser(name, email);
    if (res.success) {
      saveUser(res.data);
      setUser(res.data);
      setStep(2);
    } else {
      setErrors({ email: res.message });
    }
    setLoading(false);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   const res = await createOrGetUser(name, email);

  //   if (res.success) {
  //     saveUser(res.data);
  //     setUser(res.data);
  //     setShowModal(false);
  //     navigate('/journey');
  //   } else {
  //     setError(res.message || 'Something went wrong');
  //   }

  //   setLoading(false);
  // };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <span className="logo-icon">⭐</span>
            <span>Makers Innovation Quest</span>
          </div>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#badges">Badges</a></li>
            <li><a href="#journal">Journal</a></li>
            <li>
              <button className="btn btn-primary" onClick={() => setShowModal(!user)}>
                {user ? `Hi, ${user.user_name?.split(' ')[0]}!` : 'Hi, Maker!'}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Makers Innovation Quest</h1>
              <p className="hero-subtitle">20-Day Design Thinking Journey</p>
              <p className="hero-description">
                Explore, Define, Develop, and Deliver innovative solutions through a guided design thinking journey.
                Complete daily quests and unlock badges as you progress!
              </p>
              <div className="hero-buttons">
                <button onClick={handleStart} className="btn btn-primary btn-lg">
                  {user ? 'Continue Quest' : 'Start Quest'}
                </button>
                <button className="btn btn-secondary btn-lg">Continue Learning</button>
              </div>
            </div>
            <div className="hero-image">
              <div className="mascot-container">
                <span className="mascot-emoji">🦈</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phases, Features, CTA sections stay the same */}
      {/* ... your existing sections ... */}

      {/* Login Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setStep(1);
          setErrors({});
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close" onClick={() => {
              setShowModal(false);
              setStep(1);
              setErrors({});}}>
              ✕
            </button>

            <div className="modal-header">
              <div className="modal-icon">⭐</div>
              <h2>Join the quest</h2>
              <p>Start your 20-day design thinking journey</p>
            </div>

            <div className="step-dots">
              <span className={`dot ${step === 1 ? 'active' : ''}`}></span>
              <span className={`dot ${step === 2 ? 'active' : ''}`}></span>
            </div>

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
                <div className="field">
                  <label>Your name</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="e.g. Soy Chanratana"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className="error-msg">{errors.name}</p>}
                </div>

                <div className="field">
                  <label>Email address</label>
                  <div className="input-wrap">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Continue →'}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="success-step">
                <div className="success-circle">✓</div>
                <p className="success-title">You're all set!</p>
                <p className="success-sub">Welcome to Makers Innovation Quest.</p>
                <button className="btn-submit" onClick={() => navigate('/journey')}>
                  Start quest →
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Makers Innovation Quest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;