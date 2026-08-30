#!/usr/bin/env node
/**
 * Amanaura Design System v5.0 (FLOW) — Tri-Surface Token Sync CI Guard
 * Asserts that runtime tokens in ADR-UX-011 <-> src/index.css <-> LivingContractWorkspace.tsx
 * match verbatim (3-Way SSOT Lock).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const docPath = path.join(rootDir, 'doc', 'MASTER', 'ADR_UX_011_AMANAURA_OS_FLOW_CONSOLIDATION_v1.0.md');
const cssPath = path.join(rootDir, 'src', 'index.css');
const specimenPath = path.join(rootDir, 'src', 'components', 'workspaces', 'LivingContractWorkspace.tsx');

if (!fs.existsSync(docPath)) {
  console.error(`❌ ERROR: Document not found at ${docPath}`);
  process.exit(1);
}

if (!fs.existsSync(cssPath)) {
  console.error(`❌ ERROR: CSS file not found at ${cssPath}`);
  process.exit(1);
}

if (!fs.existsSync(specimenPath)) {
  console.error(`❌ ERROR: Specimen workspace not found at ${specimenPath}`);
  process.exit(1);
}

const docContent = fs.readFileSync(docPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const specimenContent = fs.readFileSync(specimenPath, 'utf8');

function extractTokenMap(content, blockSelector) {
  const blockRegex = new RegExp(`${blockSelector}\\s*(?:\\/\\*.*?\\*\\/)?\\s*\\{([^}]+)\\}`, 's');
  const match = content.match(blockRegex);
  if (!match) {
    return null;
  }
  const blockBody = match[1];
  const tokenRegex = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  const tokens = {};
  let m;
  while ((m = tokenRegex.exec(blockBody)) !== null) {
    tokens[m[1]] = m[2].trim().replace(/\s+/g, '').toUpperCase();
  }
  return tokens;
}

function extractSpecimenTokens(content) {
  const tokenRegex = /varName:\s*'(--[a-z0-9-]+)'/g;
  const tokens = {};
  let m;
  while ((m = tokenRegex.exec(content)) !== null) {
    tokens[m[1]] = true;
  }
  return tokens;
}

console.log('════════════════════════════════════════════════════════════════');
console.log('🏛️  AMANAURA DESIGN SYSTEM v5.0 — TRI-SURFACE TOKEN SYNC CI GUARD');
console.log('════════════════════════════════════════════════════════════════');

const codeLight = extractTokenMap(cssContent, ':root');
const codeDark = extractTokenMap(cssContent, '\\.dark');

const docLight = extractTokenMap(docContent, ':root');
const docDark = extractTokenMap(docContent, '\\.dark');

const specimenTokens = extractSpecimenTokens(specimenContent);

if (!codeLight || !codeDark) {
  console.error('❌ ERROR: Failed to extract token blocks from src/index.css');
  process.exit(1);
}

if (!docLight || !docDark) {
  console.error('❌ ERROR: Failed to extract token blocks from doc/MASTER/ADR_UX_011_AMANAURA_OS_FLOW_CONSOLIDATION_v1.0.md §3.2');
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

function compareSpecimenTokens(codeTokens, specimenMap) {
  console.log(`\n🔍 Checking 3rd Key: Living Contract Specimen Registry vs Canonical Tokens...`);
  let drifts = 0;
  const codeKeys = Object.keys(codeTokens).filter(k => k !== '--shadow-luminescent').sort();
  const specimenKeys = Object.keys(specimenMap).sort();
  
  for (const key of codeKeys) {
    if (!specimenMap[key]) {
      console.error(`  ❌ SPECIMEN DRIFT: Token ${key} exists in CODE (:root) but MISSING in LivingContractWorkspace`);
      drifts++;
    }
  }
  for (const key of specimenKeys) {
    if (!codeTokens[key]) {
      console.error(`  ❌ SPECIMEN DRIFT: Token ${key} in LivingContractWorkspace is INVALID / NOT in CODE (:root)`);
      drifts++;
    }
  }
  if (drifts === 0) {
    console.log(`  ✅ PASS: All ${codeKeys.length} canonical tokens 100% bound in Living Contract Specimen.`);
  } else {
    driftCount += drifts;
  }
}

compareTokenSets('Light (:root / Ivory Canvas)', codeLight, docLight);
compareTokenSets('Dark (.dark / Midnight Sanctuary)', codeDark, docDark);
compareSpecimenTokens(codeLight, specimenTokens);

console.log('\n════════════════════════════════════════════════════════════════');
if (driftCount === 0) {
  console.log('✅ PASS: 0 token drifts across all 3 surfaces (Doc ↔ Code ↔ Specimen)');
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.error(`❌ FAIL: ${driftCount} token drift(s) detected across surfaces!`);
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(1);
}
