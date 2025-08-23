import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Menu open/close handlers
  const handleOpenMenu = () => setMenuOpen(true);
  const handleCloseMenu = () => setMenuOpen(false);

  const scrollToWaitlist = () => {
    const waitlistSection = document.querySelector('form');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-slate-200/20 md:px-16 lg:px-24 xl:px-32 w-full bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="h-10 flex items-center">
        <Link to="/">
          <img
            src={logo}
            alt="Weave Logo"
            className="h-80 w-auto"
            style={{ maxHeight: '8rem' }}
          />
        </Link>
      </div>

      {/* Desktop menu */}
      <div
        className={
          [
            "max-md:fixed max-md:top-0 max-md:left-0 max-md:z-40 max-md:w-full max-md:h-screen max-md:bg-white/80 max-md:backdrop-blur-xl max-md:flex-col max-md:justify-center max-md:transition-all max-md:duration-300 max-md:overflow-hidden flex items-center gap-8 font-medium",
            menuOpen ? "max-md:opacity-100 max-md:visible" : "max-md:opacity-0 max-md:invisible"
          ].join(' ')
        }
      >
        <Link to="/dashboard" className="hover:text-gray-500" onClick={handleCloseMenu}>
          Dashboard
        </Link>
        <Link to="/" className="hover:text-gray-500" onClick={handleCloseMenu}>
          Editor
        </Link>
        <Link to="/" className="hover:text-gray-500" onClick={handleCloseMenu}>
          Templates
        </Link>
        <Link to="/" className="hover:text-gray-500" onClick={handleCloseMenu}>
          Pricing & Plans
        </Link>
        <button
          className="md:hidden bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-full font-medium transition"
          onClick={scrollToWaitlist}
        >
          Join Waitlist
        </button>
        <button
          className="md:hidden bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-md aspect-square font-medium transition"
          onClick={handleCloseMenu}
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-md aspect-square font-medium transition"
        onClick={handleOpenMenu}
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <path d="M4 6h16" />
        </svg>
      </button>
    </nav>
  );
};

export default Navbar;
