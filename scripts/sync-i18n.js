#!/usr/bin/env node

/**
 * Script to sync i18n files from assets/i18n to public/assets/i18n
 * This ensures the XML files are accessible by the web application
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'assets', 'i18n');
const targetDir = path.join(__dirname, '..', 'public', 'assets', 'i18n');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`Copied: ${source} -> ${target}`);
  } catch (error) {
    console.error(`Error copying ${source}:`, error.message);
  }
}

function syncI18nFiles() {
  console.log('Syncing i18n files...');
  
  // Ensure target directories exist
  ensureDirectoryExists(path.join(targetDir, 'en'));
  ensureDirectoryExists(path.join(targetDir, 'fr'));
  
  // Copy English strings
  const enSource = path.join(sourceDir, 'en', 'strings.xml');
  const enTarget = path.join(targetDir, 'en', 'strings.xml');
  if (fs.existsSync(enSource)) {
    copyFile(enSource, enTarget);
  } else {
    console.warn(`Source file not found: ${enSource}`);
  }
  
  // Copy French strings
  const frSource = path.join(sourceDir, 'fr', 'strings.xml');
  const frTarget = path.join(targetDir, 'fr', 'strings.xml');
  if (fs.existsSync(frSource)) {
    copyFile(frSource, frTarget);
  } else {
    console.warn(`Source file not found: ${frSource}`);
  }
  
  console.log('i18n sync completed!');
}

// Run the sync
syncI18nFiles(); 