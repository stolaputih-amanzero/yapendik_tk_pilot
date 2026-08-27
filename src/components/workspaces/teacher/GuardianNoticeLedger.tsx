/**
 * Yapendik School OS — Stage 4.1 Guardian Notice Ledger (CC-05)
 * Two-way digital communication ledger with parent acknowledgment and structured replies
 */

import React, { useState } from 'react';
import { GuardianNoticeItem } from '../../../types/teacherDailyTypes';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Reply, 
  AlertTriangle, 
  Send, 
  Plus, 
  User 
} from 'lucide-react';

interface Props {
  notices: GuardianNoticeItem[];
  onAcknowledgeNotice: (noticeId: string, replyText?: string) => Promise<void>;
  onSendNewNotice: (notice: { studentId?: string; type: any; title: string; content: string }) => void;
}

export const GuardianNoticeLedger: React.FC<Props> = ({
  notices,
  onAcknowledgeNotice,
  onSendNewNotice
}) => {
  const [filterUnack, setFilterUnack] = useState(false);
  const [replyingNoticeId, setReplyingNoticeId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showNewNoticeModal, setShowNewNoticeModal] = useState(false);

  // New notice form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<GuardianNoticeItem['type']>('DAILY_SUMMARY');

  const filtered = filterUnack ? notices.filter(n => !n.acknowledged_at) : notices;

  const handleReplySubmit = async (noticeId: string) => {
    try {
      await onAcknowledgeNotice(noticeId, replyText.trim() || undefined);
      setReplyingNoticeId(null);
      setReplyText('');
    } catch (err: any) {
      alert(`Gagal membalas pesan: ${err?.message}`);
    }
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSendNewNotice({ title, content, type });
    setShowNewNoticeModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Buku Penghubung & Catatan Wali Murid
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Komunikasi resmi terlindungi antara guru dan orang tua
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <button
            onClick={() => setFilterUnack(!filterUnack)}
            className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex justify-center items-center cursor-pointer ${
              filterUnack
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {filterUnack ? 'Menampilkan Belum Dibalas' : 'Semua Pesan'}
          </button>

          <button
            onClick={() => setShowNewNoticeModal(true)}
            className="w-full sm:w-auto px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm flex justify-center items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kirim Pengumuman / Catatan</span>
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div className="flex flex-col divide-y divide-slate-100 bg-white border-y md:border border-slate-200 md:rounded-2xl -mx-4 md:mx-0 mt-4 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map(n => {
            const isAck = Boolean(n.acknowledged_at);
            const isReplying = replyingNoticeId === n.id;

            return (
              <div
                key={n.id}
                className={`p-4 md:p-5 transition ${
                  !isAck
                    ? 'bg-amber-50/30'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold self-start ${
                        n.type === 'HEALTH_ALERT' ? 'bg-rose-100 text-rose-800' :
                        n.type === 'DAILY_SUMMARY' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-sky-100 text-sky-800'
                      }`}>
                        {n.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{n.title}</h4>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Pengirim: <strong className="text-slate-800">{n.author_name}</strong> {n.student_name && `• Ananda ${n.student_name}`}
                    </div>
                  </div>

                  <div>
                    {isAck ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dikonfirmasi
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Perlu Tanggapan
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed mb-3 font-normal">
                  {n.content}
                </p>

                {/* Guardian or Teacher reply thread if present */}
                {n.guardian_reply && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-3">
                    <span className="font-bold text-indigo-700 flex items-center gap-1">
                      <Reply className="w-3.5 h-3.5" /> Balasan:
                    </span>
                    <p className="text-slate-800 mt-1">{n.guardian_reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying ? (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Tuliskan balasan untuk orang tua..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReplyingNoticeId(null)}
                        className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleReplySubmit(n.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Balasan & Tandai Selesai</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  !isAck && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => {
                          setReplyingNoticeId(n.id);
                          setReplyText('');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Tanggapi Pesan</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
            Tidak ada pesan penghubung yang sesuai kriteria.
          </div>
        )}
      </div>

      {/* Modal: New Notice */}
      {showNewNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kirim Pesan Buku Penghubung</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Pesan</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="DAILY_SUMMARY">Ringkasan Harian Kelas</option>
                  <option value="HEALTH_ALERT">Pemberitahuan Kesehatan</option>
                  <option value="CLASS_ANNOUNCEMENT">Pengumuman Rombel</option>
                  <option value="DIRECT_NOTE">Catatan Personal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Pesan</label>
                <input
                  type="text"
                  placeholder="Contoh: Info Pembawaan Bahan Daur Ulang Besok"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Pesan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan pesan lengkap untuk wali murid..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewNoticeModal(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
