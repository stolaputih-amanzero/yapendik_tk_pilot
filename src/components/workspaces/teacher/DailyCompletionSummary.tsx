import React from 'react';
import { CheckCircle, AlertCircle, Sparkles, CheckCheck } from 'lucide-react';
import { Button } from '../../ui';

interface Props {
  isAttendanceComplete: boolean;
  pendingEnrichmentCount: number;
  unacknowledgedNoticeCount: number;
  isAllClear: boolean;
  onOpenEnrichmentQueue?: () => void;
}

export const DailyCompletionSummary: React.FC<Props> = ({
  isAttendanceComplete,
  pendingEnrichmentCount,
  unacknowledgedNoticeCount,
  isAllClear,
  onOpenEnrichmentQueue
}) => {
  return (
    <div className="p-5 rounded-2xl bg-surface transition-all text-ink shadow-hairline">
      <div className="flex flex-col gap-4">
        {/* Baris 1: Identitas */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            isAllClear
              ? 'bg-success text-on-brand'
              : 'bg-surface-subtle text-brand-primary'
          }`}>
            {isAllClear ? <CheckCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-brand-primary fill-brand-primary" />}
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep">
            {isAllClear ? 'Semua Tugas Selesai' : 'Status Rekonsiliasi'}
          </h4>
        </div>

        {/* Baris 2: List metrik rekonsiliasi (M-2: divide-y divide-line-hairline py-2) */}
        <div className="divide-y divide-line-hairline text-xs font-semibold text-ink-soft">
          <div className="py-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              {isAttendanceComplete ? (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-brand-primary shrink-0" />
              )}
              <span>Presensi Lengkap</span>
            </span>
            <span className={`font-mono text-[11px] font-bold px-2 py-1 rounded-full ${
              isAttendanceComplete
                ? 'bg-success-tint text-success-deep'
                : 'bg-warning-tint text-warning-deep'
            }`}>
              {isAttendanceComplete ? '100%' : 'Belum'}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              {pendingEnrichmentCount === 0 ? (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-brand-primary shrink-0" />
              )}
              <span>Draf Momen Perlu Diperkaya</span>
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-full bg-surface-subtle text-ink">
              {pendingEnrichmentCount}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              {unacknowledgedNoticeCount === 0 ? (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-info shrink-0" />
              )}
              <span>Pesan Ortu</span>
            </span>
            <span className={`font-mono text-[11px] font-bold px-2 py-1 rounded-full ${
              unacknowledgedNoticeCount > 0
                ? 'bg-info-tint text-info-deep'
                : 'bg-surface-subtle text-ink'
            }`}>
              {unacknowledgedNoticeCount}
            </span>
          </div>
        </div>

        {/* Baris 3: Tombol aksi */}
        {pendingEnrichmentCount > 0 && onOpenEnrichmentQueue && (
          <div className="flex flex-wrap gap-2 w-full medium:w-auto shrink-0 mt-1 medium:mt-0">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenEnrichmentQueue}
              className="w-full medium:w-auto bg-warning text-on-brand border-warning font-bold text-xs rounded-field"
            >
              Perkaya {pendingEnrichmentCount} Draf
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
