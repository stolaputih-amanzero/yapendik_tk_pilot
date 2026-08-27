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
  User,
  X
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Buku Penghubung & Catatan Wali Murid
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Komunikasi harian terarah dan terstruktur antara guru kelas dan orang tua
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={() => setFilterUnack(!filterUnack)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition flex justify-center items-center cursor-pointer ${
              filterUnack
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {filterUnack ? 'Menampilkan Belum Dibalas' : 'Semua Pesan'}
          </button>

          <button
            onClick={() => setShowNewNoticeModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs flex justify-center items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kirim Pengumuman / Catatan</span>
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div className="flex flex-col divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        {filtered.length > 0 ? (
          filtered.map(n => {
            const isAck = Boolean(n.acknowledged_at);
            const isReplying = replyingNoticeId === n.id;

            return (
              <div
                key={n.id}
                className={`p-5 transition space-y-3 ${
                  !isAck
                    ? 'bg-amber-50/20 hover:bg-amber-50/40'
                    : 'bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        n.type === 'HEALTH_ALERT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        n.type === 'DAILY_SUMMARY' ? 'bg-slate-900 text-white' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {n.type.replace(/_/g, ' ')}
                      </span>
                      {n.student_name && (
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          Untuk: Ananda {n.student_name}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug pt-0.5">{n.title}</h4>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Pengirim: <strong className="text-slate-800">{n.author_name}</strong>
                    </div>
                  </div>

                  <div>
                    {isAck ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dikonfirmasi
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Perlu Tanggapan
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 font-normal">
                  {n.content}
                </p>

                {/* Guardian or Teacher reply thread if present */}
                {n.guardian_reply && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <Reply className="w-3.5 h-3.5 text-emerald-600" /> Balasan:
                    </span>
                    <p className="text-slate-800 italic">{n.guardian_reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying ? (
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Tuliskan balasan untuk orang tua..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    />
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                      <button
                        onClick={() => setReplyingNoticeId(null)}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleReplySubmit(n.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex justify-center items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Balasan & Tandai Selesai</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  !isAck && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setReplyingNoticeId(n.id);
                          setReplyText('');
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex justify-center items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tanggapi Pesan</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50">
            Tidak ada pesan penghubung yang sesuai kriteria.
          </div>
        )}
      </div>

      {/* Modal: New Notice */}
      {showNewNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Pesan Buku Penghubung</h3>
                  <p className="text-[11px] text-slate-500">Komunikasi Resmi Guru Kelas & Orang Tua</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewNoticeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Pesan</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="DAILY_SUMMARY">Ringkasan Harian Kelas</option>
                  <option value="HEALTH_ALERT">Pemberitahuan Kesehatan</option>
                  <option value="CLASS_ANNOUNCEMENT">Pengumuman Rombel</option>
                  <option value="DIRECT_NOTE">Catatan Personal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Pesan</label>
                <input
                  type="text"
                  placeholder="Contoh: Info Pembawaan Bahan Daur Ulang Besok"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Pesan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan pesan lengkap untuk wali murid..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewNoticeModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
