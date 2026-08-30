/**
 * @file stage6a_adaptive_chrome.test.tsx
 * @description Suite 33: Adaptive Chrome & Navigation Contracts (ADR-UX-011 §4 & §7)
 * 
 * Verifies:
 * 1. Route Registry & Page Title Resolution (All WorkspaceTab keys mapped)
 * 2. TopBar Context Bar Contract (Dynamic active title, presence marker ✦, zero bulky brand logo)
 * 3. Mobile Profile Drawer Contract (User identity, theme, 432Hz toggle, persona switcher, 48dp floor)
 * 4. Desktop Sidebar Flat Navigation Contract (Law R-8 text navigation, Amanaura OS branding)
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TopBar, WorkspaceTab } from '../src/components/layout/TopBar';
import { ProfileDrawer } from '../src/components/layout/ProfileDrawer';
import { Sidebar } from '../src/components/layout/Sidebar';
import { ROUTE_REGISTRY, getTabMetadata } from '../src/config/routeRegistry';
import { SecurityContextProvider } from '../src/auth/context';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A ADAPTIVE CHROME & NAVIGATION (SUITE 33)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runAdaptiveChromeTests() {
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

  // --- MODULE 1: Route Registry & Page Title Resolution ---
  console.log('--- MODULE 1: Route Registry & Page Title Resolution ---');
  {
    runCheck('Route Registry [TEACHER_HOME]: Resolves to "Beranda Kelas" (<= 2 words)', () => {
      const meta = getTabMetadata('TEACHER_HOME');
      assert.equal(meta.title, 'Beranda Kelas');
      assert.equal(meta.category, 'Ruang Kelas');
      assert.ok(meta.title.split(' ').length <= 2, 'Title must be <= 2 words');
      assert.ok(meta.title.length <= 16, 'Title must be <= 16 chars');
    });

    runCheck('Route Registry [FOUNDATION]: Resolves to "Console Yayasan" (<= 2 words)', () => {
      const meta = getTabMetadata('FOUNDATION_GOVERNANCE');
      assert.equal(meta.title, 'Console Yayasan');
      assert.equal(meta.category, 'Standar Akademik');
      assert.ok(meta.title.split(' ').length <= 2, 'Title must be <= 2 words');
      assert.ok(meta.title.length <= 16, 'Title must be <= 16 chars');
    });

    runCheck('Route Registry [GUARDIAN]: Resolves to "Portal Keluarga" (<= 2 words)', () => {
      const meta = getTabMetadata('GUARDIAN_WORKSPACE');
      assert.equal(meta.title, 'Portal Keluarga');
      assert.equal(meta.category, 'Keluarga');
      assert.ok(meta.title.split(' ').length <= 2, 'Title must be <= 2 words');
      assert.ok(meta.title.length <= 16, 'Title must be <= 16 chars');
    });

    runCheck('Route Registry [HEADMASTER]: Resolves to "Kotak Kebijakan" (<= 2 words)', () => {
      const meta = getTabMetadata('HEADMASTER_ADOPTION');
      assert.equal(meta.title, 'Kotak Kebijakan');
      assert.equal(meta.category, 'Manajemen Unit');
      assert.ok(meta.title.split(' ').length <= 2, 'Title must be <= 2 words');
      assert.ok(meta.title.length <= 16, 'Title must be <= 16 chars');
    });

    runCheck('Route Registry [FALLBACK]: Gracefully handles unknown tabs with fallback', () => {
      const meta = getTabMetadata('UNKNOWN_TAB' as any);
      assert.equal(meta.title, 'Ruang Kerja');
    });
  }

  // --- MODULE 2: TopBar Context Bar Contract ---
  console.log('\n--- MODULE 2: TopBar Context Bar (ADR-UX-011 §4.1) ---');
  {
    runCheck('TopBar [CONTEXT TITLE]: Renders dynamic active page title "Beranda Kelas"', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar 
            activeTab="TEACHER_HOME"
            onOpenSupabaseModal={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Beranda Kelas'), 'Expected "Beranda Kelas" in TopBar HTML');
    });

    runCheck('TopBar [PRESENCE MARKER]: Renders Amanaura Breath ✦ presence glyph', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar 
            activeTab="TEACHER_HOME"
            onOpenSupabaseModal={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('✦'), 'Expected "✦" presence marker glyph in TopBar HTML');
      assert.ok(html.includes('animate-amanaura-breath'), 'Expected animate-amanaura-breath class on marker');
    });

    runCheck('TopBar [NON-BRAND BAR]: Zero bulky "Yapendik OS ✦" logo banner in TopBar', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar 
            activeTab="TEACHER_HOME"
            onOpenSupabaseModal={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('Yapendik OS ✦'), 'Did not expect bulky "Yapendik OS ✦" logo in TopBar');
    });

    runCheck('TopBar [NO THEME TOGGLE]: Theme toggle is removed from TopBar (moved to Profile/Sidebar)', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar 
            activeTab="TEACHER_HOME"
            onOpenSupabaseModal={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('Beralih ke Ivory Canvas'), 'Did not expect theme toggle in TopBar');
    });
  }

  // --- MODULE 3: Mobile Profile Drawer Contract ---
  console.log('\n--- MODULE 3: Mobile Profile Drawer (ADR-UX-011 §4.2) ---');
  {
    runCheck('ProfileDrawer [RENDER]: Drawer renders open in bottom-sheet DOM', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer 
            isOpen={true}
            onClose={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="profile-drawer"'), 'Expected profile-drawer testid in rendered HTML');
      assert.ok(html.includes('Amanaura OS'), 'Expected "Amanaura OS" header in drawer');
    });

    runCheck('ProfileDrawer [THEME CONTROL & 432Hz]: Renders visual theme selector and audio gate toggle', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer 
            isOpen={true}
            onClose={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Tema Visual'), 'Expected Tema Visual setting');
      assert.ok(html.includes('Denting 432Hz'), 'Expected Denting 432Hz toggle');
    });

    runCheck('ProfileDrawer [48dp FLOOR]: PWA and Sign Out action buttons enforce 48dp floor', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer 
            isOpen={true}
            onClose={() => {}}
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('min-h-[48px]'), 'Expected min-h-[48px] class on drawer buttons');
      assert.ok(html.includes('Keluar dari Sesi'), 'Expected Sign Out button');
    });
  }

  // --- MODULE 4: Desktop Sidebar Flat Navigation (Law R-8) ---
  console.log('\n--- MODULE 4: Desktop Sidebar & Law R-8 (ADR-UX-011 §4.3 & §7.1) ---');
  {
    runCheck('Sidebar [BRAND HEADER]: Renders official "Amanaura OS ✦" platform identity', () => {
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
      assert.ok(html.includes('Amanaura OS'), 'Expected "Amanaura OS" in Sidebar header');
      assert.ok(html.includes('font-serif'), 'Expected font-serif style on brand');
    });

    runCheck('Sidebar [LAW R-8 ACTIVE]: Active link uses 2px left accent line (border-l-2 border-brand-primary)', () => {
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
      assert.ok(html.includes('border-brand-primary'), 'Expected border-brand-primary on active link');
      assert.ok(html.includes('border-l-2'), 'Expected border-l-2 on active link');
    });

    runCheck('Sidebar [LAW R-8 REST]: Inactive link uses transparent border without boxed container', () => {
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
      assert.ok(html.includes('border-transparent'), 'Expected border-transparent on inactive links');
    });

    runCheck('Sidebar [THEME TOGGLE]: Sidebar renders desktop theme switch button', () => {
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
      assert.ok(html.includes('Beralih ke'), 'Expected theme toggle in Sidebar');
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 33 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Suite 33 failed with ${failedTests} error(s).`);
  }
}

runAdaptiveChromeTests().catch(err => {
  console.error(err);
  process.exit(1);
});
