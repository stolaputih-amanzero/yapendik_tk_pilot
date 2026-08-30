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
  { regex: /\b(?:ease-spring|ease-bounce|--ease-spring|--ease-bounce)\b/, name: 'R-PHYSICS: Competing bezier spring violation (Amanaura Spring {380,32,0.8} is the sole motion physics)' }
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
