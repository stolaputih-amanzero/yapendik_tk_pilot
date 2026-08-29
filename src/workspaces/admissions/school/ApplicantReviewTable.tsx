import React, { useState } from 'react';
import { ProspectiveChildApplicant, AdmissionStatus } from '../../../types/admissionsTypes';
import { Sparkles, Users, Filter, CheckCircle2, Clock, AlertCircle, FileCheck, Phone, User, Info } from 'lucide-react';

interface ApplicantReviewTableProps {
  schoolId: string;
  applicants: ProspectiveChildApplicant[];
  onSelectApplicant: (applicant: ProspectiveChildApplicant) => void;
  onOpenCeremonyModal: (applicant: ProspectiveChildApplicant) => void;
  onOpenIntakeModal: (applicant: ProspectiveChildApplicant) => void;
}

export const ApplicantReviewTable: React.FC<ApplicantReviewTableProps> = ({
  schoolId,
  applicants,
  onSelectApplicant,
  onOpenCeremonyModal,
  onOpenIntakeModal
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = applicants.filter(a => {
    if (a.target_school_id !== schoolId) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  const schoolDisplayName = schoolId === 'sch_tk_yapendik_01'
    ? 'TK Yapendik 01 Menteng'
    : schoolId === 'sch_tk_yapendik_02'
    ? 'TK Yapendik 02 Kebayoran'
    : schoolId;

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case 'ENROLLED_PROMOTED':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-success-tint text-success-deep border border-success-line inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
            Resmi Terdaftar (Siswa)
          </span>
        );
      case 'TUITION_SETTLED':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-info-deep border border-blue-300 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-info" />
            Siap Upacara (Lunas)
          </span>
        );
      case 'OFFERED_ADMISSION':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-lppa-deep border border-indigo-300">Ditawarkan Kursi</span>;
      case 'INTAKE_ASSESSED':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-lppa-tint text-lppa-deep border border-purple-300">Intake Selesai</span>;
      case 'INTAKE_SCHEDULED':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-warning-tint text-warning-deep border border-warning-line">Jadwal Intake</span>;
      case 'DOCUMENT_VERIFIED':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">Berkas Valid</span>;
      case 'SUBMITTED':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-surface-subtle text-ink-soft border border-line">Berkas Masuk</span>;
      case 'CANCELLED_ENROLLED_ELSEWHERE':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-surface-subtle text-ink-soft border border-line">Diterima di Unit Lain</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-surface-subtle text-ink-soft border border-line">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-6" data-testid="applicant-review-table">
      {/* Workspace Header Block (Amanaura Standard) */}
      <div className="bg-surface-subtle border-b border-line expanded:rounded-card px-4 py-5 medium:p-6 w-full text-ink expanded:border expanded:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-1.5 text-success text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Penerimaan Peserta Didik</span>
            </div>
            <h2 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
              <span>Meja PPDB</span>
              <div className="group relative flex items-center ml-1">
                <Info className="w-4 h-4 text-ink-faint hover-only:text-ink transition-colors cursor-help" />
                <div className="absolute left-1/2 medium:left-auto medium:right-0 -translate-x-1/2 medium:translate-x-0 top-full mt-2 hidden group-hover:block w-64 p-2 bg-brand text-on-brand text-[11px] font-medium leading-relaxed rounded-field shadow-floating z-50">
                  <div className="absolute -top-1 left-1/2 medium:left-auto medium:right-2 -translate-x-1/2 medium:translate-x-0 w-2 h-2 bg-brand rotate-45"></div>
                  Otonomi Institusi: Data pendaftar ditampung terpisah sebelum diresmikan ke data induk.
                </div>
              </div>
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Daftar Calon Siswa Baru • Unit: <strong className="text-ink font-bold">{schoolDisplayName}</strong>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'SUBMITTED', label: 'Berkas Masuk' },
              { id: 'DOCUMENT_VERIFIED', label: 'Terverifikasi' },
              { id: 'INTAKE_SCHEDULED', label: 'Intake' },
              { id: 'TUITION_SETTLED', label: 'Siap Upacara' },
              { id: 'ENROLLED_PROMOTED', label: 'Resmi Siswa' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-brand text-on-brand border-brand shadow-hairline'
                    : 'bg-surface text-ink-soft border-line hover-only:text-ink hover-only:bg-surface-subtle'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 expanded:px-0 space-y-4">

      {/* MOBILE STACKED LIST VIEW (Mobile-First Edge-to-Edge List) */}
      <div className="block expanded:hidden divide-y divide-line-soft border border-line rounded-field bg-surface overflow-hidden shadow-hairline">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-ink-faint text-xs italic">
            Tidak ada calon siswa pada kategori status ini.
          </div>
        ) : (
          filtered.map((app) => {
            const canExecuteCeremony = app.status === 'TUITION_SETTLED';

            return (
              <div 
                key={app.applicant_id}
                className="p-4 flex flex-col gap-2 hover-only:bg-surface-subtle/80 transition-colors"
                data-testid={`applicant-row-${app.applicant_id}`}
              >
                {/* Row 1: Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate w-full max-w-[200px]">
                    <h3 className="text-sm font-bold text-ink leading-tight truncate">
                      {app.child_full_name}
                    </h3>
                    <div className="text-xs text-ink-soft mt-0.5 flex items-center gap-2">
                      <span className="text-ink-soft font-bold truncate">Tujuan: {app.target_class_level.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="font-mono text-ink-faint shrink-0">#{app.applicant_id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Row 2: Details */}
                <div className="text-xs text-ink-soft bg-surface-subtle p-2 rounded-lg flex flex-col gap-1 border border-line-soft">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate w-full max-w-[200px]">NIK Anak: <strong className="font-mono text-ink-soft">{app.child_nik}</strong></span>
                    <span>{app.child_gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wali: <strong className="text-ink">{app.guardian_full_name}</strong></span>
                    <span className="font-mono">{app.guardian_phone_number}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => onOpenIntakeModal(app)}
                    className="px-3 py-1 text-xs font-semibold text-ink-soft bg-surface-subtle rounded-lg hover-only:bg-line-soft transition-colors cursor-pointer"
                    data-testid={`intake-btn-${app.applicant_id}`}
                  >
                    Observasi Intake
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCeremonyModal(app)}
                    disabled={!canExecuteCeremony}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      canExecuteCeremony
                        ? 'text-success-deep bg-success-tint hover-only:bg-success-tint cursor-pointer'
                        : 'text-ink-faint bg-surface-subtle cursor-not-allowed border border-line'
                    }`}
                    data-testid={`ceremony-btn-${app.applicant_id}`}
                    aria-disabled={!canExecuteCeremony}
                  >
                    {app.status === 'ENROLLED_PROMOTED' ? 'Telah Terdaftar' : 'Resmikan Siswa'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden expanded:block overflow-x-auto border border-line rounded-field shadow-hairline [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-subtle text-ink-soft border-b border-line uppercase tracking-wider font-bold">
            <tr>
              <th className="p-3">ID & NIK Calon Siswa</th>
              <th className="p-3">Nama Lengkap & Panggilan</th>
              <th className="p-3">Tingkat</th>
              <th className="p-3">Nama Wali & Kontak</th>
              <th className="p-3">Status Pendaftaran</th>
              <th className="p-3 text-right">Tindakan Otoritas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft text-ink-soft bg-surface">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink-faint italic">
                  Tidak ada calon siswa pada kategori status ini.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const canExecuteCeremony = app.status === 'TUITION_SETTLED';

                return (
                  <tr 
                    key={app.applicant_id}
                    className="hover-only:bg-surface-subtle/80 transition-colors"
                    data-testid={`applicant-row-${app.applicant_id}`}
                  >
                    <td className="p-3 font-mono text-xs whitespace-nowrap">
                      <span className="text-ink-soft font-bold block">#{app.applicant_id.slice(-6).toUpperCase()}</span>
                      <span className="text-ink-faint text-[11px]">NIK: {app.child_nik}</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-ink text-sm block font-bold">{app.child_full_name}</strong>
                      <span className="text-ink-soft text-[11px]">({app.child_gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {app.child_birth_place})</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-lg font-bold bg-surface-subtle text-ink-soft border border-line text-[11px]">
                        {app.target_class_level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-ink font-bold block">{app.guardian_full_name}</span>
                      <span className="text-ink-soft text-[11px] font-mono whitespace-nowrap">{app.guardian_phone_number}</span>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenIntakeModal(app)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-surface-subtle hover-only:bg-line-soft text-ink border border-line transition-colors shadow-hairline cursor-pointer"
                        data-testid={`intake-btn-${app.applicant_id}`}
                      >
                        Observasi Intake
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCeremonyModal(app)}
                        disabled={!canExecuteCeremony}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          canExecuteCeremony
                            ? 'bg-success hover-only:bg-emerald-700 text-on-brand shadow-hairline cursor-pointer'
                            : 'bg-surface-subtle text-ink-faint cursor-not-allowed border border-line'
                        }`}
                        data-testid={`ceremony-btn-${app.applicant_id}`}
                        aria-disabled={!canExecuteCeremony}
                      >
                        {app.status === 'ENROLLED_PROMOTED' ? 'Telah Dipromosikan' : 'Resmikan Siswa'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};
