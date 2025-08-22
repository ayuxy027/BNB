'use client';

import React, { useState } from 'react';
import BorderAnimationButton from '../../../common/BorderAnimationButton';

interface WaitlistFormProps {
  className?: string;
}

// --- VALIDATION FUNCTIONS ADDED HERE ---
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
};

const validateName = (name: string): { isValid: boolean; error?: string } => {
  // Name is optional, so an empty string is valid.
  if (name && name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  return { isValid: true };
};
// -----------------------------------------

/**
 * A hardcoded function to simulate adding a user to the waitlist.
 * It returns a success message after a 1-second delay.
 */
const hardcodedAddToWaitlist = async (email: string, name: string) => {
  console.log(`Simulating adding user to waitlist:`, { email, name });
  // Wait for 1 second to mimic a network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Always return a success response
  return { success: true, error: null };
};

/**
 * WaitlistForm Component
 * A translucent form component for beta waitlist signup.
 * This version is hardcoded and does not connect to Supabase.
 */
const WaitlistForm: React.FC<WaitlistFormProps> = ({ className = '' }) => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Handles form submission with validation and a simulated API call.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const emailValidation = validateEmail(email);
    const nameValidation = validateName(name);

    if (!emailValidation.isValid) {
      setMessage({ type: 'error', text: emailValidation.error! });
      return;
    }

    if (!nameValidation.isValid) {
      setMessage({ type: 'error', text: nameValidation.error! });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const result = await hardcodedAddToWaitlist(email, name);

    if (result.success) {
      setMessage({ type: 'success', text: 'Successfully joined the beta waitlist!' });
      setEmail('');
      setName('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to join waitlist' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className={`relative max-w-md w-full mx-auto ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-2xl blur-sm opacity-60"></div>
      <div className="relative bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-black to-[#748298] text-transparent bg-clip-text">Join Beta Waitlist</h3>
          <p className="text-sm text-slate-600">Be among the first to try Weave</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm backdrop-blur-sm ${message.type === 'success'
            ? 'bg-green-100/70 text-green-800 border border-green-200/50'
            : 'bg-red-100/70 text-red-800 border border-red-200/50'
          }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm focus:border-slate-400/50 focus:outline-none focus:ring-2 focus:ring-slate-300/30 transition-all text-sm text-slate-800 placeholder-slate-500 disabled:opacity-50"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm focus:border-slate-400/50 focus:outline-none focus:ring-2 focus:ring-slate-300/30 transition-all text-sm text-slate-800 placeholder-slate-500 disabled:opacity-50"
            />
          </div>
          <BorderAnimationButton
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <span>{isSubmitting ? 'Joining Beta...' : 'Join Beta'}</span>
              {!isSubmitting && (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.166 10h11.667m0 0L9.999 4.167M15.833 10l-5.834 5.834" stroke="#fff" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </BorderAnimationButton>
        </form>
      </div>
    </div>
  );
};

export default WaitlistForm;