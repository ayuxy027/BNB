/**
 * Validation utilities for waitlist form inputs
 * Provides strong email and name validation with detailed error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email address with comprehensive checks
 * @param email - Email string to validate
 * @returns ValidationResult with isValid boolean and optional error message
 */
export const validateEmail = (email: string): ValidationResult => {
  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Check if email is empty
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  // Check email format
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Check email length (RFC 5321 limit)
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  // Check for common invalid patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, error: 'Email format is invalid' };
  }
  
  return { isValid: true };
};

/**
 * Validates name field with length and character checks
 * @param name - Name string to validate (optional field)
 * @returns ValidationResult with isValid boolean and optional error message
 */
export const validateName = (name: string): ValidationResult => {
  // Name is optional, so empty is valid
  if (!name || !name.trim()) {
    return { isValid: true };
  }
  
  // Check name length
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }
  
  // Check for minimum length if provided
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true };
};

/**
 * Sanitizes input by trimming whitespace and converting to lowercase for email
 * @param input - Input string to sanitize
 * @param type - Type of input ('email' or 'name')
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string, type: 'email' | 'name'): string => {
  const trimmed = input.trim();
  
  if (type === 'email') {
    return trimmed.toLowerCase();
  }
  
  return trimmed;
};
