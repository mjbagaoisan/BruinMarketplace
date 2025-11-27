import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

/**
 * Global setup runs once before all tests
 * Use this to:
 * - Authenticate once and save state
 * - Set up test database
 * - Verify environment is ready
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Running global test setup...');
  
  // Verify environment variables
  const requiredEnvVars = [
    'FRONTEND_URL',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    throw new Error('Missing required environment variables');
  }
  
  console.log('✅ Environment variables verified');
  
  // Create .auth directory if it doesn't exist
  const authDir = path.join(process.cwd(), 'tests', 'e2e', '.auth');
  try {
    await fs.mkdir(authDir, { recursive: true });
    console.log('✅ Auth directory created');
  } catch (error) {
    // Directory might already exist, that's fine
  }
  
  // Optional: Perform authentication once and save state
  // This is commented out because Google OAuth requires manual interaction
  // Uncomment and modify if you have automated OAuth setup
  
  /*
  console.log('🔐 Attempting to authenticate...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login
    await page.goto(process.env.FRONTEND_URL + '/login');
    
    // TODO: Implement automated OAuth or manual wait
    // For now, this would require manual intervention
    
    // Save authentication state
    const authFile = path.join(authDir, 'user.json');
    await context.storageState({ path: authFile });
    console.log('✅ Authentication state saved');
  } catch (error) {
    console.log('⚠️  Could not save auth state (this is expected for OAuth)');
    console.log('   Tests will need to authenticate individually');
  } finally {
    await browser.close();
  }
  */
  
  console.log('✅ Global setup complete\n');
}

export default globalSetup;
