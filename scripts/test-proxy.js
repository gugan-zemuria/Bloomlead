#!/usr/bin/env node

/**
 * Proxy Test Script
 * Tests the proxy configuration with different backend scenarios
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 BloomLead Proxy Test Suite');
console.log('==============================\n');

// Test scenarios
const scenarios = [
  {
    name: 'Mock API Mode',
    env: { MOCK_API: 'true' },
    description: 'Tests with mock API endpoints enabled'
  },
  {
    name: 'Local Backend',
    env: { API_URL: 'http://localhost:8000' },
    description: 'Tests with local backend server'
  },
  {
    name: 'Remote Backend',
    env: { API_URL: 'https://jsonplaceholder.typicode.com' },
    description: 'Tests with remote backend server'
  }
];

async function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BloomLead-Proxy-Test'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // Truncate for display
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing proxy endpoints...\n');

  const testEndpoints = [
    { url: 'http://localhost:3000/api/config', name: 'Config API' },
    { url: 'http://localhost:3000/api/users', name: 'Users API' },
    { url: 'http://localhost:3000/auth/login', name: 'Auth Login', method: 'POST' },
    { url: 'http://localhost:3000/health', name: 'Health Check' }
  ];

  for (const endpoint of testEndpoints) {
    console.log(`Testing ${endpoint.name}...`);
    const result = await testEndpoint(endpoint.url, endpoint.method);
    
    if (result.status === 'ERROR') {
      console.log(`  ❌ ${result.error}`);
    } else {
      console.log(`  ✅ Status: ${result.status}`);
      if (result.data) {
        console.log(`  📄 Response: ${result.data}...`);
      }
    }
    console.log('');
  }
}

function startDevServer(env = {}) {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server...');
    
    const serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, ...env },
      stdio: 'pipe'
    });

    let serverReady = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (output.includes('webpack compiled') || output.includes('Local:')) {
        if (!serverReady) {
          serverReady = true;
          setTimeout(() => resolve(serverProcess), 2000); // Wait 2s for server to be fully ready
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
      if (code !== 0 && !serverReady) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        serverProcess.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
  });
}

async function runScenario(scenario) {
  console.log(`\n🎯 Running Scenario: ${scenario.name}`);
  console.log(`📝 ${scenario.description}`);
  console.log('─'.repeat(50));

  try {
    const serverProcess = await startDevServer(scenario.env);
    
    // Run tests
    await runTests();
    
    // Stop server
    console.log('🛑 Stopping development server...');
    serverProcess.kill();
    
    // Wait for server to stop
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error(`❌ Scenario failed: ${error.message}`);
  }
}

async function main() {
  // Check if npm is available
  try {
    await new Promise((resolve, reject) => {
      const npmCheck = spawn('npm', ['--version'], { stdio: 'pipe' });
      npmCheck.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('npm not found'));
      });
    });
  } catch (error) {
    console.error('❌ npm is required to run this test');
    process.exit(1);
  }

  // Check if dependencies are installed
  const fs = require('fs');
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    await new Promise((resolve, reject) => {
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      install.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('npm install failed'));
      });
    });
  }

  // Run test scenarios
  for (const scenario of scenarios) {
    await runScenario(scenario);
  }

  console.log('\n🎉 Proxy testing complete!');
  console.log('\n📚 For more information, see docs/PROXY-SETUP.md');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test interrupted by user');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testEndpoint, runTests };