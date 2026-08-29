import React, { useState } from 'react';
import { GuardianNoticeItem } from '../../../types/teacherDailyTypes';
import { SelectSheet, Button, Badge, AutoResizeTextarea } from '../../ui';
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
      <div className="flex flex-col gap-3 bg-surface p-4 rounded-card border border-line shadow-hairline mb-4">
        {/* Baris 1: Identitas */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-control bg-brand text-on-brand flex items-center justify-center font-bold text-sm shrink-0 shadow-hairline">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-display font-bold text-ink tracking-tight leading-snug">
              Buku Penghubung
            </h3>
            <p className="text-xs text-ink-soft font-medium mt-0.5 leading-snug">
              Kemitraan Guru & Orang Tua
            </p>
          </div>
        </div>

        {/* Baris 3: Tombol aksi */}
        <div className="flex flex-col gap-2 w-full shrink-0 mt-1 medium:mt-0">
          <Button
            variant={filterUnack ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterUnack(!filterUnack)}
            className="w-full text-xs font-bold justify-center rounded-field"
          >
            {filterUnack ? 'Belum Dibalas' : 'Semua Pesan'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewNoticeModal(true)}
            leftIcon={<Plus className="w-4 h-4 shrink-0" />}
            className="w-full text-xs font-bold justify-center rounded-field"
          >
            Kirim Pengumuman
          </Button>
        </div>
      </div>

      {/* Notices List */}
      <div className="flex flex-col divide-y divide-line-soft bg-surface border border-line rounded-card overflow-hidden shadow-hairline">
        {filtered.length > 0 ? (
          filtered.map(n => {
            const isAck = Boolean(n.acknowledged_at);
            const isReplying = replyingNoticeId === n.id;

            return (
              <div
                key={n.id}
                className={`p-4 transition space-y-3 ${
                  !isAck
                    ? 'bg-warning-tint/20 hover-only:bg-warning-tint/40'
                    : 'bg-surface hover-only:bg-surface-subtle/50'
                }`}
              >
                <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-3 pb-3 border-b border-line-soft">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          n.type === 'HEALTH_ALERT' ? 'danger' :
                          n.type === 'DAILY_SUMMARY' ? 'brand' : 'neutral'
                        }
                      >
                        {n.type === 'HEALTH_ALERT' ? 'Peringatan Kesehatan' :
                         n.type === 'DAILY_SUMMARY' ? 'Ringkasan Harian' :
                         n.type === 'CLASS_ANNOUNCEMENT' ? 'Pengumuman Kelas' :
                         n.type === 'DIRECT_NOTE' ? 'Catatan Personal' :
                         n.type.replace(/_/g, ' ')}
                      </Badge>
                      {n.student_name && (
                        <span className="text-xs font-bold text-ink bg-surface-subtle px-2 py-1 rounded-pill border border-line">
                          Untuk: Ananda {n.student_name}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-ink leading-snug pt-0.5">{n.title}</h4>
                    <div className="text-[11px] text-ink-soft font-medium">
                      Pengirim: <strong className="text-ink">{n.author_name}</strong>
                    </div>
                  </div>

                  <div>
                    {isAck ? (
                      <span className="text-xs font-bold text-success-deep bg-success-tint border border-success-line px-3 py-1 rounded-pill flex items-center gap-1 shadow-hairline">
                        <CheckCircle2 className="w-4 h-4 text-success" /> Dikonfirmasi
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-warning-deep bg-warning-tint border border-warning-line px-3 py-1 rounded-pill flex items-center gap-1 shadow-hairline">
                        <Clock className="w-4 h-4 text-brass" /> Perlu Tanggapan
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs medium:text-sm text-ink leading-relaxed bg-surface-subtle/70 p-4 rounded-field border border-line font-normal">
                  {n.content}
                </p>

                {/* Guardian or Teacher reply thread if present */}
                {n.guardian_reply && (
                  <div className="p-3 rounded-field bg-success-tint/50 border border-success-line text-xs space-y-1">
                    <span className="font-bold text-success-deep flex items-center gap-1">
                      <Reply className="w-4 h-4 text-success" /> Balasan:
                    </span>
                    <p className="text-ink italic">{n.guardian_reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying ? (
                  <div className="pt-3 border-t border-line space-y-2.5">
                    <AutoResizeTextarea
                      value={replyText}
                      onChange={setReplyText}
                      placeholder="Tuliskan balasan untuk orang tua..."
                      minRows={2}
                    />
                    <div className="flex flex-col medium:flex-row items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingNoticeId(null)}
                        className="w-full medium:w-auto text-xs font-bold text-ink-soft rounded-field"
                      >
                        Batal
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReplySubmit(n.id)}
                        leftIcon={<Send className="w-4 h-4" />}
                        className="w-full medium:w-auto rounded-field"
                      >
                        Kirim Balasan
                      </Button>
                    </div>
                  </div>
                ) : (
                  !isAck && (
                    <div className="pt-2 border-t border-line-soft flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setReplyingNoticeId(n.id);
                          setReplyText('');
                        }}
                        leftIcon={<Reply className="w-4 h-4 text-success" />}
                        className="w-full medium:w-auto rounded-field"
                      >
                        Tanggapi Pesan
                      </Button>
                    </div>
                  )
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-ink-soft text-xs bg-surface-subtle">
            Tidak ada pesan penghubung yang sesuai kriteria.
          </div>
        )}
      </div>

      {/* Modal: New Notice */}
      {showNewNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-card medium:rounded-card border-t medium:border border-line shadow-floating max-w-md w-full overflow-hidden text-ink">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-control bg-brand text-on-brand flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Kirim Pesan Buku Penghubung</h3>
                  <p className="text-[11px] text-ink-soft">Komunikasi Resmi Guru Kelas & Orang Tua</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewNoticeModal(false)}
                className="w-8 h-8 rounded-pill bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
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
                  className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brass/30"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Isi Pesan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan pesan lengkap untuk wali murid..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brass/30"
                />
              </div>

              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-2 border-t border-line-soft">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNewNoticeModal(false)}
                  className="w-full medium:w-auto rounded-field"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full medium:w-auto rounded-field"
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
