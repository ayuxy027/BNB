'use client';

import React from 'react';

interface BorderAnimationButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function BorderAnimationButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}: BorderAnimationButtonProps) {
  return (
    <>
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .button-bg {
          background: conic-gradient(from 0deg, #00F5FF, #000, #000, #00F5FF, #000, #000, #000, #00F5FF);
          background-size: 300% 300%;
          animation: shine 6s ease-out infinite;
        }
        
        .button-bg:disabled {
          animation: none;
          opacity: 0.5;
        }
      `}</style>

      <div className={`button-bg rounded-full p-0.5 hover:scale-105 transition duration-300 active:scale-100 ${disabled ? 'pointer-events-none' : ''} ${className}`}>
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className="px-8 text-sm py-2.5 text-white rounded-full font-medium bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {children}
        </button>
      </div>
    </>
  );
}
