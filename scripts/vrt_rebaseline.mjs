/**
 * Amanaura OS × FLOW — Visual Regression Testing (VRT) Re-baseline Engine
 * Captures 3 Viewports (COMPACT, MEDIUM, EXPANDED) × 2 Themes (Ivory Canvas, Midnight Sanctuary)
 * Across 14 Canonical Workspaces (84 snapshots total).
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'compact', width: 390, height: 844, label: 'COMPACT (390x844)' },
  { name: 'medium', width: 768, height: 1024, label: 'MEDIUM (768x1024)' },
  { name: 'expanded', width: 1440, height: 900, label: 'EXPANDED (1440x900)' }
];

const THEMES = [
  { name: 'light', label: 'Ivory Canvas' },
  { name: 'dark', label: 'Midnight Sanctuary' }
];

const ROUTES = [
  { hash: '#beranda-guru', name: 'beranda-guru', title: 'Beranda Kelas' },
  { hash: '#presensi', name: 'presensi', title: 'Presensi Harian' },
  { hash: '#kerja-harian', name: 'kerja-harian', title: 'Jurnal Harian' },
  { hash: '#observasi', name: 'observasi', title: 'Momen Belajar' },
  { hash: '#perkembangan', name: 'perkembangan', title: 'Rapor LPPA' },
  { hash: '#jejak-anak', name: 'jejak-anak', title: 'Jejak Anak' },
  { hash: '#buku-penghubung', name: 'buku-penghubung', title: 'Buku Penghubung' },
  { hash: '#portal-keluarga', name: 'portal-keluarga', title: 'Portal Keluarga' },
  { hash: '#adopsi-ks', name: 'adopsi-ks', title: 'Kotak Kebijakan' },
  { hash: '#yayasan', name: 'yayasan', title: 'Console Yayasan' },
  { hash: '#kesehatan-sekolah', name: 'kesehatan-sekolah', title: 'Statistik Unit' },
  { hash: '#siklus-akademik', name: 'siklus-akademik', title: 'Tahun Ajaran' },
  { hash: '#uji-otorisasi', name: 'uji-otorisasi', title: 'Uji Otorisasi' },
  { hash: '#percontohan', name: 'percontohan', title: 'Living Contract & Token Specimen' }
];

const OUT_DIR = path.resolve('tests', 'vrt-baseline', 'v5.0_amanaura_flow');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🏛️  AMANAURA OS × FLOW — VRT RE-BASELINE ENGINE (84 SNAPSHOTS)');
  console.log('════════════════════════════════════════════════════════════════');

  const browser = await chromium.launch({ headless: true });
  const manifest = {
    timestamp: new Date().toISOString(),
    version: '1.0.0-amanaura-os-flow-sealed',
    totalCaptures: 0,
    files: []
  };

  for (const vp of VIEWPORTS) {
    for (const th of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });

      const page = await context.newPage();

      // Set theme in localStorage before load
      await page.addInitScript(({ themeName }) => {
        localStorage.setItem('yapendik_theme', themeName);
      }, { themeName: th.name });

      for (const route of ROUTES) {
        const fullUrl = `${BASE_URL}/${route.hash}`;
        try {
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(400);

          const fileName = `${route.name}_${vp.name}_${th.name}.png`;
          const filePath = path.join(OUT_DIR, fileName);

          await page.screenshot({ path: filePath, fullPage: false });

          const fileBuffer = fs.readFileSync(filePath);
          const hashSum = crypto.createHash('sha256').update(fileBuffer).digest('hex').substring(0, 16);

          manifest.totalCaptures++;
          manifest.files.push({
            route: route.hash,
            page: route.title,
            viewport: vp.label,
            theme: th.label,
            file: fileName,
            sha256: hashSum
          });

          console.log(`  📸 [${manifest.totalCaptures.toString().padStart(2, '0')}] CAPTURED: ${route.name.padEnd(20)} | ${vp.name.padEnd(8)} | ${th.name.padEnd(5)} | sha: ${hashSum}`);
        } catch (err) {
          console.error(`  ❌ FAILED to capture ${route.name} (${vp.name}, ${th.name}):`, err.message);
        }
      }

      await context.close();
    }
  }

  await browser.close();

  // Compute master baseline hash
  const masterHashInput = manifest.files.map(f => `${f.file}:${f.sha256}`).join('\n');
  const masterHash = crypto.createHash('sha256').update(masterHashInput).digest('hex').substring(0, 32);
  manifest.masterBaselineHash = masterHash;

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('════════════════════════════════════════════════════════════════');
  console.log(`✅ VRT RE-BASELINE COMPLETE: ${manifest.totalCaptures} snapshots locked.`);
  console.log(`🔒 Master Baseline Hash: sha256:${masterHash}`);
  console.log('════════════════════════════════════════════════════════════════');
}

run().catch(err => {
  console.error('Fatal VRT error:', err);
  process.exit(1);
});
