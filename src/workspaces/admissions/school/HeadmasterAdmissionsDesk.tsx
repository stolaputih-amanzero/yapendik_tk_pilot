import React, { useState, useEffect } from 'react';
import { ProspectiveChildApplicant, AdmissionsIntakeObservation, EnrollmentCeremonyResult } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { ApplicantReviewTable } from './ApplicantReviewTable';
import { IntakeObservationForm } from './IntakeObservationForm';
import { CeremonyExecutionModal } from './CeremonyExecutionModal';

interface HeadmasterAdmissionsDeskProps {
  schoolId: string;
  headmasterContext: {
    personId: string;
    role: string;
    activeSchoolId: string;
  };
}

export const HeadmasterAdmissionsDesk: React.FC<HeadmasterAdmissionsDeskProps> = ({
  schoolId,
  headmasterContext
}) => {
  const [applicants, setApplicants] = useState<ProspectiveChildApplicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ProspectiveChildApplicant | null>(null);
  const [activeModal, setActiveModal] = useState<'INTAKE' | 'CEREMONY' | null>(null);
  const [ceremonySuccessResult, setCeremonySuccessResult] = useState<EnrollmentCeremonyResult | null>(null);

  const loadApplicants = () => {
    const list = admissionsService.listApplicantsForSchool(schoolId);
    setApplicants(list);
  };

  useEffect(() => {
    loadApplicants();
  }, [schoolId]);

  const handleOpenIntake = (applicant: ProspectiveChildApplicant) => {
    setSelectedApplicant(applicant);
    setActiveModal('INTAKE');
  };

  const handleOpenCeremony = (applicant: ProspectiveChildApplicant) => {
    setSelectedApplicant(applicant);
    setActiveModal('CEREMONY');
  };

  const handleIntakeSaved = (_saved: AdmissionsIntakeObservation) => {
    setActiveModal(null);
    loadApplicants();
  };

  const handleCeremonySuccess = (result: EnrollmentCeremonyResult) => {
    setCeremonySuccessResult(result);
    setActiveModal(null);
    loadApplicants();
  };

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto" data-testid="headmaster-admissions-desk">
      {/* Success Notification */}
      {ceremonySuccessResult && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-sm flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-lg font-black text-emerald-950">Upacara Penerimaan Siswa Baru Berhasil Diresmikan!</h3>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                Calon siswa telah resmi dipromosikan ke status hukum murid aktif (ID Siswa: <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">{ceremonySuccessResult.promoted_student_id}</strong>) pada rombel <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">{ceremonySuccessResult.placed_class_id}</strong>.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setCeremonySuccessResult(null)}
            className="text-emerald-700 hover:text-emerald-950 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Review Table */}
      <ApplicantReviewTable
        schoolId={schoolId}
        applicants={applicants}
        onSelectApplicant={(app) => setSelectedApplicant(app)}
        onOpenIntakeModal={handleOpenIntake}
        onOpenCeremonyModal={handleOpenCeremony}
      />

      {/* Modals */}
      {activeModal === 'INTAKE' && selectedApplicant && (
        <IntakeObservationForm
          applicant={selectedApplicant}
          observerPersonId={headmasterContext.personId}
          onSaveSuccess={handleIntakeSaved}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'CEREMONY' && selectedApplicant && (
        <CeremonyExecutionModal
          applicant={selectedApplicant}
          headmasterContext={headmasterContext}
          onSuccess={handleCeremonySuccess}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
