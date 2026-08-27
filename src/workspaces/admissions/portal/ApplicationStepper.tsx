import React from 'react';
import { AdmissionStatus } from '../../../types/admissionsTypes';
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
    label: 'Resmi Diterima (Promosi)',
    sublabel: 'The Enrollment Ceremony',
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
      case 'TUITION_SETTLED': return 'Biaya Pendidikan Lunas (Siap Upacara)';
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
        desc: 'Pembayaran uang pangkal dan formulir telah diverifikasi oleh bendahara sekolah. Berkas kini berada di Meja Kepala Sekolah untuk pelaksanaan "The Enrollment Ceremony" (Pengukuhan Siswa Resmi).',
        bg: 'bg-blue-50 border-blue-200 text-blue-900',
        icon: <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      };
    }
    if (currentStatus === 'ENROLLED_PROMOTED') {
      return {
        title: 'Langkah 7 Selesai: Selamat! Ananda Telah Resmi Menjadi Siswa',
        desc: 'Upacara penerimaan  telah berhasil disahkan oleh Kepala Sekolah. Ananda telah terdaftar aktif pada rombel kelas dan siap memulai kegiatan belajar di Yapendik.',
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      };
    }
    return {
      title: `Tahap Saat Ini: ${getStatusHumanLabel(currentStatus)}`,
      desc: 'Proses pendaftaran sedang berlangsung dan ditangani secara berkala oleh panitia PPDB unit.',
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
    };
  };

  const callout = getActiveCallout();

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm" data-testid="application-stepper">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Status Progres Pendaftaran (PPDB)</h3>
          <p className="text-xs text-slate-500">Siklus Hidup Pendaftaran Kanonikal & Otoritas Sekolah</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status Saat Ini:</span>
          <span 
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              currentStatus === 'ENROLLED_PROMOTED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : currentStatus === 'TUITION_SETTLED'
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : isCancelledElsewhere || isWithdrawn || isNotAdmitted
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
            data-testid="current-status-badge"
          >
            {currentStatus}
          </span>
        </div>
      </div>

      {isCancelledElsewhere && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Pemberitahuan Otomatis (Invarian AP-06):</strong> Calon siswa telah resmi terdaftar dan diterima di unit TK Yapendik lain. Aplikasi pada unit ini otomatis ditutup secara terhormat.
          </span>
        </div>
      )}

      {isNotAdmitted && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Informasi:</strong> Pendaftaran belum dapat diterima pada periode ini karena keterbatasan daya tampung rombel.
          </span>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="relative mb-6">
        {/* Background connector line */}
        <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-slate-100 rounded-full" />
        <div 
          className="hidden md:block absolute top-6 left-8 h-1 bg-emerald-500 rounded-full transition-all duration-500" 
          style={{ width: currentIndex >= 0 ? `${(currentIndex / (STEP_DEFINITIONS.length - 1)) * 100}%` : '0%' }}
        />

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative z-10">
          {STEP_DEFINITIONS.map((step, idx) => {
            const isCompleted = currentIndex > idx || currentStatus === 'ENROLLED_PROMOTED';
            const isCurrent = currentIndex === idx && currentStatus !== 'ENROLLED_PROMOTED';

            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center text-center p-2.5 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-amber-50/80 border border-amber-200 shadow-xs' 
                    : isCompleted
                    ? 'bg-emerald-50/40'
                    : 'bg-transparent'
                }`}
              >
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 font-extrabold shadow-sm'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                  data-testid={`step-indicator-${idx + 1}`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                </div>
                <span className={`text-xs font-bold leading-tight mb-1 ${
                  isCurrent ? 'text-amber-950 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
                <span className="text-[11px] text-slate-500 leading-snug hidden lg:block">
                  {step.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Callout Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${callout.bg}`}>
        {callout.icon}
        <div>
          <h4 className="text-sm font-bold">{callout.title}</h4>
          <p className="text-xs mt-0.5 leading-relaxed opacity-90">{callout.desc}</p>
        </div>
      </div>
    </div>
  );
};
