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
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resmi Terdaftar (Siswa)
          </span>
        );
      case 'TUITION_SETTLED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Siap Upacara (Lunas)
          </span>
        );
      case 'OFFERED_ADMISSION':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">Ditawarkan Kursi</span>;
      case 'INTAKE_ASSESSED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-300">Intake Selesai</span>;
      case 'INTAKE_SCHEDULED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">Jadwal Intake</span>;
      case 'DOCUMENT_VERIFIED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">Berkas Valid</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">Berkas Masuk</span>;
      case 'CANCELLED_ENROLLED_ELSEWHERE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">Diterima di Unit Lain</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-6" data-testid="applicant-review-table">
      {/* Workspace Header Block (Amanaura Standard) */}
      <div className="bg-slate-50 border-b border-slate-200 lg:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 lg:border lg:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Penerimaan Peserta Didik</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Meja PPDB</span>
              <div className="group relative flex items-center ml-1">
                <Info className="w-4 h-4 text-slate-400 hover:text-slate-900 transition-colors cursor-help" />
                <div className="absolute left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 top-full mt-2 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-xl z-50">
                  <div className="absolute -top-1 left-1/2 sm:left-auto sm:right-2 -translate-x-1/2 sm:translate-x-0 w-2 h-2 bg-slate-900 rotate-45"></div>
                  Otonomi Institusi: Data pendaftar ditampung terpisah sebelum diresmikan ke data induk.
                </div>
              </div>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar Calon Siswa Baru • Unit: <strong className="text-slate-800 font-bold">{schoolDisplayName}</strong>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
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
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 lg:px-0 space-y-4">

      {/* MOBILE STACKED LIST VIEW (Mobile-First Edge-to-Edge List) */}
      <div className="block md:hidden divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            Tidak ada calon siswa pada kategori status ini.
          </div>
        ) : (
          filtered.map((app) => {
            const canExecuteCeremony = app.status === 'TUITION_SETTLED';

            return (
              <div 
                key={app.applicant_id}
                className="p-4 flex flex-col gap-2.5 hover:bg-slate-50/80 transition-colors"
                data-testid={`applicant-row-${app.applicant_id}`}
              >
                {/* Row 1: Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate w-full max-w-[200px]">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {app.child_full_name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="text-slate-600 font-bold truncate">Tujuan: {app.target_class_level.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400 shrink-0">#{app.applicant_id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Row 2: Details */}
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg flex flex-col gap-1 border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate w-full max-w-[200px]">NIK Anak: <strong className="font-mono text-slate-700">{app.child_nik}</strong></span>
                    <span>{app.child_gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wali: <strong className="text-slate-800">{app.guardian_full_name}</strong></span>
                    <span className="font-mono">{app.guardian_phone_number}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => onOpenIntakeModal(app)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    data-testid={`intake-btn-${app.applicant_id}`}
                  >
                    Observasi Intake
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCeremonyModal(app)}
                    disabled={!canExecuteCeremony}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      canExecuteCeremony
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                        : 'text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-200'
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
      <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-bold">
            <tr>
              <th className="p-3.5">ID & NIK Calon Siswa</th>
              <th className="p-3.5">Nama Lengkap & Panggilan</th>
              <th className="p-3.5">Tingkat</th>
              <th className="p-3.5">Nama Wali & Kontak</th>
              <th className="p-3.5">Status Pendaftaran</th>
              <th className="p-3.5 text-right">Tindakan Otoritas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                  Tidak ada calon siswa pada kategori status ini.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const canExecuteCeremony = app.status === 'TUITION_SETTLED';

                return (
                  <tr 
                    key={app.applicant_id}
                    className="hover:bg-slate-50/80 transition-colors"
                    data-testid={`applicant-row-${app.applicant_id}`}
                  >
                    <td className="p-3.5 font-mono text-xs">
                      <span className="text-slate-600 font-bold block">#{app.applicant_id.slice(-6).toUpperCase()}</span>
                      <span className="text-slate-400 text-[11px]">NIK: {app.child_nik}</span>
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900 text-sm block font-bold">{app.child_full_name}</strong>
                      <span className="text-slate-500 text-[11px]">({app.child_gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {app.child_birth_place})</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {app.target_class_level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-900 font-bold block">{app.guardian_full_name}</span>
                      <span className="text-slate-500 text-[11px] font-mono">{app.guardian_phone_number}</span>
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenIntakeModal(app)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                        data-testid={`intake-btn-${app.applicant_id}`}
                      >
                        Observasi Intake
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCeremonyModal(app)}
                        disabled={!canExecuteCeremony}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          canExecuteCeremony
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
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
