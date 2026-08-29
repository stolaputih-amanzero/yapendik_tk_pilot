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
    <div className={`p-4 medium:p-4 rounded-card border transition-all ${
      isAllClear
        ? 'bg-success-tint/40 border-success-line text-success-deep shadow-hairline'
        : 'bg-surface border-line text-ink shadow-hairline'
    }`}>
      <div className="flex flex-col gap-3 medium:flex-row medium:items-center medium:justify-between">
        
        {/* Baris 1: Identitas */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`p-2 rounded-control flex items-center justify-center ${
            isAllClear
              ? 'bg-success text-on-brand'
              : 'bg-surface-subtle text-ink border border-line'
          }`}>
            {isAllClear ? <CheckCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-brass fill-brass" />}
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-display">
            {isAllClear ? 'Semua Tugas Selesai' : 'Status Rekonsiliasi'}
          </h4>
        </div>

        {/* Baris 2: Chip metrik */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-soft">
          <span className="flex items-center gap-1">
            {isAttendanceComplete ? (
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-brass shrink-0" />
            )}
            <span>Presensi Lengkap</span>
          </span>

          <span className="flex items-center gap-1">
            {pendingEnrichmentCount === 0 ? (
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-brass shrink-0" />
            )}
            <span><strong className="font-mono whitespace-nowrap">{pendingEnrichmentCount}</strong> Draf Momen Perlu Diperkaya</span>
          </span>

          <span className="flex items-center gap-1">
            {unacknowledgedNoticeCount === 0 ? (
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-info shrink-0" />
            )}
            <span><strong className="font-mono whitespace-nowrap">{unacknowledgedNoticeCount}</strong> Pesan Ortu</span>
          </span>
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
