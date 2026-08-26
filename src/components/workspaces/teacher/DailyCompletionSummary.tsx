/**
 * Yapendik School OS — Stage 4.1 Daily Completion Summary (CC-12)
 * End-of-day reconciliation indicator: Attendance complete + All drafts enriched + Notices acknowledged
 */

import React from 'react';
import { CheckCircle, AlertCircle, Sparkles, CheckCheck } from 'lucide-react';

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
    <div className={`p-4 rounded-2xl border transition-all ${
      isAllClear
        ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-sm'
        : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            isAllClear
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            {isAllClear ? <CheckCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-indigo-600" />}
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isAllClear ? 'Semua Pekerjaan Harian Selesai (All Clear)' : 'Status Rekonsiliasi Hari Ini'}
            </h4>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1">
                {isAttendanceComplete ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Presensi Lengkap</span>
              </span>

              <span className="flex items-center gap-1">
                {pendingEnrichmentCount === 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{pendingEnrichmentCount} Draf Momen Perlu Diperkaya</span>
              </span>

              <span className="flex items-center gap-1">
                {unacknowledgedNoticeCount === 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-sky-500" />
                )}
                <span>{unacknowledgedNoticeCount} Pesan Ortu</span>
              </span>
            </div>
          </div>
        </div>

        {pendingEnrichmentCount > 0 && onOpenEnrichmentQueue && (
          <button
            onClick={onOpenEnrichmentQueue}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Perkaya {pendingEnrichmentCount} Draf
          </button>
        )}
      </div>
    </div>
  );
};
