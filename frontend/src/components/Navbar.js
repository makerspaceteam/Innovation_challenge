import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearUser } from '../services/api';

function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">⭐</span>
          <span>Makers Innovation Quest</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/journey">Journey</Link></li>
          <li><a href="#badges">Badges</a></li>
          <li><a href="#journal">Journal</a></li>
          <li>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-primary">
                  Hi, {user.user_name?.split(' ')[0]}!
                </button>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/" className="btn btn-primary">Join Quest</Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;