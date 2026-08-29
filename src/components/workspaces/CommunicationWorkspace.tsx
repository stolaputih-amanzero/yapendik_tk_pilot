import { SelectSheet } from '../ui';
import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { GuardianNotice, ClassRoom } from '../../domain/types';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  User, 
  Sparkles, 
  Plus, 
  FileCheck, 
  CheckCheck,
  AlertCircle,
  X
} from 'lucide-react';

export const CommunicationWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [notices, setNotices] = useState<GuardianNotice[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_tka_01');
  const [students, setStudents] = useState<any[]>([]);

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [noticeType, setNoticeType] = useState<any>('DAILY_SUMMARY');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [requiresAck, setRequiresAck] = useState(true);

  // Acknowledgment modal
  const [ackNotice, setAckNotice] = useState<GuardianNotice | null>(null);
  const [guardianReply, setGuardianReply] = useState('');

  const loadData = () => {
    if (!securityContext) return;
    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);
    if (clsList.length > 0 && !clsList.some(c => c.id === selectedClassId)) {
      setSelectedClassId(clsList[0].id);
    }
    const studentList = db.getStudents(securityContext.activeSchoolId, selectedClassId);
    setStudents(studentList);
    if (studentList.length > 0 && !targetStudentId) {
      setTargetStudentId(studentList[0].id);
    }

    const noticeList = db.getNotices(securityContext.activeSchoolId, selectedClassId);
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
  }) : { granted: false, reason: 'Konteks identitas belum siap' };

  // Filter notices for guardian role
  const visibleNotices = notices.filter(n => {
    if (securityContext?.role === 'GUARDIAN') {
      if (!n.studentId) return true; // Class announcement
      const student = students.find(s => s.id === n.studentId);
      if (student && !securityContext.guardianChildrenPersonIds.includes(student.personId)) {
        return false; // Not my child
      }
    }
    return true;
  });

  const [filterMode, setFilterMode] = useState<'ALL' | 'UNACK'>('ALL');
  const unackCount = visibleNotices.filter(n => n.requiresAcknowledgment && !n.acknowledgedAt).length;
  const displayedNotices = filterMode === 'UNACK' 
    ? visibleNotices.filter(n => n.requiresAcknowledgment && !n.acknowledgedAt)
    : visibleNotices;

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    db.addNotice({
      schoolId: securityContext.activeSchoolId,
      classId: selectedClassId,
      studentId: noticeType === 'CLASS_ANNOUNCEMENT' ? undefined : targetStudentId,
      authorPersonId: securityContext.personId,
      type: noticeType,
      title,
      content,
      requiresAcknowledgment: requiresAck
    }, securityContext.personName, securityContext.userId, securityContext.role);

    setShowAddModal(false);
    setTitle('');
    setContent('');
  };

  const handleSaveAck = () => {
    if (ackNotice) {
      db.acknowledgeNotice(ackNotice.id, securityContext.personId, guardianReply);
      setAckNotice(null);
      setGuardianReply('');
    }
  };

  return (
    <div className="px-4 medium:px-6 py-6 space-y-6 max-w-7xl mx-auto pb-[132px] expanded:pb-8">
      {/* Top Header Card */}
      <div className="bg-surface border border-line rounded-card shadow-hairline overflow-hidden">
        <div className="p-4 medium:p-6 medium:p-8 flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-brand text-on-brand flex items-center justify-center font-bold text-sm shrink-0 shadow-hairline">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl medium:text-2xl font-black text-ink tracking-tight">
                Buku Penghubung Digital
              </h1>
              <p className="text-xs text-ink-soft mt-0.5">
                Jembatan komunikasi harian dan konfirmasi resmi guru & wali murid
              </p>
            </div>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2 w-full medium:w-auto">
            <div className="flex items-center justify-between gap-2 bg-surface-subtle border border-line rounded-field px-3 py-2 text-xs">
              <span className="text-ink-soft font-medium shrink-0">Kelas:</span>
              <SelectSheet value={selectedClassId}   options={classes.map(c => ({ value: c.id, label: c.name }))} />
            </div>

            {canCreate && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full medium:w-auto bg-brand hover-only:bg-surface-inset text-on-brand text-xs font-bold px-4 py-2 rounded-field transition flex justify-center items-center gap-2 shadow-hairline cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tulis Catatan / Pengumuman</span>
              </button>
            )}
          </div>
        </div>

        {/* Matching-Pill Context Ribbon */}
        <div className="bg-surface-subtle/70 border-t border-line-soft px-5 medium:px-6 py-2 flex flex-col medium:flex-row medium:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-ink-soft font-medium">
            <span className="px-2 py-1 rounded-md bg-surface border border-line font-semibold text-ink">
              T.A. 2026/2027 • GANJIL
            </span>
            <span>•</span>
            <span className="text-ink-soft font-bold">{selectedClass?.name || 'Kelompok A'}</span>
            <span>•</span>
            <span className="text-ink-soft">Kurikulum Merdeka TK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-soft">Total Catatan:</span>
            <span className="px-2 py-1 rounded-full bg-line-soft text-ink font-bold text-[11px]">
              {visibleNotices.length} Pesan
            </span>
          </div>
        </div>
      </div>

      {/* Filter Subtabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
        <button
          onClick={() => setFilterMode('ALL')}
          className={`px-4 py-2 rounded-field text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filterMode === 'ALL'
              ? 'bg-brand text-on-brand shadow-hairline'
              : 'bg-surface text-ink-soft hover-only:bg-surface-subtle border border-line'
          }`}
        >
          Semua Catatan ({visibleNotices.length})
        </button>
        <button
          onClick={() => setFilterMode('UNACK')}
          className={`px-4 py-2 rounded-field text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            filterMode === 'UNACK'
              ? 'bg-brand text-on-brand shadow-hairline'
              : 'bg-surface text-ink-soft hover-only:bg-surface-subtle border border-line'
          }`}
        >
          <span>Perlu Konfirmasi Saya</span>
          {unackCount > 0 && (
            <span className={`px-2 py-0 rounded-full text-[10px] font-extrabold ${
              filterMode === 'UNACK' ? 'bg-warning text-on-brand' : 'bg-warning-tint text-warning-deep'
            }`}>
              {unackCount}
            </span>
          )}
        </button>
      </div>

      {/* Notices list */}
      {displayedNotices.length === 0 ? (
        <div className="bg-surface border border-line rounded-card p-10 text-center shadow-hairline">
          <div className="w-12 h-12 rounded-card bg-surface-subtle text-ink-faint flex items-center justify-center mx-auto mb-3">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-ink">
            {filterMode === 'UNACK' 
              ? 'Semua Catatan Telah Dikonfirmasi' 
              : 'Belum ada pesan komunikasi di kelas ini'}
          </h3>
          <p className="text-xs text-ink-soft max-w-md mx-auto mt-1">
            {filterMode === 'UNACK'
              ? 'Tidak ada pesan yang membutuhkan tanda terima konfirmasi dari Anda saat ini.'
              : 'Pendidik dapat mengirim ringkasan harian kegiatan siswa atau pengumuman kelas kepada orang tua murid.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-line-soft bg-surface border-y medium:border border-line medium:rounded-card -mx-4 expanded:mx-0 overflow-hidden shadow-hairline">
          {displayedNotices.map(notice => {
            const author = db.getPersonById(notice.authorPersonId);
            const student = notice.studentId ? db.getStudentById(notice.studentId) : null;
            const isGuardianOfThisChild = !notice.studentId || (student && securityContext.guardianChildrenPersonIds.includes(student.personId));

            return (
              <div key={notice.id} className="py-5 px-4 medium:px-6 hover-only:bg-surface-subtle/50 transition space-y-3">
                <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-3 pb-3 border-b border-line-soft">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        notice.type === 'HEALTH_ALERT' ? 'bg-danger-tint text-danger-deep border border-danger-line' :
                        notice.type === 'DAILY_SUMMARY' ? 'bg-brand text-on-brand' :
                        'bg-surface-subtle text-ink border border-line'
                      }`}>
                        {notice.type.replace(/_/g, ' ')}
                      </span>
                      {student && (
                        <span className="text-xs font-bold text-ink bg-surface-subtle px-2 py-1 rounded-md border border-line">
                          Untuk: {student.person.fullName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-ink leading-snug pt-0.5">
                      {notice.title}
                    </h3>
                    <div className="text-[11px] text-ink-soft font-medium">
                      Ditulis oleh: <strong className="text-ink">{author?.fullName || 'Pendidik'}</strong> • {new Date(notice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Acknowledgment badge */}
                  <div className="shrink-0">
                    {notice.acknowledgedAt ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success-tint border border-success-line text-success-deep text-xs font-bold shadow-hairline">
                        <CheckCheck className="w-4 h-4 text-success" />
                        <span>Telah Dikonfirmasi Orang Tua</span>
                      </div>
                    ) : notice.requiresAcknowledgment ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning-tint border border-warning-line text-warning-deep text-xs font-bold shadow-hairline">
                        <Clock className="w-4 h-4 text-brass" />
                        <span>Menunggu Konfirmasi</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs medium:text-sm text-ink leading-relaxed whitespace-pre-line bg-surface-subtle/70 p-4 rounded-field border border-line">
                  {notice.content}
                </p>

                {/* Guardian reply if present */}
                {notice.guardianReply && (
                  <div className="p-3 bg-success-tint/50 border border-success-line rounded-field text-xs space-y-1">
                    <span className="font-bold text-success-deep block">
                      Respon Orang Tua / Wali:
                    </span>
                    <p className="text-ink italic">"{notice.guardianReply}"</p>
                  </div>
                )}

                {/* Guardian Acknowledgment Action Button */}
                {securityContext.role === 'GUARDIAN' && isGuardianOfThisChild && notice.requiresAcknowledgment && !notice.acknowledgedAt && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setAckNotice(notice);
                        setGuardianReply('');
                      }}
                      className="w-full medium:w-auto bg-brand hover-only:bg-surface-inset text-on-brand text-xs font-bold px-4 py-2 rounded-field transition flex justify-center items-center gap-2 shadow-hairline cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Konfirmasi Terima & Beri Respon</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Notice */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-3xl medium:rounded-card border-t medium:border border-line shadow-floating max-w-lg w-full overflow-hidden text-ink">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-field bg-brand text-on-brand flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Kirim Catatan Buku Penghubung</h3>
                  <p className="text-[11px] text-ink-soft">Komunikasi Resmi Guru Kelas & Orang Tua</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNotice} className="p-4 medium:p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Jenis Komunikasi</label>
                  <SelectSheet
    value={noticeType}
    onChange={(val) => setNoticeType(val as any)}
    options={[
      { value: "DAILY_SUMMARY", label: "Catatan Harian Anak" },
      { value: "CLASS_ANNOUNCEMENT", label: "Pengumuman Seluruh Kelas" },
      { value: "HEALTH_ALERT", label: "Pemberitahuan Kesehatan / Diet" },
      { value: "DIRECT_NOTE", label: "Pesan Pribadi ke Wali" }
    ]}
  />
                </div>
                {noticeType !== 'CLASS_ANNOUNCEMENT' && (
                  <div>
                    <label className="block font-bold text-ink-soft mb-1">Target Siswa</label>
                    <SelectSheet
    value={targetStudentId}
    onChange={setTargetStudentId}
    options={students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis || 'Siswa' }))}
  />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Judul Pesan</label>
                <input
                  type="text"
                  placeholder="mis. Catatan Harian Kenzo (24 Agustus 2026)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brass/30"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Isi Pesan / Narasi:</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tuliskan perkembangan aktivitas anak, nafsu makan siang, interaksi pertemanan..."
                  required
                  className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brass/30"
                />
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-field bg-surface-subtle border border-line">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={requiresAck}
                  onChange={e => setRequiresAck(e.target.checked)}
                  className="rounded text-ink w-4 h-4 cursor-pointer"
                />
                <label htmlFor="reqAck" className="text-ink font-medium cursor-pointer">
                  Memerlukan tanda terima konfirmasi dari orang tua / wali
                </label>
              </div>

              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full medium:w-auto px-4 py-2 rounded-field border border-line text-ink-soft font-bold hover-only:bg-surface-subtle cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full medium:w-auto px-5 py-2 rounded-field bg-brand text-on-brand font-bold hover-only:bg-surface-inset shadow-hairline cursor-pointer flex justify-center items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Acknowledgment */}
      {ackNotice && (
        <div className="fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-3xl medium:rounded-card border-t medium:border border-line shadow-floating max-w-md w-full overflow-hidden text-ink">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-field bg-success-tint text-success-deep flex items-center justify-center font-bold text-xs">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Konfirmasi Tanda Terima</h3>
                  <p className="text-[11px] text-ink-soft">Respon Resmi Wali Murid</p>
                </div>
              </div>
              <button
                onClick={() => setAckNotice(null)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 medium:p-6 space-y-4 text-xs">
              <p className="text-ink-soft leading-relaxed">
                Anda mengonfirmasi telah membaca catatan: <strong className="text-ink">"{ackNotice.title}"</strong>.
              </p>
              <div className="space-y-1.5">
                <label className="block font-bold text-ink-soft">
                  Tulis Tanggapan / Ucapan Terima Kasih (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={guardianReply}
                  onChange={e => setGuardianReply(e.target.value)}
                  placeholder="Contoh: Terima kasih Bu Guru atas pendampingannya..."
                  className="w-full bg-surface border border-line rounded-field p-3 outline-none focus:ring-1 focus:ring-brass/30 font-medium"
                />
              </div>
              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-2 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setAckNotice(null)}
                  className="w-full medium:w-auto px-4 py-2 rounded-field border border-line text-ink-soft font-bold hover-only:bg-surface-subtle cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveAck}
                  className="w-full medium:w-auto px-5 py-2 rounded-field bg-brand text-on-brand font-bold hover-only:bg-surface-inset shadow-hairline cursor-pointer flex justify-center items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Kirim Konfirmasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
