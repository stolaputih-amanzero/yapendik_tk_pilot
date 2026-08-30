/**
 * YAPENDIK SCHOOL OS — STAGE 6-A TEACHER BRIEFING
 * Teacher Rhythm Machine & Serene Closure Glass Component
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 */

import React, { useState } from 'react';
import { TeacherBriefingData } from '../../../types/briefingTypes';
import { BriefingShell } from './BriefingShell';
import { useClosureSound } from '../../../hooks/useClosureSound';
import { briefingEngine } from '../../../services/BriefingEngine';
import { CheckCircle2, Sparkles, MessageSquare, BookOpen, Clock } from 'lucide-react';

export interface TeacherBriefingProps {
  data: TeacherBriefingData;
  onTriggerAction?: (actionId: string) => void;
  onClosureCompleted?: () => void;
}

export const TeacherBriefing: React.FC<TeacherBriefingProps> = ({
  data,
  onTriggerAction,
  onClosureCompleted
}) => {
  const { mode, active_phase, quick_action, pending_tasks, warm_echo, closure_summary } = data;
  const { soundEnabled, toggleSound, playClosureChime } = useClosureSound();
  const [isClosing, setIsClosing] = useState(false);
  const [closedState, setClosedState] = useState<'TUNTAS' | 'SISA_TENANG' | null>(null);
  const [isEchoExpanded, setIsEchoExpanded] = useState(false);

  const handleQuickAction = () => {
    if (quick_action && onTriggerAction) {
      onTriggerAction(quick_action.action_id);
    }
  };

  const handleTutupHari = async () => {
    setIsClosing(true);
    try {
      const state = pending_tasks.draft_observations > 0 ? 'SISA_TENANG' : 'TUNTAS';
      await briefingEngine.triggerClosureRitual(
        state,
        pending_tasks.draft_observations,
        pending_tasks.active_allergies
      );
      setClosedState(state);
      playClosureChime('INTENTIONAL');
      if (onClosureCompleted) {
        onClosureCompleted();
      }
    } catch {
      // Handle error gracefully
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <BriefingShell
      greeting={data.greeting}
      date={data.date_formatted}
      schoolLocalTime={data.school_local_time}
      mode={mode}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
    >
      <div className="space-y-4">
        {/* OPERATIONAL MODE: Active Phase & Primary Dominant Action */}
        {mode === 'OPERASIONAL' && (
          <div className="space-y-3">
            {active_phase && (
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Clock className="w-4 h-4 text-brand-primary" />
                <span>
                  Sekarang waktu <strong className="text-ink font-semibold">{active_phase.phase_name}</strong>
                </span>
              </div>
            )}

            {quick_action && (
              <button
                type="button"
                onClick={handleQuickAction}
                className="w-full min-h-[44px] px-4 py-3 rounded-field bg-brand-primary hover-only:bg-brand-deep active:scale-[0.98] text-on-brand font-medium text-sm transition-all shadow-hairline flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{quick_action.action_name}</span>
              </button>
            )}

            {/* Micro-Summary Pending Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-faint pt-1">
              {pending_tasks.attendance_incomplete ? (
                <span className="inline-flex items-center gap-1 text-warning-deep">
                  Presensi belum selesai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-success-deep">
                  <CheckCircle2 className="w-4 h-4" />
                  Presensi lengkap
                </span>
              )}
              {pending_tasks.draft_observations > 0 && (
                <>
                  <span>•</span>
                  <span>{pending_tasks.draft_observations} draf observasi</span>
                </>
              )}
              {pending_tasks.unread_messages > 0 && (
                <>
                  <span>•</span>
                  <span>{pending_tasks.unread_messages} pesan menanti</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* PRATINJAU MODE: Morning Preview */}
        {mode === 'PRATINJAU' && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Hari ini dimulai pukul 06:45 — kegiatan dan agenda siap mendampingi kelas Anda.
            </p>
            {quick_action && (
              <button
                type="button"
                onClick={handleQuickAction}
                className="w-full min-h-[44px] px-4 py-3 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-brand-primary" />
                <span>Buka Jadwal Hari Ini</span>
              </button>
            )}
          </div>
        )}

        {/* CLOSURE MODE: Serene Nighttime Closure */}
        {mode === 'PENUTUP' && (
          <div className="space-y-3">
            {closedState ? (
              <div className="p-3 rounded-field bg-surface-subtle text-xs text-ink-soft space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-ink">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>
                    {closedState === 'TUNTAS'
                      ? 'Hari tuntas sempurna. Selamat beristirahat.'
                      : 'Catatan tersimpan tenang menemani Anda besok pagi.'}
                  </span>
                </div>
                <p className="text-ink-faint pl-5">
                  OS Yapendik beristirahat bersama Anda malam ini.
                </p>
              </div>
            ) : (
              <>
                {/* Micro-Summary Summary Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                  <span>
                    {closure_summary?.present_children ?? 15}/{closure_summary?.total_children ?? 15} hadir
                  </span>
                  <span>•</span>
                  <span>{closure_summary?.moments_recorded ?? 3} momen</span>
                  <span>•</span>
                  <span>{closure_summary?.messages_replied ?? 2} pesan dibalas</span>
                </div>

                {/* Ghost Action [Tutup Hari] (Law F-7: Flat Canvas Native) */}
                <button
                  type="button"
                  onClick={handleTutupHari}
                  disabled={isClosing}
                  className="w-full min-h-[44px] px-4 py-3 rounded-field border border-line hover-only:bg-surface-subtle active:scale-[0.98] text-ink font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-ink-soft" />
                  <span>{isClosing ? 'Menutup Hari...' : 'Tutup Hari'}</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* WARM ECHO (Signature #6 Emotional Affirmation) */}
        {warm_echo && (
          <div className="mt-2">
            {/* Compact Interactive Chip Trigger */}
            <button
              type="button"
              onClick={() => setIsEchoExpanded(!isEchoExpanded)}
              className="flex items-center gap-1.5 text-xs text-ink-soft bg-surface hover-only:bg-surface-subtle border border-line-soft rounded-full px-3 py-1 transition cursor-pointer active:scale-95 text-left shadow-hairline"
              title="Ketuk untuk membaca pesan apresiasi orang tua"
              aria-expanded={isEchoExpanded}
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="font-semibold text-ink">Gema Hangat • {warm_echo.source_author}</span>
              <span className={`text-[10px] text-ink-faint transition-transform duration-200 ml-1 ${isEchoExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Expandable Quote Drawer */}
            <div className={`border-l-2 border-brand-primary pl-3 py-1 mt-2 space-y-1 ${isEchoExpanded ? 'block animate-in fade-in slide-in-from-top-1 duration-200' : 'hidden'}`}>
              <p className="text-sm italic font-serif text-ink-soft leading-relaxed">
                "{warm_echo.quote_text}"
              </p>
            </div>
          </div>
        )}
      </div>
    </BriefingShell>
  );
};
