#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Running SmartFyt Student Tests...\n');

try {
  // Run tests with verbose output
  const result = execSync('npx vitest run --reporter=verbose', {
    cwd: __dirname,
    stdio: 'pipe',
    encoding: 'utf8',
  });

  console.log('✅ All tests passed!');
  console.log(result);
} catch (error) {
  console.log('❌ Tests failed:');
  console.log(error.stdout || error.message);

  if (error.stderr) {
    console.log('\n🔍 Error details:');
    console.log(error.stderr);
  }
}
