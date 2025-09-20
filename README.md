# 🎭 Playwright MCP Framework

## Overview
An advanced UI automation framework built with Playwright and Model Context Protocol (MCP) server integration for enhanced testing capabilities, real-time browser automation, and intelligent test orchestration.

## 🚀 Features

### 🎯 Core Capabilities
- **MCP Server Integration**: Real-time browser automation through MCP protocol
- **Multi-Browser Support**: Chromium, Firefox, and WebKit testing
- **Advanced Screenshots**: Full-page and element-specific captures
- **Network Monitoring**: Request/response tracking and performance analysis
- **Visual Testing**: Screenshot comparison and visual regression detection
- **Smart Selectors**: AI-powered element detection and interaction

### 🤖 MCP Integration Features
- **Real-time Browser Control**: Direct browser manipulation through MCP commands
- **Live Testing**: Interactive test development and debugging
- **Dynamic Test Generation**: AI-assisted test case creation
- **Intelligent Element Detection**: Smart locator strategies
- **Performance Monitoring**: Real-time metrics and bottleneck detection

## 🏗️ Project Structure
```
playwright-mcp-framework/
├── src/
│   ├── pages/              # Page Object Model classes
│   ├── utils/              # Utility functions and helpers
│   ├── config/             # Configuration files
│   └── mcp/                # MCP integration modules
├── tests/
│   ├── e2e/               # End-to-end test suites
│   ├── visual/            # Visual regression tests
│   ├── performance/       # Performance testing
│   └── mcp/               # MCP-powered tests
├── reports/
│   ├── screenshots/       # Test screenshots
│   ├── videos/           # Test recordings
│   └── allure-results/   # Allure test reports
├── docs/                  # Documentation
└── docker/               # Docker configurations
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Docker (optional)

### Setup
```bash
# Clone repository
git clone https://github.com/sshroot23cs/playwright-mcp-framework.git
cd playwright-mcp-framework

# Install dependencies
npm install
pip install -r requirements.txt

# Install Playwright browsers
npx playwright install

# Setup MCP server
npm run setup-mcp
```

## 🎯 Quick Start

### Basic Usage
```bash
# Run all tests
npm test

# Run with MCP integration
npm run test:mcp

# Run specific test suite
npm run test:e2e
npm run test:visual
npm run test:performance
```

### MCP Interactive Mode
```bash
# Start MCP server for real-time testing
npm run mcp:start

# Connect to browser for live automation
npm run mcp:connect
```

## 🧪 Test Examples

### MCP-Powered E2E Test
```javascript
// Real-time browser control through MCP
await mcpBrowser.navigate('https://example.com');
await mcpBrowser.takeScreenshot('homepage');
await mcpBrowser.fillForm({
  'search': 'playwright testing',
  'submit': true
});
```

### Visual Regression Test
```javascript
// AI-powered visual comparison
await visualTest.compareScreen({
  name: 'homepage',
  threshold: 0.95,
  aiAnalysis: true
});
```

## 📊 Reporting
- **Allure Reports**: Comprehensive test reporting with screenshots
- **Performance Metrics**: Response times, network analysis
- **Visual Comparisons**: Before/after screenshots with diff highlights
- **MCP Logs**: Real-time automation command history

## 🔧 Configuration
Framework supports multiple configuration levels:
- Environment-specific configs
- Browser-specific settings
- MCP server configurations
- CI/CD pipeline integration

## 🚢 Deployment
```bash
# Docker deployment
docker-compose up -d

# CI/CD integration
npm run ci:test

# Cloud deployment (Azure/AWS)
npm run deploy:cloud
```

## 🤝 Contributing
1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure MCP integration works
5. Submit pull request

## 📝 License
MIT License - see LICENSE file for details

---

**Repository**: https://github.com/sshroot23cs/playwright-mcp-framework  
**Created**: September 2025  
**Maintainer**: Sushrut Holey (@sshroot23cs)