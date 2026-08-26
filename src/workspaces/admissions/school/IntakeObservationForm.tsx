import React, { useState, useEffect } from 'react';
import { ProspectiveChildApplicant, AdmissionsIntakeObservation, ClassLevel } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { Sparkles, Shield, User, X } from 'lucide-react';

interface IntakeObservationFormProps {
  applicant: ProspectiveChildApplicant;
  observerPersonId: string;
  onSaveSuccess: (savedObs: AdmissionsIntakeObservation) => void;
  onClose: () => void;
}

export const IntakeObservationForm: React.FC<IntakeObservationFormProps> = ({
  applicant,
  observerPersonId,
  onSaveSuccess,
  onClose
}) => {
  const [grossMotor, setGrossMotor] = useState<string>('');
  const [fineMotor, setFineMotor] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [socialEmotional, setSocialEmotional] = useState<string>('');
  const [toiletTraining, setToiletTraining] = useState<string>('');
  const [qualitativeNotes, setQualitativeNotes] = useState<string>('');
  const [specialNeedsFlag, setSpecialNeedsFlag] = useState<boolean>(false);
  const [specialNeedsDesc, setSpecialNeedsDesc] = useState<string>('');
  const [recommendedLevel, setRecommendedLevel] = useState<ClassLevel>(applicant.target_class_level);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const existing = admissionsService.getIntakeObservation(applicant.applicant_id);
    if (existing) {
      setGrossMotor(existing.developmental_domains.gross_motor_skills || '');
      setFineMotor(existing.developmental_domains.fine_motor_skills || '');
      setLanguage(existing.developmental_domains.language_communication || '');
      setSocialEmotional(existing.developmental_domains.social_emotional_adaptation || '');
      setToiletTraining(existing.developmental_domains.toilet_training_autonomy || '');
      setQualitativeNotes(existing.observer_qualitative_notes || '');
      setSpecialNeedsFlag(existing.special_learning_needs_flag || false);
      setSpecialNeedsDesc(existing.special_needs_description || '');
      setRecommendedLevel(existing.recommended_class_level || applicant.target_class_level);
    }
  }, [applicant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const obs: AdmissionsIntakeObservation = {
        observation_id: `obs_${applicant.applicant_id}`,
        applicant_id: applicant.applicant_id,
        observer_person_id: observerPersonId,
        observation_date: new Date().toISOString().split('T')[0],
        developmental_domains: {
          gross_motor_skills: grossMotor,
          fine_motor_skills: fineMotor,
          language_communication: language,
          social_emotional_adaptation: socialEmotional,
          toilet_training_autonomy: toiletTraining
        },
        observer_qualitative_notes: qualitativeNotes,
        special_learning_needs_flag: specialNeedsFlag,
        special_needs_description: specialNeedsFlag ? specialNeedsDesc : undefined,
        recommended_class_level: recommendedLevel,
        assessed_at: new Date().toISOString()
      };

      await admissionsService.recordIntakeObservation(obs);
      await admissionsService.updateApplicantStatus(applicant.applicant_id, 'INTAKE_ASSESSED');
      onSaveSuccess(obs);
    } catch (err) {
      console.error('Failed to save intake observation:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" data-testid="intake-observation-modal">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Invarian AP-02: Karantina Asesmen Diagnostik Awal
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Instrumen Observasi Intake Calon Siswa
            </h2>
            <p className="text-xs text-slate-500">
              Calon Siswa: <strong className="text-slate-900">{applicant.child_full_name}</strong> (NIK: {applicant.child_nik})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Kemandirian & Motorik Kasar
              </label>
              <textarea
                value={grossMotor}
                onChange={(e) => setGrossMotor(e.target.value)}
                placeholder="Observasi berjalan jinjit, melompat, keseimbangan..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Motorik Halus & Koordinasi Visual
              </label>
              <textarea
                value={fineMotor}
                onChange={(e) => setFineMotor(e.target.value)}
                placeholder="Genggaman krayon, meronce, meremas playdough..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Komunikasi & Ekspresi Bahasa
              </label>
              <textarea
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Kemampuan menjawab nama, menyusun kalimat sederhana..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Sosio-Emosional & Kemandirian Toilet
              </label>
              <textarea
                value={socialEmotional}
                onChange={(e) => setSocialEmotional(e.target.value)}
                placeholder="Pemisahan dari orang tua, interaksi teman sebaya, BAK mandiri..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Catatan Kualitatif Observer (Guru Pengamat)
            </label>
            <textarea
              value={qualitativeNotes}
              onChange={(e) => setQualitativeNotes(e.target.value)}
              placeholder="Catatan holistik mengenai respon sensorik, ketertarikan eksplorasi anak..."
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="specialNeedsFlag"
                checked={specialNeedsFlag}
                onChange={(e) => setSpecialNeedsFlag(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="specialNeedsFlag" className="text-slate-800 font-bold cursor-pointer">
                Kebutuhan Pendampingan Khusus / Akomodasi Belajar Individual
              </label>
            </div>

            {specialNeedsFlag && (
              <div>
                <label className="block text-slate-600 text-xs mb-1">
                  Deskripsi Kebutuhan Khusus / Alergi / Sensitivitas Sensorik
                </label>
                <input
                  type="text"
                  value={specialNeedsDesc}
                  onChange={(e) => setSpecialNeedsDesc(e.target.value)}
                  placeholder="Contoh: Sensitivitas suara keras, membutuhkan pendampingan artikulasi..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 font-medium">Rekomendasi Rombel:</span>
              <select
                value={recommendedLevel}
                onChange={(e) => setRecommendedLevel(e.target.value as ClassLevel)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold shadow-2xs"
              >
                <option value="KB">Kelompok Bermain (KB)</option>
                <option value="TK_A">TK A</option>
                <option value="TK_B">TK B</option>
                <option value="TPA">TPA</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs transition-colors"
                data-testid="save-intake-btn"
              >
                {saving ? 'Menyimpan...' : 'Simpan Observasi Intake'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
