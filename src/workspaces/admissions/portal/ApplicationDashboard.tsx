import React, { useState, useEffect } from 'react';
import { ProspectiveChildApplicant, AdmissionsDocument } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { ApplicationStepper } from './ApplicationStepper';
import { DocumentUploadZone } from './DocumentUploadZone';
import { User, Phone, Mail, MapPin, School, Award, FileText, CheckCircle2 } from 'lucide-react';

interface ApplicationDashboardProps {
  creatorUid: string;
  personId?: string;
  guardianName?: string;
}

export const ApplicationDashboard: React.FC<ApplicationDashboardProps> = ({ creatorUid, personId, guardianName }) => {
  const initialApps = admissionsService.getMyApplications(creatorUid, personId, guardianName);
  const [applications, setApplications] = useState<ProspectiveChildApplicant[]>(initialApps);
  const [selectedApp, setSelectedApp] = useState<ProspectiveChildApplicant | null>(
    initialApps.length > 0 ? initialApps[0] : null
  );
  const [documents, setDocuments] = useState<AdmissionsDocument[]>(
    initialApps.length > 0 ? admissionsService.listDocuments(initialApps[0].applicant_id) : []
  );
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = () => {
    // Invarian AP-04: Strictly queries only applications belonging to creatorUid / active guardian
    const myApps = admissionsService.getMyApplications(creatorUid, personId, guardianName);
    setApplications(myApps);
    if (myApps.length > 0) {
      const active = myApps[0];
      setSelectedApp(active);
      setDocuments(admissionsService.listDocuments(active.applicant_id));
    } else {
      setSelectedApp(null);
      setDocuments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [creatorUid, personId, guardianName]);

  const handleDocumentUploaded = (newDoc: AdmissionsDocument) => {
    setDocuments(prev => [...prev.filter(d => d.document_id !== newDoc.document_id), newDoc]);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-600 text-sm font-medium bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Memuat data pendaftaran calon siswa...
      </div>
    );
  }

  if (!selectedApp) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Formulir Pendaftaran</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          Selamat datang di Portal Pendaftaran Siswa Baru Yapendik. Silakan hubungi panitia PPDB unit atau buat pengajuan pendaftaran baru untuk putra/putri Anda.
        </p>
      </div>
    );
  }

  const schoolDisplayName = selectedApp.target_school_id === 'sch_tk_yapendik_01'
    ? 'TK Yapendik 01 Menteng'
    : selectedApp.target_school_id === 'sch_tk_yapendik_02'
    ? 'TK Yapendik 02 Kebayoran'
    : selectedApp.target_school_id;

  const classLevelDisplayName = selectedApp.target_class_level === 'TK_A'
    ? 'TK A (Kelompok Usia 4–5 Tahun)'
    : selectedApp.target_class_level === 'TK_B'
    ? 'TK B (Kelompok Usia 5–6 Tahun)'
    : selectedApp.target_class_level === 'KB'
    ? 'Kelompok Bermain / Playgroup (Usia 3–4 Tahun)'
    : 'TPA / Penitipan Anak';

  return (
    <div className="space-y-6 max-w-7xl mx-auto" data-testid="application-dashboard">
      {/* Top Header Card - Bright & High Contrast */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 shadow-xs">
                Portal Orang Tua Calon Siswa (PPDB)
              </span>
              <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 font-medium">
                ID: {selectedApp.applicant_id}
              </span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Data Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {selectedApp.child_full_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <School className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Unit: <strong className="text-blue-900">{schoolDisplayName}</strong></span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tingkat: <strong className="text-amber-900">{classLevelDisplayName}</strong></span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-600 font-mono">T.A. 2026/2027</span>
            </div>
          </div>

          {/* Guardian Profile Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 min-w-[280px] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Data Wali Terdaftar</span>
            </div>
            <div className="text-base font-bold text-slate-900 mb-1.5">
              {selectedApp.guardian_full_name}
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono font-medium text-slate-800">{selectedApp.guardian_phone_number}</span>
              </div>
              {selectedApp.guardian_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate max-w-[200px] text-slate-700">{selectedApp.guardian_email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Status Lifecycle */}
      <ApplicationStepper currentStatus={selectedApp.status} />

      {/* Document Upload Zone */}
      <DocumentUploadZone 
        applicantId={selectedApp.applicant_id}
        documents={documents}
        onUploadSuccess={handleDocumentUploaded}
      />
    </div>
  );
};
