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
    <div className={`p-4 md:rounded-2xl border-y md:border border-x-0 transition-all -mx-4 md:mx-0 ${
      isAllClear
        ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950 md:shadow-xs'
        : 'bg-white border-slate-200 text-slate-900 md:shadow-xs'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            isAllClear
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            {isAllClear ? <CheckCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {isAllClear ? 'Semua Pekerjaan Harian Selesai (All Clear)' : 'Status Rekonsiliasi Hari Ini'}
            </h4>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                {isAttendanceComplete ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Presensi Lengkap</span>
              </span>

              <span className="flex items-center gap-1">
                {pendingEnrichmentCount === 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{pendingEnrichmentCount} Draf Momen Perlu Diperkaya</span>
              </span>

              <span className="flex items-center gap-1">
                {unacknowledgedNoticeCount === 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
                )}
                <span>{unacknowledgedNoticeCount} Pesan Ortu</span>
              </span>
            </div>
          </div>
        </div>

        {pendingEnrichmentCount > 0 && onOpenEnrichmentQueue && (
          <button
            type="button"
            onClick={onOpenEnrichmentQueue}
            className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex justify-center items-center shadow-xs"
          >
            Perkaya {pendingEnrichmentCount} Draf
          </button>
        )}
      </div>
    </div>
  );
};
