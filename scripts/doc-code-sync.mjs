#!/usr/bin/env node
/**
 * Amanaura Design System v3.0 — Doc <-> Code Token Sync CI Guard
 * Asserts that runtime tokens in doc/AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md
 * match src/index.css verbatim (Light + Dark).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const docPath = path.join(rootDir, 'doc', 'AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md');
const cssPath = path.join(rootDir, 'src', 'index.css');

if (!fs.existsSync(docPath)) {
  console.error(`❌ ERROR: Document not found at ${docPath}`);
  process.exit(1);
}

if (!fs.existsSync(cssPath)) {
  console.error(`❌ ERROR: CSS file not found at ${cssPath}`);
  process.exit(1);
}

const docContent = fs.readFileSync(docPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

function extractTokenMap(content, blockSelector) {
  // Find blockSelector (e.g. ":root" or ".dark")
  const blockRegex = new RegExp(`${blockSelector}\\s*(?:\\/\\*.*?\\*\\/)?\\s*\\{([^}]+)\\}`, 's');
  const match = content.match(blockRegex);
  if (!match) {
    return null;
  }
  const blockBody = match[1];
  const tokenRegex = /(--p-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
  const tokens = {};
  let m;
  while ((m = tokenRegex.exec(blockBody)) !== null) {
    tokens[m[1]] = m[2].toUpperCase();
  }
  return tokens;
}

console.log('════════════════════════════════════════════════════════════════');
console.log('🏛️  AMANAURA DESIGN SYSTEM — DOC <-> CODE TOKEN SYNC CI GUARD');
console.log('════════════════════════════════════════════════════════════════');

const codeLight = extractTokenMap(cssContent, ':root');
const codeDark = extractTokenMap(cssContent, '\\.dark');

const docLight = extractTokenMap(docContent, ':root');
const docDark = extractTokenMap(docContent, '\\.dark');

if (!codeLight || !codeDark) {
  console.error('❌ ERROR: Failed to extract token blocks from src/index.css');
  process.exit(1);
}

if (!docLight || !docDark) {
  console.error('❌ ERROR: Failed to extract token blocks from doc/AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md §2.1');
  process.exit(1);
}

let driftCount = 0;

function compareTokenSets(setName, codeTokens, docTokens) {
  const allKeys = Array.from(new Set([...Object.keys(codeTokens), ...Object.keys(docTokens)])).sort();
  console.log(`\n🔍 Checking ${setName} Tokens (${allKeys.length} tokens)...`);
  
  let setDrifts = 0;
  for (const key of allKeys) {
    const codeVal = codeTokens[key];
    const docVal = docTokens[key];
    if (!codeVal) {
      console.error(`  ❌ DRIFT: Token ${key} exists in DOC (${docVal}) but MISSING in CODE`);
      setDrifts++;
    } else if (!docVal) {
      console.error(`  ❌ DRIFT: Token ${key} exists in CODE (${codeVal}) but MISSING in DOC`);
      setDrifts++;
    } else if (codeVal !== docVal) {
      console.error(`  ❌ VALUE DRIFT: Token ${key} CODE=${codeVal} vs DOC=${docVal}`);
      setDrifts++;
    }
  }

  if (setDrifts === 0) {
    console.log(`  ✅ PASS: All ${allKeys.length} ${setName} tokens 100% synchronized.`);
  } else {
    driftCount += setDrifts;
  }
}

compareTokenSets('Light (:root / Frangipani Day)', codeLight, docLight);
compareTokenSets('Dark (.dark / Night Temple)', codeDark, docDark);

console.log('\n════════════════════════════════════════════════════════════════');
if (driftCount === 0) {
  console.log('✅ PASS: 0 token drifts between doc/ and src/index.css (SSOT Locked)');
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.error(`❌ FAIL: ${driftCount} token drift(s) detected between doc/ and src/index.css!`);
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(1);
}
