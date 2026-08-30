/**
 * Yapendik School OS — Stage 4.1 Learning Surface (Tab 2: Belajar & Karya)
 * Connects Intentional Plan (RPPH / Sentra Activities) with Empirical Evidence (Observation Feed)
 */

import React, { useState } from 'react';
import { 
  ClassObservationItem, 
  ActiveTeacherContext 
} from '../../../types/teacherDailyTypes';
import { LearningActivity, DevelopmentDomain } from '../../../domain/types';
import { ObservationFeed } from './ObservationFeed';
import { Button, Badge } from '../../ui';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Clock, 
  Tag, 
  Check, 
  X 
} from 'lucide-react';

interface Props {
  context: ActiveTeacherContext;
  activities: LearningActivity[];
  observations: ClassObservationItem[];
  onToggleActivityComplete: (activityId: string, reflection?: string) => void;
  onAddActivity: (activity: Omit<LearningActivity, 'id'>) => void;
  onOpenEnrichment: (obs: ClassObservationItem) => void;
  onOpenQuickCapture: () => void;
}

export const LearningSurface: React.FC<Props> = ({
  context,
  activities,
  observations,
  onToggleActivityComplete,
  onAddActivity,
  onOpenEnrichment,
  onOpenQuickCapture
}) => {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [reflectionModalActivity, setReflectionModalActivity] = useState<LearningActivity | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  // New Activity form
  const [theme, setTheme] = useState('Diriku / Panca Indra Ciptaan Tuhan');
  const [subTheme, setSubTheme] = useState('Eksplorasi Sentra Balok & Konstruksi');
  const [timeSlot, setTimeSlot] = useState('08:30 - 10:00');
  const [activityName, setActivityName] = useState('');
  const [materials, setMaterials] = useState('Balok kayu berbagai ukuran, alas karpet, miniatur figur');
  const [steps, setSteps] = useState('1. Pijakan sebelum main; 2. Pijakan saat main; 3. Pijakan setelah main (beres-beres)');

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    onAddActivity({
      schoolId: context.school_id,
      classId: context.class_id,
      date: context.date,
      theme,
      subTheme,
      timeSlot,
      activityName,
      developmentalFocus: ['KOGNITIF', 'NILAI_AGAMA_MORAL', 'FISIK_MOTORIK'],
      materialsNeeded: materials.split(',').map(m => m.trim()),
      plannedSteps: steps.split(';').map(s => s.trim()),
      completed: false
    });

    setShowAddPlanModal(false);
    setActivityName('');
  };

  const handleSaveReflection = () => {
    if (reflectionModalActivity) {
      onToggleActivityComplete(reflectionModalActivity.id, reflectionText);
      setReflectionModalActivity(null);
      setReflectionText('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Intentional Plan (RPPH & Sentra) */}
      <section className="bg-surface border border-line rounded-card p-4 medium:p-4 shadow-hairline space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 pb-3 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-control bg-lppa-tint text-lppa-deep border border-lppa-line">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-lppa-deep">
                  Rencana Pembelajaran Harian (RPPH)
                </span>
                <span className="px-2 py-1 text-[11px] font-semibold rounded-pill bg-surface-subtle text-ink-soft border border-line">
                  {context.date}
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink mt-0.5">
                {activities[0]?.theme || 'Tema: Lingkunganku yang Indah & Bersih'}
              </h3>
              <p className="text-xs text-ink-soft font-medium">
                Sub-tema: {activities[0]?.subTheme || 'Sentra Balok & Konstruksi Bangunan'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddPlanModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full medium:w-auto bg-lppa-tint hover-only:bg-lppa-tint/80 text-lppa-deep border-lppa-line rounded-field"
          >
            Tambah Aktivitas Sentra
          </Button>
        </div>

        {/* Activities Steps List */}
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div
                key={act.id}
                className={`p-4 rounded-field border transition ${
                  act.completed
                    ? 'bg-success-tint/70 border-success-line'
                    : 'bg-surface-subtle border-line'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        if (!act.completed && !act.teacherReflection) {
                          setReflectionModalActivity(act);
                        } else {
                          onToggleActivityComplete(act.id);
                        }
                      }}
                      className="mt-0.5 text-ink-faint hover-only:text-success transition cursor-pointer"
                    >
                      {act.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-ink-soft whitespace-nowrap">{act.timeSlot}</span>
                        <h4 className="text-sm font-bold text-ink">{act.activityName}</h4>
                      </div>

                      {/* Materials & Planned Steps */}
                      {act.materialsNeeded && act.materialsNeeded.length > 0 && (
                        <p className="text-xs text-ink-soft mt-1">
                          <strong>Bahan & Alat:</strong> {act.materialsNeeded.join(', ')}
                        </p>
                      )}

                      {act.teacherReflection && (
                        <div className="mt-2 p-2 rounded-field bg-surface border border-success-line text-xs">
                          <strong className="text-success-deep">Refleksi Pendidik:</strong> {act.teacherReflection}
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant={act.completed ? 'success' : 'warning'}>
                    {act.completed ? 'Selesai Dilaksanakan' : 'Rencana Main'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-ink-soft text-xs">
              Belum ada rencana aktivitas sentra untuk hari ini.
            </div>
          )}
        </div>
      </section>

      {/* 2. Observation Feed (Empirical Real-time Moments) */}
      <section>
        <ObservationFeed
          observations={observations}
          onOpenEnrichment={onOpenEnrichment}
          onOpenQuickCapture={onOpenQuickCapture}
        />
      </section>

      {/* Modal: Reflection on Complete */}
      {reflectionModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/70 backdrop-blur-xs">
          <div className="bg-surface dark:bg-surface rounded-card p-6 w-full max-w-md shadow-floating border border-line text-xs space-y-4">
            <h3 className="text-sm font-bold text-ink">
              Refleksi Aktivitas: {reflectionModalActivity.activityName}
            </h3>
            <p className="text-ink-soft">
              Bagaimana keterlibatan anak selama kegiatan sentra ini? Apa respon dan capaian yang menonjol?
            </p>
            <textarea
              rows={3}
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder="Contoh: Anak-anak sangat antusias menyusun jembatan balok, sebagian besar sudah memahami konsep keseimbangan..."
              className="w-full px-3 py-2 rounded-field bg-surface-subtle border border-line"
            />
            <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onToggleActivityComplete(reflectionModalActivity.id);
                  setReflectionModalActivity(null);
                }}
                className="w-full medium:w-auto px-3 py-2 medium:py-1 font-bold text-ink-soft order-2 medium:order-1 cursor-pointer"
              >
                Lewati Refleksi
              </button>
              <button
                onClick={handleSaveReflection}
                className="w-full medium:w-auto px-4 py-2 medium:py-1 rounded-field font-bold bg-success text-on-brand flex justify-center order-1 medium:order-2 cursor-pointer"
              >
                Simpan & Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Plan Activity */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/70 backdrop-blur-xs">
          <div className="bg-surface rounded-card p-6 w-full max-w-lg shadow-floating border border-line text-xs space-y-4">
            <h3 className="text-sm font-bold text-ink">Susun Rencana Aktivitas Sentra</h3>
            <form onSubmit={handleActivitySubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-ink-soft mb-1">Nama Aktivitas Sentra</label>
                <input
                  type="text"
                  placeholder="Contoh: Eksplorasi Membangun Menara & Jembatan"
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-field bg-surface-subtle border border-line"
                />
              </div>

              <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-field bg-surface-subtle border border-line"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-soft mb-1">Sub-Tema</label>
                  <input
                    type="text"
                    value={subTheme}
                    onChange={e => setSubTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-field bg-surface-subtle border border-line"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Bahan & Alat Main</label>
                <input
                  type="text"
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  className="w-full px-3 py-2 rounded-field bg-surface-subtle border border-line"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-soft mb-1">Langkah / Pijakan Main</label>
                <textarea
                  rows={2}
                  value={steps}
                  onChange={e => setSteps(e.target.value)}
                  className="w-full px-3 py-2 rounded-field bg-surface-subtle border border-line"
                />
              </div>

              <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-2 pt-4 medium:pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="w-full medium:w-auto px-4 py-2 medium:py-2 font-bold text-ink-soft order-2 medium:order-1 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full medium:w-auto px-5 py-2 medium:py-2 rounded-field font-bold bg-brand text-on-brand flex justify-center order-1 medium:order-2 cursor-pointer"
                >
                  Simpan Rencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
