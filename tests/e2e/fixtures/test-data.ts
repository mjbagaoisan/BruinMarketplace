/**
 * Test data generation utilities
 */

/**
 * Generate a unique test listing title with timestamp
 */
export function generateTestListingTitle(prefix: string = 'TEST'): string {
  const timestamp = Date.now();
  return `[${prefix}] ${timestamp} - Test Listing`;
}

/**
 * Generate random price between min and max
 */
export function generateRandomPrice(min: number = 10, max: number = 500): string {
  const price = Math.floor(Math.random() * (max - min + 1)) + min;
  return price.toString();
}

/**
 * Test listing templates for different categories
 */
export const LISTING_TEMPLATES = {
  textbook: {
    title: '[TEST] CS Textbook',
    category: 'textbooks',
    condition: 'good',
    location: 'hill',
    description: 'Test listing for textbook',
  },
  electronics: {
    title: '[TEST] Laptop',
    category: 'electronics',
    condition: 'like_new',
    location: 'on_campus',
    description: 'Test listing for electronics',
  },
  furniture: {
    title: '[TEST] Desk Chair',
    category: 'furniture',
    condition: 'fair',
    location: 'off_campus',
    description: 'Test listing for furniture',
  },
  clothing: {
    title: '[TEST] UCLA Hoodie',
    category: 'clothing',
    condition: 'new',
    location: 'hill',
    description: 'Test listing for clothing',
  },
  tickets: {
    title: '[TEST] Concert Tickets',
    category: 'tickets',
    condition: 'new',
    location: 'on_campus',
    description: 'Test listing for tickets',
  },
};

/**
 * Create a test listing object with unique title
 */
export function createTestListingData(
  template: keyof typeof LISTING_TEMPLATES = 'textbook',
  overrides?: Partial<{
    title: string;
    price: string;
    description: string;
    condition: string;
    category: string;
    location: string;
    preferred_payment: string;
  }>
) {
  const base = LISTING_TEMPLATES[template];
  const uniqueTitle = generateTestListingTitle();
  
  return {
    title: uniqueTitle,
    price: generateRandomPrice(),
    description: base.description,
    condition: base.condition,
    category: base.category,
    location: base.location,
    preferred_payment: 'venmo',
    ...overrides,
  };
}

/**
 * Wait helper with custom timeout
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or max attempts reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs);
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}
