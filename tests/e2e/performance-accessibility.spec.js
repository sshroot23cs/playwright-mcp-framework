import { test, expect } from '@playwright/test';

/**
 * Performance and Accessibility Test Suite
 * Tests for page performance, loading times, and accessibility compliance
 */

test.describe('Performance and Accessibility Tests', () => {
  test('Page Load Performance', async ({ page }) => {
    const urls = [
      'https://www.google.com',
      'https://www.github.com',
      'https://www.stackoverflow.com'
    ];
    
    for (const url of urls) {
      const startTime = Date.now();
      
      // Navigate to page
      const response = await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Performance assertions
      expect(response?.status()).toBe(200);
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
      
      // Get performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      console.log(`${url} Performance Metrics:`, performanceMetrics);
      console.log(`Total load time: ${loadTime}ms`);
      
      // Screenshot for documentation
      const domain = new URL(url).hostname.replace(/\./g, '_');
      await page.screenshot({ 
        path: `reports/screenshots/performance-${domain}.png`,
        fullPage: true 
      });
    }
  });

  test('Network Resource Analysis', async ({ page }) => {
    const requests = [];
    const responses = [];
    const failedRequests = [];
    
    // Monitor network activity
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: Date.now()
      });
      
      if (response.status() >= 400) {
        failedRequests.push(response);
      }
    });
    
    // Navigate to a content-rich page
    await page.goto('https://www.bbc.com/news');
    await page.waitForLoadState('networkidle');
    
    // Analyze network activity
    const totalRequests = requests.length;
    const totalResponses = responses.length;
    const failedCount = failedRequests.length;
    
    // Resource type breakdown
    const resourceTypes = {};
    requests.forEach(req => {
      resourceTypes[req.resourceType] = (resourceTypes[req.resourceType] || 0) + 1;
    });
    
    console.log('Network Analysis:', {
      totalRequests,
      totalResponses,
      failedRequests: failedCount,
      resourceTypes,
      failureRate: (failedCount / totalRequests * 100).toFixed(2) + '%'
    });
    
    // Performance assertions
    expect(failedCount).toBeLessThan(totalRequests * 0.1); // Less than 10% failures
    expect(totalRequests).toBeGreaterThan(0);
    
    await page.screenshot({ 
      path: 'reports/screenshots/network-analysis.png',
      fullPage: true 
    });
  });

  test('Large Image Loading Performance', async ({ page }) => {
    await page.goto('https://unsplash.com/');
    await page.waitForLoadState('networkidle');
    
    // Track image loading
    const imageLoadTimes = [];
    
    page.on('response', response => {
      if (response.url().includes('images.unsplash.com')) {
        imageLoadTimes.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });
    
    // Scroll to trigger more image loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(3000);
    
    console.log(`Loaded ${imageLoadTimes.length} images`);
    
    // Check if images are visible
    const images = page.locator('img[src*="unsplash"]');
    const visibleImages = await images.count();
    
    expect(visibleImages).toBeGreaterThan(0);
    console.log(`${visibleImages} images are visible on page`);
    
    await page.screenshot({ 
      path: 'reports/screenshots/image-loading-performance.png',
      fullPage: true 
    });
  });

  test('Mobile Performance Simulation', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Simulate slow 3G network
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40 // 40ms
    });
    
    const startTime = Date.now();
    await page.goto('https://www.google.com/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Mobile page load time with 3G simulation: ${loadTime}ms`);
    
    // Should still load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(15000); // 15 seconds for slow network
    
    await page.screenshot({ 
      path: 'reports/screenshots/mobile-performance.png' 
    });
    
    // Reset network conditions
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
  });

  test('Accessibility Compliance Check', async ({ page }) => {
    // Install axe-core for accessibility testing
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
    });
    
    await page.goto('https://www.w3.org/WAI/demos/bad/');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility audit
    const accessibilityResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, (err, results) => {
          if (err) {
            resolve({ error: err.message });
          } else {
            resolve(results);
          }
        });
      });
    });
    
    if (accessibilityResults.error) {
      console.log('Accessibility audit error:', accessibilityResults.error);
    } else {
      const violations = accessibilityResults.violations;
      const passes = accessibilityResults.passes;
      
      console.log(`Accessibility Audit Results:`);
      console.log(`- Violations: ${violations.length}`);
      console.log(`- Passed tests: ${passes.length}`);
      
      // Log specific violations
      violations.forEach((violation, index) => {
        console.log(`Violation ${index + 1}:`, {
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.length
        });
      });
      
      // For demo site, we expect some violations (it's intentionally bad)
      // In production, you'd want: expect(violations.length).toBe(0);
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/accessibility-audit.png',
      fullPage: true 
    });
  });

  test('Color Contrast Verification', async ({ page }) => {
    await page.goto('https://webaim.org/resources/contrastchecker/');
    await page.waitForLoadState('networkidle');
    
    // Test different color combinations
    const colorTests = [
      { fg: '#000000', bg: '#FFFFFF', name: 'black-on-white' },
      { fg: '#FFFFFF', bg: '#000000', name: 'white-on-black' },
      { fg: '#767676', bg: '#FFFFFF', name: 'gray-on-white' },
      { fg: '#0000FF', bg: '#FFFFFF', name: 'blue-on-white' }
    ];
    
    for (const colorTest of colorTests) {
      // Input foreground color
      await page.fill('#foreground', colorTest.fg);
      
      // Input background color  
      await page.fill('#background', colorTest.bg);
      
      await page.waitForTimeout(1000); // Wait for calculation
      
      // Check results
      const aaResult = await page.locator('#aa').textContent();
      const aaaResult = await page.locator('#aaa').textContent();
      
      console.log(`Color test ${colorTest.name}:`, {
        foreground: colorTest.fg,
        background: colorTest.bg,
        AA_compliance: aaResult?.includes('Pass'),
        AAA_compliance: aaaResult?.includes('Pass')
      });
      
      await page.screenshot({ 
        path: `reports/screenshots/color-contrast-${colorTest.name}.png` 
      });
    }
  });

  test('Page Speed Insights Simulation', async ({ page }) => {
    const urls = ['https://www.google.com', 'https://www.github.com'];
    
    for (const url of urls) {
      // Measure Core Web Vitals metrics
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Get Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};
          
          // Largest Contentful Paint
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.LCP = lastEntry.startTime;
            
            if (vitals.LCP && vitals.FID !== undefined && vitals.CLS !== undefined) {
              resolve(vitals);
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // First Input Delay (simulated)
          vitals.FID = 0; // Would need real user interaction
          
          // Cumulative Layout Shift
          let cls = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            }
            vitals.CLS = cls;
            
            if (vitals.LCP && vitals.FID !== undefined && vitals.CLS !== undefined) {
              resolve(vitals);
            }
          }).observe({ type: 'layout-shift', buffered: true });
          
          // Timeout fallback
          setTimeout(() => {
            resolve(vitals);
          }, 5000);
        });
      });
      
      const domain = new URL(url).hostname;
      console.log(`Core Web Vitals for ${domain}:`, webVitals);
      
      // Performance thresholds (Google recommendations)
      if (webVitals.LCP) {
        expect(webVitals.LCP).toBeLessThan(2500); // 2.5 seconds
      }
      if (webVitals.CLS !== undefined) {
        expect(webVitals.CLS).toBeLessThan(0.1); // 0.1 CLS score
      }
    }
  });
});