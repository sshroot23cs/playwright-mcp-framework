# Test Suite Documentation

## Overview
This document describes the comprehensive E2E test suites available in the Playwright MCP Framework.

## Test Suites

### 1. Finance E2E Tests (`finance-e2e.spec.js`)
**Original test suite for financial data testing**
- Stock search workflows
- Multiple stock searches (GOOGL, MSFT, TSLA)
- Responsive design testing across different viewports
- Google Finance platform testing

**Run with:**
```bash
npm run test:finance
```

### 2. Search Functionality Tests (`search-functionality.spec.js`)
**Comprehensive search feature testing**
- Basic Google search functionality
- Search suggestions and autocomplete
- Voice search button availability
- Special character searches (quotes, operators)
- Image search navigation
- Search performance metrics

**Key Features:**
- Multiple selector strategies for robustness
- Performance monitoring and assertions
- Screenshot capture for visual validation
- Network request tracking

**Run with:**
```bash
npm run test:search
```

### 3. E-commerce Tests (`ecommerce-tests.spec.js`)
**Online shopping and e-commerce workflows**
- Amazon product search and details
- eBay auction listings
- Shopping cart functionality (OpenCart demo)
- Product comparison features
- User account registration flows
- Wishlist functionality

**Key Features:**
- Real e-commerce site testing
- Cart management workflows
- User registration simulation
- Product browsing and comparison

**Run with:**
```bash
npm run test:ecommerce
```

### 4. Form Testing (`form-testing.spec.js`)
**Comprehensive form validation and interaction tests**
- Contact form validation
- Complete form submission flows
- File upload functionality
- Dynamic form elements
- Dropdown and select interactions
- Checkbox and radio button groups
- CAPTCHA simulation
- Input validation edge cases

**Key Features:**
- Form validation testing
- File upload scenarios
- Dynamic element handling
- Edge case validation
- Multi-step form flows

**Run with:**
```bash
npm run test:forms
```

### 5. Performance & Accessibility Tests (`performance-accessibility.spec.js`)
**Performance monitoring and accessibility compliance**
- Page load performance measurement
- Network resource analysis
- Large image loading performance
- Mobile performance simulation
- Accessibility compliance checking (axe-core)
- Color contrast verification
- Core Web Vitals measurement

**Key Features:**
- Performance metrics collection
- Accessibility audit automation
- Mobile device simulation
- Network throttling tests
- Core Web Vitals tracking

**Run with:**
```bash
npm run test:performance
```

### 6. API Integration Tests (`api-integration.spec.js`)
**Backend API testing and integration**
- REST API CRUD operations (GET, POST, PUT, DELETE)
- API error handling
- Response time performance
- Authentication simulation
- Rate limiting tests
- GraphQL query testing
- WebSocket connection simulation
- CORS handling
- Data validation and schema testing
- API pagination handling

**Key Features:**
- Complete API testing coverage
- Performance benchmarking
- Error scenario testing
- Schema validation
- Real API integration

**Run with:**
```bash
npm run test:api
```

## Test Configuration

### Running Individual Test Suites
```bash
# Run specific test suite
npm run test:search
npm run test:ecommerce
npm run test:forms
npm run test:performance
npm run test:api
npm run test:finance

# Run all E2E tests
npm run test:e2e

# Run with specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### Advanced Test Execution
```bash
# Run tests with UI mode for debugging
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests in parallel
npm run test:parallel

# Generate and view reports
npm run report
```

## Test Data and Screenshots

All tests generate:
- **Screenshots**: Stored in `reports/screenshots/`
- **Videos**: Stored in `test-results/` (on failures)
- **Trace files**: Available for debugging
- **Performance metrics**: Logged to console and reports

## Best Practices Implemented

### 1. Robust Selectors
- Multiple selector strategies for reliability
- Fallback options for dynamic content
- Accessibility-friendly selectors

### 2. Error Handling
- Graceful degradation for missing elements
- Timeout handling
- Network error recovery

### 3. Performance Monitoring
- Response time tracking
- Resource loading analysis
- Core Web Vitals measurement

### 4. Cross-Browser Testing
- Support for Chromium, Firefox, WebKit
- Mobile device simulation
- Responsive design validation

### 5. Documentation
- Comprehensive test descriptions
- Console logging for debugging
- Screenshot capture for visual validation

## Environment Requirements

### Dependencies
- Node.js 18+
- @playwright/test
- axe-core (for accessibility tests)

### External Services
Tests use various public APIs and demo sites:
- Google (search functionality)
- Amazon/eBay (e-commerce demos)
- OpenCart demo (shopping cart)
- DemoQA (form testing)
- JSONPlaceholder (API testing)
- Countries GraphQL API
- HTTPBin (HTTP testing)

### Network Requirements
- Internet connection for external site testing
- Some tests simulate network throttling
- CORS-enabled endpoints for API testing

## Customization

### Adding New Tests
1. Create new `.spec.js` file in `tests/e2e/`
2. Follow existing naming conventions
3. Add corresponding npm script in `package.json`
4. Update this documentation

### Modifying Existing Tests
1. Update test descriptions and scenarios
2. Maintain screenshot naming conventions
3. Preserve error handling patterns
4. Update documentation as needed

## Troubleshooting

### Common Issues
1. **Network timeouts**: Increase timeout values for slow connections
2. **Element not found**: Update selectors for site changes
3. **Performance test failures**: Adjust thresholds for different environments
4. **API test failures**: Check external service availability

### Debug Tips
1. Use `npm run test:debug` for step-by-step debugging
2. Check screenshots in `reports/screenshots/`
3. Review console logs for detailed error information
4. Use `npm run test:headed` to see browser interactions

## CI/CD Integration

Tests are configured for:
- **GitHub Actions**: Use `npm run ci:test`
- **Parallel execution**: Optimized for CI environments
- **Retry logic**: Automatic retry on failures
- **Report generation**: HTML and JSON formats available