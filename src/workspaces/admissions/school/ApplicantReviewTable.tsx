import React, { useState } from 'react';
import { ProspectiveChildApplicant, AdmissionStatus } from '../../../types/admissionsTypes';
import { Sparkles, Users, Filter, CheckCircle2, Clock, AlertCircle, FileCheck } from 'lucide-react';

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
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5" data-testid="applicant-review-table">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Meja Kerja Penerimaan Siswa Baru (PPDB)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabel Pementasan Calon Siswa (Staging Isolation / Invarian AP-06) • Unit: <strong className="text-slate-800 font-bold">{schoolDisplayName}</strong> ({schoolId})
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
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
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
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
                      <span className="text-blue-700 font-bold block">{app.applicant_id}</span>
                      <span className="text-slate-400 text-[11px]">NIK: {app.child_nik}</span>
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900 text-sm block font-bold">{app.child_full_name}</strong>
                      <span className="text-slate-500 text-[11px]">({app.child_gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {app.child_birth_place})</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {app.target_class_level}
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
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors shadow-2xs"
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
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                        data-testid={`ceremony-btn-${app.applicant_id}`}
                        aria-disabled={!canExecuteCeremony}
                      >
                        {app.status === 'ENROLLED_PROMOTED' ? 'Telah Dipromosikan' : 'The Ceremony 🎓'}
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
  );
};
