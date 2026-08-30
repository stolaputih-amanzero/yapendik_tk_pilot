import { SelectSheet } from '../ui';
/**
 * Yapendik School OS — Authorization & Security Testing Suite
 * Validates Contextual Authorization (USER + ROLE + SCHOOL CONTEXT + RELATIONSHIP + ACTION + RESOURCE)
 * and verifies Negative Authorization test cases as mandated by the Constitution.
 */

import React, { useState } from 'react';
import { runAuthorizationTestSuite, TestResult } from '../../tests/authorizationTests';
import { evaluateAuthorization, SecurityContext, ActionType, ResourceType } from '../../auth/authorization';
import { useSecurityContext } from '../../auth/context';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  RefreshCw, 
  Sliders,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Role } from '../../domain/types';

export const AuthorizationTestingWorkspace: React.FC = () => {
  const { currentPersona } = useSecurityContext();
  const [suiteResults, setSuiteResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
  }>(() => runAuthorizationTestSuite());

  // Interactive Custom Simulator State
  const [simRole, setSimRole] = useState<Role>('TEACHER');
  const [simUserSchool, setSimUserSchool] = useState<string>('sch_tk_yapendik_02'); // School 2
  const [simTargetSchool, setSimTargetSchool] = useState<string>('sch_tk_yapendik_01'); // School 1
  const [simAction, setSimAction] = useState<ActionType>('CREATE');
  const [simResource, setSimResource] = useState<ResourceType>('STUDENT_OBSERVATION');
  const [simTargetPersonId, setSimTargetPersonId] = useState<string>('per_child_alina');
  const [simIsConfidential, setSimIsConfidential] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const handleRunAllTests = () => {
    const res = runAuthorizationTestSuite();
    setSuiteResults(res);
  };

  const handleRunSimulator = () => {
    const simContext: SecurityContext = {
      userId: 'sim_user',
      personId: 'sim_person',
      personName: 'Simulated User',
      role: simRole,
      activeSchoolId: simUserSchool,
      assignedClasses: ['cls_sim'],
      guardianChildrenPersonIds: ['per_child_kenzo'], // Parent only of Kenzo
      isSuperAdmin: simRole === 'YAPENDIK_SUPERADMIN'
    };

    const evalResult = evaluateAuthorization({
      context: simContext,
      action: simAction,
      resource: simResource,
      resourceSchoolId: simTargetSchool,
      targetStudentPersonId: simTargetPersonId,
      isConfidential: simIsConfidential
    });

    setSimResult(evalResult);
  };

  return (
    <div className="px-4 medium:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-surface border border-line-hairline rounded-card p-4 shadow-hairline flex flex-col medium:flex-row medium:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-deep uppercase tracking-wider mb-1 whitespace-nowrap">
            <Lock className="w-4 h-4 text-brand-deep shrink-0" />
            <span>Constitutional Security Gate — Contextual Policy Engine</span>
          </div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-deep shrink-0" />
            <span>Automated Negative &amp; Positive Authorization Testing</span>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Verifikasi ketat batas multi-sekolah, proteksi data anak (PII), hak wali murid, dan pencegahan eskalasi wewenang.
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          className="w-full medium:w-auto mt-3 medium:mt-0 bg-brand hover-only:opacity-90 text-on-brand text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 shrink-0 shadow-hairline"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Jalankan Seluruh Uji Otorisasi</span>
        </button>
      </div>

      {/* Test Suite Summary Banner */}
      <div className="grid grid-cols-1 medium:grid-cols-3 gap-4">
        <div className="bg-surface border border-line rounded-lg p-4 shadow-hairline flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-ink-soft">Total Skenario Uji</div>
            <div className="text-2xl font-black text-ink mt-0.5">{suiteResults.total} Kasus</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center font-mono font-bold text-ink-soft whitespace-nowrap">
            {suiteResults.total}
          </div>
        </div>

        <div className="bg-surface border border-success-line rounded-lg p-4 shadow-hairline flex items-center justify-between bg-success-tint/20">
          <div>
            <div className="text-xs font-medium text-success-deep">Lolos Uji (Verified)</div>
            <div className="text-2xl font-black text-success-deep mt-0.5">{suiteResults.passed} Lolos</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>

        <div className="bg-surface border border-line rounded-lg p-4 shadow-hairline flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-ink-soft">Gagal / Regresi</div>
            <div className={`text-2xl font-black mt-0.5 ${suiteResults.failed > 0 ? 'text-danger' : 'text-ink-faint'}`}>
              {suiteResults.failed} Gagal
            </div>
          </div>
          {suiteResults.failed > 0 ? (
            <XCircle className="w-8 h-8 text-danger" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-success" />
          )}
        </div>
      </div>

      {/* Automated Tests Table */}
      <div className="bg-surface border border-line rounded-lg shadow-hairline overflow-hidden">
        <div className="p-4 border-b border-line-soft bg-surface-subtle flex items-center justify-between">
          <h2 className="font-bold text-ink text-xs uppercase tracking-wider tracking-wide">
            Daftar Eksekusi Uji Otorisasi Kontekstual
          </h2>
          <span className="text-[11px] font-mono text-ink-soft whitespace-nowrap">
            Engine: PolicyEvaluator v1.0
          </span>
        </div>

        <div className="divide-y divide-line-soft">
          {suiteResults.results.map(t => {
            const isNegative = t.category.startsWith('NEGATIVE');
            return (
              <div key={t.id} className="p-4 hover-only:bg-surface-subtle/60 transition-colors space-y-2">
                <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger shrink-0" />
                    )}
                    <span className="font-bold text-ink text-xs">{t.name}</span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-1 rounded border ${
                      isNegative ? 'bg-danger-tint text-danger-deep border-danger-line' : 'bg-info-tint text-info-deep border-info-line'
                    }`}>
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] font-mono text-ink-soft whitespace-nowrap">
                      Ekspektasi: <b className={t.expected === 'ALLOW' ? 'text-success-deep' : 'text-danger-deep'}>{t.expected}</b>
                    </span>
                    <span className="text-[11px] font-mono text-ink-soft whitespace-nowrap">→</span>
                    <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded ${
                      t.actual === 'ALLOW' ? 'bg-success-tint text-success-deep' : 'bg-danger-tint text-danger-deep'
                    }`}>
                      Hasil: {t.actual}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-ink-soft pl-6 space-y-1">
                  <div>
                    <span className="font-medium text-ink">Skenario:</span> {t.scenario}
                  </div>
                  <div className="text-[11px] text-ink-soft font-mono whitespace-nowrap">
                    <span className="font-medium text-ink-soft">Kode Evaluasi:</span> [{t.code}] {t.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Simulator Card */}
      <div className="bg-surface border border-line rounded-lg p-4 shadow-hairline space-y-4">
        <div className="flex items-center space-x-2 border-b border-line-soft pb-3">
          <Sliders className="w-4 h-4 text-ink-soft" />
          <h2 className="font-bold text-ink text-sm">
            Simulator Uji Otorisasi Interaktif (Live Policy Matrix)
          </h2>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-ink-soft mb-1">Peran Pengguna (Role):</label>
            <SelectSheet value={simRole}   options={[{ value: "TEACHER", label: "TEACHER (Pendidik)" }, { value: "HEADMASTER", label: "HEADMASTER (Kepala Sekolah)" }, { value: "GUARDIAN", label: "GUARDIAN (Orang Tua / Wali)" }, { value: "STAFF", label: "STAFF (Tenaga Kependidikan)" }, { value: "YAPENDIK_SUPERADMIN", label: "YAPENDIK_SUPERADMIN (Yayasan)" }]} />
          </div>

          <div>
            <label className="block font-semibold text-ink-soft mb-1">Asal Sekolah Pengguna:</label>
            <SelectSheet value={simUserSchool}   options={[{ value: "sch_tk_yapendik_01", label: "TK Yapendik 01 Menteng" }, { value: "sch_tk_yapendik_02", label: "TK Yapendik 02 Kebayoran" }]} />
          </div>

          <div>
            <label className="block font-semibold text-ink-soft mb-1">Sekolah Target Sumber Daya:</label>
            <SelectSheet value={simTargetSchool}   options={[{ value: "sch_tk_yapendik_01", label: "TK Yapendik 01 Menteng" }, { value: "sch_tk_yapendik_02", label: "TK Yapendik 02 Kebayoran" }]} />
          </div>

          <div>
            <label className="block font-semibold text-ink-soft mb-1">Jenis Aksi (Action):</label>
            <SelectSheet value={simAction}   options={[{ value: "VIEW", label: "VIEW (Melihat)" }, { value: "CREATE", label: "CREATE (Membuat / Mencatat)" }, { value: "EDIT", label: "EDIT (Mengubah)" }, { value: "DELETE", label: "DELETE (Menghapus)" }, { value: "APPROVE", label: "APPROVE (Mengesahkan LPPA)" }]} />
          </div>

          <div>
            <label className="block font-semibold text-ink-soft mb-1">Target Sumber Daya (Resource):</label>
            <SelectSheet value={simResource}   options={[{ value: "STUDENT_OBSERVATION", label: "STUDENT_OBSERVATION (Catatan Anekdot)" }, { value: "STUDENT_DEVELOPMENT", label: "STUDENT_DEVELOPMENT (Rapor LPPA)" }, { value: "TEACHER_DAILY_WORK", label: "TEACHER_DAILY_WORK (Rencana Kegiatan)" }, { value: "ATTENDANCE_REGISTER", label: "ATTENDANCE_REGISTER (Presensi Siswa)" }, { value: "AUDIT_LOG", label: "AUDIT_LOG (Log Tata Kelola)" }]} />
          </div>

          <div>
            <label className="block font-semibold text-ink-soft mb-1">Target Siswa (Bila Ada):</label>
            <SelectSheet value={simTargetPersonId}   options={[{ value: "per_child_kenzo", label: "Kenzo Pratama (Anak dari Wali Sim)" }, { value: "per_child_alina", label: "Alina Putri (Bukan Anak Wali Sim)" }]} />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="simConfidential"
            checked={simIsConfidential}
            onChange={e => setSimIsConfidential(e.target.checked)}
            className="rounded text-ink"
          />
          <label htmlFor="simConfidential" className="text-xs text-ink-soft font-medium">
            Tandai data ini sebagai Rahasia Internal Guru (isConfidential = true)
          </label>
        </div>

        <div className="flex flex-col medium:flex-row medium:items-center justify-between pt-2 gap-3">
          <button
            onClick={handleRunSimulator}
            className="w-full medium:w-auto mt-3 medium:mt-0 bg-brand hover-only:opacity-90 text-on-brand text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center justify-center space-x-1.5 shadow-hairline"
          >
            <Play className="w-4 h-4" />
            <span>Evaluasi Kebijakan Otorisasi</span>
          </button>

          {simResult && (
            <div className={`p-2 rounded-md border text-xs flex items-center space-x-2 ${
              simResult.granted 
                ? 'bg-success-tint border-success-line text-success-deep' 
                : 'bg-danger-tint border-danger-line text-danger-deep'
            }`}>
              {simResult.granted ? (
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-danger shrink-0" />
              )}
              <div>
                <span className="font-bold">{simResult.granted ? 'IZIN DIBERIKAN (ALLOW)' : 'IZIN DITOLAK (DENY)'}:</span>{' '}
                {simResult.reason} <span className="font-mono opacity-70">[{simResult.code}]</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
