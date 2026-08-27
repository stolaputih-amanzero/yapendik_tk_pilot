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
    <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Buku Penghubung Digital
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Jembatan komunikasi harian dan konfirmasi resmi guru & wali murid
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-500 font-medium shrink-0">Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer text-xs"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {canCreate && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex justify-center items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tulis Catatan / Pengumuman</span>
              </button>
            )}
          </div>
        </div>

        {/* Matching-Pill Context Ribbon */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-5 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-800">
              📅 T.A. 2026/2027 • GANJIL
            </span>
            <span>•</span>
            <span className="text-slate-700 font-bold">{selectedClass?.name || 'Kelompok A'}</span>
            <span>•</span>
            <span className="text-slate-500">Kurikulum Merdeka TK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Total Catatan:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px]">
              {visibleNotices.length} Pesan
            </span>
          </div>
        </div>
      </div>

      {/* Filter Subtabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterMode('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filterMode === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Catatan ({visibleNotices.length})
        </button>
        <button
          onClick={() => setFilterMode('UNACK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            filterMode === 'UNACK'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Perlu Konfirmasi Saya</span>
          {unackCount > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              filterMode === 'UNACK' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
            }`}>
              {unackCount}
            </span>
          )}
        </button>
      </div>

      {/* Notices list */}
      {displayedNotices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {filterMode === 'UNACK' 
              ? 'Semua Catatan Telah Dikonfirmasi' 
              : 'Belum ada pesan komunikasi di kelas ini'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {filterMode === 'UNACK'
              ? 'Tidak ada pesan yang membutuhkan tanda terima konfirmasi dari Anda saat ini.'
              : 'Pendidik dapat mengirim ringkasan harian kegiatan siswa atau pengumuman kelas kepada orang tua murid.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 bg-white border-y md:border border-slate-200 md:rounded-2xl -mx-4 md:mx-0 overflow-hidden shadow-2xs">
          {displayedNotices.map(notice => {
            const author = db.getPersonById(notice.authorPersonId);
            const student = notice.studentId ? db.getStudentById(notice.studentId) : null;
            const isGuardianOfThisChild = !notice.studentId || (student && securityContext.guardianChildrenPersonIds.includes(student.personId));

            return (
              <div key={notice.id} className="py-5 px-4 sm:px-6 hover:bg-slate-50/50 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        notice.type === 'HEALTH_ALERT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        notice.type === 'DAILY_SUMMARY' ? 'bg-slate-900 text-white' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {notice.type.replace(/_/g, ' ')}
                      </span>
                      {student && (
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          Untuk: {student.person.fullName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug pt-0.5">
                      {notice.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Ditulis oleh: <strong className="text-slate-800">{author?.fullName || 'Pendidik'}</strong> • {new Date(notice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Acknowledgment badge */}
                  <div className="shrink-0">
                    {notice.acknowledgedAt ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Telah Dikonfirmasi Orang Tua</span>
                      </div>
                    ) : notice.requiresAcknowledgment ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menunggu Konfirmasi</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {notice.content}
                </p>

                {/* Guardian reply if present */}
                {notice.guardianReply && (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-950 block">
                      Respon Orang Tua / Wali:
                    </span>
                    <p className="text-slate-800 italic">"{notice.guardianReply}"</p>
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
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Catatan Buku Penghubung</h3>
                  <p className="text-[11px] text-slate-500">Komunikasi Resmi Guru Kelas & Orang Tua</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNotice} className="p-5 sm:p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Komunikasi</label>
                  <select
                    value={noticeType}
                    onChange={e => setNoticeType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="DAILY_SUMMARY">Catatan Harian Anak</option>
                    <option value="CLASS_ANNOUNCEMENT">Pengumuman Seluruh Kelas</option>
                    <option value="HEALTH_ALERT">Pemberitahuan Kesehatan / Diet</option>
                    <option value="DIRECT_NOTE">Pesan Pribadi ke Wali</option>
                  </select>
                </div>
                {noticeType !== 'CLASS_ANNOUNCEMENT' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Siswa</label>
                    <select
                      value={targetStudentId}
                      onChange={e => setTargetStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.person?.fullName || s.nis || 'Siswa'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Pesan</label>
                <input
                  type="text"
                  placeholder="mis. Catatan Harian Kenzo (24 Agustus 2026)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Pesan / Narasi:</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tuliskan perkembangan aktivitas anak, nafsu makan siang, interaksi pertemanan..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={requiresAck}
                  onChange={e => setRequiresAck(e.target.checked)}
                  className="rounded text-slate-900 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="reqAck" className="text-slate-800 font-medium cursor-pointer">
                  Memerlukan tanda terima konfirmasi dari orang tua / wali
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Acknowledgment */}
      {ackNotice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-900">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Konfirmasi Tanda Terima</h3>
                  <p className="text-[11px] text-slate-500">Respon Resmi Wali Murid</p>
                </div>
              </div>
              <button
                onClick={() => setAckNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Anda mengonfirmasi telah membaca catatan: <strong className="text-slate-900">"{ackNotice.title}"</strong>.
              </p>
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Tulis Tanggapan / Ucapan Terima Kasih (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={guardianReply}
                  onChange={e => setGuardianReply(e.target.value)}
                  placeholder="Contoh: Terima kasih Bu Guru atas pendampingannya..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAckNotice(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveAck}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
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
