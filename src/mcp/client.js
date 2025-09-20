// MCP Client for connecting to browser automation server
const WebSocket = require('ws');

class MCPClient {
  constructor(url = 'ws://localhost:8080') {
    this.url = url;
    this.ws = null;
    this.connected = false;
    this.messageQueue = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.on('open', () => {
        console.log('🔗 Connected to MCP Server');
        this.connected = true;
        
        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.ws.send(JSON.stringify(message));
        }
        
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('📨 Received:', message);
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ MCP Connection error:', error);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log('🔌 Disconnected from MCP Server');
        this.connected = false;
      });
    });
  }

  async send(message) {
    if (this.connected) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  async navigate(url) {
    await this.send({
      type: 'navigate',
      url: url
    });
  }

  async takeScreenshot(name) {
    await this.send({
      type: 'screenshot',
      name: name
    });
  }

  async click(selector) {
    await this.send({
      type: 'click',
      selector: selector
    });
  }

  async type(selector, text) {
    await this.send({
      type: 'type',
      selector: selector,
      text: text
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Example usage if run directly
if (require.main === module) {
  (async () => {
    const client = new MCPClient();
    
    try {
      await client.connect();
      
      // Example automation commands
      await client.navigate('https://www.google.com/finance/');
      await client.takeScreenshot('homepage');
      await client.click('input[placeholder*="Search"]');
      await client.type('input[placeholder*="Search"]', 'AAPL');
      
    } catch (error) {
      console.error('❌ Client error:', error);
    }
  })();
}

module.exports = MCPClient;