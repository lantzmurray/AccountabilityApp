#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AccountabilityApp Deployment Script');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if expo is installed
try {
  execSync('npx expo --version', { stdio: 'ignore' });
  console.log('✅ Expo CLI found');
} catch (error) {
  console.error('❌ Error: Expo CLI not found. Please install it with: npm install -g @expo/cli');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🏗️  Building web version...');
  execSync('npx expo export --platform web', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
  console.log('📁 Web build available in: ./dist/');
  
  console.log('\n🌐 Deployment Options:');
  console.log('1. Netlify: netlify deploy --dir=dist --prod');
  console.log('2. Vercel: cd dist && vercel --prod');
  console.log('3. Firebase: firebase deploy');
  console.log('4. GitHub Pages: Push to GitHub and enable Pages');
  
  console.log('\n📖 For detailed instructions, see: deploy.md');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}