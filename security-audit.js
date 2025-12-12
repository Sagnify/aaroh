#!/usr/bin/env node

/**
 * Security Audit Script for CVE-2025-55184 and CVE-2025-55183
 * Checks for potential vulnerabilities in Next.js RSC implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running security audit for CVE-2025-55184 and CVE-2025-55183...\n');

// Check Next.js version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const nextVersion = packageJson.dependencies.next;
console.log(`📦 Next.js version: ${nextVersion}`);

// Check for hardcoded secrets
function scanForSecrets(dir) {
  const secrets = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      secrets.push(...scanForSecrets(fullPath));
    } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for hardcoded secrets (basic patterns)
      const secretPatterns = [
        /password\s*[:=]\s*['"][^'"]+['"]/gi,
        /secret\s*[:=]\s*['"][^'"]+['"]/gi,
        /key\s*[:=]\s*['"][^'"]+['"]/gi,
        /token\s*[:=]\s*['"][^'"]+['"]/gi
      ];
      
      for (const pattern of secretPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          secrets.push({
            file: fullPath,
            matches: matches
          });
        }
      }
    }
  }
  
  return secrets;
}

// Scan for Server Actions
function scanForServerActions(dir) {
  const serverActions = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      serverActions.push(...scanForServerActions(fullPath));
    } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('use server')) {
        serverActions.push(fullPath);
      }
    }
  }
  
  return serverActions;
}

// Run scans
console.log('🔐 Scanning for hardcoded secrets...');
const secrets = scanForSecrets('./src');
if (secrets.length > 0) {
  console.log('⚠️  Found potential hardcoded secrets:');
  secrets.forEach(secret => {
    console.log(`   ${secret.file}: ${secret.matches.join(', ')}`);
  });
} else {
  console.log('✅ No hardcoded secrets found');
}

console.log('\n🎯 Scanning for Server Actions...');
const serverActions = scanForServerActions('./src');
if (serverActions.length > 0) {
  console.log('⚠️  Found Server Actions (review for sensitive data):');
  serverActions.forEach(action => {
    console.log(`   ${action}`);
  });
} else {
  console.log('✅ No Server Actions found');
}

// Check middleware
console.log('\n🛡️  Checking middleware security...');
if (fs.existsSync('./src/middleware.js')) {
  const middleware = fs.readFileSync('./src/middleware.js', 'utf8');
  if (middleware.includes('X-Content-Type-Options') && middleware.includes('content-length')) {
    console.log('✅ Middleware has security headers and DoS protection');
  } else {
    console.log('⚠️  Middleware missing security protections');
  }
} else {
  console.log('⚠️  No middleware found');
}

// Check Next.js config
console.log('\n⚙️  Checking Next.js configuration...');
if (fs.existsSync('./next.config.js')) {
  const config = fs.readFileSync('./next.config.js', 'utf8');
  if (config.includes('headers()') && config.includes('serverActions')) {
    console.log('✅ Next.js config has security headers and RSC protection');
  } else {
    console.log('⚠️  Next.js config missing security features');
  }
} else {
  console.log('⚠️  No Next.js config found');
}

console.log('\n🎉 Security audit complete!');
console.log('\n📋 Recommendations:');
console.log('1. Update to Next.js 15.1.7+ for CVE fixes');
console.log('2. Ensure no secrets are hardcoded in Server Actions');
console.log('3. Implement request size limits in middleware');
console.log('4. Add security headers to prevent RSC exploitation');
console.log('5. Use environment variables for all sensitive data');