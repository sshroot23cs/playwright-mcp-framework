# 🎭 Playwright MCP Framework

## Overview
An advanced UI automation framework built with Playwright, designed for comprehensive E2E testing with Model Context Protocol (MCP) integration. This framework leverages the official Playwright MCP server to provide AI-assisted testing capabilities and intelligent test automation.

## 🚀 Features

### 🎯 Core Capabilities
- **Official MCP Integration**: AI-assisted testing through official Playwright MCP server
- **Multi-Browser Support**: Chromium, Firefox, WebKit, and mobile device testing
- **Advanced Screenshots**: Full-page and element-specific captures with failure recording
- **Network Monitoring**: Request/response tracking and performance analysis
- **Visual Testing**: Screenshot comparison and responsive design validation
- **Smart Test Design**: Robust selectors and error handling strategies

### 🤖 MCP Integration Features
- **AI Assistant Integration**: Compatible with GitHub Copilot, Claude, and other AI assistants
- **Automated Test Generation**: AI-powered test case creation and maintenance
- **Intelligent Browser Control**: Direct browser automation through standardized MCP protocol
- **Real-time Debugging**: Live test development and troubleshooting support
- **Performance Insights**: Automated performance monitoring and bottleneck detection

## 🏗️ Project Structure
```
playwright-mcp-framework/
├── tests/
│   └── e2e/               # End-to-end test suites
├── reports/
│   ├── screenshots/       # Test screenshots
│   ├── videos/           # Test recordings
│   └── *.json            # Test results and reports
├── package.json           # Dependencies and scripts
├── playwright.config.js   # Playwright configuration
├── docker-compose.yml     # Docker setup
└── README.md             # Project documentation
```

**Note**: This framework uses the official Playwright MCP server (`@playwright/mcp`) configured in your AI assistant's `mcp.json` file for seamless integration.

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- AI Assistant with MCP support (GitHub Copilot, Claude, etc.)

### Setup
```bash
# Clone repository
git clone https://github.com/sshroot23cs/playwright-mcp-framework.git
cd playwright-mcp-framework

# Install dependencies and Playwright browsers
npm run setup
```

### MCP Configuration
Ensure your AI assistant has the Playwright MCP server configured in `mcp.json`:
```json
{
  "servers": {
    "playwright": {
      "type": "stdio", 
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "gallery": true,
      "version": "0.0.1"
    }
  }
}
```

## 🎯 Quick Start

### Running Tests
```bash
# Run all tests
npm test

# Run E2E tests specifically
npm run test:e2e

# Run tests with visual output
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Generate and view test reports
npm run report
```

### Available Test Suites
- **Stock Search Workflow**: Tests basic search functionality
- **Multiple Stock Searches**: Tests searching across different stocks (GOOGL, MSFT, TSLA)
- **Responsive Design**: Tests across desktop, tablet, and mobile viewports

## 🧪 Test Examples

### Standard E2E Test
```javascript
import { test, expect } from '@playwright/test';

test('Stock Search Workflow', async ({ page }) => {
  await page.goto('https://www.google.com/finance/');
  await page.waitForLoadState('networkidle');
  
  // Take homepage screenshot
  await page.screenshot({ 
    path: 'reports/screenshots/e2e-homepage.png',
    fullPage: true 
  });
  
  // Search for stock
  const searchElement = await page.locator('input[placeholder*="Search"]').first();
  await searchElement.click();
  await searchElement.fill('AAPL');
  await page.keyboard.press('Enter');
  
  // Verify results
  const title = await page.title();
  expect(title.toLowerCase()).toContain('apple');
});
```

### AI-Assisted Testing with MCP
When using AI assistants with MCP integration, you can:
- Ask for test generation based on user flows
- Get intelligent element selectors
- Receive suggestions for test improvements
- Automate test maintenance and updates

## 📊 Reporting
- **HTML Reports**: Built-in Playwright HTML reports with screenshots and videos
- **JSON Reports**: Structured test results for CI/CD integration
- **Allure Integration**: Enhanced reporting with detailed test analytics
- **Screenshot Capture**: Automatic screenshots on test failures
- **Video Recording**: Test execution recordings for debugging
- **Trace Files**: Detailed execution traces for performance analysis

## 🔧 Configuration
The framework uses `playwright.config.js` for configuration:
- **Multi-browser testing**: Chromium, Firefox, WebKit, and mobile devices
- **Parallel execution**: Optimized for CI/CD environments
- **Retry logic**: Automatic retries on failures
- **Timeouts**: Configurable action and navigation timeouts
- **Base URL**: Environment-specific URL configuration

## 🚢 Deployment & CI/CD
```bash
# CI/CD integration
npm run ci:test

# Docker deployment
docker-compose up -d

# View test reports
npm run report
```

### GitHub Actions Integration
The framework is ready for GitHub Actions with proper CI/CD configuration for automated testing across multiple browsers and environments.

## 🤖 AI Assistant Integration
This framework is optimized for use with AI assistants through the Model Context Protocol:
- **GitHub Copilot**: Enhanced code suggestions and test generation
- **Claude**: Natural language test creation and debugging
- **Other MCP-compatible tools**: Extensible AI integration

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add comprehensive tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit pull request with detailed description

## 📝 License
MIT License - see LICENSE file for details

## 🙏 Acknowledgments
- Built with [Playwright](https://playwright.dev/)
- Model Context Protocol integration
- Inspired by modern testing best practices

---

**Repository**: https://github.com/sshroot23cs/playwright-mcp-framework  
**Created**: September 2025  
**Maintainer**: Sushrut Holey (@sshroot23cs)