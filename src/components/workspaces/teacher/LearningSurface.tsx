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
      <section className="bg-white border-y md:border border-x-0 border-slate-200 md:rounded-2xl p-4 md:p-5 md:shadow-sm space-y-4 -mx-4 md:mx-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                  Rencana Pembelajaran Harian (RPPH)
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {context.date}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {activities[0]?.theme || 'Tema: Lingkunganku yang Indah & Bersih'}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Sub-tema: {activities[0]?.subTheme || 'Sentra Balok & Konstruksi Bangunan'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPlanModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition flex justify-center items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aktivitas Sentra</span>
          </button>
        </div>

        {/* Activities Steps List */}
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border transition ${
                  act.completed
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
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
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                    >
                      {act.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{act.timeSlot}</span>
                        <h4 className="text-sm font-bold text-slate-900">{act.activityName}</h4>
                      </div>

                      {/* Materials & Planned Steps */}
                      {act.materialsNeeded && act.materialsNeeded.length > 0 && (
                        <p className="text-xs text-slate-700 mt-1">
                          <strong>Bahan & Alat:</strong> {act.materialsNeeded.join(', ')}
                        </p>
                      )}

                      {act.teacherReflection && (
                        <div className="mt-2 p-2.5 rounded-xl bg-white border border-emerald-300 text-xs">
                          <strong className="text-emerald-800">Refleksi Pendidik:</strong> {act.teacherReflection}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    act.completed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {act.completed ? 'Selesai Dilaksanakan' : 'Rencana Main'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Refleksi Aktivitas: {reflectionModalActivity.activityName}
            </h3>
            <p className="text-slate-500">
              Bagaimana keterlibatan anak selama kegiatan sentra ini? Apa respon dan capaian yang menonjol?
            </p>
            <textarea
              rows={3}
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder="Contoh: Anak-anak sangat antusias menyusun jembatan balok, sebagian besar sudah memahami konsep keseimbangan..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onToggleActivityComplete(reflectionModalActivity.id);
                  setReflectionModalActivity(null);
                }}
                className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 font-bold text-slate-500 order-2 sm:order-1"
              >
                Lewati Refleksi
              </button>
              <button
                onClick={handleSaveReflection}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 rounded-xl font-bold bg-emerald-600 text-white flex justify-center order-1 sm:order-2"
              >
                Simpan & Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Plan Activity */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Susun Rencana Aktivitas Sentra</h3>
            <form onSubmit={handleActivitySubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Aktivitas Sentra</label>
                <input
                  type="text"
                  placeholder="Contoh: Eksplorasi Membangun Menara & Jembatan"
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Tema</label>
                  <input
                    type="text"
                    value={subTheme}
                    onChange={e => setSubTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bahan & Alat Main</label>
                <input
                  type="text"
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Langkah / Pijakan Main</label>
                <textarea
                  rows={2}
                  value={steps}
                  onChange={e => setSteps(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 sm:pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 font-bold text-slate-500 order-2 sm:order-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl font-bold bg-indigo-600 text-white flex justify-center order-1 sm:order-2"
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
