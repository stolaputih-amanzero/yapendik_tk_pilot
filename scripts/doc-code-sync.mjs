#!/usr/bin/env node
/**
 * Amanaura Design System v5.0 (FLOW) — 4-Surface Token & Component Index Sync CI Guard
 * Asserts that:
 * 1. Runtime tokens in ADR-UX-011 <-> src/index.css <-> LivingContractWorkspace.tsx match verbatim (3-Way SSOT Lock).
 * 2. Component library index in AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md §4.4 matches src/components/ui/*.tsx + ratified workspace primitives (R-INDEX-SYNC).
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
const dsReleaseDocPath = path.join(rootDir, 'doc', 'AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md');
const uiDirPath = path.join(rootDir, 'src', 'components', 'ui');

const RATIFIED_WORKSPACE_PRIMITIVES = {
  'WarmEchoCarousel.tsx': path.join(rootDir, 'src', 'components', 'workspaces', 'briefing', 'WarmEchoCarousel.tsx')
};

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

if (!fs.existsSync(dsReleaseDocPath)) {
  console.error(`❌ ERROR: DS Release Document not found at ${dsReleaseDocPath}`);
  process.exit(1);
}

if (!fs.existsSync(uiDirPath)) {
  console.error(`❌ ERROR: UI components directory not found at ${uiDirPath}`);
  process.exit(1);
}

const docContent = fs.readFileSync(docPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const specimenContent = fs.readFileSync(specimenPath, 'utf8');
const dsReleaseContent = fs.readFileSync(dsReleaseDocPath, 'utf8');

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

function extractSection44Primitives(content) {
  const match = content.match(/###\s*4\.4\s+Index Pustaka Komponen Primitif[\s\S]*?```text([\s\S]*?)```/);
  if (!match) {
    return null;
  }
  const block = match[1];
  const uiBlockMatch = block.match(/src\/components\/ui\/([\s\S]*?)(?:src\/hooks\/|$)/);
  const targetText = uiBlockMatch ? uiBlockMatch[1] : block;
  const tsxRegex = /([A-Za-z0-9_]+\.tsx)/g;
  const primitives = new Set();
  let m;
  while ((m = tsxRegex.exec(targetText)) !== null) {
    primitives.add(m[1]);
  }
  return Array.from(primitives).sort();
}

function getCodebasePrimitives() {
  const uiFiles = fs.readdirSync(uiDirPath).filter(f => f.endsWith('.tsx'));
  const allPrimitives = new Set([...uiFiles, ...Object.keys(RATIFIED_WORKSPACE_PRIMITIVES)]);
  return Array.from(allPrimitives).sort();
}

console.log('════════════════════════════════════════════════════════════════');
console.log('🏛️  AMANAURA DESIGN SYSTEM v5.0 — 4-SURFACE TOKEN & INDEX SYNC GUARD');
console.log('════════════════════════════════════════════════════════════════');

const codeLight = extractTokenMap(cssContent, ':root');
const codeDark = extractTokenMap(cssContent, '\\.dark');

const docLight = extractTokenMap(docContent, ':root');
const docDark = extractTokenMap(docContent, '\\.dark');

const specimenTokens = extractSpecimenTokens(specimenContent);

const docPrimitives = extractSection44Primitives(dsReleaseContent);
const codePrimitives = getCodebasePrimitives();

if (!codeLight || !codeDark) {
  console.error('❌ ERROR: Failed to extract token blocks from src/index.css');
  process.exit(1);
}

if (!docLight || !docDark) {
  console.error('❌ ERROR: Failed to extract token blocks from doc/MASTER/ADR_UX_011_AMANAURA_OS_FLOW_CONSOLIDATION_v1.0.md §3.2');
  process.exit(1);
}

if (!docPrimitives) {
  console.error('❌ ERROR: Failed to extract primitive components from doc/AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md §4.4');
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

function compareComponentIndex(docPrims, codePrims, ratifiedMap) {
  console.log(`\n🔍 Checking 4th Surface: Component Index Sync (R-INDEX-SYNC — §4.4 vs Codebase Primitives)...`);
  let indexDrifts = 0;
  const docSet = new Set(docPrims);
  const codeSet = new Set(codePrims);
  const allNames = Array.from(new Set([...docPrims, ...codePrims])).sort();

  for (const name of allNames) {
    const inDoc = docSet.has(name);
    const inCode = codeSet.has(name);

    if (inDoc && !inCode) {
      console.error(`  ❌ R-INDEX-SYNC DRIFT: Component ${name} exists in DOC (§4.4) but MISSING in CODE`);
      indexDrifts++;
    } else if (!inDoc && inCode) {
      console.error(`  ❌ R-INDEX-SYNC DRIFT: Component ${name} exists in CODE but MISSING in DOC (§4.4)`);
      indexDrifts++;
    } else if (ratifiedMap[name]) {
      if (!fs.existsSync(ratifiedMap[name])) {
        console.error(`  ❌ R-INDEX-SYNC DRIFT: Ratified workspace component ${name} path ${ratifiedMap[name]} does not exist on disk!`);
        indexDrifts++;
      }
    }
  }

  if (indexDrifts === 0) {
    console.log(`  ✅ PASS: All ${allNames.length} UI & Ratified Workspace Primitives 100% synchronized with §4.4.`);
  } else {
    driftCount += indexDrifts;
  }
}

compareTokenSets('Light (:root / Ivory Canvas)', codeLight, docLight);
compareTokenSets('Dark (.dark / Midnight Sanctuary)', codeDark, docDark);
compareSpecimenTokens(codeLight, specimenTokens);
compareComponentIndex(docPrimitives, codePrimitives, RATIFIED_WORKSPACE_PRIMITIVES);

console.log('\n════════════════════════════════════════════════════════════════');
if (driftCount === 0) {
  console.log('✅ PASS: 0 drifts across all 4 surfaces (Doc ↔ Code ↔ Specimen ↔ Component Index)');
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.error(`❌ FAIL: ${driftCount} drift(s) detected across 4 surfaces!`);
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(1);
}
