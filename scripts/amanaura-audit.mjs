import fs from 'fs';
import path from 'path';

const FORBIDDEN_RULES = [
  { regex: /\b(sm|md|lg|xl|2xl):/, name: 'Legacy Breakpoint (Gunakan compact:/medium:/expanded:/large:)' },
  { regex: /(?<!hover-only:)(?<!group-)(?<!group-hover-only:)\bhover:[a-z0-9\/-]+/, name: 'Unshielded Hover (Gunakan hover-only:)' },
  { regex: /\b(h-screen|min-h-screen|max-h-screen)\b/, name: 'Legacy Viewport (Gunakan 100dvh)' },
  { regex: /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{2725}\u{2727}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u, name: 'Unicode Emoji Violation (Wajib Lucide Icon)' },
  { regex: /<select\b/, name: 'Raw <select> (Wajib SelectSheet/SegmentedControl)' },
  { regex: /\bz-\[\d+\]/, name: 'Arbitrary z-index (Gunakan skala kanonikal z-40/50/60/70/80)' },
  { regex: /\btext-white\b/, name: 'Raw text-white (Wajib gunakan text-on-brand/text-inverse)' },
  { regex: /\btext-black\b/, name: 'Raw text-black (Wajib gunakan text-ink)' },
  { regex: /\bbg-black\b/, name: 'Raw bg-black (Wajib gunakan bg-surface-inset)' },
  { regex: /\b(CLASS ANNOUNCEMENT|DAILY SUMMARY)\b/, name: 'Forbidden English Uppercase Label (Wajib terjemahkan ke Kamus Pendidik)' },
  { regex: /grid-cols-\[1fr/, name: 'R-GRID: Grid Blowout Violation (Wajib gunakan minmax(0,1fr))' },
  { regex: /rounded-\[\d+px\]/, name: 'R-RADIUS: Arbitrary pixel border-radius (Wajib gunakan rounded-card/field/control/pill)' },
  { regex: /<(?:Button|button)[^>]*\bclassName=['"][^'"]*\btruncate\b/i, name: 'R-NO-TRUNCATE-BUTTON: Truncation on interactive button (Wajib wrap / multi-line, dilarang memotong aksi)' },
  { regex: /\b(p|px|py|m|mx|my)-\d+\.\d+\b/, name: 'R-SPACING-RHYTHM: Larangan half-step seperti p-2.5, p-3.5 (Wajib skala kanonikal)' },
  { regex: /\bw-3\.5 h-3\.5\b/, name: 'R-ICON-SIZE: Larangan icon w-3.5 h-3.5 (Wajib w-4 h-4 di dalam Button/chip)' },
  { regex: /\\buppercase\\b(?!.*\\btracking-wider\\b)/, name: 'R-TRACKING-UPPER: Elemen dengan uppercase WAJIB tracking-wider' },
  { regex: /\b(motif-poleng|padma|gunungan)\b/, name: 'R-ORNAMENT: Zero-Ornament Doctrine violation (motif-poleng/padma/gunungan dilarang)' },
  { regex: /ClassroomPulseBanner.*border-warning-line/, name: 'R-FLAT-BOX: Kotak alert border-warning-line dilarang pada banner kehadiran (Wajib divide-y divide-line-hairline)' },
  { regex: /className=['"][^'"]*?(?<!focus-visible:)(?<!focus:)(?<!hover-only:)(?<!hover:)\bshadow-luminescent\b/, name: 'R-GLOW: shadow-luminescent tanpa prefix interaksi (Wajib focus-visible: / hover-only:)' },
  { regex: /(?<!TK\s)(?<!Yayasan\s)\bYapendik\s+(School\s+)?OS\b/i, name: 'R-BRAND: Legacy "Yapendik OS" Brand Slot Violation (Wajib gunakan "Amanaura OS")' },
  { regex: /\b(?:ease-spring|ease-bounce|--ease-spring|--ease-bounce)\b/, name: 'R-PHYSICS: Competing bezier spring violation (Amanaura Spring {380,32,0.8} is the sole motion physics)' },
  { regex: /[\u2303\u2304⌃⌄]/, name: 'R-NO-RAW-CHEVRON: Raw chevron glyph violation (Wajib Lucide ChevronUp/ChevronDown per Law 11 / G-3)' }
];

const ALLOWED_FILES = [
  'LppaPrintPreviewModal.tsx',
];

const ALLOWED_DIRS = [
  path.join('src', 'components', 'ui'),
  path.join('src', 'db')
];

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!ALLOWED_DIRS.some(allowed => fullPath.endsWith(allowed) || fullPath.includes(allowed + path.sep))) {
        scanDir(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|css)$/.test(file)) {
      if (!ALLOWED_FILES.some(allowed => file.includes(allowed))) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const srcDir = path.resolve('src');
const allFiles = scanDir(srcDir);
if (fs.existsSync(path.resolve('index.html'))) {
  allFiles.push(path.resolve('index.html'));
}

let violationCount = 0;
const violationsByFile = {};

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let inPrintBlock = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Ignore @media print in css
    if (filePath.endsWith('.css')) {
      if (line.includes('@media print')) inPrintBlock = true;
      if (inPrintBlock) {
        if (line.includes('}')) inPrintBlock = false;
        return;
      }
    }

    // Ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    for (const { regex, name } of FORBIDDEN_RULES) {
      if (regex.test(line)) {
        // W-B Exemption: CanonicalAnchor closed-loop seal is the sole sanctioned ambient glow
        if (name.includes('R-GLOW') && filePath.includes('CanonicalAnchor')) {
          continue;
        }

        violationCount++;
        const relPath = path.relative(process.cwd(), filePath);
        if (!violationsByFile[relPath]) {
          violationsByFile[relPath] = [];
        }
        violationsByFile[relPath].push({ lineNum, line: trimmed, name });
      }
    }
  });
}

// ═══ RULE R-SPECIMEN: Scoped Strict Contract Guard for LivingContractWorkspace.tsx ═══
const SPECIMEN_REL_PATH = path.join('src', 'components', 'workspaces', 'LivingContractWorkspace.tsx');
const SPECIMEN_FULL_PATH = path.resolve(SPECIMEN_REL_PATH);
if (fs.existsSync(SPECIMEN_FULL_PATH)) {
  const specimenContent = fs.readFileSync(SPECIMEN_FULL_PATH, 'utf-8');
  const specimenLines = specimenContent.split('\n');

  const R_SPECIMEN_RULES = [
    { regex: /<(button|input|select|textarea)\b/, name: 'R-SPECIMEN: Raw interactive HTML tag (Wajib primitif src/components/ui/)' },
    { regex: /style=\{\{[^}]*?(color|background|width|height|border|padding|margin)\s*:\s*['"`](?!var\()[^'"`]+['"`]/i, name: 'R-SPECIMEN: Static style property with color/size (Wajib CSS variables / Tailwind tokens)' },
    { regex: /#(?:[0-9a-fA-F]{3,4}){1,2}\b(?!['"]\s*\))/i, name: 'R-SPECIMEN: Hardcoded static hex color literal (Wajib runtime getComputedStyle)' }
  ];

  specimenLines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    // Skip comments and top-level helper functions (parseColorToRgb / getLuminance)
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    if (lineNum < 75) return;

    for (const { regex, name } of R_SPECIMEN_RULES) {
      if (regex.test(line)) {
        violationCount++;
        const relPath = path.relative(process.cwd(), SPECIMEN_FULL_PATH);
        if (!violationsByFile[relPath]) {
          violationsByFile[relPath] = [];
        }
        violationsByFile[relPath].push({ lineNum, line: trimmed, name });
      }
    }
  });
}

// ═══ RULE R-INVISIBLE-SCROLL: Invisible Mastery #8 (Disappear Scrollbar) ═══
const INDEX_CSS_REL_PATH = path.join('src', 'index.css');
const INDEX_CSS_FULL_PATH = path.resolve(INDEX_CSS_REL_PATH);
if (fs.existsSync(INDEX_CSS_FULL_PATH)) {
  const cssContent = fs.readFileSync(INDEX_CSS_FULL_PATH, 'utf-8');
  if (!cssContent.includes('scrollbar-width: none') || !cssContent.includes('::-webkit-scrollbar { width: 0; height: 0; }')) {
    violationCount++;
    if (!violationsByFile[INDEX_CSS_REL_PATH]) violationsByFile[INDEX_CSS_REL_PATH] = [];
    violationsByFile[INDEX_CSS_REL_PATH].push({
      lineNum: 1,
      line: 'src/index.css missing global invisible scroll rules',
      name: 'R-INVISIBLE-SCROLL: Global scrollbar must disappear across all containers (Mastery #8)'
    });
  }
}

// ═══ RULE R-NAV-CHEVRON-CALIBRATION: ADR-UX-012 Horizon Handle & FAB Collision Check (G-3, G-6) ═══
const OMNIBAR_REL_PATH = path.join('src', 'components', 'layout', 'MobileOmniBar.tsx');
const OMNIBAR_FULL_PATH = path.resolve(OMNIBAR_REL_PATH);
if (fs.existsSync(OMNIBAR_FULL_PATH)) {
  const omniContent = fs.readFileSync(OMNIBAR_FULL_PATH, 'utf-8');
  if (!omniContent.includes('min-h-[48px]')) {
    violationCount++;
    if (!violationsByFile[OMNIBAR_REL_PATH]) violationsByFile[OMNIBAR_REL_PATH] = [];
    violationsByFile[OMNIBAR_REL_PATH].push({
      lineNum: 1,
      line: 'MobileOmniBar horizon handle missing min-h-[48px]',
      name: 'R-CHEVRON-TOUCH-FLOOR: Horizon handle must enforce >= 48dp touch floor (G-3)'
    });
  }
  if (!omniContent.includes('aria-label="Buka Menu Navigasi"')) {
    violationCount++;
    if (!violationsByFile[OMNIBAR_REL_PATH]) violationsByFile[OMNIBAR_REL_PATH] = [];
    violationsByFile[OMNIBAR_REL_PATH].push({
      lineNum: 1,
      line: 'MobileOmniBar horizon handle missing aria-label="Buka Menu Navigasi"',
      name: 'R-CHEVRON-A11Y: Horizon handle must include aria-label="Buka Menu Navigasi" (G-3)'
    });
  }
  // R-HORIZON-PURE: Zero text inside handle button (no "Menu" text node)
  if (/data-testid="mobile-chevron-handle"[^>]*>[\s\S]*?<span[^>]*>[^<]*Menu[^<]*<\/span>/i.test(omniContent)) {
    violationCount++;
    if (!violationsByFile[OMNIBAR_REL_PATH]) violationsByFile[OMNIBAR_REL_PATH] = [];
    violationsByFile[OMNIBAR_REL_PATH].push({
      lineNum: 1,
      line: 'MobileOmniBar horizon handle contains "Menu" text node',
      name: 'R-HORIZON-PURE: Horizon handle must be pure hairline + Lucide ChevronUp with ZERO text'
    });
  }
}

// ═══ RULE R-FAB-ALLOWLIST: ADR-UX-012 Addendum III (Law of Single Primary Presence) ═══
// Empty allowlist: QuickCaptureFloatingButton / standalone FAB capture is retired from src/
const allSrcFiles = [];
function collectSrcFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSrcFiles(full);
    } else if (entry.isFile() && (full.endsWith('.tsx') || full.endsWith('.ts'))) {
      allSrcFiles.push(full);
    }
  }
}
collectSrcFiles(path.resolve('src'));

for (const filePath of allSrcFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('QuickCaptureFloatingButton') || /<[A-Za-z0-9]*FAB/i.test(content)) {
    violationCount++;
    const rel = path.relative(process.cwd(), filePath);
    if (!violationsByFile[rel]) violationsByFile[rel] = [];
    violationsByFile[rel].push({
      lineNum: 1,
      line: 'Deprecated FAB / QuickCaptureFloatingButton rendered or imported in src/',
      name: 'R-FAB-ALLOWLIST: FAB is retired per Law of Single Primary Presence (ADR-UX-012 Addendum III)'
    });
  }
}

// Validate Manifest PWA Brand (R-BRAND)
const manifestPath = path.resolve('public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.name !== 'Amanaura OS') {
    violationCount++;
    if (!violationsByFile['public/manifest.json']) violationsByFile['public/manifest.json'] = [];
    violationsByFile['public/manifest.json'].push({
      lineNum: 1,
      line: `name: "${manifest.name}"`,
      name: 'R-BRAND: manifest.name must be "Amanaura OS"'
    });
  }
}

console.log('════════════════════════════════════════════════════════════════');
console.log('🏛️  AMANAURA DESIGN SYSTEM — DEEP STRUCTURAL CI GUARD AUDIT');
console.log('════════════════════════════════════════════════════════════════');

if (violationCount === 0) {
  console.log('✅ PASS: 0 structural & ergonomic violations detected across src/');
  console.log('════════════════════════════════════════════════════════════════');
  process.exit(0);
} else {
  console.log(`❌ FAIL: Found ${violationCount} structural violations:\n`);
  for (const [file, items] of Object.entries(violationsByFile)) {
    console.log(`📂 ${file}:`);
    for (const item of items) {
      console.log(`   Line ${item.lineNum} [${item.name}]: ${item.line}`);
    }
  }
  console.log('\n════════════════════════════════════════════════════════════════');
  process.exit(1);
}
