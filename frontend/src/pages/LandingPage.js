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

    // Ocean bubble animation
    const hero = document.querySelector('.hero');
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
        {/* <div className="waves-container">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div> */}
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