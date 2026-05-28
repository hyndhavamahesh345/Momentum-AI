#!/usr/bin/env node
/**
 * Momentum AI — Database Setup Script
 * Usage: node scripts/setup-db.mjs
 *
 * Requires DATABASE_URL to be set in your .env file.
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Load .env manually (no dotenv dependency needed in newer Node)
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env not found — rely on system environment
}

if (!process.env.DATABASE_URL) {
  console.error('\n❌  DATABASE_URL is not set.');
  console.error('    Add it to your .env file:\n');
  console.error('    DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require\n');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaSQL = readFileSync(path.join(__dirname, 'setup-db.sql'), 'utf-8');

console.log('\n🔌  Connecting to database...');

try {
  // Split on semicolons and run each statement individually
  const statements = schemaSQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    await sql.unsafe(stmt);
  }

  console.log('✅  All tables and indexes created successfully!\n');
  console.log('Tables created:');
  console.log('  • goals');
  console.log('  • milestones');
  console.log('  • tasks');
  console.log('  • ai_insights');
  console.log('  • momentum_history');
  console.log('  • execution_events\n');
  console.log('🚀  Your database is ready. Start the app with: npm run dev\n');
} catch (err) {
  console.error('\n❌  Database setup failed:', err.message);
  process.exit(1);
}
