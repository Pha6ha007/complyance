#!/usr/bin/env node
/**
 * Locale Key Sync Script
 *
 * Ensures all locale files have exactly the same keys as the English (en) source.
 * - Removes keys from non-en locales that don't exist in en
 * - Reports keys present in en but missing in non-en locales
 *
 * Usage: node scripts/sync-locale-keys.mjs [--fix] [--verbose]
 *   --fix      Remove extra keys (default: dry-run)
 *   --verbose  Show per-key details
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = resolve(__dirname, '../src/i18n/messages');
const LOCALES = ['fr', 'de', 'pt', 'ar', 'pl', 'it'];
const SOURCE_LOCALE = 'en';

const fix = process.argv.includes('--fix');
const verbose = process.argv.includes('--verbose');

// Recursively collect all leaf key paths from an object
function collectKeys(obj, prefix = '') {
  const keys = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const k of collectKeys(value, fullKey)) {
        keys.add(k);
      }
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

// Get a nested value by dot-separated path
function getNestedValue(obj, path) {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

// Set a nested value by dot-separated path
function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') {
      curr[parts[i]] = {};
    }
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = value;
}

// Delete a nested key by dot-separated path, and clean empty parents
function deleteNestedKey(obj, path) {
  const parts = path.split('.');
  const stack = [];
  let curr = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) return;
    stack.push({ obj: curr, key: parts[i] });
    curr = curr[parts[i]];
  }

  delete curr[parts[parts.length - 1]];

  // Clean up empty parent objects
  for (let i = stack.length - 1; i >= 0; i--) {
    const { obj: parentObj, key } = stack[i];
    if (Object.keys(parentObj[key]).length === 0) {
      delete parentObj[key];
    } else {
      break;
    }
  }
}

// Build a clean object from EN keys, preserving existing translations
function buildCleanObject(enData, localeData, enKeys) {
  const result = {};
  for (const key of [...enKeys].sort()) {
    const localeValue = getNestedValue(localeData, key);
    const enValue = getNestedValue(enData, key);
    // Keep existing translation, or fall back to EN value
    setNestedValue(result, key, localeValue !== undefined ? localeValue : enValue);
  }
  return result;
}

// Main
const enPath = resolve(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
const enData = JSON.parse(readFileSync(enPath, 'utf-8'));
const enKeys = collectKeys(enData);

console.log(`\n📋 Source: ${SOURCE_LOCALE}.json — ${enKeys.size} keys\n`);

let totalRemoved = 0;
let totalMissing = 0;

for (const locale of LOCALES) {
  const localePath = resolve(MESSAGES_DIR, `${locale}.json`);
  const localeData = JSON.parse(readFileSync(localePath, 'utf-8'));
  const localeKeys = collectKeys(localeData);

  const extraKeys = [...localeKeys].filter((k) => !enKeys.has(k));
  const missingKeys = [...enKeys].filter((k) => !localeKeys.has(k));

  const status = extraKeys.length === 0 && missingKeys.length === 0 ? '✅' : '⚠️';
  console.log(
    `${status} ${locale}: ${localeKeys.size} keys | +${extraKeys.length} extra | -${missingKeys.length} missing`
  );

  if (verbose && extraKeys.length > 0) {
    console.log(`   Extra: ${extraKeys.slice(0, 10).join(', ')}${extraKeys.length > 10 ? '...' : ''}`);
  }
  if (verbose && missingKeys.length > 0) {
    console.log(`   Missing: ${missingKeys.slice(0, 10).join(', ')}${missingKeys.length > 10 ? '...' : ''}`);
  }

  totalRemoved += extraKeys.length;
  totalMissing += missingKeys.length;

  if (fix && (extraKeys.length > 0 || missingKeys.length > 0)) {
    const cleaned = buildCleanObject(enData, localeData, enKeys);
    writeFileSync(localePath, JSON.stringify(cleaned, null, 2) + '\n', 'utf-8');
    console.log(`   → Fixed: removed ${extraKeys.length}, added ${missingKeys.length} (EN fallback)`);
  }
}

console.log(`\n${fix ? '🔧 Fixed' : '📊 Summary'}: ${totalRemoved} extra keys, ${totalMissing} missing keys across ${LOCALES.length} locales`);
if (!fix && totalRemoved > 0) {
  console.log('💡 Run with --fix to auto-clean');
}
console.log('');
