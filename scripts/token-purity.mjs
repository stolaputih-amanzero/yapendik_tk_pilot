import fs from 'fs';
import path from 'path';

const FORBIDDEN_PATTERNS = [
  { regex: /\bbg-white\b/, name: 'bg-white' },
  { regex: /\bbg-(?:slate|gray|zinc|neutral)-\d+/, name: 'bg-neutral-raw' },
  { regex: /\btext-(?:slate|gray|zinc|neutral)-\d+/, name: 'text-neutral-raw' },
  { regex: /\bborder-(?:slate|gray|zinc)-\d+/, name: 'border-neutral-raw' },
  { regex: /\bdivide-(?:slate|gray)-\d+/, name: 'divide-neutral-raw' },
  { regex: /\bring-(?:slate|gray)-\d+/, name: 'ring-neutral-raw' },
  { regex: /\btext-(?:red|amber|emerald|rose|green)-\d{2,3}\b/, name: 'text-color-raw' },
  { regex: /(fill|stroke)-(red|amber|emerald|rose|green|indigo|blue|slate|gray|zinc)-\d{2,3}/, name: 'fill-stroke-color-raw' }
];

const ALLOWED_FILES = [
  'LppaPrintPreviewModal.tsx',
];

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, fileList);
    } else if (/\.(tsx|ts|css)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const srcDir = path.resolve('src');
const allFiles = scanDir(srcDir);

let violationCount = 0;
const violationsByFile = {};

for (const filePath of allFiles) {
  const baseName = path.basename(filePath);
  if (ALLOWED_FILES.some(allowed => baseName.includes(allowed))) {
    continue;
  }

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

    for (const { regex, name } of FORBIDDEN_PATTERNS) {
      if (regex.test(line)) {
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

console.log('════════════════════════════════════════════════════════════════');
console.log('🔍 AMANAURA DESIGN SYSTEM — TOKEN PURITY CI GUARD AUDIT');
console.log('════════════════════════════════════════════════════════════════');

if (violationCount === 0) {
  console.log('✅ PASS: 0 token violations detected across src/');
  console.log('════════════════════════════════════════════════════════════════');
  process.exit(0);
} else {
  console.log(`❌ FAIL: Found ${violationCount} token violations:\n`);
  for (const [file, items] of Object.entries(violationsByFile)) {
    console.log(`📂 ${file}:`);
    for (const item of items) {
      console.log(`   Line ${item.lineNum} [${item.name}]: ${item.line}`);
    }
  }
  console.log('\n════════════════════════════════════════════════════════════════');
  process.exit(1);
}
