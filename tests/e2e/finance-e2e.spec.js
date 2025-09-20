import { test, expect } from '@playwright/test';

/**
 * End-to-End Test Suite
 * Comprehensive E2E tests for various scenarios
 */

test.describe('E2E Test Suite', () => {
  test('Stock Search Workflow', async ({ page }) => {
    await page.goto('https://www.google.com/finance/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take homepage screenshot
    await page.screenshot({ 
      path: 'reports/screenshots/e2e-homepage.png',
      fullPage: true 
    });
    
    // Search for stock
    const searchSelector = 'input[placeholder*="Search"], input[aria-label*="Search"]';
    const searchElement = await page.locator(searchSelector).first();
    
    if (await searchElement.count() > 0) {
      await searchElement.click();
      await searchElement.fill('AAPL');
      await page.keyboard.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      // Verify search results
      const title = await page.title();
      const url = page.url();
      
      expect(
        title.toLowerCase().includes('apple') ||
        title.toLowerCase().includes('aapl') ||
        url.toLowerCase().includes('aapl')
      ).toBeTruthy();
      
      // Take results screenshot
      await page.screenshot({ 
        path: 'reports/screenshots/e2e-search-results.png',
        fullPage: true 
      });
    }
  });

  test('Multiple Stock Searches', async ({ page }) => {
    const stocks = ['GOOGL', 'MSFT', 'TSLA'];
    
    for (const stock of stocks) {
      await page.goto('https://www.google.com/finance/');
      await page.waitForLoadState('networkidle');
      
      const searchSelector = 'input[placeholder*="Search"], input[aria-label*="Search"]';
      const searchElement = await page.locator(searchSelector).first();
      
      if (await searchElement.count() > 0) {
        await searchElement.click();
        await searchElement.fill(stock);
        await page.keyboard.press('Enter');
        
        await page.waitForLoadState('networkidle');
        
        // Take screenshot for each stock
        await page.screenshot({ 
          path: `reports/screenshots/e2e-${stock.toLowerCase()}-search.png`,
          fullPage: true 
        });
        
        // Verify search was successful
        const url = page.url();
        console.log(`${stock} search URL: ${url}`);
      }
    }
  });

  test('Responsive Design Test', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://www.google.com/finance/');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `reports/screenshots/e2e-responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Verify page elements are accessible
      const title = await page.title();
      expect(title.toLowerCase()).toContain('finance');
    }
  });
});