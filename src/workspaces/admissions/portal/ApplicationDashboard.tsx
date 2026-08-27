import React, { useState, useEffect } from 'react';
import { ProspectiveChildApplicant, AdmissionsDocument, ClassLevel, Gender, GuardianRelationshipType } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { ApplicationStepper } from './ApplicationStepper';
import { DocumentUploadZone } from './DocumentUploadZone';
import { User, Phone, Mail, School, Award, FileText, CheckCircle2, Plus, X, Users, Baby, Calendar } from 'lucide-react';

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
  const [showNewAppModal, setShowNewAppModal] = useState(false);

  // New Application Form State
  const [childFullName, setChildFullName] = useState('');
  const [childGender, setChildGender] = useState<Gender>('L');
  const [childDob, setChildDob] = useState('2022-05-15');
  const [childNik, setChildNik] = useState('');
  const [targetSchoolId, setTargetSchoolId] = useState('sch_tk_yapendik_01');
  const [targetClassLevel, setTargetClassLevel] = useState<ClassLevel>('TK_A');
  const [relationshipType, setRelationshipType] = useState<GuardianRelationshipType>('AYAH');
  const [guardianPhone, setGuardianPhone] = useState('081298765432');
  const [guardianEmail, setGuardianEmail] = useState('');

  const loadData = () => {
    // Invarian AP-04: Strictly queries only applications belonging to creatorUid / active guardian
    const myApps = admissionsService.getMyApplications(creatorUid, personId, guardianName);
    setApplications(myApps);
    if (myApps.length > 0) {
      // Keep currently selected app if it still exists in list, otherwise select first
      const stillActive = selectedApp ? myApps.find(a => a.applicant_id === selectedApp.applicant_id) : null;
      const active = stillActive || myApps[0];
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

  const handleSelectApplicant = (app: ProspectiveChildApplicant) => {
    setSelectedApp(app);
    setDocuments(admissionsService.listDocuments(app.applicant_id));
  };

  const handleDocumentUploaded = (newDoc: AdmissionsDocument) => {
    setDocuments(prev => [...prev.filter(d => d.document_id !== newDoc.document_id), newDoc]);
  };

  const handleCreateNewApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childFullName.trim()) return;

    const newApplicantId = `app_${Date.now()}`;
    const newApplicant: ProspectiveChildApplicant = {
      applicant_id: newApplicantId,
      target_school_id: targetSchoolId,
      academic_year_id: 'ay_2026_2027',
      target_class_level: targetClassLevel,
      child_full_name: childFullName.trim(),
      child_gender: childGender,
      child_date_of_birth: childDob,
      child_nik_encrypted: childNik ? `ENC:${childNik}` : undefined,
      guardian_full_name: guardianName || 'Wali Murid',
      guardian_relationship: relationshipType,
      guardian_phone_number: guardianPhone,
      guardian_email: guardianEmail || undefined,
      creator_user_id: creatorUid,
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await admissionsService.createApplicant(newApplicant);
    setShowNewAppModal(false);
    
    // Reset Form
    setChildFullName('');
    setChildNik('');

    // Reload and switch to new applicant
    const myApps = admissionsService.getMyApplications(creatorUid, personId, guardianName);
    setApplications(myApps);
    setSelectedApp(newApplicant);
    setDocuments(admissionsService.listDocuments(newApplicant.applicant_id));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-600 text-sm font-medium bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mr-3"></div>
        Memuat data pendaftaran calon siswa...
      </div>
    );
  }

  if (!selectedApp) {
    return (
      <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Formulir Pendaftaran</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Selamat datang di Portal Pendaftaran Siswa Baru Yapendik. Anda dapat memulai pendaftaran peserta didik baru untuk putra/putri Anda secara langsung di bawah ini.
          </p>
          <button
            onClick={() => setShowNewAppModal(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Formulir Pendaftaran PPDB</span>
          </button>
        </div>

        {/* Modal New Application Form */}
        {showNewAppModal && renderNewAppModal()}
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

  function renderNewAppModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Formulir Pendaftaran Siswa Baru</h3>
                <p className="text-[11px] text-slate-500">Penerimaan Peserta Didik Baru (PPDB) TK Yapendik</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewAppModal(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateNewApplication} className="p-5 sm:p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Calon Siswa *</label>
              <input
                type="text"
                placeholder="Contoh: Timothy Andreas Pandjaitan"
                value={childFullName}
                onChange={e => setChildFullName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={childGender}
                  onChange={e => setChildGender(e.target.value as Gender)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={childDob}
                  onChange={e => setChildDob(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit TK Pilihan</label>
                <select
                  value={targetSchoolId}
                  onChange={e => setTargetSchoolId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="sch_tk_yapendik_01">TK Yapendik 01 Menteng</option>
                  <option value="sch_tk_yapendik_02">TK Yapendik 02 Kebayoran</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                <select
                  value={targetClassLevel}
                  onChange={e => setTargetClassLevel(e.target.value as ClassLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="TK_A">TK A (Usia 4–5 Tahun)</option>
                  <option value="TK_B">TK B (Usia 5–6 Tahun)</option>
                  <option value="KB">Playgroup / KB (Usia 3–4 Tahun)</option>
                  <option value="TPA">TPA / Penitipan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hubungan Wali</label>
              <select
                value={relationshipType}
                onChange={e => setRelationshipType(e.target.value as GuardianRelationshipType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="AYAH">Ayah Kandung</option>
                <option value="IBU">Ibu Kandung</option>
                <option value="WALI_HUKUM">Wali Hukum / Keluarga</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Wali</label>
                <input
                  type="tel"
                  placeholder="0812xxxxxxx"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIK Anak (Opsional)</label>
                <input
                  type="text"
                  placeholder="16 digit NIK"
                  value={childNik}
                  onChange={e => setChildNik(e.target.value)}
                  maxLength={16}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewAppModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan & Ajukan Pendaftaran</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto" data-testid="application-dashboard">
      {/* Multiple Applicant Switcher Pill Bar */}
      {applications.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 px-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Pendaftaran Terdaftar ({applications.length} Anak):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {applications.map(app => (
              <button
                key={app.applicant_id}
                onClick={() => handleSelectApplicant(app)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedApp.applicant_id === app.applicant_id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{app.child_full_name}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                  selectedApp.applicant_id === app.applicant_id
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {app.target_class_level.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Header & Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Main Identity Area */}
        <div className="p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-900 text-white shadow-2xs">
                Portal Orang Tua Calon Siswa (PPDB)
              </span>
              <span className="text-xs text-slate-700 font-mono bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                ID: {selectedApp.applicant_id}
              </span>
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Data Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {selectedApp.child_full_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <School className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Unit: <strong className="text-slate-900">{schoolDisplayName}</strong></span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tingkat: <strong className="text-slate-900">{classLevelDisplayName}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Side: Guardian Profile Box & New App Button */}
          <div className="flex flex-col gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 min-w-[280px] shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-700" />
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

            <button
              onClick={() => setShowNewAppModal(true)}
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftarkan Calon Siswa Lain</span>
            </button>
          </div>
        </div>

        {/* Matching-Pill Context Ribbon */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-5 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-800">
              📅 PPDB T.A. 2026/2027
            </span>
            <span>•</span>
            <span className="text-slate-600">Kurikulum Merdeka TK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Tahap Pendaftaran:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[11px]">
              {selectedApp.status.replace(/_/g, ' ')}
            </span>
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

      {/* Modal New Application */}
      {showNewAppModal && renderNewAppModal()}
    </div>
  );
};
