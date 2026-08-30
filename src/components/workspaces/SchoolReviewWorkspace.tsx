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
    <div className="space-y-6 text-ink font-sans w-full" data-testid="school-review-workspace">
      {/* Header Banner */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success-deep text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Building className="w-4 h-4" />
              <span>Standar Yayasan • Audit &amp; Tata Kelola</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Profil Institusi &amp; Jejak Tata Kelola</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              Data identitas unit sekolah, penanggung jawab akademik, dan rekaman log audit yang dapat ditelusuri.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2 w-full medium:w-auto">
            <button
              onClick={handleResetDatabase}
              className="px-3 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-hairline cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-ink-soft" />
              <span>Reset ke Seed Fixture Default</span>
            </button>
          </div>
        </div>
      </div>

      {/* School Overview Card */}
      {activeSchool && (
        <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
          <div className="flex items-center space-x-2 border-b border-line-soft pb-3">
            <Building className="w-4 h-4 text-ink-soft" />
            <h2 className="text-sm font-bold text-ink">Identitas &amp; Legalitas Unit</h2>
          </div>

          <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-4 gap-4 text-xs">
            <div className="bg-surface-subtle p-4 rounded-field border border-line-soft">
              <span className="text-ink-soft font-semibold block text-[10px] uppercase tracking-wider">Nama Sekolah:</span>
              <span className="font-bold text-ink text-sm mt-0.5 block">{activeSchool.name}</span>
              <div className="text-ink-soft mt-1 font-mono text-[11px] whitespace-nowrap">NPSN: {activeSchool.npsn}</div>
            </div>

            <div className="bg-surface-subtle p-4 rounded-field border border-line-soft">
              <span className="text-ink-soft font-semibold block text-[10px] uppercase tracking-wider">Kepala Sekolah:</span>
              <span className="font-bold text-ink mt-0.5 block">{headmaster?.fullName || '-'}</span>
              <div className="text-ink-soft mt-1 font-mono text-[11px] whitespace-nowrap">{headmaster?.phone || '-'}</div>
            </div>

            <div className="bg-surface-subtle p-4 rounded-field border border-line-soft">
              <span className="text-ink-soft font-semibold block text-[10px] uppercase tracking-wider">Alamat &amp; Kota:</span>
              <span className="font-semibold text-ink mt-0.5 block">{activeSchool.address}</span>
              <div className="text-ink-soft mt-1">{activeSchool.city}, {activeSchool.province}</div>
            </div>

            <div className="bg-surface-subtle p-4 rounded-field border border-line-soft">
              <span className="text-ink-soft font-semibold block text-[10px] uppercase tracking-wider">Tahun Ajaran Aktif:</span>
              <span className="font-bold text-success-deep mt-0.5 block">2026/2027 (Semester Ganjil)</span>
              <div className="text-ink-soft mt-1">Status: Kurikulum Merdeka TK</div>
            </div>
          </div>
        </div>
      )}

      {/* Classes in School */}
      <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
        <div className="flex items-center justify-between border-b border-line-soft pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-ink-soft" />
            <h2 className="text-sm font-bold text-ink">Rombongan Belajar (Rombel) Terdaftar</h2>
          </div>
          <span className="text-xs text-ink-soft font-medium">{classes.length} Rombel Aktif</span>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 gap-4 text-xs">
          {classes.map(c => {
            const teacher = db.getPersonById(c.homeroomTeacherId);
            const studentCount = db.getStudents(securityContext?.activeSchoolId || '', c.id).length;
            return (
              <div key={c.id} className="p-4 bg-surface-subtle border border-line rounded-field space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-ink text-sm">{c.name}</div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-line-soft text-ink-soft">
                    {c.ageGroup === 'TK_A_4_5' ? 'TK A (4-5 Thn)' : 'TK B (5-6 Thn)'}
                  </span>
                </div>
                <div className="text-ink-soft">Guru Kelas: <b className="text-ink">{teacher?.fullName || 'Belum Ditugaskan'}</b></div>
                <div className="text-ink-soft font-mono text-[11px] pt-1 border-t border-line flex justify-between whitespace-nowrap">
                  <span>Ruang: {c.roomNumber}</span>
                  <span>Kapasitas: {studentCount}/{c.capacity} Siswa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-surface border border-line rounded-card shadow-hairline overflow-hidden">
        <div className="p-4 medium:p-4 border-b border-line-soft bg-surface-subtle flex flex-col medium:flex-row medium:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-ink-soft" />
            <h2 className="text-sm font-bold text-ink">
              Jejak Audit Aktivitas &amp; Tata Kelola (Immutable Log)
            </h2>
          </div>
          <span className="text-xs font-mono text-ink-soft font-semibold whitespace-nowrap">
            Total {auditLogs.length} Entri Tercatat
          </span>
        </div>

        <div className="divide-y divide-line-soft max-h-96 overflow-y-auto">
          {auditLogs.map(log => (
            <div key={log.id} className="p-4 medium:p-4 text-xs hover-only:bg-surface-subtle/80 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-ink">{log.personName}</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-surface-subtle text-ink-soft font-bold border border-line whitespace-nowrap">
                    {log.role}
                  </span>
                  <span className="text-[10px] font-mono text-ink-soft font-bold whitespace-nowrap">
                    [{log.action}]
                  </span>
                </div>
                <div className="text-ink-soft leading-relaxed">{log.details}</div>
              </div>

              <div className="text-[11px] font-mono text-ink-soft shrink-0 font-medium whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
