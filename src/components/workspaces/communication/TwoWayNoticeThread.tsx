/**
 * Yapendik School OS — Stage 6 Gate 5: Two-Way Notice Thread (Compassionate Ledger)
 * Structured two-way dialogue between Teachers and Parents/Guardians.
 * Features:
 * - Teacher message bubble with type badges & Health Alert protections
 * - Acknowledgment state machine (SENT -> READ -> ACKNOWLEDGED -> REPLIED)
 * - Touch-target compliant confirmation button (min-h >= 48dp per Hukum 7.8.1)
 * - Guardian reply bubble with timestamp and confirmation receipt
 * - Zero Emoji Clutter (Hukum 11 / Lucide icons only).
 */

import React, { useState } from 'react';
import { GuardianNotice } from '../../../domain/types';
import { NoticeStatusReceipt, NoticeLifecycleStatus } from './NoticeStatusReceipt';
import { HealthAlertBadge } from './HealthAlertBadge';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Bell, 
  FileText,
  Camera,
  Check
} from 'lucide-react';

interface Props {
  notice: GuardianNotice;
  studentName?: string;
  authorName?: string;
  isGuardianView: boolean;
  onAcknowledge?: (noticeId: string, replyText?: string) => Promise<void>;
}

const TYPE_CONFIG: Record<string, { label: string; badge: string; icon: any }> = {
  DAILY_SUMMARY: { label: 'Ringkasan Harian', badge: 'bg-brand/10 text-brand border-brand/20', icon: FileText },
  ANECDOTE_SHARE: { label: 'Momen & Karya', badge: 'bg-lppa-tint text-lppa-deep border-lppa-line', icon: Camera },
  HEALTH_ALERT: { label: 'Peringatan Kesehatan', badge: 'bg-danger-tint text-danger-deep border-danger-line', icon: ShieldAlert },
  CLASS_ANNOUNCEMENT: { label: 'Pengumuman Kelas', badge: 'bg-info-tint text-info-deep border-info-line', icon: Bell },
  DIRECT_NOTE: { label: 'Catatan Khusus', badge: 'bg-warning-tint text-warning-deep border-warning-line', icon: MessageSquare }
};

export const TwoWayNoticeThread: React.FC<Props> = ({
  notice,
  studentName = 'Ananda',
  authorName = 'Pendidik',
  isGuardianView,
  onAcknowledge
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive Lifecycle Status
  let status: NoticeLifecycleStatus = 'SENT';
  if (notice.guardianReply) {
    status = 'REPLIED';
  } else if (notice.acknowledgedAt) {
    status = 'ACKNOWLEDGED';
  } else if (notice.requiresAcknowledgment) {
    status = 'DELIVERED';
  }

  const typeInfo = TYPE_CONFIG[notice.type] || TYPE_CONFIG.DAILY_SUMMARY;
  const TypeIcon = typeInfo.icon;

  const handleConfirm = async (withReply: boolean) => {
    if (!onAcknowledge) return;
    setIsSubmitting(true);
    try {
      await onAcknowledge(notice.id, withReply ? replyText.trim() : undefined);
      setIsReplying(false);
      setReplyText('');
    } catch (err: any) {
      alert(`Gagal mengirim konfirmasi: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm hover-only:shadow-md transition duration-200 flex flex-col justify-between">
      {/* 1. Header: Metadata, Type Badge & Date */}
      <div className="p-4 bg-surface-subtle/60 border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.badge}`}>
            <TypeIcon className="w-3 h-3" />
            <span>{typeInfo.label}</span>
          </span>

          {notice.studentId && (
            <span className="text-xs font-semibold text-ink px-2 py-0.5 rounded-lg bg-surface border border-line">
              Untuk: {studentName}
            </span>
          )}

          {notice.type === 'HEALTH_ALERT' && (
            <HealthAlertBadge createdAt={notice.createdAt} childName={studentName} />
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NoticeStatusReceipt
            status={status}
            timestamp={notice.acknowledgedAt || notice.createdAt}
            isGuardianView={isGuardianView}
          />
          <span className="text-[11px] text-ink-faint">
            {new Date(notice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* 2. Body: Teacher Message Bubble */}
      <div className="p-4 space-y-3 flex-1">
        <div className="space-y-1">
          <h3 className="font-bold text-ink text-base leading-snug">
            {notice.title}
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed whitespace-pre-line bg-surface-subtle p-3.5 rounded-2xl border border-line-soft">
            {notice.content}
          </p>
        </div>

        {/* Sender Footer attribution */}
        <div className="flex items-center gap-2 text-[11px] text-ink-faint pt-1">
          <User className="w-3 h-3 text-ink-soft" />
          <span>Ditulis oleh: <strong className="text-ink">{authorName}</strong></span>
        </div>

        {/* 3. Guardian Response Section */}
        {notice.acknowledgedAt && (
          <div className="mt-4 pt-4 border-t border-line-soft space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-success-deep">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Konfirmasi Diterima Orang Tua / Wali</span>
              </div>
              <span className="text-[11px] font-mono text-ink-faint">
                {new Date(notice.acknowledgedAt).toLocaleString('id-ID', { 
                  day: 'numeric', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            {notice.guardianReply && (
              <div className="bg-brand/5 border border-brand/20 p-3.5 rounded-2xl space-y-1">
                <div className="text-[11px] font-bold text-brand flex items-center gap-1">
                  <span>Balasan Orang Tua / Wali:</span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  "{notice.guardianReply}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. Action Area for Guardian (When Unacknowledged) */}
        {isGuardianView && notice.requiresAcknowledgment && !notice.acknowledgedAt && (
          <div className="mt-4 pt-4 border-t border-line space-y-3">
            {!isReplying ? (
              <div className="flex flex-col compact:flex-row items-stretch compact:items-center gap-2">
                {/* Touch-Target Compliant CTA (min-h >= 48dp per Hukum 7.8.1) */}
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  disabled={isSubmitting}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-brand text-on-brand font-bold text-xs shadow-sm ring-1 ring-brand/50 hover-only:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer flex-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Saya Mengerti / Sudah Membaca'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReplying(true)}
                  disabled={isSubmitting}
                  className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-line bg-surface text-ink text-xs font-semibold hover-only:bg-surface-subtle transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-ink-soft" />
                  <span>Kirim Balasan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 bg-surface-subtle p-3 rounded-2xl border border-line animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-ink">
                  Tulis Catatan Balasan untuk Guru:
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Terima kasih Bu Guru, obat sirup sudah kami titipkan di tas saku depan..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface border border-line focus:ring-1 focus:ring-brand outline-none text-ink resize-none shadow-hairline"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    disabled={isSubmitting}
                    className="min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-ink-soft hover-only:bg-line-soft transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirm(true)}
                    disabled={isSubmitting || !replyText.trim()}
                    className="min-h-[44px] px-4 rounded-xl bg-brand text-on-brand text-xs font-bold shadow-sm ring-1 ring-brand/50 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Mengirim...' : 'Kirim Balasan &amp; Konfirmasi'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
