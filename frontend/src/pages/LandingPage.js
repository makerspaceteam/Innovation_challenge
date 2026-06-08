import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/api';
import './LandingPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function LandingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleStart = () => {
    if (user) {
      navigate('/journey');
    } else {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
    }
  };

  return (
    <div className="landing-page">
      <Navbar />

      <section className="hero">
        <div className="container">
          <div className="hero-content">

            {/* Left — Mascot */}
            <div className="hero-image">
              <div className="mascot-container">
                <img
                  src="/images/sharks/shark_hello.png"
                  alt="Shark Mascot"
                  className="mascot-image"
                  title="Maker Innovation Quest Mascot"
                />
              </div>
            </div>

            {/* Right — Text */}
            <div className="hero-text">
              <h1>Makers Innovation Quest</h1>
              <p className="hero-subtitle">20-Day Design Thinking Journey</p>
              <p className="hero-description">
                Explore, Define, Develop, and Deliver innovative solutions through a guided
                design thinking journey. Complete daily quests and unlock badges as you progress!
              </p>
              <div className="hero-buttons">
                <button onClick={handleStart} className="btn btn-primary btn-lg">
                  {user ? 'Continue Quest' : 'Start Quest'}
                </button>
                <button onClick={handleStart} className="btn btn-secondary btn-lg">
                  Continue Learning
                </button>
                <a
                  href="https://app.notion.com/p/CADT-Innovation-Challenge-Program-36e4a518dcc680b48977fe36a1c68e20?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-notion btn-lg"
                >
                  📘 Explore Syllabus
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;