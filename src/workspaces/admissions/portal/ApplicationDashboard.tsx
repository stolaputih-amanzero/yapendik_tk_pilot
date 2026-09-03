import React, { useState, useEffect } from 'react';
import { ProspectiveChildApplicant, AdmissionsDocument, ClassLevel, Gender, GuardianRelationshipType } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { ApplicationStepper } from './ApplicationStepper';
import { DocumentUploadZone } from './DocumentUploadZone';
import { SegmentedControl, SelectSheet, Input, AdaptiveDialog } from '../../../components/ui';
import { User, Phone, Mail, School, Award, FileText, CheckCircle2, Plus, X, Users, Baby, Calendar, Building2, GraduationCap } from 'lucide-react';

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
      child_birth_place: '',
      child_birth_date: childDob,
      child_nik: childNik || '',
      child_religion: '',
      child_address: '',
      guardian_nik: '',
      guardian_gender: 'L',
      guardian_full_name: guardianName || 'Wali Murid',
      guardian_relationship_type: relationshipType,
      guardian_phone_number: guardianPhone,
      guardian_email: guardianEmail || undefined,
      creator_uid: creatorUid,
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
      <div className="min-h-[400px] flex items-center justify-center text-ink-soft text-sm font-medium bg-surface rounded-card border border-line p-8 shadow-hairline">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mr-3"></div>
        Memuat data pendaftaran calon siswa...
      </div>
    );
  }

  if (!selectedApp) {
    return (
      <div className="w-full space-y-6 text-ink">
        <div className="p-10 text-center bg-surface border border-line rounded-card shadow-hairline">
          <div className="w-16 h-16 rounded-card bg-surface-subtle text-ink flex items-center justify-center mx-auto mb-4 border border-line">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Belum Ada Formulir Pendaftaran</h2>
          <p className="text-sm text-ink-soft max-w-md mx-auto mb-6">
            Selamat datang di Portal Pendaftaran Siswa Baru Yapendik. Anda dapat memulai pendaftaran peserta didik baru untuk putra/putri Anda secara langsung di bawah ini.
          </p>
          <button
            onClick={() => setShowNewAppModal(true)}
            className="w-full medium:w-auto px-6 py-3 rounded-field bg-brand hover-only:opacity-90 text-on-brand text-xs font-bold transition-all shadow-hairline inline-flex items-center justify-center gap-2 cursor-pointer"
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
    const targetUnitName = targetSchoolId === 'sch_tk_yapendik_01' ? 'TK Yapendik 01 Menteng' : 'TK Yapendik 02 Kebayoran';

    const dialogHeader = (
      <div className="space-y-3">
        {/* Tier 1: Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand text-on-brand flex items-center justify-center font-bold text-sm shrink-0 shadow-hairline">
            <Baby className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink tracking-tight truncate">
              Formulir Pendaftaran Calon Siswa Baru
            </h2>
            <p className="text-xs text-ink-soft">
              Penerimaan Peserta Didik Baru (PPDB) TK Yapendik
            </p>
          </div>
        </div>

        {/* Tier 2: Context Ribbon (Hukum 9 Matching-Pill Context Ribbon) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-[11px] font-medium text-ink-soft">
            <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
            <span>{targetUnitName}</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-line text-[11px] font-medium text-ink-soft">
            <Calendar className="w-4 h-4 text-brand-secondary shrink-0" />
            <span>T.A. 2026/2027 • Ganjil</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-tint border border-brand-line text-[11px] font-bold text-brand-deep">
            <GraduationCap className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Jenjang: {targetClassLevel.replace('_', ' ')}</span>
          </span>
        </div>
      </div>
    );

    return (
      <AdaptiveDialog
        isOpen={showNewAppModal}
        onClose={() => setShowNewAppModal(false)}
        title={dialogHeader}
        description="Pengisian berkas pendaftaran awal peserta didik baru."
        maxWidth="lg"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setShowNewAppModal(false)}
              className="w-full sm:w-auto px-4 py-2 rounded-field border border-line text-ink-soft text-xs font-bold hover-only:bg-surface-subtle cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCreateNewApplication}
              className="w-full sm:w-auto px-5 py-2 rounded-field bg-brand text-on-brand text-xs font-bold hover-only:opacity-90 shadow-hairline cursor-pointer flex justify-center items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan &amp; Ajukan Pendaftaran</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateNewApplication} className="space-y-4 text-xs max-h-[90dvh] overflow-y-auto py-1">
          <div>
            <label className="block font-bold text-ink-soft mb-1">Nama Lengkap Calon Siswa *</label>
            <input
              type="text"
              placeholder="Contoh: Timothy Andreas Pandjaitan"
              value={childFullName}
              onChange={e => setChildFullName(e.target.value)}
              required
              className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink-soft mb-1 text-xs">Jenis Kelamin</label>
                <SegmentedControl
                  value={childGender}
                  onChange={val => setChildGender(val as Gender)}
                  options={[
                    { id: 'L', label: 'Laki-Laki' },
                    { id: 'P', label: 'Perempuan' }
                  ]}
                />
              </div>
              <Input
                label="Tanggal Lahir"
                type="date"
                value={childDob}
                onChange={e => setChildDob(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
              <SelectSheet
                label="Unit TK Pilihan"
                value={targetSchoolId}
                onChange={setTargetSchoolId}
                options={[
                  { value: 'sch_tk_yapendik_01', label: 'TK Yapendik 01 Menteng' },
                  { value: 'sch_tk_yapendik_02', label: 'TK Yapendik 02 Kebayoran' }
                ]}
              />
              
              <div>
                <label className="block font-bold text-ink-soft mb-1 text-xs">Tingkat Kelas</label>
                <SegmentedControl
                  value={targetClassLevel}
                  onChange={val => setTargetClassLevel(val as ClassLevel)}
                  options={[
                    { id: 'TK_A', label: 'TK A' },
                    { id: 'TK_B', label: 'TK B' },
                    { id: 'KB', label: 'KB' },
                    { id: 'TPA', label: 'TPA' }
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-ink-soft mb-1 text-xs">Hubungan Wali</label>
              <SegmentedControl
                value={relationshipType}
                onChange={val => setRelationshipType(val as GuardianRelationshipType)}
                options={[
                  { id: 'AYAH', label: 'Ayah Kandung' },
                  { id: 'IBU', label: 'Ibu Kandung' },
                  { id: 'WALI_HUKUM', label: 'Wali Hukum' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink-soft mb-1">Nomor WhatsApp Wali</label>
              <input
                type="tel"
                placeholder="0812xxxxxxx"
                value={guardianPhone}
                onChange={e => setGuardianPhone(e.target.value)}
                required
                className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-soft mb-1">NIK Anak (Opsional)</label>
              <input
                type="text"
                placeholder="16 digit NIK"
                value={childNik}
                onChange={e => setChildNik(e.target.value)}
                maxLength={16}
                className="w-full bg-surface border border-line rounded-field px-3 py-2 font-medium text-ink outline-none focus:ring-1 focus:ring-brand-primary font-mono"
              />
            </div>
          </div>
        </form>
      </AdaptiveDialog>
    );
  }

  return (
    <div className="w-full space-y-6 text-ink" data-testid="application-dashboard">
      {/* Multiple Applicant Switcher Pill Bar */}
      {applications.length > 1 && (
        <div className="bg-surface border border-line rounded-card p-3 shadow-hairline flex flex-col medium:flex-row medium:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-soft px-2">
            <Users className="w-4 h-4 text-ink-soft" />
            <span>Pendaftaran Terdaftar ({applications.length} Anak):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {applications.map(app => (
              <button
                key={app.applicant_id}
                onClick={() => handleSelectApplicant(app)}
                className={`px-3 py-1 rounded-field text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedApp.applicant_id === app.applicant_id
                    ? 'bg-brand text-on-brand shadow-hairline'
                    : 'bg-surface-subtle text-ink-soft hover-only:bg-line-soft border border-line'
                }`}
              >
                <span>{app.child_full_name}</span>
                <span className={`text-[10px] px-2 py-0 rounded-full font-semibold ${
                  selectedApp.applicant_id === app.applicant_id
                    ? 'bg-surface-inset text-on-brand'
                    : 'bg-line-soft text-ink-soft'
                }`}>
                  {app.target_class_level.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Header & Identity Card */}
      <div className="bg-surface border border-line rounded-card shadow-hairline overflow-hidden">
        {/* Main Identity Area */}
        <div className="p-4 medium:p-6 medium:p-8 flex flex-col expanded:flex-row expanded:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand text-on-brand shadow-hairline">
                Portal Orang Tua Calon Siswa (PPDB)
              </span>
              <span className="text-xs text-ink-soft font-mono bg-surface-subtle px-2 py-1 rounded-full border border-line font-medium whitespace-nowrap">
                ID: {selectedApp.applicant_id}
              </span>
              <span className="text-xs text-success-deep font-bold bg-success-tint px-2 py-1 rounded-full border border-success-line flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Data Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl medium:text-3xl font-black text-ink tracking-tight pt-1">
              {selectedApp.child_full_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs medium:text-sm text-ink-soft">
              <div className="flex items-center gap-2 font-medium text-ink">
                <School className="w-4 h-4 text-ink-soft shrink-0" />
                <span>Unit: <strong className="text-ink">{schoolDisplayName}</strong></span>
              </div>
              <span className="text-ink-faint hidden medium:inline">•</span>
              <div className="flex items-center gap-2 font-medium text-ink">
                <Award className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Tingkat: <strong className="text-ink">{classLevelDisplayName}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Side: Guardian Profile Box & New App Button */}
          <div className="flex flex-col gap-3">
            <div className="bg-surface-subtle border border-line rounded-field p-4 medium:p-4 min-w-[280px] shadow-hairline">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-ink-soft" />
                <span>Data Wali Terdaftar</span>
              </div>
              <div className="text-base font-bold text-ink mb-1.5">
                {selectedApp.guardian_full_name}
              </div>
              <div className="space-y-1 text-xs text-ink-soft">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-ink-soft shrink-0" />
                  <span className="font-mono font-medium text-ink">{selectedApp.guardian_phone_number}</span>
                </div>
                {selectedApp.guardian_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-ink-soft shrink-0" />
                    <span className="truncate max-w-[200px] text-ink-soft">{selectedApp.guardian_email}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowNewAppModal(true)}
              className="w-full bg-surface-subtle hover-only:bg-line-soft border border-line text-ink text-xs font-bold px-3 py-2 rounded-field transition-all flex items-center justify-center gap-2 shadow-hairline cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Calon Siswa Lain</span>
            </button>
          </div>
        </div>

        {/* Matching-Pill Context Ribbon */}
        <div className="bg-surface-subtle/70 border-t border-line-soft px-5 medium:px-6 py-2 flex flex-col medium:flex-row medium:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-ink-soft font-medium">
            <span className="px-2 py-1 rounded-md bg-surface border border-line font-semibold text-ink">
              PPDB T.A. 2026/2027
            </span>
            <span>•</span>
            <span className="text-ink-soft">Kurikulum Merdeka TK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-soft">Tahap Pendaftaran:</span>
            <span className="px-2 py-1 rounded-full bg-brand text-on-brand font-bold text-[11px]">
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
