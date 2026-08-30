/**
 * Yapendik School OS — Stage 4.1 Student Roster Surface (Tab 3: Siswa & Rapor)
 * Class roster with longitudinal evidence counts, LPPA readiness metrics, and One Child Context pivots
 */

import React, { useState } from 'react';
import { StudentRosterItem } from '../../../types/teacherDailyTypes';
import { AvatarChild, Button, Badge, ProgressBar, Input } from '../../ui';
import { 
  Search, 
  Award, 
  FolderOpen, 
  Sparkles, 
  ChevronRight, 
  Camera,
  Compass
} from 'lucide-react';

interface Props {
  roster: StudentRosterItem[];
  onOpenChildPivot: (studentId: string) => void;
  onQuickCaptureForChild: (studentId: string) => void;
  onOpenLppaStudio?: (studentId: string) => void;
  onOpenContinuityModal?: (studentId: string) => void;
}

export const StudentRosterSurface: React.FC<Props> = ({
  roster,
  onOpenChildPivot,
  onQuickCaptureForChild,
  onOpenLppaStudio,
  onOpenContinuityModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = roster.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery)
  );

  return (
    <div className="space-y-6 medium:space-y-8 animate-in fade-in duration-200">
      {/* Search & Header */}
      <div className="bg-surface rounded-card border border-line p-4 medium:p-4 shadow-hairline flex flex-col medium:flex-row medium:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base medium:text-lg font-bold text-ink">Roster Siswa</h3>
            <Badge variant="lppa">
              {roster.length} Peserta Didik
            </Badge>
          </div>
          <p className="text-xs text-ink-soft font-medium mt-1 hidden medium:block">
            Pusat sintesis rapor LPPA, busur kontinuitas multi-semester, dan portofolio bukti otentik per anak.
          </p>
        </div>

        <div className="w-full medium:w-72">
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NIS..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Grid of Student Cards (Fluid Auto-Fit) */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {filtered.map(student => {
          const isLppaReady = student.lppa_ready_percentage >= 75;

          return (
            <div
              key={student.student_id}
              className="bg-surface rounded-card border border-line p-4 medium:p-4 shadow-hairline hover-only:border-line transition-all duration-150 flex flex-col justify-between gap-4"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AvatarChild
                      name={student.name}
                      id={student.student_id}
                      size="md"
                      showSymbol={false}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-ink leading-snug truncate">{student.name}</h4>
                      <p className="text-[11px] text-ink-soft font-mono font-semibold whitespace-nowrap">NIS: {student.nis}</p>
                    </div>
                  </div>

                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => onQuickCaptureForChild(student.student_id)}
                    title="Catat Momen untuk Anak Ini"
                    className="p-2 rounded-control bg-warning-tint hover-only:bg-warning-tint text-warning-deep border border-warning-line"
                  >
                    <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
                  </Button>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 pt-3 border-t border-line-soft space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-soft font-semibold flex items-center gap-1">
                      <Award className="w-4 h-4 text-lppa" /> Kesiapan LPPA:
                    </span>
                    <strong className="text-ink font-bold font-mono whitespace-nowrap">{student.lppa_ready_percentage}%</strong>
                  </div>
                  <ProgressBar
                    value={student.lppa_ready_percentage}
                    variant={isLppaReady ? 'success' : 'brand'}
                    trackClassName="h-2"
                  />
                  <div className="flex items-center justify-between text-[10px] text-ink-soft font-medium">
                    <span className="font-mono whitespace-nowrap">{student.evidence_count_semester} Bukti Tersimpan</span>
                    <span className={`font-bold ${isLppaReady ? 'text-success-deep' : 'text-ink-soft'}`}>
                      {isLppaReady ? 'Siap Rapor' : 'Perlu Bukti'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: LPPA Studio, Continuity & One Child Pivot */}
              <div className="space-y-1.5 pt-2 border-t border-line-soft">
                {onOpenLppaStudio && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenLppaStudio(student.student_id)}
                    className="w-full shadow-hairline justify-start font-semibold rounded-field"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-lppa" />
                        <span>Susun Rapor LPPA</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-75" />
                    </div>
                  </Button>
                )}

                {onOpenContinuityModal && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenContinuityModal(student.student_id)}
                    className="w-full text-xs rounded-field"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-lppa" />
                        <span>Busur Kontinuitas & Rencana</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </div>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChildPivot(student.student_id)}
                  className="w-full text-xs text-ink-soft hover-only:text-ink border border-line/60 rounded-field"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-ink-soft" />
                      <span>Buka Rekam Jejak</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </div>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
