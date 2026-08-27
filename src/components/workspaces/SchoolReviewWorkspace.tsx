/**
 * Yapendik School OS — Domain 07: School Review & Governance Audit Log
 * Overview of School Context, Academic Years, Classes, and Immutable Audit Trail.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { School, AcademicYear, ClassRoom, AuditLogEntry } from '../../domain/types';
import { 
  Building, 
  ShieldCheck, 
  Layers, 
  History, 
  RotateCcw, 
  Sparkles, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const SchoolReviewWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const loadData = () => {
    if (!securityContext) return;
    setSchools(db.getSchools());
    setClasses(db.getClasses(securityContext.activeSchoolId));
    setAuditLogs(db.getAuditLogs(securityContext.activeSchoolId));
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId]);

  const activeSchool = securityContext ? db.getSchoolById(securityContext.activeSchoolId) : null;
  const headmaster = activeSchool ? db.getPersonById(activeSchool.headmasterPersonId) : null;

  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data ke seed default TK Pilot? Tindakan ini akan mengembalikan seluruh perubahan simulasi.')) {
      db.resetToDefaults();
    }
  };  return (
    <div className="space-y-6 text-slate-900 font-sans w-full" data-testid="school-review-workspace">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>Standar Yayasan • Audit &amp; Tata Kelola</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Profil Institusi &amp; Jejak Tata Kelola</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              Data identitas unit sekolah, penanggung jawab akademik, dan rekaman log audit yang dapat ditelusuri.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleResetDatabase}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset ke Seed Fixture Default</span>
            </button>
          </div>
        </div>
      </div>

      {/* School Overview Card */}
      {activeSchool && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Identitas &amp; Legalitas Unit</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Nama Sekolah:</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{activeSchool.name}</span>
              <div className="text-slate-500 mt-1 font-mono text-[11px]">NPSN: {activeSchool.npsn}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Kepala Sekolah:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{headmaster?.fullName || '-'}</span>
              <div className="text-slate-500 mt-1 font-mono text-[11px]">{headmaster?.phone || '-'}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Alamat &amp; Kota:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{activeSchool.address}</span>
              <div className="text-slate-500 mt-1">{activeSchool.city}, {activeSchool.province}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Tahun Ajaran Aktif:</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">2026/2027 (Semester Ganjil)</span>
              <div className="text-slate-500 mt-1">Status: Kurikulum Merdeka TK</div>
            </div>
          </div>
        </div>
      )}

      {/* Classes in School */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Rombongan Belajar (Rombel) Terdaftar</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">{classes.length} Rombel Aktif</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {classes.map(c => {
            const teacher = db.getPersonById(c.homeroomTeacherId);
            const studentCount = db.getStudents(securityContext?.activeSchoolId || '', c.id).length;
            return (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {c.ageGroup === 'TK_A_4_5' ? 'TK A (4-5 Thn)' : 'TK B (5-6 Thn)'}
                  </span>
                </div>
                <div className="text-slate-600">Guru Kelas: <b className="text-slate-900">{teacher?.fullName || 'Belum Ditugaskan'}</b></div>
                <div className="text-slate-500 font-mono text-[11px] pt-1 border-t border-slate-200 flex justify-between">
                  <span>Ruang: {c.roomNumber}</span>
                  <span>Kapasitas: {studentCount}/{c.capacity} Siswa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Jejak Audit Aktivitas &amp; Tata Kelola (Immutable Log)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Total {auditLogs.length} Entri Tercatat
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {auditLogs.map(log => (
            <div key={log.id} className="p-4 sm:p-4 text-xs hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{log.personName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {log.role}
                  </span>
                  <span className="text-[10px] font-mono text-slate-700 font-bold">
                    [{log.action}]
                  </span>
                </div>
                <div className="text-slate-600 leading-relaxed">{log.details}</div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 shrink-0 font-medium">
                {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
