import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './FAQPage.css';

const FAQ_DATA = [
  {
    category: 'General',
    items: [
      {
        q: 'What is the Makers Innovation Quest?',
        a: 'A 20-day guided design thinking program where you complete daily quests to Discover, Define, Develop, and Deliver innovative solutions to real-world problems.'
      },
      {
        q: 'Who can join the program?',
        a: 'The program is open to all CADT students and innovators who want to sharpen their problem-solving and design thinking skills.'
      },
      {
        q: 'Is the program free?',
        a: 'Yes, the Makers Innovation Quest is completely free for all eligible participants.'
      },
    ]
  },
  {
    category: 'Program Structure',
    items: [
      {
        q: 'How many days is the program?',
        a: 'The program runs for 20 weekdays (Monday–Friday) across 4 weeks, with one quest unlocked each day.'
      },
      {
        q: 'What are the 4 phases?',
        a: 'Discover (Week 1), Define (Week 2), Develop (Week 3), and Deliver (Week 4). Each phase builds on the previous one to guide you through the full design thinking process.'
      },
      {
        q: 'What time does a new quest unlock each day?',
        a: 'Each quest unlocks at the start of its scheduled weekday. Weekends are rest days — no quests are scheduled on Saturday or Sunday.'
      },
    ]
  },
  {
    category: 'Progress & Completion',
    items: [
      {
        q: 'What happens if I miss a day?',
        a: 'Missed days become available for catch-up. You can complete them anytime before the program ends — they will be marked as available on your journey map.'
      },
      {
        q: 'Do I get a certificate or badge?',
        a: 'Yes! You earn badges as you complete each phase, and a certificate of completion is awarded when you finish all 20 quests.'
      },
      {
        q: 'Can I track my progress?',
        a: 'Yes — your Journey Map shows every day, which phase it belongs to, whether it is completed, your current day, and what is still locked ahead.'
      },
    ]
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'Do I need to create an account?',
        a: 'Yes, you need to log in to track your progress, unlock quests, and earn badges. Your progress is saved to your account.'
      },
      {
        q: 'Can I use the program on mobile?',
        a: 'Yes, the platform is fully responsive and works on phones, tablets, and desktops.'
      },
      {
        q: 'Who do I contact if something is not working?',
        a: 'Reach out to the program coordinator or check the Notion syllabus for support contacts.'
      },
    ]
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{question}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
}

function FAQPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="faq-page">
      <Navbar />

      <div className="faq-hero">
        <div className="container">
          <button className="faq-back" onClick={() => navigate(-1)}>← Back</button>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about the Makers Innovation Quest</p>

          <div className="faq-search-wrap">
            <input
              type="text"
              className="faq-search"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="faq-body">
        <div className="container">
          {filtered.length === 0 ? (
            <p className="faq-empty">No results found for "{search}"</p>
          ) : (
            filtered.map((cat, i) => (
              <div key={i} className="faq-category">
                <h2 className="faq-category-title">{cat.category}</h2>
                <div className="faq-list">
                  {cat.items.map((item, j) => (
                    <FAQItem key={j} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default FAQPage;