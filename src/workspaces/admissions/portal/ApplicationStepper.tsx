import React from 'react';
import { AdmissionStatus } from '../../../types/admissionsTypes';
import { ProgressBar } from '../../../components/ui';
import { CheckCircle2, Clock, Info, AlertTriangle, Sparkles, Check } from 'lucide-react';

interface ApplicationStepperProps {
  currentStatus: AdmissionStatus;
}

interface StepItem {
  id: string;
  label: string;
  sublabel: string;
  matchingStatuses: AdmissionStatus[];
}

const STEP_DEFINITIONS: StepItem[] = [
  {
    id: 'step_1',
    label: 'Pengisian Formulir',
    sublabel: 'Data diri calon siswa & orang tua',
    matchingStatuses: ['DRAFT_APPLICATION']
  },
  {
    id: 'step_2',
    label: 'Pengajuan Berkas',
    sublabel: 'Dokumen KK, Akta & Foto',
    matchingStatuses: ['SUBMITTED']
  },
  {
    id: 'step_3',
    label: 'Verifikasi Dokumen',
    sublabel: 'Validasi panitia PPDB unit',
    matchingStatuses: ['DOCUMENT_VERIFIED']
  },
  {
    id: 'step_4',
    label: 'Observasi Intake',
    sublabel: 'Asesmen kesiapan perkembangan',
    matchingStatuses: ['INTAKE_SCHEDULED', 'INTAKE_ASSESSED']
  },
  {
    id: 'step_5',
    label: 'Pengumuman Hasil',
    sublabel: 'Penawaran kursi / tunggu',
    matchingStatuses: ['OFFERED_ADMISSION', 'WAITLISTED']
  },
  {
    id: 'step_6',
    label: 'Penyelesaian Biaya',
    sublabel: 'Uang pangkal & komitmen',
    matchingStatuses: ['TUITION_SETTLED']
  },
  {
    id: 'step_7',
    label: 'Resmi Diterima',
    sublabel: 'Pengukuhan Siswa Resmi',
    matchingStatuses: ['ENROLLED_PROMOTED']
  }
];

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({ currentStatus }) => {
  // Check if status is a special/cancellation state
  const isCancelledElsewhere = currentStatus === 'CANCELLED_ENROLLED_ELSEWHERE';
  const isWithdrawn = currentStatus === 'APPLICATION_WITHDRAWN';
  const isNotAdmitted = currentStatus === 'NOT_ADMITTED';

  const getStepIndex = (status: AdmissionStatus): number => {
    switch (status) {
      case 'DRAFT_APPLICATION': return 0;
      case 'SUBMITTED': return 1;
      case 'DOCUMENT_VERIFIED': return 2;
      case 'INTAKE_SCHEDULED':
      case 'INTAKE_ASSESSED': return 3;
      case 'OFFERED_ADMISSION':
      case 'WAITLISTED': return 4;
      case 'TUITION_SETTLED': return 5;
      case 'ENROLLED_PROMOTED': return 6;
      default: return -1;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  const getStatusHumanLabel = (status: AdmissionStatus): string => {
    switch (status) {
      case 'DRAFT_APPLICATION': return 'Draf Formulir';
      case 'SUBMITTED': return 'Berkas Diajukan';
      case 'DOCUMENT_VERIFIED': return 'Dokumen Terverifikasi';
      case 'INTAKE_SCHEDULED': return 'Jadwal Observasi';
      case 'INTAKE_ASSESSED': return 'Observasi Selesai';
      case 'OFFERED_ADMISSION': return 'Penawaran Kursi';
      case 'WAITLISTED': return 'Daftar Tunggu';
      case 'TUITION_SETTLED': return 'Biaya Pendidikan Lunas';
      case 'ENROLLED_PROMOTED': return 'Resmi Terdaftar (Siswa Aktif)';
      case 'CANCELLED_ENROLLED_ELSEWHERE': return 'Diterima di Unit Lain';
      case 'APPLICATION_WITHDRAWN': return 'Pendaftaran Ditarik';
      case 'NOT_ADMITTED': return 'Belum Diterima';
      default: return status;
    }
  };

  const getActiveCallout = () => {
    if (currentStatus === 'TUITION_SETTLED') {
      return {
        title: 'Langkah 6 Selesai: Biaya Pendidikan Telah Lunas!',
        desc: 'Pembayaran uang pangkal dan formulir telah diverifikasi oleh bendahara sekolah. Berkas kini berada di Meja Kepala Sekolah untuk pengesahan pengukuhan siswa resmi.',
        bg: 'bg-surface-subtle border-line text-ink',
        icon: <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
      };
    }
    if (currentStatus === 'ENROLLED_PROMOTED') {
      return {
        title: 'Langkah 7 Selesai: Selamat! Ananda Telah Resmi Menjadi Siswa',
        desc: 'Penerimaan telah berhasil disahkan oleh Kepala Sekolah. Ananda telah terdaftar aktif pada rombel kelas dan siap memulai kegiatan belajar di TK Yapendik.',
        bg: 'bg-success-tint border-success-line text-success-deep',
        icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
      };
    }
    return {
      title: `Tahap Saat Ini: ${getStatusHumanLabel(currentStatus)}`,
      desc: 'Proses pendaftaran sedang berlangsung dan ditangani secara berkala oleh panitia PPDB unit.',
      bg: 'bg-surface-subtle border-line text-ink',
      icon: <Clock className="w-5 h-5 text-ink-soft shrink-0 mt-0.5" />
    };
  };

  const callout = getActiveCallout();

  return (
    <div className="w-full bg-surface border border-line rounded-card p-4 medium:p-6 medium:p-8 shadow-hairline" data-testid="application-stepper">
      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 mb-6 pb-4 border-b border-line-soft">
        <div>
          <h3 className="text-base medium:text-lg font-bold text-ink tracking-tight">Tahapan Alur Pendaftaran (PPDB)</h3>
          <p className="text-xs text-ink-soft">Siklus Pendaftaran Resmi Peserta Didik Baru Unit TK</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-soft font-medium">Status Saat Ini:</span>
          <span 
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              currentStatus === 'ENROLLED_PROMOTED'
                ? 'bg-success-tint text-success-deep border-success-line'
                : currentStatus === 'TUITION_SETTLED'
                ? 'bg-brand text-on-brand border-brand'
                : isCancelledElsewhere || isWithdrawn || isNotAdmitted
                ? 'bg-danger-tint text-danger-deep border-danger-line'
                : 'bg-warning-tint text-warning-deep border-warning-line'
            }`}
            data-testid="current-status-badge"
          >
            {getStatusHumanLabel(currentStatus)}
          </span>
        </div>
      </div>

      {isCancelledElsewhere && (
        <div className="mb-6 p-4 rounded-field bg-warning-tint border border-warning-line text-warning-deep text-xs flex items-start space-x-3">
          <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <span>
            <strong>Pemberitahuan Mutasi Antar-Unit:</strong> Calon siswa telah resmi terdaftar dan diterima di unit TK Yapendik lain. Aplikasi pada unit ini otomatis ditutup secara terhormat.
          </span>
        </div>
      )}

      {isNotAdmitted && (
        <div className="mb-6 p-4 rounded-field bg-danger-tint border border-danger-line text-danger-deep text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <span>
            <strong>Informasi:</strong> Pendaftaran belum dapat diterima pada periode ini karena keterbatasan daya tampung rombel.
          </span>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="relative mb-6">
        {/* Background connector line */}
        <div className="hidden expanded:block absolute top-5 left-8 right-8 z-0">
          <ProgressBar 
            value={currentIndex >= 0 ? (currentIndex / (STEP_DEFINITIONS.length - 1)) * 100 : 0} 
            variant="brand" 
            trackClassName="h-1" 
          />
        </div>

        <div className="grid grid-cols-2 medium:grid-cols-4 medium:grid-cols-7 gap-2 relative z-10">
          {STEP_DEFINITIONS.map((step, idx) => {
            const isCompleted = currentIndex > idx || currentStatus === 'ENROLLED_PROMOTED';
            const isCurrent = currentIndex === idx && currentStatus !== 'ENROLLED_PROMOTED';

            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center text-center p-2 rounded-field transition-all ${
                  isCurrent 
                    ? 'bg-surface-subtle border border-line shadow-hairline' 
                    : isCompleted
                    ? 'bg-surface-subtle/50'
                    : 'bg-transparent'
                }`}
              >
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                    isCompleted
                      ? 'bg-success text-on-brand shadow-hairline ring-2 ring-emerald-100'
                      : isCurrent
                      ? 'bg-brand text-on-brand ring-2 ring-brand-primary font-extrabold shadow-hairline'
                      : 'bg-surface-subtle text-ink-soft border border-line'
                  }`}
                  data-testid={`step-indicator-${idx + 1}`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-bold leading-tight mb-0.5 ${
                  isCurrent ? 'text-ink font-black' : isCompleted ? 'text-ink' : 'text-ink-faint'
                }`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-ink-soft leading-snug hidden expanded:block">
                  {step.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Callout Banner */}
      <div className={`p-4 rounded-field border flex items-start gap-3 shadow-hairline ${callout.bg}`}>
        {callout.icon}
        <div>
          <h4 className="text-xs medium:text-sm font-bold">{callout.title}</h4>
          <p className="text-xs mt-0.5 leading-relaxed opacity-90">{callout.desc}</p>
        </div>
      </div>
    </div>
  );
};
