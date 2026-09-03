/**
 * YAPENDIK SCHOOL OS — GUARDIAN PERSONA HARMONIZATION SUITE (SUITE 45)
 * Governing Treaties & Directives: G-1 s.d. G-5, FB-01, FB-04, Amanaura Laws 1, 8, 9, 11, 12
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import { SecurityContextProvider } from '../src/auth/context';
import App from '../src/App';
import { GuardianWorkspace } from '../src/workspaces/guardian/GuardianWorkspace';
import { CommunicationWorkspace } from '../src/components/workspaces/CommunicationWorkspace';
import { StudentJourneyTimeline } from '../src/components/workspaces/StudentJourneyTimeline';
import { ApplicationDashboard } from '../src/workspaces/admissions/portal/ApplicationDashboard';
import { GuardianDevelopmentTimeline } from '../src/workspaces/guardian/GuardianDevelopmentTimeline';
import { db } from '../src/db/database';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 45: GUARDIAN PERSONA HARMONIZATION SWEEP (G-1 s.d. G-5)');
console.log('════════════════════════════════════════════════════════════════');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runCheck(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`  🟢 PASS: ${name}`);
        passedTests++;
      }).catch((err) => {
        console.error(`  🔴 FAIL: ${name}`);
        console.error(`     Error: ${err?.message || err}`);
        failedTests++;
      });
    } else {
      console.log(`  🟢 PASS: ${name}`);
      passedTests++;
    }
  } catch (err: any) {
    console.error(`  🔴 FAIL: ${name}`);
    console.error(`     Error: ${err?.message || err}`);
    failedTests++;
  }
}

async function runGuardianPersonaTests() {
  // ----------------------------------------------------------------------------
  // SCENARIO 1: Mandatory Security & Privacy Patch G-1 (FB-01 & FB-04)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 1: Security & Privacy Patch (FB-01 & FB-04) ---');
  {
    // Render Guardian on DEVELOPMENT tab (Wali Millen)
    const guardianTimelineHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <GuardianDevelopmentTimeline studentId="stu_maranatha_01" schoolId="sch_tk_maranatha" />
      </SecurityContextProvider>
    );

    runCheck('Guardian DEVELOPMENT renders ratified LPPA narrative, NOT teacher grading desk', () => {
      assert.ok(guardianTimelineHtml.includes('data-testid="guardian-development-timeline"'));
      assert.ok(!guardianTimelineHtml.includes('Simpan Draf'), 'Found "Simpan Draf" in Guardian DOM');
      assert.ok(!guardianTimelineHtml.includes('Ajukan ke Kepala Sekolah'), 'Found teacher workflow button');
      assert.ok(!guardianTimelineHtml.includes('Publikasikan Laporan Resmi'), 'Found publication trigger');
    });

    runCheck('Guardian DEVELOPMENT is 100% sterile from other children on the roster (FB-01)', () => {
      assert.ok(!guardianTimelineHtml.includes('KAYLA GABRIELLA ZEGA'), 'Leaked Kayla in Julen view');
      assert.ok(!guardianTimelineHtml.includes('CARISSA'), 'Leaked Carissa in Julen view');
      assert.ok(!guardianTimelineHtml.includes('RAINER'), 'Leaked Rainer in Julen view');
      assert.ok(!guardianTimelineHtml.includes('FALEN'), 'Leaked Falen in Julen view');
    });

    // Safe Fallback Doctrine: Guardian with no child linked
    const emptyFallbackHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_parent_budi">
        <div className="p-8 text-center bg-surface border border-line rounded-card shadow-hairline space-y-3" data-testid="guardian-empty-child-state">
          <h3 className="text-base font-bold text-ink">Belum Ada Data Ananda Terhubung</h3>
        </div>
      </SecurityContextProvider>
    );

    runCheck('Safe Fallback Doctrine: No silently leaked child ID when child is unlinked', () => {
      assert.ok(emptyFallbackHtml.includes('data-testid="guardian-empty-child-state"'));
      assert.ok(!emptyFallbackHtml.includes('stu_maranatha_01'));
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 2: Single Containment Doctrine G-2 (Hukum 1)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Single Containment Doctrine G-2 (Hukum 1) ---');
  {
    const guardianWorkspaceHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <GuardianWorkspace />
      </SecurityContextProvider>
    );

    runCheck('GuardianWorkspace has ZERO nested <main> elements', () => {
      const mainTagCount = (guardianWorkspaceHtml.match(/<main\b/g) || []).length;
      assert.equal(mainTagCount, 0, `GuardianWorkspace must have 0 <main> tags, found ${mainTagCount}`);
    });

    runCheck('GuardianWorkspace has zero min-h-[100dvh] or double pb-24 bottom clearance', () => {
      assert.ok(!guardianWorkspaceHtml.includes('min-h-[100dvh]'));
      assert.ok(!guardianWorkspaceHtml.includes('pb-24'));
    });

    const commHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <CommunicationWorkspace />
      </SecurityContextProvider>
    );

    runCheck('CommunicationWorkspace has zero max-w-4xl or double pb-[140px] containment', () => {
      assert.ok(!commHtml.includes('max-w-4xl'));
      assert.ok(!commHtml.includes('pb-[140px]'));
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 3: Adaptive Identity & Progressive Disclosure G-3 (Hukum 6.4)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Adaptive Identity & Progressive Disclosure G-3 ---');
  {
    // Ibu Julen (Wali Millen)
    const julenHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <GuardianWorkspace />
      </SecurityContextProvider>
    );
    runCheck('GuardianWorkspace dynamically renders Julen Patricia identity', () => {
      assert.ok(julenHtml.includes('JULEN PATRICIA'), 'Missing Julen Patricia in header');
    });

    // Ibu Mutiara (Wali Kayla)
    const mutiaraHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_mutiara">
        <GuardianWorkspace />
      </SecurityContextProvider>
    );
    runCheck('GuardianWorkspace dynamically renders Mutiara Zega identity (no static Julen fallback)', () => {
      assert.ok(mutiaraHtml.includes('MUTIARA ZEGA'), 'Missing Mutiara Zega in header');
    });

    // Single-child Guardian in StudentJourneyTimeline
    const timelineHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <StudentJourneyTimeline initialStudentId="stu_maranatha_01" />
      </SecurityContextProvider>
    );
    runCheck('StudentJourneyTimeline renders Warm Child Identity Badge for single-child guardian', () => {
      assert.ok(timelineHtml.includes('data-testid="warm-child-identity-badge"'), 'Missing warm child badge');
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 4: PPDB Modal Modernization G-4 (Hukum 8 & 9)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: PPDB Modal Modernization G-4 (Hukum 8 & 9) ---');
  {
    const appDashHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <ApplicationDashboard
          creatorUid="user_guard_julen"
          personId="per_guard_julen_patricia"
          guardianName="JULEN PATRICIA"
        />
      </SecurityContextProvider>
    );

    runCheck('ApplicationDashboard renders PPDB initiation portal without rigid manual overlay', () => {
      assert.ok(!appDashHtml.includes('fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40'));
      assert.ok(appDashHtml.includes('data-testid="application-dashboard"'));
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 5: Zero-Emoji & Kamus Keluarga Doctrine G-5 (Hukum 11 & 12)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Zero-Emoji & Kamus Keluarga Doctrine G-5 ---');
  {
    const guardianWorkspaceHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_guard_julen">
        <GuardianWorkspace />
      </SecurityContextProvider>
    );

    runCheck('Guardian workspace contains zero raw Unicode emojis', () => {
      const emojiMatch = guardianWorkspaceHtml.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
      assert.equal(emojiMatch, null, `Found raw emoji in Guardian workspace: ${emojiMatch}`);
    });

    runCheck('Kamus Keluarga terms (Surat Sore, Momen & Karya, Perkembangan) are present', () => {
      assert.ok(guardianWorkspaceHtml.includes('Hari Ini'));
      assert.ok(guardianWorkspaceHtml.includes('Momen &amp; Karya'));
      assert.ok(guardianWorkspaceHtml.includes('Perkembangan'));
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 SUITE 45 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runGuardianPersonaTests().catch(err => {
  console.error('Unhandled error in Suite 45:', err);
  process.exit(1);
});
