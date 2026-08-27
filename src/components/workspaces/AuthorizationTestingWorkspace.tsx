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
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-700 uppercase tracking-wide mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Constitutional Security Gate — Contextual Policy Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Automated Negative & Positive Authorization Testing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verifikasi ketat batas multi-sekolah, proteksi data anak (PII), hak wali murid, dan pencegahan eskalasi wewenang.
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          className="w-full md:w-auto mt-3 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 shrink-0 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Jalankan Seluruh Uji Otorisasi</span>
        </button>
      </div>

      {/* Test Suite Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Skenario Uji</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{suiteResults.total} Kasus</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700">
            {suiteResults.total}
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm flex items-center justify-between bg-emerald-50/20">
          <div>
            <div className="text-xs font-medium text-emerald-800">Lolos Uji (Verified)</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{suiteResults.passed} Lolos</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Gagal / Regresi</div>
            <div className={`text-2xl font-black mt-0.5 ${suiteResults.failed > 0 ? 'text-red-600' : 'text-slate-400'}`}>
              {suiteResults.failed} Gagal
            </div>
          </div>
          {suiteResults.failed > 0 ? (
            <XCircle className="w-8 h-8 text-red-600" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          )}
        </div>
      </div>

      {/* Automated Tests Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
            Daftar Eksekusi Uji Otorisasi Kontekstual
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Engine: PolicyEvaluator v1.0
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {suiteResults.results.map(t => {
            const isNegative = t.category.startsWith('NEGATIVE');
            return (
              <div key={t.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 text-xs">{t.name}</span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      isNegative ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500">
                      Ekspektasi: <b className={t.expected === 'ALLOW' ? 'text-emerald-700' : 'text-rose-700'}>{t.expected}</b>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">→</span>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      t.actual === 'ALLOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Hasil: {t.actual}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 pl-6 space-y-1">
                  <div>
                    <span className="font-medium text-slate-800">Skenario:</span> {t.scenario}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    <span className="font-medium text-slate-700">Kode Evaluasi:</span> [{t.code}] {t.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Simulator Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-sm">
            Simulator Uji Otorisasi Interaktif (Live Policy Matrix)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peran Pengguna (Role):</label>
            <select
              value={simRole}
              onChange={e => setSimRole(e.target.value as Role)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="TEACHER">TEACHER (Pendidik)</option>
              <option value="HEADMASTER">HEADMASTER (Kepala Sekolah)</option>
              <option value="GUARDIAN">GUARDIAN (Orang Tua / Wali)</option>
              <option value="STAFF">STAFF (Tenaga Kependidikan)</option>
              <option value="YAPENDIK_SUPERADMIN">YAPENDIK_SUPERADMIN (Yayasan)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah Pengguna:</label>
            <select
              value={simUserSchool}
              onChange={e => setSimUserSchool(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="sch_tk_yapendik_01">TK Yapendik 01 Menteng</option>
              <option value="sch_tk_yapendik_02">TK Yapendik 02 Kebayoran</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sekolah Target Sumber Daya:</label>
            <select
              value={simTargetSchool}
              onChange={e => setSimTargetSchool(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="sch_tk_yapendik_01">TK Yapendik 01 Menteng</option>
              <option value="sch_tk_yapendik_02">TK Yapendik 02 Kebayoran</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Aksi (Action):</label>
            <select
              value={simAction}
              onChange={e => setSimAction(e.target.value as ActionType)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="VIEW">VIEW (Melihat)</option>
              <option value="CREATE">CREATE (Membuat / Mencatat)</option>
              <option value="EDIT">EDIT (Mengubah)</option>
              <option value="DELETE">DELETE (Menghapus)</option>
              <option value="APPROVE">APPROVE (Mengesahkan LPPA)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Sumber Daya (Resource):</label>
            <select
              value={simResource}
              onChange={e => setSimResource(e.target.value as ResourceType)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="STUDENT_OBSERVATION">STUDENT_OBSERVATION (Catatan Anekdot)</option>
              <option value="STUDENT_DEVELOPMENT">STUDENT_DEVELOPMENT (Rapor LPPA)</option>
              <option value="TEACHER_DAILY_WORK">TEACHER_DAILY_WORK (Rencana Kegiatan)</option>
              <option value="ATTENDANCE_REGISTER">ATTENDANCE_REGISTER (Presensi Siswa)</option>
              <option value="AUDIT_LOG">AUDIT_LOG (Log Tata Kelola)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Siswa (Bila Ada):</label>
            <select
              value={simTargetPersonId}
              onChange={e => setSimTargetPersonId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="per_child_kenzo">Kenzo Pratama (Anak dari Wali Sim)</option>
              <option value="per_child_alina">Alina Putri (Bukan Anak Wali Sim)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="simConfidential"
            checked={simIsConfidential}
            onChange={e => setSimIsConfidential(e.target.checked)}
            className="rounded text-slate-900"
          />
          <label htmlFor="simConfidential" className="text-xs text-slate-700 font-medium">
            Tandai data ini sebagai Rahasia Internal Guru (isConfidential = true)
          </label>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 gap-3">
          <button
            onClick={handleRunSimulator}
            className="w-full md:w-auto mt-3 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Evaluasi Kebijakan Otorisasi</span>
          </button>

          {simResult && (
            <div className={`p-2.5 rounded-md border text-xs flex items-center space-x-2 ${
              simResult.granted 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {simResult.granted ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
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
