/**
 * Test environment configuration and constants
 */

// Environment variables for tests
export const TEST_ENV = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

/**
 * Test user credentials
 * NOTE: For Google OAuth E2E tests, you'll need a real test Google account
 * with @ucla.edu or @g.ucla.edu email
 */
export const TEST_USERS = {
  validUser: {
    email: 'test@ucla.edu', // Replace with actual test account
    // Google OAuth doesn't use password, but keep for reference
  },
  invalidUser: {
    email: 'invalid@gmail.com',
  },
};

/**
 * Test listing data for creating test listings
 */
export const TEST_LISTING = {
  title: '[TEST] CS 35L Textbook',
  price: '50',
  description: 'Test listing - Used textbook in good condition',
  condition: 'good',
  category: 'textbooks',
  location: 'hill',
  preferred_payment: 'venmo',
};

/**
 * Test listing variations for different test scenarios
 */
export const TEST_LISTINGS = {
  electronics: {
    title: '[TEST] MacBook Pro',
    price: '800',
    description: 'Test listing - Laptop for sale',
    condition: 'like_new',
    category: 'electronics',
    location: 'on_campus',
    preferred_payment: 'zelle',
  },
  furniture: {
    title: '[TEST] Desk Chair',
    price: '30',
    description: 'Test listing - Comfortable desk chair',
    condition: 'good',
    category: 'furniture',
    location: 'off_campus',
    preferred_payment: 'cash',
  },
};

/**
 * Timeouts for various operations
 */
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  OAUTH: 60000, // OAuth flow can be slow
};
