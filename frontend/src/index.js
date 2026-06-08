import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UserProgressProvider } from './contexts/UserProgressContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProgressProvider>
      <App />
    </UserProgressProvider>
  </React.StrictMode>
);
