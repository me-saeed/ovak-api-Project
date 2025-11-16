/**
 * Helper script to extract access token from browser
 * 
 * Instructions:
 * 1. Log into the Ovok app in your browser
 * 2. Open browser DevTools (F12)
 * 3. Go to Console tab
 * 4. Run: localStorage.getItem('accessToken')
 * 5. Copy the token value
 * 6. Run this script: node tests/get-token-helper.js
 * 7. Or set environment variable: export OVOK_ACCESS_TOKEN=your_token
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Ovok API Token Helper                               ║
╚══════════════════════════════════════════════════════════════╝

To get your access token:

METHOD 1: From Browser Console
────────────────────────────────
1. Open your Ovok app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Type: localStorage.getItem('accessToken')
5. Copy the token value
6. Run: export OVOK_ACCESS_TOKEN=your_token_here
7. Then run: node tests/api-bug-testing.js

METHOD 2: Direct Environment Variable
───────────────────────────────────────
export OVOK_ACCESS_TOKEN=your_token_here
node tests/api-bug-testing.js

METHOD 3: Inline
────────────────
OVOK_ACCESS_TOKEN=your_token_here node tests/api-bug-testing.js

Current token status:
`);

const token = process.env.OVOK_ACCESS_TOKEN;
if (token) {
  console.log(`✅ Token found: ${token.substring(0, 20)}...`);
  console.log(`\nYou can now run: node tests/api-bug-testing.js\n`);
} else {
  console.log(`❌ No token found in environment variable OVOK_ACCESS_TOKEN`);
  console.log(`\nPlease set it using one of the methods above.\n`);
}

