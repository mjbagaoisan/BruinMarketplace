// runs once before all tests
import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

async function globalSetup(config: FullConfig) {
  console.log('Running global test setup...');
  
  const requiredEnvVars = [
    'FRONTEND_URL',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    throw new Error('Missing required environment variables');
  }
  
  console.log('Environment variables verified');
  
  // auth state saved here so we dont login every test
  const authDir = path.join(process.cwd(), 'tests', 'e2e', '.auth');
  try {
    await fs.mkdir(authDir, { recursive: true });
    console.log('Auth directory created');
  } catch (error) {
  }
  
  console.log('Global setup complete\n');
}

export default globalSetup;
