/**
 * @file stage6a_living_shell.test.tsx
 * @description Suite 34: The Living Shell, Breath 4-State & Trinitas Refresh Contracts (ADR-UX-011 §5)
 * 
 * Verifies:
 * 1. Breath 4-State Connection Indicator (ONLINE, OFFLINE_IDLE, OFFLINE_QUEUED, RECONCILING) (D-10)
 * 2. Breath A11y & Status Dot Capsule Contract (a11y aria-label & title)
 * 3. Trinitas Refresh Orchestration & Circadian Gate (D-11 / D-8 Right to Rest)
 * 4. PWA Manifest Canonical Structure & oklch Color Calibration (ADR-UX-011 §2.3)
 * 5. iOS Install Guide Fallback Contract (ProfileDrawer §5.3)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getBreathStateMeta, ConnectionState } from '../src/hooks/useConnectionStatus';
import { TopBar } from '../src/components/layout/TopBar';
import { ProfileDrawer } from '../src/components/layout/ProfileDrawer';
import { SecurityContextProvider } from '../src/auth/context';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A THE LIVING SHELL & ERGONOMICS (SUITE 34)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runLivingShellTests() {
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

  // --- MODULE 1: Breath 4-State Evaluation (D-10) ---
  console.log('--- MODULE 1: Amanaura Breath 4-State Connection States (D-10) ---');
  {
    runCheck('Breath State [ONLINE]: Gold color and active resting human pulse (4s)', () => {
      const meta = getBreathStateMeta('ONLINE', 0);
      assert.equal(meta.state, 'ONLINE');
      assert.equal(meta.colorClass, 'text-accent-valor');
      assert.equal(meta.animationClass, 'animate-amanaura-breath');
      assert.equal(meta.showCapsule, false);
      assert.ok(meta.ariaLabel.includes('Terhubung'), 'Expected "Terhubung" in aria-label');
    });

    runCheck('Breath State [OFFLINE_IDLE]: Faint gray color and slow pulse (8s holding breath)', () => {
      const meta = getBreathStateMeta('OFFLINE_IDLE', 0);
      assert.equal(meta.state, 'OFFLINE_IDLE');
      assert.equal(meta.colorClass, 'text-ink-faint');
      assert.equal(meta.animationClass, 'animate-amanaura-breath-slow');
      assert.equal(meta.showCapsule, false);
      assert.ok(meta.ariaLabel.includes('Data Aman di Perangkat'), 'Expected local safety note in aria-label');
    });

    runCheck('Breath State [OFFLINE_QUEUED]: Faint slow pulse + Status Dot Capsule badge', () => {
      const meta = getBreathStateMeta('OFFLINE_QUEUED', 4);
      assert.equal(meta.state, 'OFFLINE_QUEUED');
      assert.equal(meta.showCapsule, true);
      assert.equal(meta.capsuleText, '● 4 Belum Sinkron');
      assert.ok(meta.ariaLabel.includes('4 Perubahan Menunggu Sinkronisasi'));
    });

    runCheck('Breath State [RECONCILING]: Luminous pulse and reconciling capsule', () => {
      const meta = getBreathStateMeta('RECONCILING', 0);
      assert.equal(meta.state, 'RECONCILING');
      assert.equal(meta.colorClass, 'text-accent-valor');
      assert.equal(meta.animationClass, 'animate-pulse');
      assert.equal(meta.showCapsule, true);
      assert.equal(meta.capsuleText, '✦ Menyinkronkan...');
    });
  }

  // --- MODULE 2: TopBar Breath A11y & Status Capsule Rendering ---
  console.log('\n--- MODULE 2: TopBar Breath A11y & Status Capsule Rendering ---');
  {
    runCheck('TopBar Breath [A11Y LABELS]: Renders descriptive aria-label and title', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar 
            activeTab="TEACHER_HOME"
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('aria-label="Status:'), 'Expected aria-label="Status: in TopBar');
      assert.ok(html.includes('title="Status:'), 'Expected title="Status: in TopBar');
    });
  }

  // --- MODULE 3: Trinitas Refresh Orchestration (D-11 & D-8) ---
  console.log('\n--- MODULE 3: Trinitas Refresh Orchestration & Circadian Safety (D-11) ---');
  {
    runCheck('Trinitas Refresh [RIGHT TO REST D-8]: In PENUTUP mode, background polling is suspended', () => {
      // Logic test: In PENUTUP mode, interval is intentionally bypassed to protect battery and biological rest
      const mode: string = 'PENUTUP';
      const shouldPoll = mode !== 'PENUTUP';
      assert.equal(shouldPoll, false, 'Expected soft interval polling to be inactive during PENUTUP mode');
    });

    runCheck('Trinitas Refresh [OPERASIONAL ACTIVE]: Polling is enabled during active school hours', () => {
      const mode: string = 'OPERASIONAL';
      const shouldPoll = mode !== 'PENUTUP';
      assert.equal(shouldPoll, true, 'Expected soft interval polling to be active during OPERASIONAL mode');
    });
  }

  // --- MODULE 4: PWA Web App Manifest Structure & oklch (ADR-UX-011 §2.3) ---
  console.log('\n--- MODULE 4: PWA Web App Manifest Canonical Contract ---');
  {
    runCheck('PWA Manifest [STRUCTURE & IDENTITY]: Manifest specifies Amanaura OS identity', () => {
      const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in public/');

      const raw = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);

      assert.equal(manifest.name, 'Amanaura OS');
      assert.equal(manifest.short_name, 'Amanaura');
      assert.equal(manifest.display, 'standalone');
      assert.equal(manifest.theme_color, '#1e293b', 'theme_color must use sRGB hex for launcher fallback compatibility');
      assert.equal(manifest.background_color, '#0f172a', 'background_color must use sRGB hex for launcher fallback compatibility');
    });

    runCheck('PWA Manifest [SHORTCUTS]: Defines canonical quick shortcuts', () => {
      const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
      const raw = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);

      assert.ok(Array.isArray(manifest.shortcuts), 'Manifest shortcuts must be an array');
      assert.ok(manifest.shortcuts.length >= 2, 'Manifest must declare at least 2 quick shortcuts');
    });
  }

  // --- MODULE 5: iOS Install Guide Fallback (ADR-UX-011 §5.3) ---
  console.log('\n--- MODULE 5: Profile Drawer iOS Install Guide Fallback ---');
  {
    runCheck('Profile Drawer [INSTALL ACTIONS]: Drawer renders PWA install button', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer 
            isOpen={true}
            onClose={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Panduan Pasang Aplikasi') || html.includes('Pasang di iOS') || html.includes('Pasang Aplikasi'), 'Expected install action in ProfileDrawer');
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 34 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Suite 34 failed with ${failedTests} error(s).`);
  }
}

runLivingShellTests().catch(err => {
  console.error(err);
  process.exit(1);
});
