#!/usr/bin/env node

/**
 * Environment Switching Script for PsyPsy CMS
 *
 * Usage:
 *   npm run switch:dev    # Switch to development (emulators)
 *   npm run switch:prod   # Switch to production (live Firebase)
 *   npm run switch:status # Show current environment status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_FILE = path.join(__dirname, '..', '.env.example');

// Environment configurations
const ENVIRONMENTS = {
  development: {
    name: 'Development (Emulators)',
    description: 'Uses local Firebase emulators for development',
    icon: '🔧',
    variables: {
      'VITE_USE_FIREBASE_EMULATOR': 'true',
      'FIREBASE_USE_EMULATOR': 'true',
      'VITE_FIREBASE_PROJECT_ID': 'psypsy-dev-local'
    },
    endpoints: {
      'Functions': 'http://127.0.0.1:8780/psypsy-dev-local/us-east4',
      'Emulator UI': 'http://127.0.0.1:8782',
      'Auth': 'http://127.0.0.1:9880',
      'Firestore': 'http://127.0.0.1:9881'
    }
  },
  production: {
    name: 'Production (Live Firebase)',
    description: 'Uses live Firebase services',
    icon: '🏭',
    variables: {
      'VITE_USE_FIREBASE_EMULATOR': 'false',
      'FIREBASE_USE_EMULATOR': 'false'
      // Note: VITE_FIREBASE_PROJECT_ID should be set to your actual project ID
    },
    endpoints: {
      'Functions': 'https://us-east4-{PROJECT_ID}.cloudfunctions.net',
      'Console': 'https://console.firebase.google.com',
      'Auth': 'Live Firebase Auth',
      'Firestore': 'Live Firestore'
    }
  }
};

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('⚠️  .env file not found. Creating from .env.example...');
    if (fs.existsSync(ENV_EXAMPLE_FILE)) {
      fs.copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
      console.log('✅ Created .env file from .env.example');
    } else {
      console.error('❌ .env.example file not found');
      process.exit(1);
    }
  }

  const content = fs.readFileSync(ENV_FILE, 'utf8');
  const lines = content.split('\n');
  const env = {};

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=');
      }
    }
  });

  return { content, env };
}

function writeEnvFile(content, updates) {
  let newContent = content;

  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `${key}=${value}`);
    } else {
      // Add the variable if it doesn't exist
      newContent += `\n${key}=${value}`;
    }
  });

  fs.writeFileSync(ENV_FILE, newContent);
}

function getCurrentEnvironment(env) {
  const useEmulator = env['VITE_USE_FIREBASE_EMULATOR'] === 'true';
  return useEmulator ? 'development' : 'production';
}

function showStatus() {
  const { env } = readEnvFile();
  const currentEnv = getCurrentEnvironment(env);
  const config = ENVIRONMENTS[currentEnv];

  console.log('\n🔍 Current Environment Status\n');
  console.log(`${config.icon} Environment: ${config.name}`);
  console.log(`📝 Description: ${config.description}\n`);

  console.log('🔧 Configuration:');
  Object.entries(config.variables).forEach(([key, value]) => {
    const actual = env[key] || 'not set';
    const status = actual === value ? '✅' : '⚠️';
    console.log(`  ${status} ${key}=${actual}`);
  });

  console.log('\n🌐 Endpoints:');
  Object.entries(config.endpoints).forEach(([name, url]) => {
    console.log(`  • ${name}: ${url}`);
  });

  if (currentEnv === 'production') {
    const projectId = env['VITE_FIREBASE_PROJECT_ID'];
    if (!projectId || projectId === 'your-project-id' || projectId === 'psypsy-dev-local') {
      console.log('\n⚠️  Warning: Production mode requires a valid VITE_FIREBASE_PROJECT_ID');
      console.log('   Please update your .env file with your actual Firebase project ID');
    }
  }

  console.log('\n💡 To switch environments:');
  console.log('   npm run switch:dev   # Switch to development');
  console.log('   npm run switch:prod  # Switch to production');
}

function switchEnvironment(targetEnv) {
  if (!ENVIRONMENTS[targetEnv]) {
    console.error(`❌ Invalid environment: ${targetEnv}`);
    console.log('Available environments: development, production');
    process.exit(1);
  }

  const { content, env } = readEnvFile();
  const currentEnv = getCurrentEnvironment(env);
  const config = ENVIRONMENTS[targetEnv];

  if (currentEnv === targetEnv) {
    console.log(`✅ Already using ${config.name}`);
    showStatus();
    return;
  }

  console.log(`\n🔄 Switching from ${ENVIRONMENTS[currentEnv].name} to ${config.name}...\n`);

  // Apply environment variables
  writeEnvFile(content, config.variables);

  console.log('✅ Environment switched successfully!\n');

  // Show warnings for production
  if (targetEnv === 'production') {
    const { env: newEnv } = readEnvFile();
    const projectId = newEnv['VITE_FIREBASE_PROJECT_ID'];

    console.log('⚠️  Production Environment Checklist:');
    console.log('   1. Ensure VITE_FIREBASE_PROJECT_ID is set to your actual project ID');
    console.log('   2. Verify all Firebase credentials are correctly configured');
    console.log('   3. Make sure your Firebase project is deployed and accessible');
    console.log('   4. Check Quebec Law 25 compliance settings are enabled\n');

    if (!projectId || projectId === 'your-project-id' || projectId === 'psypsy-dev-local') {
      console.log('🚨 ACTION REQUIRED: Update VITE_FIREBASE_PROJECT_ID in .env file');
    }
  }

  if (targetEnv === 'development') {
    console.log('💡 Development Environment Notes:');
    console.log('   1. Make sure Firebase emulators are running:');
    console.log('      firebase emulators:start');
    console.log('   2. Emulator UI available at: http://127.0.0.1:8782');
    console.log('   3. All data is local and will be reset when emulators restart\n');
  }

  showStatus();
}

// Main script logic
const command = process.argv[2];

switch (command) {
  case 'dev':
  case 'development':
    switchEnvironment('development');
    break;

  case 'prod':
  case 'production':
    switchEnvironment('production');
    break;

  case 'status':
  case undefined:
    showStatus();
    break;

  default:
    console.log('Usage:');
    console.log('  npm run switch:dev    # Switch to development');
    console.log('  npm run switch:prod   # Switch to production');
    console.log('  npm run switch:status # Show current status');
    process.exit(1);
}