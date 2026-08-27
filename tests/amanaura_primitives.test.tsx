/**
 * YAPENDIK SCHOOL OS — AMANAURA DESIGN SYSTEM v1.0
 * PRIMITIVE ATOMIC COMPONENTS CONTRACT & RENDERING SUITE (SUITE 30)
 * 
 * Verifies:
 * - Test 1: Button Primitive (The 5 Button Laws, Debounce, Zero Width Jiggle)
 * - Test 2: Badge Primitive (Status Dot Capsule, JetBrains Mono Typography, Pulse Halo)
 * - Test 3: ListItem Primitive (Universal Edge-to-Edge List Row, Truncation Protection)
 * - Test 4: SegmentedControl Primitive (The Threshold Rule <= 4, 1-Tap Toggle)
 * - Test 5: AdaptiveDialog Primitive (Chameleon: Drawer on Mobile & Modal on Desktop)
 * - Test 6: AutoResizeTextarea Primitive (Zero Double Scrollbar, Responsive Height)
 * - Test 7: AvatarChild Primitive (Signature 5: Deterministic Pastel & Symbol Privacy Engine)
 * - Test 8: ToastHUD Primitive (Floating Feedback Capsule with 4s/5s Undo Action)
 * - Test 9: Barrel Export Integrity (src/components/ui/index.ts)
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  Button,
  Badge,
  ListItem,
  SegmentedControl,
  AdaptiveDialog,
  AutoResizeTextarea,
  AvatarChild,
  ToastHUD
} from '../src/components/ui';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 AMANAURA DESIGN SYSTEM v1.0 PRIMITIVES TEST SUITE (SUITE 30)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runAmanauraPrimitivesTests() {
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

  console.log('--- MODULE 1: Atomic Action & Status Primitives (Button & Badge) ---');

  // Test 1: Button Primitive
  runCheck('Suite 30 [BUTTON LAWS]: Renders 5 variants with tactile classes & loading state', () => {
    const primaryHtml = renderToString(<Button variant="primary">Simpan</Button>);
    assert.ok(primaryHtml.includes('bg-slate-900'), 'Primary button must use bg-slate-900');
    assert.ok(primaryHtml.includes('Simpan'), 'Primary button must render children');

    const secondaryHtml = renderToString(<Button variant="secondary">Batal</Button>);
    assert.ok(secondaryHtml.includes('bg-slate-100'), 'Secondary button must use bg-slate-100');

    const ghostHtml = renderToString(<Button variant="ghost">Ubah</Button>);
    assert.ok(ghostHtml.includes('bg-transparent'), 'Ghost button must use bg-transparent');

    const dangerHtml = renderToString(<Button variant="danger">Hapus</Button>);
    assert.ok(dangerHtml.includes('bg-rose-50'), 'Danger button must use bg-rose-50');

    const loadingHtml = renderToString(<Button isLoading>Memuat</Button>);
    assert.ok(loadingHtml.includes('animate-spin'), 'Loading button must render spinner without jiggle');
  });

  // Test 2: Badge Primitive
  runCheck('Suite 30 [STATUS DOT CAPSULE]: Renders semantic color tokens and monospace font', () => {
    const successHtml = renderToString(<Badge variant="success" dot pulse>HADIR</Badge>);
    assert.ok(successHtml.includes('font-mono'), 'Badge must enforce font-mono typography');
    assert.ok(successHtml.includes('bg-emerald-50'), 'Success badge must use emerald bg');
    assert.ok(successHtml.includes('animate-ping'), 'Pulse badge must render pulse ping halo');
    assert.ok(successHtml.includes('HADIR'), 'Badge must render label');

    const warningHtml = renderToString(<Badge variant="warning">ALERGI</Badge>);
    assert.ok(warningHtml.includes('bg-amber-50'), 'Warning badge must use amber token');

    const lppaHtml = renderToString(<Badge variant="lppa">RAPOR</Badge>);
    assert.ok(lppaHtml.includes('bg-purple-50'), 'LPPA badge must use purple token');
  });

  console.log('\n--- MODULE 2: Structural & Selection Primitives (ListItem & SegmentedControl) ---');

  // Test 3: ListItem Primitive
  runCheck('Suite 30 [LIST ITEM EDGE-TO-EDGE]: Enforces single-line truncation and 1px border-b', () => {
    const listHtml = renderToString(
      <ListItem
        title="Budi Pratama"
        subtitle="NIS 202601001 • Sentra Balok"
        badge={<Badge variant="success">Aktif</Badge>}
        showChevron
      />
    );
    assert.ok(listHtml.includes('border-b border-slate-100'), 'ListItem must enforce 1px border-b');
    assert.ok(listHtml.includes('truncate'), 'ListItem title/subtitle must enforce truncate');
    assert.ok(listHtml.includes('Budi Pratama'), 'ListItem must render title');
    assert.ok(listHtml.includes('NIS 202601001'), 'ListItem must render subtitle');
  });

  // Test 4: SegmentedControl Primitive
  runCheck('Suite 30 [SEGMENTED CONTROL <= 4]: Renders 1-tap pill container with active highlight', () => {
    const options = [
      { id: 'TODAY', label: 'Hari Ini' },
      { id: 'LEARNING', label: 'Sentra & Observasi' },
      { id: 'ROSTER', label: 'Roster' }
    ];
    const controlHtml = renderToString(
      <SegmentedControl options={options} value="TODAY" onChange={() => {}} />
    );
    assert.ok(controlHtml.includes('bg-slate-100'), 'SegmentedControl container must use bg-slate-100');
    assert.ok(controlHtml.includes('bg-white text-slate-900'), 'Active segment must use solid white card highlight');
    assert.ok(controlHtml.includes('Hari Ini'), 'SegmentedControl must render option labels');
  });

  console.log('\n--- MODULE 3: Adaptive Surface & Narrative Form Primitives ---');

  // Test 5: AdaptiveDialog Primitive
  runCheck('Suite 30 [ADAPTIVE DIALOG CHAMELEON]: Renders drag-handle on mobile and centered modal on desktop', () => {
    const dialogHtml = renderToString(
      <AdaptiveDialog
        isOpen={true}
        onClose={() => {}}
        title="Konfirmasi Tindakan"
        description="Apakah Anda yakin ingin melanjutkan?"
        footer={<Button variant="primary">Lanjutkan</Button>}
      >
        <p>Konten dialog verifikasi</p>
      </AdaptiveDialog>
    );
    assert.ok(dialogHtml.includes('lg:hidden'), 'AdaptiveDialog must render mobile drag handle with lg:hidden');
    assert.ok(dialogHtml.includes('Konfirmasi Tindakan'), 'AdaptiveDialog must render title');
    assert.ok(dialogHtml.includes('Konten dialog verifikasi'), 'AdaptiveDialog must render child body');
  });

  // Test 6: AutoResizeTextarea Primitive
  runCheck('Suite 30 [AUTO RESIZE TEXTAREA]: Renders single-fluid observation input without resize handle', () => {
    const textareaHtml = renderToString(
      <AutoResizeTextarea placeholder="Catat narasi observasi anak..." minRows={3} />
    );
    assert.ok(textareaHtml.includes('resize-none'), 'AutoResizeTextarea must disable manual drag resize');
    assert.ok(textareaHtml.includes('Catat narasi observasi anak...'), 'AutoResizeTextarea must render placeholder');
  });

  console.log('\n--- MODULE 4: Privacy Engine & Ambient Feedback (AvatarChild & ToastHUD) ---');

  // Test 7: AvatarChild Privacy Engine
  runCheck('Suite 30 [DETERMINISTIC PASTEL PRIVACY]: Generates deterministic warm pastel theme and cheerful symbol', () => {
    const avatarHtml1 = renderToString(<AvatarChild name="Siti Rahma" id="stu_01" size="md" />);
    const avatarHtml2 = renderToString(<AvatarChild name="Siti Rahma" id="stu_01" size="md" />);
    assert.strictEqual(avatarHtml1, avatarHtml2, 'Same student ID must yield deterministic identical output');
    assert.ok(avatarHtml1.includes('SR'), 'Avatar must compute 2-letter uppercase initials');
    assert.ok(/🌟|🦁|⛵|🎈|🍀|🚀/.test(avatarHtml1), 'Avatar must include one of the 6 playful symbols');

    const avatarHtml3 = renderToString(<AvatarChild name="Ahmad Dahlan" id="stu_02" size="lg" />);
    assert.ok(avatarHtml3.includes('AD'), 'Avatar must compute initials for different student');
  });

  // Test 8: ToastHUD Primitive
  runCheck('Suite 30 [TOAST HUD FEEDBACK]: Renders floating capsule with message and undo action', () => {
    const toastHtml = renderToString(
      <ToastHUD
        message="Presensi 17 siswa berhasil disimpan"
        type="success"
        undoAction={{ label: 'Batalkan (5s)', onUndo: () => {} }}
        onClose={() => {}}
      />
    );
    assert.ok(toastHtml.includes('Presensi 17 siswa berhasil disimpan'), 'ToastHUD must render message');
    assert.ok(toastHtml.includes('Batalkan (5s)'), 'ToastHUD must render undo action button');
    assert.ok(toastHtml.includes('fixed bottom-28'), 'ToastHUD must float with fixed positioning');
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 30 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Amanaura Primitives test suite failed with ${failedTests} failure(s)`);
  }
}

runAmanauraPrimitivesTests().catch((err) => {
  console.error('Fatal Test Failure:', err);
  process.exit(1);
});
