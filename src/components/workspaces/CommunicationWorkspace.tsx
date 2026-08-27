/**
 * Yapendik School OS — Domain 05: Guardian Communication (Buku Penghubung Digital)
 * Transparent daily feedback loop between teachers and guardians.
 */

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
  AlertCircle
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
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-y md:border border-slate-200 md:rounded-lg p-4 md:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-4 md:mx-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Buku Penghubung Digital (Komunikasi Guru & Orang Tua)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Jembatan komunikasi harian, informasi pola makan & istirahat, serta konfirmasi tanda terima orang tua.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="w-full flex justify-between items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto mt-3 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors flex justify-center items-center space-x-1.5 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Catatan / Pengumuman</span>
            </button>
          )}
        </div>
      </div>

      {/* Notices list */}
      {visibleNotices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Belum ada pesan komunikasi di kelas ini</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Pendidik dapat mengirim ringkasan harian kegiatan siswa atau pengumuman kelas kepada orang tua murid.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 md:divide-none md:space-y-4 -mx-4 md:mx-0">
          {visibleNotices.map(notice => {
            const author = db.getPersonById(notice.authorPersonId);
            const student = notice.studentId ? db.getStudentById(notice.studentId) : null;
            const isGuardianOfThisChild = student && securityContext.guardianChildrenPersonIds.includes(student.personId);

            return (
              <div key={notice.id} className="bg-white px-4 py-5 md:p-5 md:border md:border-slate-200 md:rounded-lg md:shadow-sm space-y-3 transition-colors hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {notice.type.replace('_', ' ')}
                      </span>
                      {student && (
                        <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          Untuk: {student.person.fullName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {notice.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ditulis oleh: {author?.fullName || 'Pendidik'} • {new Date(notice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Acknowledgment badge */}
                  <div>
                    {notice.acknowledgedAt ? (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Telah Dikonfirmasi Orang Tua</span>
                      </div>
                    ) : notice.requiresAcknowledgment ? (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu Konfirmasi</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-md border border-slate-100">
                  {notice.content}
                </p>

                {/* Guardian reply if present */}
                {notice.guardianReply && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-md text-xs">
                    <span className="font-semibold text-emerald-900 block mb-0.5">
                      Respon Orang Tua / Wali:
                    </span>
                    <p className="text-slate-700 italic">"{notice.guardianReply}"</p>
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
                      className="w-full md:w-auto mt-3 md:mt-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded transition-colors flex justify-center items-center space-x-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Kirim Catatan Buku Penghubung
            </h2>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Komunikasi</label>
                  <select
                    value={noticeType}
                    onChange={e => setNoticeType(e.target.value)}
                    className="w-full flex justify-between items-center border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="DAILY_SUMMARY">Catatan Harian Anak</option>
                    <option value="CLASS_ANNOUNCEMENT">Pengumuman Seluruh Kelas</option>
                    <option value="HEALTH_ALERT">Pemberitahuan Kesehatan / Diet</option>
                    <option value="DIRECT_NOTE">Pesan Pribadi ke Wali</option>
                  </select>
                </div>
                {noticeType !== 'CLASS_ANNOUNCEMENT' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Siswa</label>
                    <select
                      value={targetStudentId}
                      onChange={e => setTargetStudentId(e.target.value)}
                      className="w-full flex justify-between items-center border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.person?.fullName || s.nis || 'Siswa'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pesan</label>
                <input
                  type="text"
                  placeholder="mis. Catatan Harian Kenzo (24 Agustus 2026)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pesan / Narasi:</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tuliskan perkembangan aktivitas anak, nafsu makan siang, interaksi pertemanan..."
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={requiresAck}
                  onChange={e => setRequiresAck(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <label htmlFor="reqAck" className="text-slate-800 font-medium">
                  Memerlukan tanda terima konfirmasi dari orang tua / wali
                </label>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full md:w-auto px-4 py-2 rounded border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Acknowledgment */}
      {ackNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Konfirmasi Tanda Terima Orang Tua
            </h3>
            <p className="text-slate-600 mb-4">
              Anda mengonfirmasi telah membaca catatan: <span className="font-semibold text-slate-900">"{ackNotice.title}"</span>.
            </p>
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Tulis Tanggapan / Ucapan Terima Kasih (Opsional):
              </label>
              <textarea
                rows={3}
                value={guardianReply}
                onChange={e => setGuardianReply(e.target.value)}
                placeholder="Contoh: Terima kasih Bu Siti atas pendampingannya..."
                className="w-full border border-slate-300 rounded p-2 outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAckNotice(null)}
                className="w-full md:w-auto px-4 py-2 rounded border border-slate-300 text-slate-700 font-medium"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveAck}
                className="w-full md:w-auto px-4 py-2 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Kirim Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
