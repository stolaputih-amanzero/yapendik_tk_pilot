/**
 * Yapendik School OS — Stage 6 Gate 5: Communication Workspace (Buku Penghubung Digital)
 * Two-way asynchronous dialogue between Teachers and Guardians.
 * Enforces:
 * - FB-01 Child Privacy & Contextual Projection
 * - Dynamic Class Resolution without hardcoded fallback
 * - Threshold Rule Enforcement (§4.2): SelectSheet for 5 message types
 * - Zero Emoji Clutter (Hukum 11 / Lucide icons only)
 * - Two-Way Notice Thread with receipt state machine.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { GuardianNotice, ClassRoom } from '../../domain/types';
import { SelectSheet, Button, AdaptiveDialog } from '../ui';
import { TwoWayNoticeThread } from './communication/TwoWayNoticeThread';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Clock, 
  Plus, 
  FileCheck, 
  X,
  Reply,
  Layers,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Filter
} from 'lucide-react';

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const NOTICE_TYPE_OPTIONS = [
  { value: 'DAILY_SUMMARY', label: 'Ringkasan Harian', sublabel: 'Rangkuman aktivitas sentra dan suasana kelas' },
  { value: 'ANECDOTE_SHARE', label: 'Momen & Karya', sublabel: 'Berbagi foto kreasi atau celoteh ananda' },
  { value: 'HEALTH_ALERT', label: 'Peringatan Kesehatan', sublabel: 'Suhu tubuh, alergi, atau kondisi fisik (Tier-3)' },
  { value: 'CLASS_ANNOUNCEMENT', label: 'Pengumuman Rombel', sublabel: 'Pemberitahuan untuk seluruh wali di kelas' },
  { value: 'DIRECT_NOTE', label: 'Catatan Khusus', sublabel: 'Komunikasi privat dua arah dengan wali murid' }
];

export const CommunicationWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [notices, setNotices] = useState<GuardianNotice[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // ARB Directive: Dynamic Class Assignment
  const isGuardian = securityContext?.role === 'GUARDIAN';
  const hasSupervisoryPrivilege = ['SUPERADMIN', 'FOUNDATION_HEAD', 'HEADMASTER', 'ACADEMIC_COORDINATOR', 'ADMINISTRATOR'].includes(securityContext?.role || '');
  const assignedClasses = securityContext?.assignedClasses || [];

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (assignedClasses.length > 0) return assignedClasses[0];
    return '';
  });

  // Filter mode
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNACK'>('ALL');

  // New Notice Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [noticeType, setNoticeType] = useState<string>('DAILY_SUMMARY');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [requiresAck, setRequiresAck] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    if (!securityContext) return;

    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);

    // Synchronize selectedClassId dynamically
    let activeClassId = selectedClassId;
    if (clsList.length > 0) {
      if (assignedClasses.length > 0) {
        if (!selectedClassId || !clsList.some(c => c.id === selectedClassId)) {
          activeClassId = assignedClasses[0];
          setSelectedClassId(activeClassId);
        }
      } else if (hasSupervisoryPrivilege) {
        if (!selectedClassId || !clsList.some(c => c.id === selectedClassId)) {
          activeClassId = clsList[0].id;
          setSelectedClassId(activeClassId);
        }
      }
    }

    const studentList = db.getStudents(securityContext.activeSchoolId, activeClassId);
    setStudents(studentList);
    if (studentList.length > 0 && !targetStudentId) {
      setTargetStudentId(studentList[0].id);
    }

    // Contextual Projection Query (FB-01 Child Privacy & Tier-3 Expiry)
    const noticeList = db.getNoticesForContext(securityContext, activeClassId);
    setNotices(noticeList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId]);

  const canCreate = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'GUARDIAN_COMMUNICATION',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }).granted : false;

  const unackCount = useMemo(() => {
    return notices.filter(n => n.requiresAcknowledgment && !n.acknowledgedAt).length;
  }, [notices]);

  const displayedNotices = useMemo(() => {
    if (filterMode === 'UNACK') {
      return notices.filter(n => n.requiresAcknowledgment && !n.acknowledgedAt);
    }
    return notices;
  }, [notices, filterMode]);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityContext || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      db.addNotice({
        schoolId: securityContext.activeSchoolId,
        classId: selectedClassId,
        studentId: noticeType === 'CLASS_ANNOUNCEMENT' ? undefined : targetStudentId,
        authorPersonId: securityContext.personId,
        type: noticeType as any,
        title: title.trim(),
        content: content.trim(),
        requiresAcknowledgment: requiresAck
      }, securityContext.personName, securityContext.userId, securityContext.role);

      setShowAddModal(false);
      setTitle('');
      setContent('');
      setNoticeType('DAILY_SUMMARY');
      loadData();
    } catch (err: any) {
      alert(`Gagal mengirim catatan: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledgeNotice = async (noticeId: string, replyText?: string) => {
    if (!securityContext) return;
    db.acknowledgeNotice(noticeId, securityContext.personId, replyText);
    loadData();
  };

  // Empty State if teacher has no assigned classes (ARB Directive #5)
  if (!isGuardian && !hasSupervisoryPrivilege && assignedClasses.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center space-y-4" data-testid="communication-workspace">
        <div className="w-16 h-16 rounded-3xl bg-surface-subtle border border-line flex items-center justify-center mx-auto text-ink-soft shadow-hairline">
          <MessageSquare className="w-8 h-8 text-ink-soft" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-ink">Belum Ada Penugasan Rombel</h2>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            Belum ada rombel yang ditugaskan kepada akun ini. Silakan hubungi Administrator Sekolah untuk mendapatkan akses komunikasi buku penghubung.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 medium:px-6 pt-6 pb-[140px] space-y-7 animate-in fade-in duration-200 text-ink"
      data-testid="communication-workspace"
    >
      {/* 1. Header Hero Canvas */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand text-xs font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4 text-brand shrink-0" />
              <span>Buku Penghubung Digital • Kemitraan Sekolah &amp; Keluarga</span>
            </div>
            <h1 className="text-2xl medium:text-3xl font-bold tracking-tight text-ink leading-tight">
              Buku Penghubung
            </h1>
            <p className="text-xs medium:text-sm text-ink-soft max-w-xl mt-1">
              Jembatan dialog harian dua arah dan konfirmasi resmi pendidik dengan orang tua / wali murid.
            </p>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="min-h-[44px] rounded-xl text-xs font-bold bg-brand text-on-brand shadow-sm ring-1 ring-brand/50 hover-only:opacity-90 flex items-center gap-2 px-4 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Catatan</span>
            </Button>
          )}
        </div>

        {/* 2. Flat Controls & Class Filter */}
        <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3 pt-1">
          <div className="w-full medium:w-64">
            <SelectSheet 
              label="Kelas Rombel"
              value={selectedClassId} 
              onChange={setSelectedClassId} 
              options={classes.map(c => ({ value: c.id, label: c.name }))} 
            />
          </div>

          {/* Action Filter Pills (Semua vs Perlu Konfirmasi) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                filterMode === 'ALL'
                  ? 'bg-brand text-on-brand border-brand shadow-sm'
                  : 'bg-surface border-line text-ink-soft hover-only:text-ink'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Semua Catatan ({notices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('UNACK')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                filterMode === 'UNACK'
                  ? 'bg-brand text-on-brand border-brand shadow-sm'
                  : 'bg-surface border-line text-ink-soft hover-only:text-ink'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Perlu Konfirmasi</span>
              {unackCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-warning-deep text-white">
                  {unackCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Role Context notice */}
      {isGuardian && (
        <div className="border-l-2 border-success-line pl-3.5 py-2.5 text-xs text-success-deep flex items-center justify-between bg-surface-subtle rounded-r-2xl">
          <div>
            <strong className="font-bold">Konteks Orang Tua / Wali:</strong> Menampilkan buku penghubung dan catatan harian yang relevan untuk ananda.
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success-tint text-success-deep border border-success-line whitespace-nowrap flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            PII Terproteksi
          </span>
        </div>
      )}

      {/* 3. Two-Way Notice Stream */}
      {displayedNotices.length === 0 ? (
        <div className="py-16 text-center text-ink-faint text-xs bg-surface-subtle rounded-3xl border border-line">
          <FileCheck className="w-10 h-10 text-ink-faint mx-auto mb-2" />
          <h3 className="font-bold text-ink-soft text-sm">Belum ada catatan pada filter ini</h3>
          <p className="text-ink-faint text-xs max-w-md mx-auto mt-1">
            Catatan harian, pengumuman rombel, dan konfirmasi kesehatan akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedNotices.map(notice => {
            const student = notice.studentId ? db.getStudentById(notice.studentId) : undefined;
            const author = notice.authorPersonId ? db.getPersonById(notice.authorPersonId) : undefined;
            const studentName = toTitleCase(student?.person?.preferredName || student?.person?.fullName || 'Ananda');
            const authorName = author?.fullName || 'Ibu Guru';

            return (
              <TwoWayNoticeThread
                key={notice.id}
                notice={notice}
                studentName={studentName}
                authorName={authorName}
                isGuardianView={isGuardian}
                onAcknowledge={handleAcknowledgeNotice}
              />
            );
          })}
        </div>
      )}

      {/* 4. Modal Tulis Catatan Baru (SelectSheet Threshold Rule §4.2) */}
      <AdaptiveDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tulis Catatan Buku Penghubung"
        description={<span>Kirim pesan resmi atau ringkasan harian kepada orang tua / wali</span>}
        maxWidth="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl text-xs w-full medium:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              onClick={() => {
                const form = document.getElementById('notice-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="rounded-xl text-xs font-bold w-full medium:w-auto bg-brand text-on-brand shadow-sm ring-1 ring-brand/50"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Catatan'}</span>
            </Button>
          </>
        }
      >
        <form id="notice-form" onSubmit={handleCreateNotice} className="space-y-4 text-xs text-ink">
          {/* Threshold Rule: 5 options -> SelectSheet Primitive */}
          <div>
            <label className="block font-bold text-ink-soft mb-1">Tipe Komunikasi</label>
            <SelectSheet
              value={noticeType}
              onChange={setNoticeType}
              options={NOTICE_TYPE_OPTIONS}
              placeholder="Pilih jenis komunikasi..."
            />
          </div>

          {/* Student Selector (If not CLASS_ANNOUNCEMENT) */}
          {noticeType !== 'CLASS_ANNOUNCEMENT' && (
            <div>
              <label className="block font-bold text-ink-soft mb-1">Ditujukan Kepada Siswa</label>
              <SelectSheet
                value={targetStudentId}
                onChange={setTargetStudentId}
                options={students.map(s => ({
                  value: s.id,
                  label: toTitleCase(s.person?.preferredName || s.person?.fullName || s.nis || 'Siswa'),
                  sublabel: `NIS: ${s.nis || s.id}`
                }))}
                placeholder="Pilih ananda penerima..."
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-ink-soft mb-1">Judul Catatan</label>
            <input
              type="text"
              placeholder="Contoh: Ringkasan Perkembangan Sentra Balok Hari Ini"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-subtle border border-line focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand text-ink"
            />
          </div>

          <div>
            <label className="block font-bold text-ink-soft mb-1">Isi Pesan / Narasi</label>
            <textarea
              rows={4}
              placeholder="Tuliskan peristiwa, apresiasi, atau instruksi khusus secara hangat dan bermartabat..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-subtle border border-line focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand text-ink resize-none shadow-hairline"
            />
          </div>

          <div className="p-3 bg-surface-subtle border border-line rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="requiresAck" className="font-bold text-xs text-ink cursor-pointer">
                Wajibkan Konfirmasi Baca (Acknowledgment)
              </label>
              <p className="text-[11px] text-ink-soft">
                Orang tua akan melihat tombol "Saya Mengerti" dan dapat memberikan balasan.
              </p>
            </div>
            <input
              type="checkbox"
              id="requiresAck"
              checked={requiresAck}
              onChange={e => setRequiresAck(e.target.checked)}
              className="w-4 h-4 rounded text-brand cursor-pointer"
            />
          </div>
        </form>
      </AdaptiveDialog>
    </div>
  );
};
