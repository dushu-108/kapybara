#!/usr/bin/env node

/**
 * Database setup script
 * Run with: node scripts/setup-db.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up your database...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create .env.local with your DATABASE_URL');
  console.log('Example:');
  console.log('DATABASE_URL="postgresql://username:password@host/database?sslmode=require"');
  process.exit(1);
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_URL')) {
  console.log('❌ DATABASE_URL not found in .env.local');
  console.log('Please add your Neon database connection string');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n🔄 Generating migrations...');
  execSync('npm run db:generate', { stdio: 'inherit' });

  console.log('\n🚀 Applying migrations...');
  execSync('npm run db:migrate', { stdio: 'inherit' });

  console.log('\n✅ Database setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run dev" to start your development server');
  console.log('2. Visit http://localhost:3000 to test your app');
  console.log('3. Run "npm run db:studio" to view your database');

} catch (error) {
  console.log('\n❌ Setup failed:', error.message);
  console.log('\nTry running the commands manually:');
  console.log('1. npm install');
  console.log('2. npm run db:generate');
  console.log('3. npm run db:migrate');
}