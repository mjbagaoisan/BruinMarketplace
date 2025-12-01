export const TEST_ENV = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const TEST_USERS = {
  validUser: {
    email: 'mjbagaoisan@ucla.edu',
  },
  invalidUser: {
    email: 'invalid@gmail.com',
  },
};

export const TEST_LISTING = {
  title: '[TEST] CS 35L Textbook',
  price: '50',
  description: 'Test listing - Used textbook in good condition',
  condition: 'good',
  category: 'textbooks',
  location: 'hill',
  preferred_payment: 'venmo',
};

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

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  OAUTH: 60000,
};
