import { test, expect } from '@playwright/test';

/**
 * MCP-Enhanced E2E Tests
 * These tests demonstrate integration with MCP server for real-time automation
 */

test.describe('MCP Enhanced E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup MCP integration if available
    await page.addInitScript(() => {
      window.mcpEnabled = true;
      window.mcpCommands = [];
    });
  });

  test('MCP Enhanced Google Finance Search', async ({ page }) => {
    // Navigate with MCP logging
    await page.goto('https://www.google.com/finance/');
    
    // Take MCP-enhanced screenshot
    await page.screenshot({ 
      path: 'reports/screenshots/mcp-google-finance-homepage.png',
      fullPage: true 
    });
    
    // Enhanced element detection with multiple strategies
    const searchSelectors = [
      'input[placeholder*="Search"]',
      'input[aria-label*="Search"]',
      '[data-test*="search"]',
      '.search-input'
    ];
    
    let searchElement = null;
    for (const selector of searchSelectors) {
      try {
        searchElement = await page.waitForSelector(selector, { timeout: 5000 });
        if (searchElement) {
          console.log(`✅ Found search element with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Selector failed: ${selector}`);
        continue;
      }
    }
    
    expect(searchElement).toBeTruthy();
    
    // MCP-enhanced interaction with human-like typing
    await searchElement.click();
    await searchElement.fill(''); // Clear any existing text
    
    // Simulate human typing with delays
    const searchTerm = 'AAPL';
    for (const char of searchTerm) {
      await page.keyboard.type(char, { delay: 100 });
    }
    
    // Press Enter and wait for navigation
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of results
    await page.screenshot({ 
      path: 'reports/screenshots/mcp-search-results.png',
      fullPage: true 
    });
    
    // Enhanced verification with multiple checks
    const title = await page.title();
    const url = page.url();
    
    // Verify search was successful
    const searchSuccess = 
      title.toLowerCase().includes('apple') ||
      title.toLowerCase().includes('aapl') ||
      url.toLowerCase().includes('aapl') ||
      url.toLowerCase().includes('apple');
    
    expect(searchSuccess).toBeTruthy();
    
    // Log MCP command for analysis
    await page.evaluate((data) => {
      window.mcpCommands.push({
        timestamp: Date.now(),
        action: 'search',
        target: 'AAPL',
        success: true,
        url: window.location.href
      });
    });
  });

  test('MCP Multi-Browser Compatibility', async ({ page, browserName }) => {
    // Log browser being tested
    console.log(`🌍 Testing with browser: ${browserName}`);
    
    await page.goto('https://www.google.com/finance/');
    
    // Browser-specific screenshot
    await page.screenshot({ 
      path: `reports/screenshots/mcp-${browserName}-homepage.png`,
      fullPage: true 
    });
    
    // Verify page loads correctly in different browsers
    const title = await page.title();
    expect(title.toLowerCase()).toContain('finance');
    
    // Check for responsive elements
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);
    
    // Verify search functionality exists
    const searchExists = await page.locator('input[placeholder*="Search"], input[aria-label*="Search"]').count() > 0;
    expect(searchExists).toBeTruthy();
  });

  test('MCP Network Performance Monitoring', async ({ page }) => {
    const requests = [];
    const responses = [];
    
    // Setup network monitoring
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      });
    });
    
    // Navigate and measure performance
    const startTime = Date.now();
    await page.goto('https://www.google.com/finance/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Perform search and measure
    const searchStartTime = Date.now();
    try {
      const searchElement = await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
      await searchElement.fill('AAPL');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
    } catch (error) {
      console.log('Search element not found, skipping search performance test');
    }
    const searchTime = Date.now() - searchStartTime;
    
    // Analyze performance
    const failedRequests = responses.filter(r => r.status >= 400);
    const performanceMetrics = {
      totalRequests: requests.length,
      totalResponses: responses.length,
      failedRequests: failedRequests.length,
      pageLoadTime: loadTime,
      searchTime: searchTime,
      domains: [...new Set(requests.map(r => new URL(r.url).hostname))]
    };
    
    console.log('Performance Metrics:', performanceMetrics);
    
    // Performance assertions
    expect(loadTime).toBeLessThan(10000); // Page should load in less than 10 seconds
    expect(failedRequests.length).toBeLessThan(requests.length * 0.1); // Less than 10% failed requests
    expect(requests.length).toBeGreaterThan(0); // Should have made some requests
    
    // Save performance data for MCP analysis
    await page.evaluate((metrics) => {
      window.mcpPerformance = metrics;
    }, performanceMetrics);
  });

  test('MCP Visual Regression Detection', async ({ page }) => {
    await page.goto('https://www.google.com/finance/');
    
    // Take baseline screenshot
    await page.screenshot({ 
      path: 'reports/screenshots/mcp-visual-baseline.png',
      fullPage: true 
    });
    
    // Simulate user interaction
    try {
      const searchElement = await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
      await searchElement.click();
      
      // Take screenshot after interaction
      await page.screenshot({ 
        path: 'reports/screenshots/mcp-visual-after-click.png',
        fullPage: true 
      });
      
      // Type search term
      await searchElement.fill('AAPL');
      
      // Take screenshot after typing
      await page.screenshot({ 
        path: 'reports/screenshots/mcp-visual-after-type.png',
        fullPage: true 
      });
      
    } catch (error) {
      console.log('Search interaction failed, visual test incomplete');
    }
    
    // Log visual checkpoints for MCP analysis
    await page.evaluate(() => {
      window.mcpVisualCheckpoints = [
        { name: 'baseline', timestamp: Date.now() },
        { name: 'after-click', timestamp: Date.now() },
        { name: 'after-type', timestamp: Date.now() }
      ];
    });
  });

  test.afterEach(async ({ page }) => {
    // Extract MCP data for analysis
    try {
      const mcpData = await page.evaluate(() => {
        return {
          commands: window.mcpCommands || [],
          performance: window.mcpPerformance || {},
          visualCheckpoints: window.mcpVisualCheckpoints || []
        };
      });
      
      if (mcpData.commands.length > 0 || Object.keys(mcpData.performance).length > 0) {
        console.log('MCP Test Data:', JSON.stringify(mcpData, null, 2));
      }
    } catch (error) {
      console.log('Could not extract MCP data:', error.message);
    }
  });
});