import React from 'react';

function Footer({ message }) {
  return (
    <footer className="footer">
      <div className="container">
        <p>{message || '© 2026 Makers Innovation Quest. All rights reserved.'}</p>
      </div>
    </footer>
  );
}

export default Footer;