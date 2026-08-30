import React, { useState, useEffect } from 'react';
import { ProspectiveChildApplicant, AdmissionsIntakeObservation, ClassLevel } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { SegmentedControl } from '../../../components/ui';
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
    <div className="fixed inset-0 z-50 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" data-testid="intake-observation-modal">
      <div className="w-full max-w-3xl bg-surface border border-line rounded-card shadow-floating p-6 medium:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-line-soft pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider tracking-wide font-bold rounded-full bg-surface-subtle text-ink-soft border border-line">
                Tahap 2: Asesmen Diagnostik
              </span>
            </div>
            <h2 className="text-xl font-bold text-ink tracking-tight mt-1">
              Instrumen Observasi Intake Calon Siswa
            </h2>
            <div className="flex flex-col gap-0.5 mt-2">
              <span className="text-sm font-bold text-ink leading-tight">
                {applicant.child_full_name}
              </span>
              <span className="text-xs text-ink-soft font-mono whitespace-nowrap">
                NIK: {applicant.child_nik}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-faint hover-only:text-ink-soft rounded-lg hover-only:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-bold mb-1">
                Kemandirian & Motorik Kasar
              </label>
              <textarea
                value={grossMotor}
                onChange={(e) => setGrossMotor(e.target.value)}
                placeholder="Observasi berjalan jinjit, melompat, keseimbangan..."
                rows={2}
                className="w-full bg-surface-subtle border border-line rounded-lg p-2 text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-ink font-bold mb-1">
                Motorik Halus & Koordinasi Visual
              </label>
              <textarea
                value={fineMotor}
                onChange={(e) => setFineMotor(e.target.value)}
                placeholder="Genggaman krayon, meronce, meremas playdough..."
                rows={2}
                className="w-full bg-surface-subtle border border-line rounded-lg p-2 text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-ink font-bold mb-1">
                Komunikasi & Ekspresi Bahasa
              </label>
              <textarea
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Kemampuan menjawab nama, menyusun kalimat sederhana..."
                rows={2}
                className="w-full bg-surface-subtle border border-line rounded-lg p-2 text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-ink font-bold mb-1">
                Sosio-Emosional & Kemandirian Toilet
              </label>
              <textarea
                value={socialEmotional}
                onChange={(e) => setSocialEmotional(e.target.value)}
                placeholder="Pemisahan dari orang tua, interaksi teman sebaya, BAK mandiri..."
                rows={2}
                className="w-full bg-surface-subtle border border-line rounded-lg p-2 text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink font-bold mb-1">
              Catatan Kualitatif Observer (Guru Pengamat)
            </label>
            <textarea
              value={qualitativeNotes}
              onChange={(e) => setQualitativeNotes(e.target.value)}
              placeholder="Catatan holistik mengenai respon sensorik, ketertarikan eksplorasi anak..."
              rows={3}
              required
              className="w-full bg-surface-subtle border border-line rounded-lg p-2 text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
            />
          </div>

          <div className="p-4 rounded-field bg-surface-subtle border border-line space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="specialNeedsFlag"
                checked={specialNeedsFlag}
                onChange={(e) => setSpecialNeedsFlag(e.target.checked)}
                className="w-4 h-4 rounded border-line text-lppa focus:ring-brand-primary/30"
              />
              <label htmlFor="specialNeedsFlag" className="text-ink font-bold cursor-pointer">
                Kebutuhan Pendampingan Khusus / Akomodasi Belajar Individual
              </label>
            </div>

            {specialNeedsFlag && (
              <div>
                <label className="block text-ink-soft text-xs mb-1">
                  Deskripsi Kebutuhan Khusus / Alergi / Sensitivitas Sensorik
                </label>
                <input
                  type="text"
                  value={specialNeedsDesc}
                  onChange={(e) => setSpecialNeedsDesc(e.target.value)}
                  placeholder="Contoh: Sensitivitas suara keras, membutuhkan pendampingan artikulasi..."
                  className="w-full bg-surface border border-line rounded-lg p-2 text-ink"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4 pt-4 border-t border-line-soft">
            <div className="flex flex-col medium:flex-row medium:items-center gap-2">
              <span className="text-ink-soft text-xs font-semibold">Rekomendasi Rombel:</span>
              <SegmentedControl
                value={recommendedLevel}
                onChange={(val) => setRecommendedLevel(val as ClassLevel)}
                options={[
                  { id: 'KB', label: 'KB' },
                  { id: 'TK_A', label: 'TK A' },
                  { id: 'TK_B', label: 'TK B' },
                  { id: 'TPA', label: 'TPA' },
                ]}
              />
            </div>

            <div className="flex flex-col-reverse medium:flex-row items-stretch medium:items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full medium:w-auto px-4 py-2 medium:py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full medium:w-auto px-5 py-2 medium:py-2 rounded-field bg-brand hover-only:opacity-90 text-on-brand font-bold shadow-hairline transition-colors"
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
