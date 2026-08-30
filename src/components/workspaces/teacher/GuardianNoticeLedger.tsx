import React, { useState } from 'react';
import { GuardianNoticeItem } from '../../../types/teacherDailyTypes';
import { SelectSheet, Button, AutoResizeTextarea } from '../../ui';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Reply, 
  Send, 
  Plus, 
  X,
  FileCheck
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
  const unackCount = notices.filter(n => !n.acknowledged_at).length;

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
    <div className="space-y-6">
      {/* 1. HEADER CANVAS (Hukum F-7: Canvas-Native Hero & Actions) */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">
              Buku Penghubung
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Jembatan komunikasi harian dan konfirmasi resmi orang tua
            </p>
          </div>
          <div className="text-[11px] font-mono font-medium text-ink-faint shrink-0 pt-1">
            {notices.length} Pesan • {unackCount} Perlu Aksi
          </div>
        </div>

        {/* Action Pills Grid */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={filterUnack ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterUnack(!filterUnack)}
            className="w-full text-xs font-bold justify-center rounded-xl min-h-[44px]"
          >
            {filterUnack ? 'Belum Dibalas' : 'Semua Pesan'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewNoticeModal(true)}
            leftIcon={<Plus className="w-4 h-4 shrink-0" />}
            className="w-full text-xs font-bold justify-center rounded-xl min-h-[44px]"
          >
            Tulis Pengumuman
          </Button>
        </div>
      </header>

      {/* 2. ARTIKEL CANVAS-NATIVE (divide-y divide-line, TANPA panel bg-surface) */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-ink-soft text-xs space-y-1.5 border-y border-line">
          <FileCheck className="w-6 h-6 mx-auto text-ink-faint" />
          <p className="font-bold text-ink">
            {filterUnack ? 'Semua Pesan Telah Ditanggapi' : 'Belum Ada Pesan Penghubung'}
          </p>
          <p className="text-ink-faint text-[11px]">
            {filterUnack 
              ? 'Tidak ada pesan yang menunggu balasan saat ini.' 
              : 'Gunakan tombol Tulis Pengumuman di atas untuk mengirim pesan.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map(n => {
            const isAck = Boolean(n.acknowledged_at);
            const isReplying = replyingNoticeId === n.id;

            const typeLabel = 
              n.type === 'DAILY_SUMMARY' ? 'Ringkasan Harian' :
              n.type === 'HEALTH_ALERT' ? 'Pemberitahuan Kesehatan' :
              n.type === 'CLASS_ANNOUNCEMENT' ? 'Pengumuman Kelas' :
              n.type === 'DIRECT_NOTE' ? 'Catatan Personal' :
              n.type.replace(/_/g, ' ');

            return (
              <article key={n.id} className="py-5 space-y-3">
                {/* Baris Chip & Status Teks Polos */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-brand-tint text-brand-deep font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      {typeLabel}
                    </span>
                    {n.student_name && (
                      <span className="bg-surface-subtle text-ink-soft text-xs font-bold px-2 py-1 rounded-full">
                        Untuk: Ananda {n.student_name}
                      </span>
                    )}
                  </div>

                  <div>
                    {isAck ? (
                      <span className="text-xs font-bold text-success-deep flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>Dikonfirmasi</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-warning-deep flex items-center gap-1">
                        <Clock className="w-4 h-4 text-warning" />
                        <span>Perlu Tanggapan</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Judul & Meta */}
                <div>
                  <h4 className="text-base font-bold text-ink leading-snug">
                    {n.title}
                  </h4>
                  <div className="text-[11px] text-ink-faint mt-0.5">
                    Pengirim: <strong className="text-ink-soft">{n.author_name}</strong>
                  </div>
                </div>

                {/* Hairline + Isi Pesan Teks Polos (TANPA kotak inset) */}
                <div className="border-t border-line pt-3">
                  <p className="text-xs medium:text-sm text-ink-soft leading-relaxed whitespace-pre-line font-normal">
                    {n.content}
                  </p>
                </div>

                {/* Respon Orang Tua / Balasan */}
                {n.guardian_reply && (
                  <div className="border-t border-line pt-3 space-y-1.5">
                    <span className="font-bold text-success-deep text-xs flex items-center gap-1">
                      <Reply className="w-4 h-4 text-success" />
                      <span>Respon Orang Tua / Wali:</span>
                    </span>
                    <p className="text-xs text-ink-soft italic leading-relaxed pl-4 border-l-2 border-success-line">
                      "{n.guardian_reply}"
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying ? (
                  <div className="border-t border-line pt-3 space-y-2">
                    <AutoResizeTextarea
                      value={replyText}
                      onChange={setReplyText}
                      placeholder="Tuliskan balasan untuk orang tua..."
                      minRows={2}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingNoticeId(null)}
                        className="text-xs font-bold text-ink-soft rounded-xl"
                      >
                        Batal
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReplySubmit(n.id)}
                        leftIcon={<Send className="w-4 h-4" />}
                        className="rounded-xl"
                      >
                        Kirim Balasan
                      </Button>
                    </div>
                  </div>
                ) : (
                  !isAck && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReplyingNoticeId(n.id);
                          setReplyText('');
                        }}
                        leftIcon={<Reply className="w-4 h-4 text-success" />}
                        className="rounded-xl text-xs"
                      >
                        Tanggapi Pesan
                      </Button>
                    </div>
                  )
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* 3. MODAL NEW NOTICE */}
      {showNewNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-3xl medium:rounded-2xl shadow-floating max-w-md w-full overflow-hidden text-ink">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line-hairline flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-on-brand flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Kirim Pesan Buku Penghubung</h3>
                  <p className="text-[11px] text-ink-soft">Komunikasi Resmi Guru Kelas & Orang Tua</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewNoticeModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-surface text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-4 medium:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink-soft mb-1">Tipe Pesan</label>
                <SelectSheet
                  value={type}
                  onChange={(val) => setType(val as any)}
                  options={[
                    { value: "DAILY_SUMMARY", label: "Ringkasan Harian Kelas" },
                    { value: "HEALTH_ALERT", label: "Pemberitahuan Kesehatan" },
                    { value: "CLASS_ANNOUNCEMENT", label: "Pengumuman Rombel" },
                    { value: "DIRECT_NOTE", label: "Catatan Personal" }
                  ]}
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Judul Pesan</label>
                <input
                  type="text"
                  placeholder="Contoh: Info Pembawaan Bahan Daur Ulang Besok"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-surface-subtle text-ink placeholder:text-ink-faint rounded-xl min-h-[48px] px-4 py-2 font-medium border border-line-hairline outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Isi Pesan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan pesan lengkap untuk wali murid..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-surface-subtle text-ink placeholder:text-ink-faint rounded-xl p-3 font-medium border border-line-hairline outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                />
              </div>

              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-2 border-t border-line-soft">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNewNoticeModal(false)}
                  className="w-full medium:w-auto rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full medium:w-auto rounded-xl"
                >
                  Kirim Pesan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
