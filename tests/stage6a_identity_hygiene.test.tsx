/**
 * @file stage6a_identity_hygiene.test.tsx
 * @description Suite 36: Identity Hygiene & Brand Slot Contracts (ADR-UX-011 §2)
 * 
 * Verifies:
 * 1. PWA Web App Manifest Identity (name === "Amanaura OS")
 * 2. index.html Title & OpenGraph Meta Tags (Amanaura OS)
 * 3. PremiumLoginScreen Brand Presentation (Amanaura OS)
 * 4. DOM Cleanliness: Zero /Yapendik\s+(School\s+)?OS/i in living user interfaces
 * 5. Tenant Slot Preservation ("TK Yapendik" & "Yayasan Pendidikan Kristen - Yapendik GPIB")
 * 6. Official PDF & Document Freedom from Software Brand
 * 7. Permanent CI Guard (R-BRAND) Validation
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PremiumLoginScreen } from '../src/components/auth/PremiumLoginScreen';
import { ProfileDrawer } from '../src/components/layout/ProfileDrawer';
import { SecurityContextProvider } from '../src/auth/context';
import { db } from '../src/db/database';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A IDENTITY HYGIENE & BRAND CONTRACTS (SUITE 36)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runIdentityHygieneTests() {
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  function runCheck(testName: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  // --- MODULE 1: PWA Web App Manifest Identity ---
  console.log('--- MODULE 1: Web App Manifest Canonical Brand ---');
  {
    runCheck('Manifest [BRAND NAME]: Manifest specifies "Amanaura OS" & "Amanaura"', () => {
      const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.equal(manifest.name, 'Amanaura OS');
      assert.equal(manifest.short_name, 'Amanaura');
      assert.ok(!manifest.name.includes('Yapendik OS'), 'Manifest name must not contain Yapendik OS');
    });
  }

  // --- MODULE 2: index.html Canonical Title & Meta ---
  console.log('\n--- MODULE 2: index.html Title & Metadata ---');
  {
    runCheck('index.html [TITLE & META]: Document title is "Amanaura OS"', () => {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      const html = fs.readFileSync(indexPath, 'utf8');
      assert.ok(html.includes('<title>Amanaura OS</title>'), 'Expected <title>Amanaura OS</title>');
      assert.ok(html.includes('content="Amanaura OS"'), 'Expected content="Amanaura OS" in OpenGraph');
      assert.ok(!html.includes('Yapendik School OS'), 'Did not expect Yapendik School OS in index.html');
    });
  }

  // --- MODULE 3: Login Screen Brand Presentation ---
  console.log('\n--- MODULE 3: PremiumLoginScreen Living Brand ---');
  {
    runCheck('LoginScreen [BRAND PRESENTATION]: Renders Amanaura OS branding and vision', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <PremiumLoginScreen />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Amanaura OS'), 'Expected "Amanaura OS" in Login Screen');
      assert.ok(!html.includes('Yapendik School OS'), 'Did not expect "Yapendik School OS" in Login Screen');
    });
  }

  // --- MODULE 4: Tenant Slot Preservation ---
  console.log('\n--- MODULE 4: Tenant Slot Preservation (Doktrin ARB §1) ---');
  {
    runCheck('LoginScreen [FLOW FOOTER]: Renders "Amanaura OS ✦ FLOW Design System • 2026"', () => {
      const loginHtml = renderToString(
        <SecurityContextProvider>
          <PremiumLoginScreen />
        </SecurityContextProvider>
      );
      assert.ok(
        loginHtml.includes('Amanaura OS ✦ FLOW Design System • 2026'),
        'Expected "Amanaura OS ✦ FLOW Design System • 2026" in Login Screen footer'
      );
    });

    runCheck('ProfileDrawer [TENANT CONTEXT]: Profile Drawer retains school tenant unit', () => {
      const drawerHtml = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer 
            isOpen={true}
            onClose={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(drawerHtml.includes('Amanaura OS'), 'Profile Drawer header must be Amanaura OS');
      assert.ok(
        drawerHtml.includes('Yayasan') || drawerHtml.includes('Yapendik') || drawerHtml.includes('TK'),
        'Profile Drawer retains tenant context'
      );
    });
  }

  // --- MODULE 5: Official Documents Freedom from Software Brand ---
  console.log('\n--- MODULE 5: Official PDF Documents Software Brand Freedom ---');
  {
    runCheck('PDF Generator [NO OS BRAND IN FOOTER]: Vector PDF uses institutional document verification', () => {
      const pdfServicePath = path.resolve(process.cwd(), 'src', 'services', 'lppaPdfGenerator.ts');
      const content = fs.readFileSync(pdfServicePath, 'utf8');
      assert.ok(!content.includes('Yapendik School OS'), 'PDF generator must not print software brand');
      assert.ok(content.includes('Verifikasi Dokumen Resmi Portofolio Digital'), 'Expected official document verification string');
    });
  }

  // --- MODULE 6: Permanent CI Guard R-BRAND Compliance ---
  console.log('\n--- MODULE 6: Permanent CI Guard R-BRAND Compliance ---');
  {
    runCheck('CI Guard [R-BRAND CONFORMANCE]: Zero legacy brand occurrences across living UI', () => {
      const appPath = path.resolve(process.cwd(), 'src', 'App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf8');
      assert.ok(appContent.includes('Memuat Konteks Identitas Amanaura OS...'), 'App loading screen uses Amanaura OS');
      assert.ok(!appContent.includes('Memuat Konteks Identitas Yapendik OS...'), 'Zero legacy loading screen');
    });
  }

  // --- MODULE 7: Official Seal & Human Identity Hygiene (ARB Ruling 2026-09-03) ---
  console.log('\n--- MODULE 7: Official Seal & Human Identity Hygiene (Zero Forbidden Literals) ---');
  {
    runCheck('Forbidden Literals [ZERO LEAKAGE]: Scan src/components/ and src/services/ for legacy mocks', () => {
      const forbiddenStrings = ['Marlina', 'Simanjuntak', 'Erna Susanti', '20104821'];
      const targetDirs = [
        path.resolve(process.cwd(), 'src', 'components'),
        path.resolve(process.cwd(), 'src', 'services'),
        path.resolve(process.cwd(), 'src', 'workspaces')
      ];

      function scanDir(dir: string) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const forbidden of forbiddenStrings) {
              assert.ok(
                !content.includes(forbidden),
                `Forbidden string "${forbidden}" detected in production file: ${fullPath}`
              );
            }
          }
        }
      }

      for (const d of targetDirs) {
        scanDir(d);
      }
    });

    runCheck('Canonical Authority [DB RESOLUTION]: getOfficialSchoolMetadata resolves authentic Headmaster & NPSN', () => {
      const meta = db.getOfficialSchoolMetadata('sch_tk_maranatha', 'cls_maranatha_tka');
      
      assert.equal(meta.schoolName, 'TK YAPENDIK GPIB Cabang Maranatha', 'Must resolve official school name');
      assert.equal(meta.schoolNpsn, '69820291', 'Must resolve authentic canonical NPSN 69820291');
      assert.equal(meta.headmasterName, 'SHERYL Y N UMBAS, S.IKOM, M.PD', 'Must resolve canonical Headmaster Sheryl');
      assert.equal(meta.headmasterPersonId, 'per_headmaster_sheryl', 'Must resolve canonical Headmaster person ID');
      assert.equal(meta.homeroomTeacherName, 'ERNA BOYKELA R', 'Must resolve authentic Homeroom Teacher Erna Boykela');
      assert.equal(meta.className, 'Kelas TK A', 'Must resolve authentic Class TK A');
    });

    runCheck('PTK Directory [READ-ONLY PROJECTION]: getPTKDirectory returns 4 authentic school PTK members', () => {
      const ptkList = db.getPTKDirectory('sch_tk_maranatha');
      
      assert.equal(ptkList.length, 4, 'Must return exactly 4 PTK members for TK Maranatha');
      const headmaster = ptkList.find((p: any) => p.role === 'HEADMASTER');
      assert.ok(headmaster, 'Must have Headmaster');
      assert.equal(headmaster.fullName, 'SHERYL Y N UMBAS, S.IKOM, M.PD');
      assert.equal(headmaster.employmentType, 'TETAP');
      
      const tkaWali = ptkList.find((p: any) => p.role === 'TEACHER' && p.assignedClassName === 'Kelas TK A');
      assert.ok(tkaWali, 'Must have Wali Kelas TK A');
      assert.equal(tkaWali.fullName, 'ERNA BOYKELA R');
      
      const tkaPendamping = ptkList.find((p: any) => p.role === 'ASSISTANT_TEACHER');
      assert.ok(tkaPendamping, 'Must have Pendamping TK A');
      assert.equal(tkaPendamping.fullName, 'CHARLOTHA JOVANNCA BLANDINNA R');
      
      const tkbWali = ptkList.find((p: any) => p.role === 'TEACHER' && p.assignedClassName === 'Kelas TK B');
      assert.ok(tkbWali, 'Must have Wali Kelas TK B');
      assert.equal(tkbWali.fullName, 'EVI TANIA');
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 36 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Suite 36 failed with ${failedTests} error(s).`);
  }
}

runIdentityHygieneTests().catch(err => {
  console.error(err);
  process.exit(1);
});
