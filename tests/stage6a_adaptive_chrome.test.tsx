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
import { MobileOmniBar } from '../src/components/layout/MobileOmniBar';
import { ROUTE_REGISTRY, getTabMetadata, getRouteLabel } from '../src/config/routeRegistry';
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

    runCheck('Route Registry [HARMONIZED CANONICALS]: Verifies unified Indonesian terminology', () => {
      assert.equal(getRouteLabel('COHORT_PROMOTION'), 'Kenaikan Kelas');
      assert.equal(getRouteLabel('GRADUATION_REGISTRY'), 'Buku Induk');
      assert.equal(getRouteLabel('ATTENDANCE'), 'Presensi Harian');
      assert.equal(getRouteLabel('GOVERNANCE'), 'Audit Tata Kelola');
      assert.equal(getRouteLabel('PROVISIONING'), 'Kesiapan Unit');
    });

    runCheck('Route Registry [CONTEXTUAL LABELS]: Resolves role-tailored titles for DEVELOPMENT', () => {
      assert.equal(getRouteLabel('DEVELOPMENT', 'HEADMASTER'), 'Verifikasi LPPA');
      assert.equal(getRouteLabel('DEVELOPMENT', 'GUARDIAN'), 'Perkembangan Ananda');
      assert.equal(getRouteLabel('DEVELOPMENT', 'TEACHER'), 'Rapor LPPA');
      assert.equal(getRouteLabel('ADMISSIONS_PORTAL', 'APPLICANT'), 'Pendaftaran PPDB');
      assert.equal(getRouteLabel('ADMISSIONS_PORTAL', 'YAPENDIK_SUPERADMIN'), 'Portal PPDB');
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
          <TopBar activeTab="TEACHER_HOME" />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Beranda Kelas'), 'Expected "Beranda Kelas" in TopBar HTML');
    });

    runCheck('TopBar [PRESENCE MARKER]: Renders Amanaura Breath ✦ presence glyph', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar activeTab="TEACHER_HOME" />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('✦'), 'Expected "✦" presence marker glyph in TopBar HTML');
      assert.ok(html.includes('animate-amanaura-breath'), 'Expected animate-amanaura-breath class on marker');
    });

    runCheck('TopBar [NON-BRAND BAR]: Zero bulky "Yapendik OS ✦" logo banner in TopBar', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar activeTab="TEACHER_HOME" />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('Yapendik OS ✦'), 'Did not expect bulky "Yapendik OS ✦" logo in TopBar');
    });

    runCheck('TopBar [PURE CLEAN CONTEXT BAR]: Zero avatar button or dropdown menu in TopBar', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <TopBar activeTab="TEACHER_HOME" />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('Buka Menu Profil'), 'Did not expect avatar menu trigger in clean TopBar');
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
            onClose={() => { }}
            onSelectTab={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="profile-drawer"'), 'Expected profile-drawer testid in rendered HTML');
      assert.ok(html.includes('Amanaura OS'), 'Expected "Amanaura OS" header in drawer');
    });

    runCheck('ProfileDrawer [PROFILE HUB V2]: Full Profile Hub with photo, name card, credentials & completion action (ADR-UX-013)', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer
            isOpen={true}
            onClose={() => { }}
            onSelectTab={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Profil Saya'), 'Expected Profil Saya header');
      assert.ok(!html.includes('Tema Visual'), 'Did not expect Tema Visual in ProfileDrawer (moved to sheet footer & sidebar)');
      assert.ok(!html.includes('Denting 432Hz'), 'Did not expect Denting 432Hz in ProfileDrawer (single control point on dashboard)');
      assert.ok(!html.includes('Living Contract'), 'Did not expect Living Contract in ProfileDrawer');
      assert.ok(html.includes('data-testid="btn-drawer-done"'), 'Expected done/save action in Profile Hub');
      assert.ok(html.includes('Simpan Profil'), 'Expected Simpan Profil label in Profile Hub');
      assert.ok(html.includes('data-testid="btn-change-photo"'), 'Expected change photo trigger in Profile Hub');
      assert.ok(html.includes('data-testid="btn-open-namecard"'), 'Expected open namecard trigger in Profile Hub');
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
            onSelectTab={() => { }}
            isCollapsed={false}
            onToggleCollapse={() => { }}
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
            onSelectTab={() => { }}
            isCollapsed={false}
            onToggleCollapse={() => { }}
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
            onSelectTab={() => { }}
            isCollapsed={false}
            onToggleCollapse={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('border-transparent'), 'Expected border-transparent on inactive links');
    });

    runCheck('Sidebar [THEME & SIGNOUT UTILITIES]: Desktop Sidebar renders Theme Visual and Sign Out utilities', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar
            activeTab="TEACHER_HOME"
            onSelectTab={() => { }}
            isCollapsed={false}
            onToggleCollapse={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Tema Visual'), 'Expected Theme Visual in Sidebar');
      assert.ok(html.includes('Keluar dari Sesi'), 'Expected Keluar dari Sesi in Sidebar');
    });

    runCheck('Sidebar [USER PROFILE]: Desktop Sidebar renders user persona profile trigger', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <Sidebar
            activeTab="TEACHER_HOME"
            onSelectTab={() => { }}
            isCollapsed={false}
            onToggleCollapse={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Menu Profil'), 'Expected Profile trigger in Sidebar');
    });
  }

  // --- MODULE 5: Mobile Slide-Up Chevron & Menu Navigasi (ADR-UX-012) ---
  console.log('\n--- MODULE 5: Mobile Slide-Up Chevron & Menu Navigasi (ADR-UX-012) ---');
  {
    runCheck('MobileOmniBar [DISCRETE CHEVRON HANDLE]: Renders discrete bottom chevron handle (G-3)', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <MobileOmniBar
            activeTab="TEACHER_HOME"
            onSelectTab={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('aria-label="Buka Menu Navigasi"'), 'Expected aria-label="Buka Menu Navigasi" on chevron handle');
      assert.ok(html.includes('min-h-[48px]'), 'Expected min-h-[48px] touch floor on chevron handle');
      assert.ok(html.includes('data-testid="mobile-chevron-handle"'), 'Expected mobile-chevron-handle testid');
    });

    runCheck('MobileOmniBar [HORIZON HANDLE PURE]: Pure hairline with center Lucide ChevronUp and ZERO text noise', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <MobileOmniBar 
            activeTab="TEACHER_HOME"
            onSelectTab={() => {}}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('via-line-strong') || html.includes('via-line-soft') || html.includes('bg-line-soft'), 'Expected line gradient in horizon handle');
      assert.ok(html.includes('text-accent-valor'), 'Expected text-accent-valor golden chevron in horizon handle (Dawn Aura v4)');
      assert.ok(html.includes('rounded-t-2xl'), 'Expected peeking notch rounded-t-2xl in horizon handle (Dawn Aura v4)');
      assert.ok(!html.includes('>Menu<'), 'Expected zero text node (no "Menu") in handle');
    });

    runCheck('MobileOmniBar [ZERO BULKY CAPSULE]: Zero bulky "Apa fokus Anda hari ini?" capsule in collapsed dock', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <MobileOmniBar
            activeTab="TEACHER_HOME"
            onSelectTab={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('Apa fokus Anda hari ini?'), 'Did not expect bulky "Apa fokus Anda hari ini?" capsule');
    });

    runCheck('MobileOmniBar [ZERO RAW CHEVRON GLYPH]: Zero raw character "⌃" (Law 11 / G-3)', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <MobileOmniBar
            activeTab="TEACHER_HOME"
            onSelectTab={() => { }}
          />
        </SecurityContextProvider>
      );
      assert.ok(!html.includes('⌃'), 'Expected Lucide icon instead of raw glyph "⌃"');
    });

    runCheck('MobileOmniBar [SINGLE SURFACE LAUNCHER]: 3x3 9-tile grid with Profil tile and utility footer rows (Addendum VIII)', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <MobileOmniBar
            activeTab="TEACHER_HOME"
            onSelectTab={() => { }}
            initialExpanded={true}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('9 Modul'), 'Expected 9 Modul in header');
      assert.ok(html.includes('Profil'), 'Expected Profil 9th tile in grid');
      assert.ok(html.includes('grid-cols-3'), 'Expected 3-column grid');
      assert.ok(html.includes('Tema Visual'), 'Expected Tema Visual in utility footer');
      assert.ok(html.includes('Ivory'), 'Expected Ivory option in segmented toggle');
      assert.ok(html.includes('Midnight'), 'Expected Midnight option in segmented toggle');
      assert.ok(html.includes('Keluar dari Sesi'), 'Expected Keluar dari Sesi in utility footer');
      assert.ok(html.includes('bg-danger-tint'), 'Expected danger tint on sign out row');
      assert.ok(!html.includes('Cari modul atau menu'), 'Expected zero search input in COMPACT sheet');
      assert.ok(!html.includes('Uji Otorisasi Sistem'), 'Expected zero TESTS row in COMPACT sheet');
      assert.ok(!html.includes('Living Contract &amp; Token Specimen'), 'Expected zero Living Contract row in COMPACT sheet');
    });

    runCheck('MobileOmniBar [HEADMASTER MOBILE PARITY]: Renders "Verifikasi LPPA" and "Data Roster" in mobile sheet', () => {
      const html = renderToString(
        <SecurityContextProvider initialPersonaId="user_headmaster_sheryl">
          <MobileOmniBar
            activeTab="HEADMASTER_ADOPTION"
            onSelectTab={() => { }}
            initialExpanded={true}
          />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('Verifikasi LPPA'), 'Expected "Verifikasi LPPA" in Headmaster mobile menu');
      assert.ok(html.includes('Data Roster'), 'Expected "Data Roster" in Headmaster mobile menu');
      assert.ok(html.includes('Kenaikan Kelas'), 'Expected "Kenaikan Kelas" in Headmaster mobile menu');
      assert.ok(html.includes('Buku Induk'), 'Expected "Buku Induk" in Headmaster mobile menu');
      assert.ok(!html.includes('Audit Tata Kelola'), 'Did not expect Audit Tata Kelola in Headmaster mobile menu');
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
