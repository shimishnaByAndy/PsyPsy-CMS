#!/usr/bin/env node

/**
 * Simple WebSocket test script for MCP server connection
 * Tests the connection to ws://localhost:9223 that our DevConsole uses
 */

import WebSocket from 'ws';

console.log('🔌 Testing WebSocket connection to MCP server...');
console.log('📍 Connecting to: ws://localhost:9223');

const ws = new WebSocket('ws://localhost:9223');

// Connection timeout
const timeout = setTimeout(() => {
  console.log('❌ Connection timeout - MCP server may not be running');
  ws.close();
  process.exit(1);
}, 5000);

ws.on('open', () => {
  clearTimeout(timeout);
  console.log('✅ Connected to MCP server successfully!');

  // Send a ping message like our WebSocket service does
  const pingMessage = {
    type: 'ping',
    timestamp: Date.now()
  };

  console.log('📤 Sending ping message:', JSON.stringify(pingMessage));
  ws.send(JSON.stringify(pingMessage));

  // Send a test console message like our app would
  const testConsoleMessage = {
    type: 'console',
    level: 'info',
    message: 'Test message from WebSocket connection test',
    timestamp: Date.now(),
    source: 'websocket-test'
  };

  console.log('📤 Sending test console message:', JSON.stringify(testConsoleMessage));
  ws.send(JSON.stringify(testConsoleMessage));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received message from MCP server:', JSON.stringify(message, null, 2));
  } catch (error) {
    console.log('📨 Received raw data:', data.toString());
  }
});

ws.on('error', (error) => {
  clearTimeout(timeout);
  console.log('❌ WebSocket connection error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.log('💡 Hint: Make sure the MCP server is running on port 9223');
  }
});

ws.on('close', (code, reason) => {
  clearTimeout(timeout);
  console.log(`🔌 Connection closed - Code: ${code}, Reason: ${reason.toString()}`);
  process.exit(0);
});

// Gracefully close on Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping WebSocket test...');
  clearTimeout(timeout);
  ws.close();
  process.exit(0);
});