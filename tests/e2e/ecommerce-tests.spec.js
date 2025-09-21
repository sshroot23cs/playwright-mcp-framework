import { test, expect } from '@playwright/test';

/**
 * E-commerce Website Test Suite
 * Tests for shopping cart, product browsing, and checkout flows
 */

test.describe('E-commerce Tests', () => {
  test('Amazon Product Search and Details', async ({ page }) => {
    await page.goto('https://www.amazon.com/');
    await page.waitForLoadState('networkidle');
    
    // Handle potential location/cookie popups
    const acceptButton = page.locator('input[aria-label*="Accept"], button:has-text("Accept"), #sp-cc-accept');
    if (await acceptButton.count() > 0) {
      await acceptButton.first().click();
    }
    
    // Search for a product
    const searchBox = page.locator('#twotabsearchtextbox, input[placeholder*="Search"]').first();
    await expect(searchBox).toBeVisible();
    
    await searchBox.fill('wireless bluetooth headphones');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Verify search results page
    const resultsContainer = page.locator('[data-component-type="s-search-result"]').first();
    await expect(resultsContainer).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of search results
    await page.screenshot({ 
      path: 'reports/screenshots/amazon-search-results.png',
      fullPage: true 
    });
    
    // Click on first product
    const firstProduct = page.locator('[data-component-type="s-search-result"] h2 a').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    
    // Verify product details page
    const productTitle = page.locator('#productTitle, h1');
    await expect(productTitle).toBeVisible();
    
    const priceElement = page.locator('.a-price-whole, .a-offscreen, [class*="price"]').first();
    if (await priceElement.count() > 0) {
      const price = await priceElement.textContent();
      console.log(`Product price: ${price}`);
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/amazon-product-details.png',
      fullPage: true 
    });
  });

  test('eBay Auction Listings', async ({ page }) => {
    await page.goto('https://www.ebay.com/');
    await page.waitForLoadState('networkidle');
    
    // Search for auction items
    const searchBox = page.locator('#gh-ac, input[placeholder*="Search"]').first();
    await searchBox.fill('vintage camera');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Filter for auction items
    const auctionFilter = page.locator('text="Auction", input[value*="auction"]');
    if (await auctionFilter.count() > 0) {
      await auctionFilter.first().click();
      await page.waitForLoadState('networkidle');
    }
    
    // Verify auction listings
    const listings = page.locator('.s-item');
    const listingCount = await listings.count();
    expect(listingCount).toBeGreaterThan(0);
    
    console.log(`Found ${listingCount} auction listings`);
    
    await page.screenshot({ 
      path: 'reports/screenshots/ebay-auction-listings.png',
      fullPage: true 
    });
    
    // Check first listing details
    if (listingCount > 0) {
      const firstListing = listings.first();
      const title = await firstListing.locator('.s-item__title').textContent();
      console.log(`First auction: ${title}`);
    }
  });

  test('Shopping Cart Functionality', async ({ page }) => {
    // Using a demo e-commerce site for cart testing
    await page.goto('https://demo.opencart.com/');
    await page.waitForLoadState('networkidle');
    
    // Browse to a product category
    const laptopsCategory = page.locator('text="Laptops & Notebooks"').first();
    if (await laptopsCategory.count() > 0) {
      await laptopsCategory.hover();
      
      const showAllLaptops = page.locator('text="Show All Laptops & Notebooks"');
      if (await showAllLaptops.count() > 0) {
        await showAllLaptops.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Add a product to cart
    const addToCartButtons = page.locator('button:has-text("Add to Cart")');
    if (await addToCartButtons.count() > 0) {
      await addToCartButtons.first().click();
      
      // Wait for success message or cart update
      await page.waitForTimeout(2000);
      
      // Check cart
      const cartButton = page.locator('#cart, .cart, button:has-text("Cart")').first();
      if (await cartButton.count() > 0) {
        await cartButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'reports/screenshots/shopping-cart.png' 
        });
      }
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/opencart-demo.png',
      fullPage: true 
    });
  });

  test('Product Comparison Feature', async ({ page }) => {
    await page.goto('https://demo.opencart.com/');
    await page.waitForLoadState('networkidle');
    
    // Look for compare buttons
    const compareButtons = page.locator('button[title*="Compare"], button:has-text("Compare")');
    const compareCount = await compareButtons.count();
    
    if (compareCount >= 2) {
      // Add multiple products to comparison
      await compareButtons.nth(0).click();
      await page.waitForTimeout(1000);
      await compareButtons.nth(1).click();
      await page.waitForTimeout(1000);
      
      // Navigate to comparison page
      const compareLink = page.locator('a:has-text("product comparison"), a[href*="compare"]');
      if (await compareLink.count() > 0) {
        await compareLink.first().click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: 'reports/screenshots/product-comparison.png',
          fullPage: true 
        });
      }
    } else {
      console.log('Product comparison feature not available or insufficient products');
    }
  });

  test('User Account Registration Flow', async ({ page }) => {
    await page.goto('https://demo.opencart.com/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to register page
    const myAccountDropdown = page.locator('text="My Account"').first();
    if (await myAccountDropdown.count() > 0) {
      await myAccountDropdown.click();
      
      const registerLink = page.locator('text="Register"');
      if (await registerLink.count() > 0) {
        await registerLink.click();
        await page.waitForLoadState('networkidle');
        
        // Fill registration form with test data
        await page.fill('#input-firstname', 'Test');
        await page.fill('#input-lastname', 'User');
        await page.fill('#input-email', `test${Date.now()}@example.com`);
        await page.fill('#input-telephone', '1234567890');
        await page.fill('#input-password', 'TestPassword123');
        await page.fill('#input-confirm', 'TestPassword123');
        
        // Accept privacy policy
        const privacyCheckbox = page.locator('input[name="agree"]');
        if (await privacyCheckbox.count() > 0) {
          await privacyCheckbox.check();
        }
        
        await page.screenshot({ 
          path: 'reports/screenshots/registration-form.png',
          fullPage: true 
        });
        
        // Note: Not submitting to avoid creating actual accounts
        console.log('Registration form filled successfully (not submitted)');
      }
    }
  });

  test('Wishlist Functionality', async ({ page }) => {
    await page.goto('https://demo.opencart.com/');
    await page.waitForLoadState('networkidle');
    
    // Look for wishlist buttons
    const wishlistButtons = page.locator('button[title*="Wish List"], button:has-text("♡")');
    
    if (await wishlistButtons.count() > 0) {
      await wishlistButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Check if login is required
      const loginForm = page.locator('form[action*="login"]');
      if (await loginForm.count() > 0) {
        console.log('Login required for wishlist functionality');
        await page.screenshot({ 
          path: 'reports/screenshots/wishlist-login-required.png' 
        });
      } else {
        // Navigate to wishlist
        const wishlistLink = page.locator('a:has-text("Wish List"), a[href*="wishlist"]');
        if (await wishlistLink.count() > 0) {
          await wishlistLink.first().click();
          await page.waitForLoadState('networkidle');
          
          await page.screenshot({ 
            path: 'reports/screenshots/wishlist-page.png',
            fullPage: true 
          });
        }
      }
    } else {
      console.log('Wishlist feature not found on current page');
    }
  });
});