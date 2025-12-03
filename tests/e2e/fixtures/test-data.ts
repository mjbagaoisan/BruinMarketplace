// timestamp ensures unique titles
export function generateTestListingTitle(prefix: string = 'TEST'): string {
  const timestamp = Date.now();
  return `[${prefix}] ${timestamp} - Test Listing`;
}
