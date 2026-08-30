/**
 * @file stage6a_weight_discipline_vrt.test.tsx
 * @description Suite 35: Weight Discipline, Law R-8/R-9 & VRT Final Verification (ADR-UX-011 §7 & §8)
 * 
 * Verifies:
 * 1. Law R-8 (Navigation is Text, Not Objects — 2px left accent line, zero boxed containers at rest)
 * 2. Law R-9 (Icons are Glyphs, Not Badges — Zero decorative badge wrappers)
 * 3. Flat Fluid Legibility Ladder (Lv 1-7 Pure Structure)
 * 4. VRT Final Re-Baseline (84 snapshots, 3 viewports × 2 themes)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Sidebar } from '../src/components/layout/Sidebar';
import { SecurityContextProvider } from '../src/auth/context';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A WEIGHT DISCIPLINE & VRT FINAL (SUITE 35)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runWeightDisciplineTests() {
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

  // --- MODULE 1: Law R-8 (Navigation is Text, Not Objects) ---
  console.log('--- MODULE 1: Law R-8 Flat Text Navigation ---');
  {
    runCheck('Law R-8 [REST STATE]: Inactive navigation items are flat without background boxes', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar 
            activeTab="TEACHER_HOME"
            onSelectTab={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('border-transparent'), 'Expected border-transparent for rest state');
      assert.ok(html.includes('text-ink-soft'), 'Expected text-ink-soft for rest state');
    });

    runCheck('Law R-8 [ACTIVE ACCENT]: Active navigation item uses 2px left accent line', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar 
            activeTab="TEACHER_HOME"
            onSelectTab={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('border-brand-primary'), 'Expected border-brand-primary for active link');
      assert.ok(html.includes('border-l-2'), 'Expected border-l-2 for active link');
    });

    runCheck('Law R-8 [TOUCH TARGET FLOOR]: Navigation items enforce minimum 48dp height', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar 
            activeTab="TEACHER_HOME"
            onSelectTab={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('min-h-[48px]'), 'Expected min-h-[48px] on sidebar navigation items');
    });
  }

  // --- MODULE 2: Law R-9 (Icons are Glyphs, Not Badges) ---
  console.log('\n--- MODULE 2: Law R-9 Naked Glyphs ---');
  {
    runCheck('Law R-9 [REFINED ICON SCALING]: Icons use proportional rem sizing', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar 
            activeTab="TEACHER_HOME"
            onSelectTab={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('w-[1.125rem]') || html.includes('w-4.5') || html.includes('w-4'), 'Expected rem-scaled icons');
    });

    runCheck('Law R-9 [ZERO BOXED ICON WRAPPERS]: Sidebar nav contains no decorative icon badge boxes', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar 
            activeTab="TEACHER_HOME"
            onSelectTab={() => {}}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('bg-brand/10 p-2 rounded-lg'), 'Sidebar icons must not be enclosed in decorative badge boxes');
    });
  }

  // --- MODULE 3: Flat Fluid Addendum III Legibility Ladder ---
  console.log('\n--- MODULE 3: Flat Fluid Legibility Ladder (Lv 1-7) ---');
  {
    runCheck('Legibility Ladder [HAIRLINES & TONE BANDS]: Clean semantic dividers without heavy borders', () => {
      const indexCssPath = path.resolve(process.cwd(), 'src', 'index.css');
      const css = fs.readFileSync(indexCssPath, 'utf8');
      assert.ok(css.includes('--line:'), 'CSS must define --line token');
      assert.ok(css.includes('--surface-subtle:'), 'CSS must define --surface-subtle tone band');
    });
  }

  // --- MODULE 4: VRT Final Re-Baseline (84 Snapshots) ---
  console.log('\n--- MODULE 4: VRT Final Re-Baseline Manifest Verification ---');
  {
    runCheck('VRT Manifest [84 SNAPSHOTS]: Manifest verifies complete 3 viewports × 2 themes baseline', () => {
      const manifestPath = path.resolve(process.cwd(), 'tests', 'vrt-baseline', 'v5.0_amanaura_flow', 'manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'VRT v5.0 manifest.json must exist');

      const raw = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);

      assert.equal(manifest.totalCaptures, 84, 'VRT must capture exactly 84 snapshots (14 routes × 3 viewports × 2 themes)');
      assert.ok(manifest.masterBaselineHash, 'Master baseline hash must be present');
      assert.equal(manifest.files.length, 84, 'Files array must contain 84 entries');
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 35 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Suite 35 failed with ${failedTests} error(s).`);
  }
}

runWeightDisciplineTests().catch(err => {
  console.error(err);
  process.exit(1);
});
