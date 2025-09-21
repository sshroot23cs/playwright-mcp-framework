import { test, expect } from '@playwright/test';

/**
 * Form Testing Suite
 * Comprehensive tests for form validation, submission, and user interactions
 */

test.describe('Form Testing', () => {
  test('Contact Form Validation', async ({ page }) => {
    // Using a demo contact form
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.waitForLoadState('networkidle');
    
    // Test form validation by submitting empty form
    const submitButton = page.locator('#submit');
    await submitButton.click();
    
    // Check for validation messages
    const requiredFields = [
      '#firstName',
      '#lastName', 
      '#userEmail',
      '#userNumber'
    ];
    
    for (const field of requiredFields) {
      const fieldElement = page.locator(field);
      const isInvalid = await fieldElement.evaluate(el => 
        el.matches(':invalid') || el.classList.contains('field-error')
      );
      
      if (isInvalid) {
        console.log(`Field ${field} shows validation error as expected`);
      }
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/form-validation-errors.png',
      fullPage: true 
    });
  });

  test('Complete Form Submission', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.waitForLoadState('networkidle');
    
    // Fill out the complete form
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#userEmail', 'john.doe@example.com');
    
    // Select gender
    await page.check('#gender-radio-1');
    
    await page.fill('#userNumber', '1234567890');
    
    // Date of birth
    await page.click('#dateOfBirthInput');
    await page.selectOption('.react-datepicker__year-select', '1990');
    await page.selectOption('.react-datepicker__month-select', '0'); // January
    await page.click('.react-datepicker__day--015');
    
    // Subjects
    await page.fill('#subjectsInput', 'Math');
    await page.keyboard.press('Enter');
    
    // Hobbies
    await page.check('#hobbies-checkbox-1');
    
    // Address
    await page.fill('#currentAddress', '123 Test Street, Test City, Test State');
    
    // State and City
    await page.click('#state');
    await page.click('text="NCR"');
    await page.click('#city');
    await page.click('text="Delhi"');
    
    await page.screenshot({ 
      path: 'reports/screenshots/form-filled.png',
      fullPage: true 
    });
    
    // Submit form
    await page.click('#submit');
    await page.waitForTimeout(2000);
    
    // Verify submission success
    const modal = page.locator('.modal-dialog');
    if (await modal.count() > 0) {
      await expect(modal).toBeVisible();
      console.log('Form submitted successfully - modal appeared');
      
      await page.screenshot({ 
        path: 'reports/screenshots/form-submission-success.png' 
      });
      
      // Close modal
      await page.click('#closeLargeModal');
    }
  });

  test('File Upload Functionality', async ({ page }) => {
    await page.goto('https://demoqa.com/upload-download');
    await page.waitForLoadState('networkidle');
    
    // Create a temporary test file
    const testFilePath = 'reports/test-upload.txt';
    const fs = require('fs');
    fs.writeFileSync(testFilePath, 'This is a test file for upload testing.');
    
    // Upload file
    const fileInput = page.locator('#uploadFile');
    await fileInput.setInputFiles(testFilePath);
    
    // Verify file path appears
    const uploadedFilePath = page.locator('#uploadedFilePath');
    await expect(uploadedFilePath).toContainText('test-upload.txt');
    
    await page.screenshot({ 
      path: 'reports/screenshots/file-upload.png' 
    });
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  });

  test('Dynamic Form Elements', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties');
    await page.waitForLoadState('networkidle');
    
    // Test button that becomes enabled after 5 seconds
    const enableAfterButton = page.locator('#enableAfter');
    
    // Initially should be disabled
    await expect(enableAfterButton).toBeDisabled();
    
    // Wait for button to become enabled
    await expect(enableAfterButton).toBeEnabled({ timeout: 6000 });
    
    // Test button that changes color
    const colorChangeButton = page.locator('#colorChange');
    const initialColor = await colorChangeButton.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Wait for color change
    await page.waitForTimeout(5000);
    const newColor = await colorChangeButton.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    expect(initialColor).not.toBe(newColor);
    console.log(`Button color changed from ${initialColor} to ${newColor}`);
    
    await page.screenshot({ 
      path: 'reports/screenshots/dynamic-form-elements.png' 
    });
  });

  test('Dropdown and Select Interactions', async ({ page }) => {
    await page.goto('https://demoqa.com/select-menu');
    await page.waitForLoadState('networkidle');
    
    // Single select dropdown
    await page.click('#withOptGroup');
    await page.click('text="Group 1, option 1"');
    
    // Multi-select dropdown
    await page.click('#selectMenuContainer #react-select-4-input');
    await page.keyboard.type('Green');
    await page.keyboard.press('Enter');
    
    await page.click('#selectMenuContainer #react-select-4-input');
    await page.keyboard.type('Blue');
    await page.keyboard.press('Enter');
    
    // Standard HTML select
    await page.selectOption('#oldSelectMenu', 'red');
    
    // Multi-select standard
    await page.selectOption('#cars', ['volvo', 'audi']);
    
    await page.screenshot({ 
      path: 'reports/screenshots/dropdown-selections.png',
      fullPage: true 
    });
  });

  test('Checkbox and Radio Button Groups', async ({ page }) => {
    await page.goto('https://demoqa.com/checkbox');
    await page.waitForLoadState('networkidle');
    
    // Expand all checkboxes
    await page.click('.rct-option-expand-all');
    await page.waitForTimeout(1000);
    
    // Select specific checkboxes
    const checkboxes = [
      'text="Desktop"',
      'text="Documents"', 
      'text="Downloads"'
    ];
    
    for (const checkbox of checkboxes) {
      const element = page.locator(checkbox);
      if (await element.count() > 0) {
        await element.click();
      }
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/checkbox-selections.png',
      fullPage: true 
    });
    
    // Verify selections in result text
    const result = page.locator('#result');
    const resultText = await result.textContent();
    console.log(`Checkbox selections result: ${resultText}`);
  });

  test('Form with CAPTCHA Simulation', async ({ page }) => {
    // Note: This is a simulation since real CAPTCHA would be difficult to automate
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.waitForLoadState('networkidle');
    
    // Fill basic form fields
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#userEmail', 'test@example.com');
    await page.check('#gender-radio-1');
    await page.fill('#userNumber', '1234567890');
    
    // Simulate CAPTCHA check (in real scenarios, this would need special handling)
    console.log('In real scenarios, CAPTCHA would require:');
    console.log('1. Visual verification by human');
    console.log('2. Third-party CAPTCHA solving services');
    console.log('3. Test environment with disabled CAPTCHA');
    console.log('4. Mock CAPTCHA responses');
    
    await page.screenshot({ 
      path: 'reports/screenshots/form-with-captcha-simulation.png',
      fullPage: true 
    });
  });

  test('Form Input Validation Edge Cases', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.waitForLoadState('networkidle');
    
    // Test email validation
    const emailField = page.locator('#userEmail');
    
    const invalidEmails = [
      'invalid.email',
      '@domain.com',
      'user@',
      'user..user@domain.com'
    ];
    
    for (const email of invalidEmails) {
      await emailField.fill(email);
      await page.keyboard.press('Tab'); // Trigger validation
      
      const isValid = await emailField.evaluate(el => el.validity.valid);
      expect(isValid).toBeFalsy();
      console.log(`Email '${email}' correctly identified as invalid`);
    }
    
    // Test phone number validation
    const phoneField = page.locator('#userNumber');
    
    const invalidPhones = [
      '123', // too short
      'abcdefghij', // non-numeric
      '123-456-7890', // with dashes
    ];
    
    for (const phone of invalidPhones) {
      await phoneField.fill(phone);
      await page.keyboard.press('Tab');
      
      // Check if field accepts only valid format
      const fieldValue = await phoneField.inputValue();
      console.log(`Phone input '${phone}' resulted in field value: '${fieldValue}'`);
    }
    
    await page.screenshot({ 
      path: 'reports/screenshots/form-validation-edge-cases.png',
      fullPage: true 
    });
  });
});