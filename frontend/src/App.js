import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import JourneyPage from './pages/JourneyPage';
import DayQuestPage from './pages/DayQuestPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import LectureDashboardPage from './pages/LectureDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/quest/day/:dayNumber" element={<DayQuestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/dashboard" element={<LectureDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
