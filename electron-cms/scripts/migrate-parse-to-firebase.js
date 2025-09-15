#!/usr/bin/env node

/**
 * Parse to Firebase Migration Script
 * 
 * Command line script to migrate data from Parse Server to Firebase
 * Usage: node scripts/migrate-parse-to-firebase.js [options]
 */

const Parse = require('parse/node');
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

// Migration utility
const { ParseToFirebaseMigration } = require('../src/utils/parseToFirebaseMigration');

// Configuration
const PARSE_CONFIG = {
  SERVER_URL: process.env.REACT_APP_PARSE_SERVER_URL || 'http://localhost:1337/parse',
  APP_ID: process.env.REACT_APP_PARSE_APP_ID || 'PsyPsyAppId',
  JAVASCRIPT_KEY: process.env.REACT_APP_PARSE_JAVASCRIPT_KEY || 'PsyPsyJSKey'
};

const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    users: true,
    appointments: true,
    batchSize: 50,
    userType: null,
    skipExisting: true,
    useEmulator: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-users':
        options.users = false;
        break;
      case '--no-appointments':
        options.appointments = false;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 50;
        break;
      case '--user-type':
        options.userType = parseInt(args[++i]);
        break;
      case '--no-skip-existing':
        options.skipExisting = false;
        break;
      case '--use-emulator':
        options.useEmulator = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        console.warn(`Unknown option: ${arg}`);
        break;
    }
  }

  return options;
}

/**
 * Print help information
 */
function printHelp() {
  console.log(`
Parse to Firebase Migration Script

Usage: node scripts/migrate-parse-to-firebase.js [options]

Options:
  --dry-run              Show what would be migrated without actually doing it
  --no-users            Skip user migration
  --no-appointments     Skip appointment migration
  --batch-size <n>      Number of records to process per batch (default: 50)
  --user-type <n>       Migrate only specific user type (1=admin, 2=client, 3=professional)
  --no-skip-existing    Overwrite existing records instead of skipping them
  --use-emulator        Use Firebase emulator instead of production
  --verbose             Enable verbose logging
  --help                Show this help message

Environment Variables:
  REACT_APP_PARSE_SERVER_URL          Parse Server URL
  REACT_APP_PARSE_APP_ID             Parse Application ID
  REACT_APP_PARSE_JAVASCRIPT_KEY     Parse JavaScript Key
  REACT_APP_FIREBASE_API_KEY         Firebase API Key
  REACT_APP_FIREBASE_AUTH_DOMAIN     Firebase Auth Domain
  REACT_APP_FIREBASE_PROJECT_ID      Firebase Project ID
  REACT_APP_FIREBASE_STORAGE_BUCKET  Firebase Storage Bucket
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID  Firebase Messaging Sender ID
  REACT_APP_FIREBASE_APP_ID          Firebase App ID

Examples:
  node scripts/migrate-parse-to-firebase.js
  node scripts/migrate-parse-to-firebase.js --dry-run --verbose
  node scripts/migrate-parse-to-firebase.js --user-type 3 --batch-size 25
  node scripts/migrate-parse-to-firebase.js --use-emulator --no-skip-existing
  `);
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN', 
    'REACT_APP_FIREBASE_PROJECT_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(key => console.error(`  ${key}`));
    console.error('');
    console.error('Please set these variables in your .env file or environment');
    process.exit(1);
  }
}

/**
 * Initialize Parse SDK
 */
function initializeParse() {
  Parse.initialize(PARSE_CONFIG.APP_ID, PARSE_CONFIG.JAVASCRIPT_KEY);
  Parse.serverURL = PARSE_CONFIG.SERVER_URL;
  console.log(`Connected to Parse Server: ${PARSE_CONFIG.SERVER_URL}`);
}

/**
 * Initialize Firebase SDK
 */
function initializeFirebase(useEmulator = false) {
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (useEmulator) {
    console.log('Connecting to Firebase emulators...');
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
  }

  console.log(`Connected to Firebase Project: ${FIREBASE_CONFIG.projectId}`);
  return { app, auth, db };
}

/**
 * Preview migration (dry run)
 */
async function previewMigration(options) {
  console.log('=== MIGRATION PREVIEW (DRY RUN) ===');
  console.log(`Options: ${JSON.stringify(options, null, 2)}`);
  
  try {
    // Count Parse records
    const userQuery = new Parse.Query(Parse.User);
    if (options.userType) {
      userQuery.equalTo('userType', options.userType);
    }
    
    const userCount = await userQuery.count();
    const appointmentCount = await new Parse.Query('Appointment').count();

    console.log('\nRecords to migrate:');
    console.log(`  Users: ${userCount} ${options.userType ? `(type ${options.userType} only)` : ''}`);
    console.log(`  Appointments: ${appointmentCount}`);
    console.log(`  Batch size: ${options.batchSize}`);
    console.log(`  Estimated batches: ${Math.ceil((userCount + appointmentCount) / options.batchSize)}`);
    
    console.log('\nMigration would proceed with these settings.');
    console.log('Run without --dry-run to perform actual migration.');

  } catch (error) {
    console.error('Preview failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run the actual migration
 */
async function runMigration(options) {
  console.log('=== STARTING MIGRATION ===');
  
  try {
    const migration = new ParseToFirebaseMigration();
    
    const migrationOptions = {
      users: options.users ? {
        batchSize: options.batchSize,
        userType: options.userType,
        skipExisting: options.skipExisting
      } : false,
      appointments: options.appointments ? {
        batchSize: options.batchSize
      } : false
    };

    const results = await migration.runFullMigration(migrationOptions);
    
    console.log('\n=== MIGRATION COMPLETED ===');
    console.log('Results:', JSON.stringify(results, null, 2));
    
    // Generate and save report
    const report = migration.generateReport();
    const reportPath = `migration-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    if (report.errors.length > 0) {
      console.warn(`\nWarning: ${report.errors.length} errors occurred during migration`);
      console.warn('Check the report file for details');
    }

  } catch (error) {
    console.error('Migration failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArguments();
  
  console.log('Parse to Firebase Migration Tool');
  console.log('================================');
  
  // Validate environment
  validateEnvironment();
  
  // Initialize services
  initializeParse();
  initializeFirebase(options.useEmulator);
  
  if (options.dryRun) {
    await previewMigration(options);
  } else {
    await runMigration(options);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { main, parseArguments, previewMigration, runMigration };