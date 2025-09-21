import { test, expect } from '@playwright/test';

/**
 * Search Functionality Test Suite
 * Comprehensive tests for search features across different platforms
 */

test.describe('Search Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
    await page.goto('https://www.google.com/');
    await page.waitForLoadState('networkidle');
  });

  test('Basic Google Search', async ({ page }) => {
    const searchTerm = 'Playwright testing framework';
    
    // Find search input with multiple selector strategies
    const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
    await expect(searchInput).toBeVisible();
    
    // Perform search
    await searchInput.fill(searchTerm);
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Verify search results
    await expect(page).toHaveTitle(/Playwright testing framework/i);
    
    // Check that results are displayed
    const resultsContainer = page.locator('#search, #rso');
    await expect(resultsContainer).toBeVisible();
    
    // Take screenshot of results
    await page.screenshot({ 
      path: 'reports/screenshots/google-search-results.png',
      fullPage: true 
    });
  });

  test('Search Suggestions', async ({ page }) => {
    const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
    
    // Type partial search term
    await searchInput.fill('playwright');
    
    // Wait for suggestions to appear
    const suggestions = page.locator('[role="listbox"] [role="option"]');
    await expect(suggestions.first()).toBeVisible({ timeout: 5000 });
    
    // Verify multiple suggestions are present
    const suggestionCount = await suggestions.count();
    expect(suggestionCount).toBeGreaterThan(0);
    
    // Take screenshot of suggestions
    await page.screenshot({ 
      path: 'reports/screenshots/search-suggestions.png' 
    });
    
    // Click first suggestion
    await suggestions.first().click();
    await page.waitForLoadState('networkidle');
    
    // Verify navigation to results
    const url = page.url();
    expect(url).toContain('search?q=');
  });

  test('Voice Search Button Availability', async ({ page }) => {
    // Check if voice search button exists
    const voiceButton = page.locator('[aria-label*="voice"], [title*="voice"]');
    
    if (await voiceButton.count() > 0) {
      await expect(voiceButton.first()).toBeVisible();
      console.log('Voice search button is available');
    } else {
      console.log('Voice search button not found - may be device/browser specific');
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/voice-search-check.png' 
    });
  });

  test('Search with Special Characters', async ({ page }) => {
    const specialSearchTerms = [
      'C++ programming',
      '"exact phrase search"',
      'site:github.com playwright',
      'filetype:pdf testing'
    ];
    
    for (const term of specialSearchTerms) {
      await page.goto('https://www.google.com/');
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchInput.fill(term);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Verify search was processed
      const url = page.url();
      expect(url).toContain('search?q=');
      
      // Take screenshot for each special search
      const safeTerm = term.replace(/[^a-zA-Z0-9]/g, '_');
      await page.screenshot({ 
        path: `reports/screenshots/special-search-${safeTerm}.png` 
      });
    }
  });

  test('Image Search Navigation', async ({ page }) => {
    const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
    await searchInput.fill('playwright logo');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Images tab
    const imagesTab = page.locator('a[href*="tbm=isch"], text="Images"').first();
    
    if (await imagesTab.count() > 0) {
      await imagesTab.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on images search
      const url = page.url();
      expect(url).toContain('tbm=isch');
      
      // Check for image results
      const imageResults = page.locator('img[data-src], img[src*="gstatic"]');
      await expect(imageResults.first()).toBeVisible({ timeout: 10000 });
      
      await page.screenshot({ 
        path: 'reports/screenshots/image-search-results.png',
        fullPage: true 
      });
    } else {
      console.log('Images tab not found - layout may have changed');
    }
  });

  test('Search Performance Metrics', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    const startTime = Date.now();
    
    // Perform search
    const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
    await searchInput.fill('performance testing');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const searchDuration = endTime - startTime;
    
    // Performance assertions
    expect(searchDuration).toBeLessThan(10000); // Should complete within 10 seconds
    expect(requests.length).toBeGreaterThan(0);
    
    console.log(`Search completed in ${searchDuration}ms with ${requests.length} requests`);
    
    // Check for performance indicators
    const resultsInfo = page.locator('div[id="result-stats"]');
    if (await resultsInfo.count() > 0) {
      const statsText = await resultsInfo.textContent();
      console.log(`Search stats: ${statsText}`);
    }
  });
});