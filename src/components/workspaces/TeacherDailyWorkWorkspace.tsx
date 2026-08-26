/**
 * Yapendik School OS — Domain 01: Teacher Daily Work (Kerja Harian Guru)
 * Supports daily learning plans, sentra activities, steps, and teacher reflections.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { LearningActivity, DevelopmentDomain, ClassRoom } from '../../domain/types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Plus, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const TeacherDailyWorkWorkspace: React.FC = () => {
  const { securityContext, currentPersona } = useSecurityContext();
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_tka_01');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-24');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reflectionModalActivity, setReflectionModalActivity] = useState<LearningActivity | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  // Form State
  const [theme, setTheme] = useState('Diriku / Panca Indra Ciptaan Tuhan');
  const [subTheme, setSubTheme] = useState('Eksplorasi Indra Pengecap');
  const [timeSlot, setTimeSlot] = useState('08:00 - 09:30');
  const [activityName, setActivityName] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<DevelopmentDomain[]>(['KOGNITIF', 'NILAI_AGAMA_MORAL']);
  const [materials, setMaterials] = useState('');
  const [steps, setSteps] = useState('');

  const loadData = () => {
    if (!securityContext) return;
    const schoolClasses = db.getClasses(securityContext.activeSchoolId);
    setClasses(schoolClasses);
    if (schoolClasses.length > 0 && !schoolClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(schoolClasses[0].id);
    }
    const actList = db.getLearningActivities(securityContext.activeSchoolId, selectedClassId, selectedDate);
    setActivities(actList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId, selectedDate]);

  // Authorization check for creating / editing activities
  const authResult = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'CREATE',
    resource: 'TEACHER_DAILY_WORK',
    resourceSchoolId: securityContext.activeSchoolId,
    targetClassId: selectedClassId
  }) : { granted: false, reason: 'Konteks identitas belum siap' };

  const handleToggleComplete = (activity: LearningActivity) => {
    if (!authResult.granted) {
      alert(`Otorisasi Ditolak: ${authResult.reason}`);
      return;
    }
    if (!activity.completed && !activity.teacherReflection) {
      setReflectionModalActivity(activity);
      setReflectionText('');
    } else {
      db.toggleActivityComplete(activity.id);
    }
  };

  const handleSaveReflection = () => {
    if (reflectionModalActivity) {
      db.toggleActivityComplete(reflectionModalActivity.id, reflectionText);
      setReflectionModalActivity(null);
      setReflectionText('');
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    db.addLearningActivity({
      schoolId: securityContext.activeSchoolId,
      classId: selectedClassId,
      date: selectedDate,
      theme,
      subTheme,
      timeSlot,
      activityName,
      developmentalFocus: selectedDomains,
      materialsNeeded: materials.split('\n').filter(m => m.trim().length > 0),
      plannedSteps: steps.split('\n').filter(s => s.trim().length > 0),
      completed: false
    }, securityContext.personName, securityContext.userId, securityContext.role);

    setShowAddModal(false);
    setActivityName('');
    setMaterials('');
    setSteps('');
  };

  const toggleDomainSelection = (d: DevelopmentDomain) => {
    if (selectedDomains.includes(d)) {
      setSelectedDomains(selectedDomains.filter(item => item !== d));
    } else {
      setSelectedDomains([...selectedDomains, d]);
    }
  };

  const availableDomains: { key: DevelopmentDomain; label: string; bg: string }[] = [
    { key: 'NILAI_AGAMA_MORAL', label: 'Nilai Agama & Moral', bg: 'bg-emerald-100 text-emerald-800' },
    { key: 'FISIK_MOTORIK', label: 'Fisik-Motorik', bg: 'bg-amber-100 text-amber-800' },
    { key: 'KOGNITIF', label: 'Kognitif', bg: 'bg-blue-100 text-blue-800' },
    { key: 'BAHASA', label: 'Bahasa', bg: 'bg-purple-100 text-purple-800' },
    { key: 'SOSIAL_EMOSIONAL', label: 'Sosial-Emosional', bg: 'bg-rose-100 text-rose-800' },
    { key: 'SENI', label: 'Seni & Kreativitas', bg: 'bg-indigo-100 text-indigo-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Context Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Agenda & Kerja Harian Guru (TK Pilot)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengorganisasian sentra kegiatan, fokus capaian perkembangan, dan catatan refleksi pedagogis.
          </p>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {authResult.granted && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Rencana Aktivitas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Authorization banner if restricted */}
      {!authResult.granted && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Mode Tinjauan Terbatas:</span> {authResult.reason}
          </div>
        </div>
      )}

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Belum ada agenda aktivitas untuk tanggal ini</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Gunakan tombol "Rencana Aktivitas Baru" di atas untuk menyusun jadwal pembelajaran sentra anak usia dini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activities.map((act) => (
            <div 
              key={act.id} 
              className={`bg-white border rounded-lg p-5 transition-all shadow-sm ${
                act.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.timeSlot}
                    </span>
                    {act.completed && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Selesai Dilaksanakan
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {act.activityName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Tema: <span className="font-medium text-slate-700">{act.theme}</span> • {act.subTheme}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleComplete(act)}
                  disabled={!authResult.granted}
                  title={act.completed ? "Tandai belum selesai" : "Tandai selesai terlaksana"}
                  className={`p-1.5 rounded-md border transition-colors shrink-0 ${
                    act.completed 
                      ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Developmental Domains */}
              <div className="my-3 flex flex-wrap gap-1.5">
                {act.developmentalFocus.map(d => {
                  const dom = availableDomains.find(ad => ad.key === d);
                  return (
                    <span key={d} className={`text-[10px] font-medium px-2 py-0.5 rounded ${dom?.bg || 'bg-slate-100'}`}>
                      {dom?.label || d}
                    </span>
                  );
                })}
              </div>

              {/* Steps and Materials */}
              <div className="space-y-3 text-xs text-slate-700">
                {act.materialsNeeded.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Alat & Bahan:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {act.materialsNeeded.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {act.plannedSteps.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Langkah Alur Kegiatan:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                      {act.plannedSteps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Reflection */}
                {act.teacherReflection && (
                  <div className="mt-3 p-3 bg-amber-50/60 border border-amber-100 rounded-md">
                    <span className="font-semibold text-amber-900 text-[11px] uppercase tracking-wide block mb-1">
                      Refleksi & Catatan Guru:
                    </span>
                    <p className="text-slate-800 italic leading-relaxed">
                      "{act.teacherReflection}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Activity */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Rencana Aktivitas Pembelajaran TK
            </h2>
            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tema Utama</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sub-Tema</label>
                  <input
                    type="text"
                    value={subTheme}
                    onChange={e => setSubTheme(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Aktivitas</label>
                  <input
                    type="text"
                    placeholder="mis. Sentra Balok: Membangun Menara Rumah"
                    value={activityName}
                    onChange={e => setActivityName(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Fokus Capaian Perkembangan:</label>
                <div className="flex flex-wrap gap-2">
                  {availableDomains.map(d => {
                    const isChecked = selectedDomains.includes(d.key);
                    return (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => toggleDomainSelection(d.key)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                          isChecked 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bahan & Perlengkapan (Satu per baris):</label>
                <textarea
                  rows={3}
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  placeholder="Kertas gambar A3&#10;Cat warna primer non-toksik&#10;Lap pembersih"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Langkah-Langkah Kegiatan (Satu per baris):</label>
                <textarea
                  rows={4}
                  value={steps}
                  onChange={e => setSteps(e.target.value)}
                  placeholder="1. Pijakan sebelum main: Berdoa dan penjelasan aturan sentra&#10;2. Pijakan saat main: Eksplorasi mandiri dan stimulasi guru&#10;3. Pijakan setelah main: Membereskan mainan bersama"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                >
                  Simpan Rencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Teacher Reflection */}
      {reflectionModalActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Refleksi Guru Setelah Pelaksanaan
            </h3>
            <p className="text-slate-500 mb-4">
              Aktivitas: <span className="font-semibold text-slate-800">{reflectionModalActivity.activityName}</span>
            </p>
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700">
                Bagaimana respon anak-anak? Adakah anak yang memerlukan bimbingan khusus?
              </label>
              <textarea
                rows={4}
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder="Contoh: Seluruh anak antusias berpartisipasi. Kenzo menunjukkan inisiatif membagi giliran bermain balok kepada temannya..."
                className="w-full border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReflectionModalActivity(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 font-medium"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveReflection}
                className="px-4 py-1.5 rounded bg-emerald-700 text-white font-semibold hover:bg-emerald-800"
              >
                Simpan & Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
