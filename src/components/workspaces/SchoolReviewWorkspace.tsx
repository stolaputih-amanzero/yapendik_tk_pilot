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
  };

  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-y md:border border-slate-200 md:rounded-lg p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-4 md:mx-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            Profil Institusi & Jejak Tata Kelola (Governance Audit)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas unit sekolah, penanggung jawab akademik, dan rekaman log audit yang dapat ditelusuri.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          className="w-full md:w-auto mt-3 md:mt-0 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 md:py-2 rounded-md transition-colors flex justify-center items-center space-x-1.5 whitespace-nowrap border border-slate-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Seed Fixture Default</span>
        </button>
      </div>

      {/* School Overview Card */}
      {activeSchool && (
        <div className="bg-white border-y md:border border-slate-200 md:rounded-lg p-5 shadow-sm -mx-4 md:mx-0">
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 divide-y divide-slate-100 md:divide-none gap-0 md:gap-4 text-xs -mx-5 md:mx-0">
            <div className="bg-slate-50 px-5 py-4 md:p-3 border-0 md:border md:rounded md:border-slate-100">
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Nama Sekolah:</span>
              <span className="font-bold text-slate-900 text-sm">{activeSchool.name}</span>
              <div className="text-slate-500 mt-0.5">NPSN: {activeSchool.npsn}</div>
            </div>

            <div className="bg-slate-50 px-5 py-4 md:p-3 border-0 md:border md:rounded md:border-slate-100">
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Kepala Sekolah:</span>
              <span className="font-bold text-slate-900">{headmaster?.fullName || '-'}</span>
              <div className="text-slate-500 mt-0.5">{headmaster?.phone || '-'}</div>
            </div>

            <div className="bg-slate-50 px-5 py-4 md:p-3 border-0 md:border md:rounded md:border-slate-100">
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Alamat & Kota:</span>
              <span className="font-semibold text-slate-800">{activeSchool.address}</span>
              <div className="text-slate-500 mt-0.5">{activeSchool.city}, {activeSchool.province}</div>
            </div>

            <div className="bg-slate-50 px-5 py-4 md:p-3 border-0 md:border md:rounded md:border-slate-100">
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Tahun Ajaran Aktif:</span>
              <span className="font-bold text-emerald-700">2026/2027 (Semester Ganjil)</span>
              <div className="text-slate-500 mt-0.5">Status: Kurikulum Merdeka TK</div>
            </div>
          </div>
        </div>
      )}

      {/* Classes in School */}
      <div className="bg-white border-y md:border border-slate-200 md:rounded-lg p-5 shadow-sm space-y-3 -mx-4 md:mx-0">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          Rombongan Belajar (Rombel) Terdaftar
        </h2>
        <div className="flex flex-col md:grid md:grid-cols-3 divide-y divide-slate-100 md:divide-none gap-0 md:gap-3 text-xs -mx-5 md:mx-0">
          {classes.map(c => {
            const teacher = db.getPersonById(c.homeroomTeacherId);
            const studentCount = db.getStudents(securityContext.activeSchoolId, c.id).length;
            return (
              <div key={c.id} className="px-5 py-4 md:p-3 bg-slate-50 border-0 md:border md:rounded md:border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-0.5">{c.name}</div>
                <div className="text-slate-500">Wali Kelas: <b className="text-slate-800">{teacher?.fullName}</b></div>
                <div className="text-slate-500 mt-1">Ruangan: {c.roomNumber} • Kapasitas: {studentCount}/{c.capacity} Siswa</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-white border-y md:border border-slate-200 md:rounded-lg shadow-sm overflow-hidden -mx-4 md:mx-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            Jejak Audit Aktivitas & Tata Kelola (Immutable Log)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Total {auditLogs.length} Entri Tercatat
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {auditLogs.map(log => (
            <div key={log.id} className="p-4 md:p-3 text-xs hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{log.personName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {log.role}
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 font-semibold">
                    [{log.action}]
                  </span>
                </div>
                <div className="text-slate-600 leading-relaxed">{log.details}</div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
