import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { GuardianNotice, ClassRoom } from '../../domain/types';
import { SelectSheet } from '../ui';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Clock, 
  Plus, 
  FileCheck, 
  X,
  Reply,
  Layers
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

  // Acknowledgment modal / composer
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
    <div className="w-full max-w-4xl mx-auto px-4 medium:px-6 pt-6 pb-[120px] space-y-8 animate-in fade-in duration-200">
      
      {/* 1. HERO CANVAS (Hukum F-7: Tanpa panel bg-surface) */}
      <header className="space-y-5">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-ink leading-tight">
            Buku Penghubung
          </h1>
          <p className="text-sm text-ink-soft max-w-prose mt-1">
            Jembatan komunikasi harian dan konfirmasi resmi guru & wali murid
          </p>
        </div>

        {/* Action Pills Grid (2 Kolom) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFilterMode(filterMode === 'ALL' ? 'UNACK' : 'ALL')}
            className={`min-h-[52px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              filterMode === 'UNACK'
                ? 'bg-brand-primary text-on-brand shadow-hairline'
                : 'bg-surface-subtle text-ink hover-only:bg-surface-subtle/80'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>{filterMode === 'UNACK' ? 'Filter: Perlu Konfirmasi' : 'Semua Catatan'}</span>
          </button>

          {canCreate ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="min-h-[52px] px-4 py-2 rounded-xl bg-brand-primary hover-only:opacity-90 text-on-brand text-xs font-bold transition flex items-center justify-center gap-2 shadow-hairline cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Tulis Catatan / Pengumuman</span>
            </button>
          ) : (
            <div className="min-h-[52px] px-4 py-2 rounded-xl bg-surface-subtle text-ink-soft text-xs font-medium flex items-center justify-center gap-2">
              <CheckCheck className="w-4 h-4 text-success shrink-0" />
              <span className="truncate">Wali Murid Terhubung</span>
            </div>
          )}
        </div>

        {/* Context Ribbon (Canvas-Native Ribbon) */}
        <div className="w-full bg-surface-subtle rounded-xl px-4 py-3 flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3 text-xs text-ink-soft">
          <div className="flex items-center gap-2 font-medium truncate">
            <span className="font-semibold text-ink">T.A. 2026/2027 • GANJIL</span>
            <span>•</span>
            <span className="font-bold text-ink-soft">{selectedClass?.name || 'Kelompok A'}</span>
            <span className="hidden medium:inline">•</span>
            <span className="hidden medium:inline text-ink-faint">Kurikulum Merdeka TK</span>
          </div>

          <div className="flex items-center justify-between medium:justify-end gap-3 shrink-0">
            <span className="text-ink-faint text-[11px] font-mono">Ganti Rombel:</span>
            <div className="w-40">
              <SelectSheet 
                value={selectedClassId} 
                onChange={setSelectedClassId}
                options={classes.map(c => ({ value: c.id, label: c.name }))} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. CHIPS & MICRO-SUMMARY EYEBROW (Anchor 4) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          {/* Eyebrow Summary */}
          <div className="text-xs font-medium text-ink-faint font-mono">
            {visibleNotices.length} Pesan • {unackCount} Perlu Konfirmasi
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-ink-soft hover-only:text-ink'
              }`}
            >
              Semua ({visibleNotices.length})
            </button>
            <button
              onClick={() => setFilterMode('UNACK')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                filterMode === 'UNACK'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-ink-soft hover-only:text-ink'
              }`}
            >
              <span>Perlu Konfirmasi</span>
              {unackCount > 0 && (
                <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                  filterMode === 'UNACK' ? 'bg-warning text-on-brand' : 'bg-warning-tint text-warning-deep'
                }`}>
                  {unackCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. ARTIKEL CANVAS-NATIVE (divide-y divide-line, TANPA panel bg-surface) */}
        {displayedNotices.length === 0 ? (
          <div className="py-16 text-center text-ink-soft text-xs space-y-2 border-y border-line">
            <FileCheck className="w-8 h-8 mx-auto text-ink-faint" />
            <p className="font-bold text-ink text-sm">
              {filterMode === 'UNACK' ? 'Semua Catatan Telah Dikonfirmasi' : 'Belum Ada Catatan Penghubung'}
            </p>
            <p className="text-ink-faint max-w-sm mx-auto">
              {filterMode === 'UNACK' 
                ? 'Tidak ada pesan yang menunggu tanda terima konfirmasi dari Anda saat ini.' 
                : 'Pendidik dapat menyusun catatan harian ananda atau pengumuman resmi di sini.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {displayedNotices.map(notice => {
              const author = db.getPersonById(notice.authorPersonId);
              const student = notice.studentId ? db.getStudentById(notice.studentId) : null;
              const isGuardianOfThisChild = !notice.studentId || (student && securityContext?.guardianChildrenPersonIds?.includes(student.personId));
              const isAck = Boolean(notice.acknowledgedAt);

              const typeLabel = 
                notice.type === 'DAILY_SUMMARY' ? 'Ringkasan Harian' :
                notice.type === 'HEALTH_ALERT' ? 'Peringatan Kesehatan' :
                notice.type === 'CLASS_ANNOUNCEMENT' ? 'Pengumuman Kelas' :
                notice.type === 'DIRECT_NOTE' ? 'Catatan Personal' :
                notice.type.replace(/_/g, ' ');

              return (
                <article key={notice.id} className="py-6 space-y-4">
                  {/* Baris Chip & Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-brand-tint text-brand-deep font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {typeLabel}
                      </span>
                      {student && (
                        <span className="bg-surface-subtle text-ink-soft text-xs font-bold px-3 py-1 rounded-full">
                          Untuk: Ananda {student.person?.fullName || student.nis}
                        </span>
                      )}
                    </div>

                    {/* Status Konfirmasi Teks Polos (Bukan Bar Tint) */}
                    <div>
                      {isAck ? (
                        <span className="text-xs font-bold text-success-deep flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 text-success" />
                          <span>Telah Dikonfirmasi Orang Tua</span>
                        </span>
                      ) : notice.requiresAcknowledgment ? (
                        <span className="text-xs font-bold text-warning-deep flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-warning" />
                          <span>Menunggu Konfirmasi</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Judul & Penulis */}
                  <div>
                    <h2 className="text-xl font-bold text-ink leading-snug">
                      {notice.title}
                    </h2>
                    <div className="text-xs text-ink-faint mt-1">
                      Ditulis oleh: <strong className="text-ink-soft">{author?.fullName || 'Pendidik'}</strong> • {new Date(notice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Hairline + Isi Pesan Teks Polos */}
                  <div className="border-t border-line pt-4">
                    <p className="text-ink-soft leading-relaxed text-sm font-normal whitespace-pre-line">
                      {notice.content}
                    </p>
                  </div>

                  {/* Respon Orang Tua / Wali (Grid 2 Kolom + Kutipan Polos) */}
                  {notice.guardianReply && (
                    <div className="border-t border-line pt-4 space-y-2">
                      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2">
                        <span className="text-success-deep font-semibold text-xs flex items-center gap-1.5">
                          <Reply className="w-4 h-4 text-success" />
                          <span>Respon Orang Tua / Wali:</span>
                        </span>
                        {notice.acknowledgedAt && (
                          <span className="text-ink-faint text-[11px] font-mono">
                            Dikonfirmasi pada {new Date(notice.acknowledgedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-ink-soft italic text-xs leading-relaxed pl-5 border-l-2 border-success-line">
                        "{notice.guardianReply}"
                      </p>
                    </div>
                  )}

                  {/* Aksi Konfirmasi Mandiri untuk Orang Tua */}
                  {securityContext?.role === 'GUARDIAN' && isGuardianOfThisChild && notice.requiresAcknowledgment && !notice.acknowledgedAt && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAckNotice(notice);
                          setGuardianReply('');
                        }}
                        className="bg-brand-primary hover-only:opacity-90 text-on-brand text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-hairline cursor-pointer"
                      >
                        <CheckCheck className="w-4 h-4 text-on-brand" />
                        <span>Tanggapi Catatan & Konfirmasi</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MODAL ADD NOTICE (Canvas-Native Tone, no white slab) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-3xl medium:rounded-2xl shadow-floating max-w-lg w-full overflow-hidden text-ink">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line-hairline flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-on-brand flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Kirim Catatan Buku Penghubung</h3>
                  <p className="text-[11px] text-ink-soft">Komunikasi Resmi Guru Kelas & Orang Tua</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-surface text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
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
                      { value: "DAILY_SUMMARY", label: "Ringkasan Harian Anak" },
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
                  className="w-full bg-surface-subtle text-ink placeholder:text-ink-faint rounded-xl min-h-[48px] px-3 py-2 font-medium border border-line-hairline outline-none focus:ring-1 focus:ring-brand-primary"
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
                  className="w-full bg-surface-subtle text-ink placeholder:text-ink-faint rounded-xl p-3 font-medium border border-line-hairline outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-xl bg-surface-subtle">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={requiresAck}
                  onChange={e => setRequiresAck(e.target.checked)}
                  className="rounded text-brand-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="reqAck" className="text-ink font-medium cursor-pointer">
                  Memerlukan tanda terima konfirmasi dari orang tua / wali
                </label>
              </div>

              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-3 border-t border-line-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full medium:w-auto px-4 py-2 rounded-xl border border-line-hairline text-ink-soft font-bold hover-only:bg-surface-subtle cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full medium:w-auto px-5 py-2 rounded-xl bg-brand-primary text-on-brand font-bold hover-only:opacity-90 shadow-hairline cursor-pointer flex justify-center items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. COMPOSER / MODAL ACKNOWLEDGMENT (Fixed glass bottom bar style) */}
      {ackNotice && (
        <div className="fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-3xl medium:rounded-2xl shadow-floating max-w-md w-full overflow-hidden text-ink">
            <div className="px-5 py-4 border-b border-line-hairline flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-success-tint text-success-deep flex items-center justify-center font-bold text-xs">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Konfirmasi Tanda Terima</h3>
                  <p className="text-[11px] text-ink-soft">Respon Resmi Wali Murid</p>
                </div>
              </div>
              <button
                onClick={() => setAckNotice(null)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-surface text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
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
                  className="w-full bg-surface-subtle text-ink placeholder:text-ink-faint rounded-xl p-3 font-medium border border-line-hairline outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                />
              </div>
              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-2 border-t border-line-hairline">
                <button
                  type="button"
                  onClick={() => setAckNotice(null)}
                  className="w-full medium:w-auto px-4 py-2 rounded-xl border border-line-hairline text-ink-soft font-bold hover-only:bg-surface-subtle cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveAck}
                  className="w-full medium:w-auto px-5 py-2 rounded-xl bg-brand-primary text-on-brand font-bold hover-only:opacity-90 shadow-hairline cursor-pointer flex justify-center items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4 text-on-brand" />
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
