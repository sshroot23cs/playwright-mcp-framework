import { test, expect } from '@playwright/test';

/**
 * API Integration Test Suite
 * Tests for API endpoints, data validation, and backend integration
 */

test.describe('API Integration Tests', () => {
  test('REST API GET Requests', async ({ request }) => {
    // Test public REST API
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('body');
    expect(data).toHaveProperty('userId');
    
    console.log('GET Response:', data);
  });

  test('REST API POST Requests', async ({ request }) => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post created by Playwright',
      userId: 1
    };
    
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
    expect(createdPost.body).toBe(newPost.body);
    expect(createdPost.userId).toBe(newPost.userId);
    
    console.log('POST Response:', createdPost);
  });

  test('REST API PUT Requests', async ({ request }) => {
    const updatedPost = {
      id: 1,
      title: 'Updated Test Post',
      body: 'This post has been updated',
      userId: 1
    };
    
    const response = await request.put('https://jsonplaceholder.typicode.com/posts/1', {
      data: updatedPost
    });
    
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.title).toBe(updatedPost.title);
    expect(responseData.body).toBe(updatedPost.body);
    
    console.log('PUT Response:', responseData);
  });

  test('REST API DELETE Requests', async ({ request }) => {
    const response = await request.delete('https://jsonplaceholder.typicode.com/posts/1');
    
    expect(response.status()).toBe(200);
    
    console.log('DELETE successful');
  });

  test('API Error Handling', async ({ request }) => {
    // Test 404 error
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/999999');
    expect(response.status()).toBe(404);
    
    // Test invalid endpoint
    const invalidResponse = await request.get('https://jsonplaceholder.typicode.com/invalid-endpoint');
    expect(invalidResponse.status()).toBe(404);
    
    console.log('Error handling tests passed');
  });

  test('API Response Time Performance', async ({ request }) => {
    const endpoints = [
      'https://jsonplaceholder.typicode.com/posts',
      'https://jsonplaceholder.typicode.com/users',
      'https://jsonplaceholder.typicode.com/comments'
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
      
      console.log(`${endpoint} response time: ${responseTime}ms`);
    }
  });

  test('API Authentication Simulation', async ({ request }) => {
    // Using httpbin.org for auth testing
    const response = await request.get('https://httpbin.org/basic-auth/user/pass', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('user:pass').toString('base64')
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.authenticated).toBe(true);
    expect(data.user).toBe('user');
    
    console.log('Authentication test:', data);
  });

  test('API Rate Limiting Test', async ({ request }) => {
    const responses = [];
    const requestCount = 10;
    
    // Make multiple rapid requests
    for (let i = 0; i < requestCount; i++) {
      try {
        const response = await request.get('https://jsonplaceholder.typicode.com/posts');
        responses.push({
          status: response.status(),
          index: i,
          headers: Object.fromEntries(response.headers())
        });
      } catch (error) {
        responses.push({
          error: error.message,
          index: i
        });
      }
    }
    
    // Analyze responses for rate limiting patterns
    const successfulRequests = responses.filter(r => r.status === 200).length;
    const rateLimitedRequests = responses.filter(r => r.status === 429).length;
    
    console.log(`Rate limiting test: ${successfulRequests} successful, ${rateLimitedRequests} rate limited`);
    
    // Most requests should succeed (jsonplaceholder is lenient)
    expect(successfulRequests).toBeGreaterThan(5);
  });

  test('GraphQL API Query', async ({ request }) => {
    // Using a public GraphQL API
    const query = `
      query {
        countries {
          code
          name
          capital
        }
      }
    `;
    
    const response = await request.post('https://countries.trevorblades.com/', {
      data: { query }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('countries');
    expect(Array.isArray(data.data.countries)).toBe(true);
    expect(data.data.countries.length).toBeGreaterThan(0);
    
    // Check first country structure
    const firstCountry = data.data.countries[0];
    expect(firstCountry).toHaveProperty('code');
    expect(firstCountry).toHaveProperty('name');
    
    console.log(`GraphQL API returned ${data.data.countries.length} countries`);
  });

  test('WebSocket Connection Simulation', async ({ page }) => {
    // Navigate to a WebSocket test page
    await page.goto('https://websocketking.com/');
    await page.waitForLoadState('networkidle');
    
    // Connect to WebSocket
    const connectButton = page.locator('button:has-text("Connect")').first();
    if (await connectButton.count() > 0) {
      await connectButton.click();
      await page.waitForTimeout(2000);
      
      // Send a test message
      const messageInput = page.locator('input[placeholder*="message"], #message');
      if (await messageInput.count() > 0) {
        await messageInput.fill('Test message from Playwright');
        
        const sendButton = page.locator('button:has-text("Send")');
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(1000);
          
          // Check for message in log
          const messageLog = page.locator('.message-log, .log, [class*="message"]');
          if (await messageLog.count() > 0) {
            const logText = await messageLog.textContent();
            console.log('WebSocket message log:', logText);
          }
        }
      }
      
      await page.screenshot({ 
        path: 'reports/screenshots/websocket-test.png',
        fullPage: true 
      });
    } else {
      console.log('WebSocket test interface not found');
    }
  });

  test('CORS Handling Test', async ({ request }) => {
    // Test CORS-enabled endpoint
    const response = await request.get('https://httpbin.org/headers', {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const headers = response.headers();
    console.log('CORS headers received:', {
      'access-control-allow-origin': headers['access-control-allow-origin'],
      'access-control-allow-methods': headers['access-control-allow-methods']
    });
    
    const data = await response.json();
    expect(data).toHaveProperty('headers');
  });

  test('API Data Validation and Schema', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/users');
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    
    // Validate user schema
    const user = users[0];
    const requiredFields = ['id', 'name', 'username', 'email', 'address', 'phone', 'website', 'company'];
    
    requiredFields.forEach(field => {
      expect(user).toHaveProperty(field);
    });
    
    // Validate nested objects
    expect(user.address).toHaveProperty('street');
    expect(user.address).toHaveProperty('city');
    expect(user.address).toHaveProperty('zipcode');
    expect(user.address.geo).toHaveProperty('lat');
    expect(user.address.geo).toHaveProperty('lng');
    
    expect(user.company).toHaveProperty('name');
    expect(user.company).toHaveProperty('catchPhrase');
    expect(user.company).toHaveProperty('bs');
    
    // Validate data types
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(user.email)).toBe(true);
    
    console.log('User schema validation passed for:', user.name);
  });

  test('API Pagination Handling', async ({ request }) => {
    // Test pagination with limit and offset
    const limit = 5;
    const responses = [];
    
    for (let page = 1; page <= 3; page++) {
      const response = await request.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`);
      expect(response.status()).toBe(200);
      
      const posts = await response.json();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeLessThanOrEqual(limit);
      
      responses.push({
        page,
        count: posts.length,
        firstId: posts[0]?.id,
        lastId: posts[posts.length - 1]?.id
      });
    }
    
    console.log('Pagination test results:', responses);
    
    // Verify no duplicate IDs across pages
    const allIds = responses.flatMap(r => 
      Array.from({ length: r.count }, (_, i) => r.firstId + i)
    );
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});