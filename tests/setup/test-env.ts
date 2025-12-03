// environment config for tests
export const TEST_ENV = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
};

export const TEST_PROFILE = {
  major: 'Computer Science',
  classYear: '2027',
};
