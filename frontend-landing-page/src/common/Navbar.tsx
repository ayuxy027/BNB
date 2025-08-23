'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
    <nav className="bg-white border-b border-gray-200 px-4 py-4 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-black font-['Poppins'] ml-15">
          FluxGallery
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-black hover:text-gray-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/editor" className="text-black hover:text-gray-600 transition-colors">
            Create
          </Link>
          <Link href="/profile" className="text-black hover:text-gray-600 transition-colors">
            Profile
          </Link>

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
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed top-0 left-0 z-40 w-full h-screen bg-white/80 backdrop-blur-xl flex flex-col justify-center items-center transition-all duration-300">
          <div className="flex flex-col items-center space-y-6 text-center">
            <Link href="/dashboard" className="text-black hover:text-gray-600 transition-colors text-lg" onClick={handleCloseMenu}>
              Dashboard
            </Link>
            <Link href="/" className="text-black hover:text-gray-600 transition-colors text-lg" onClick={handleCloseMenu}>
              Editor
            </Link>
            <Link href="/" className="text-black hover:text-gray-600 transition-colors text-lg" onClick={handleCloseMenu}>
              Templates
            </Link>
            <Link href="/" className="text-black hover:text-gray-600 transition-colors text-lg" onClick={handleCloseMenu}>
              Pricing & Plans
            </Link>
            <button
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-full font-medium transition"
              onClick={scrollToWaitlist}
            >
              Join Waitlist
            </button>
          </div>
          <button
            className="absolute top-4 right-4 bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-md aspect-square font-medium transition"
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
      )}
    </nav>
  );
};

export default Navbar;