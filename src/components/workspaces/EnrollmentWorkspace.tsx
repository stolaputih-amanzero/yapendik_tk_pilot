import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { ClassRoom, StudentProfile, Person, GuardianRelationship } from '../../domain/types';
import { Users, User, Heart, Shield, Phone, MapPin, Calendar, Activity, Info, Sparkles, GraduationCap, Edit3, X, Save, Check } from 'lucide-react';
import { SelectSheet, Button } from '../ui';

export const EnrollmentWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_maranatha_tka');
  const [students, setStudents] = useState<any[]>([]);

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editPreferredName, setEditPreferredName] = useState<string>('');
  const [editNis, setEditNis] = useState<string>('');
  const [editNik, setEditNik] = useState<string>('');
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [editBirthPlace, setEditBirthPlace] = useState<string>('');
  const [editBirthDate, setEditBirthDate] = useState<string>('');
  const [editBloodType, setEditBloodType] = useState<'A' | 'B' | 'AB' | 'O'>('O');
  const [editAllergies, setEditAllergies] = useState<string>('');
  const [editSpecialNeeds, setEditSpecialNeeds] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const isStaff = securityContext?.role === 'TEACHER' || 
                  securityContext?.role === 'ASSISTANT_TEACHER' || 
                  securityContext?.role === 'HEADMASTER' || 
                  securityContext?.role === 'YAPENDIK_SUPERADMIN';

  const loadData = () => {
    if (!securityContext) return;
    const isTeacher = securityContext.role === 'TEACHER' || securityContext.role === 'ASSISTANT_TEACHER';
    const isGuardian = securityContext.role === 'GUARDIAN';

    let clsList = db.getClasses(securityContext.activeSchoolId);
    if (isTeacher && securityContext.assignedClasses.length > 0) {
      clsList = clsList.filter(c => securityContext.assignedClasses.includes(c.id));
    }
    setClasses(clsList);

    const activeClsId = clsList.some(c => c.id === selectedClassId) 
      ? selectedClassId 
      : (clsList[0]?.id || 'cls_maranatha_tka');
    
    if (activeClsId !== selectedClassId) {
      setSelectedClassId(activeClsId);
    }

    let studentList = db.getStudents(securityContext.activeSchoolId, activeClsId);
    if (isGuardian && securityContext.guardianChildrenPersonIds.length > 0) {
      studentList = studentList.filter(s => securityContext.guardianChildrenPersonIds.includes(s.personId));
    }
    setStudents(studentList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId]);

  const openEditModal = (s: any) => {
    setEditingStudent(s);
    setEditFullName(s.person?.fullName || '');
    setEditPreferredName(s.person?.preferredName || '');
    setEditNis(s.nis || '');
    setEditNik(s.person?.nationalIdNumber || '');
    setEditGender(s.person?.gender === 'FEMALE' ? 'FEMALE' : 'MALE');
    setEditBirthPlace(s.person?.birthPlace || '');
    setEditBirthDate(s.person?.birthDate || '');
    setEditBloodType(s.bloodType || 'O');
    setEditAllergies(s.allergies || '');
    setEditSpecialNeeds(s.specialNeeds || '');
    setEditAddress(s.person?.address || '');
    setSaveSuccessMessage(null);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !securityContext) return;
    setIsSaving(true);

    try {
      db.updateStudentProfile(
        editingStudent.id,
        {
          fullName: editFullName.trim(),
          preferredName: editPreferredName.trim(),
          nationalIdNumber: editNik.trim() || undefined,
          gender: editGender,
          birthPlace: editBirthPlace.trim(),
          birthDate: editBirthDate,
          bloodType: editBloodType,
          allergies: editAllergies.trim() || undefined,
          specialNeeds: editSpecialNeeds.trim() || undefined,
          address: editAddress.trim() || undefined
        },
        securityContext.personName,
        securityContext.userId,
        securityContext.role
      );

      setSaveSuccessMessage('Data siswa berhasil diperbarui!');
      setTimeout(() => {
        setEditingStudent(null);
        setIsSaving(false);
        setSaveSuccessMessage(null);
        loadData();
      }, 700);
    } catch (err) {
      console.error('Failed to update student:', err);
      setIsSaving(false);
    }
  };

  const currentClass = classes.find(c => c.id === selectedClassId);
  const homeroomTeacher = currentClass?.homeroomTeacherId ? db.getPersonById(currentClass.homeroomTeacherId) : null;
  const coTeacher = currentClass?.coTeacherId ? db.getPersonById(currentClass.coTeacherId) : null;

  return (
    <div className="space-y-6 pb-[160px] expanded:pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-hairline space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-subtle text-brand-primary border border-brand-line">
                Data Pokok Pendidikan • DAPODIK & Buku Induk
              </span>
            </div>
            <h1 className="text-xl medium:text-2xl font-bold text-ink flex items-center gap-2 mt-1">
              <Users className="w-6 h-6 text-brand-primary" />
              Data Induk Siswa & Orang Tua / Wali
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Daftar seluruh anak didik aktif, nomor induk kependudukan (NIK/NISN), data kesehatan, dan kontak orang tua/wali resmi.
            </p>
          </div>

          {/* Quick Stats Capsule */}
          <div className="flex items-center gap-2 self-start medium:self-auto">
            <div className="px-3 py-2 rounded-xl bg-surface-subtle border border-line text-xs flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-primary" />
              <span className="font-semibold text-ink">{students.length} Siswa Terdaftar</span>
            </div>
          </div>
        </div>

        {/* Class Selection Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-line-hairline overflow-x-auto">
          {classes.map(c => {
            const isSelected = c.id === selectedClassId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClassId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all touch-target-min whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-primary text-on-brand shadow-sm'
                    : 'bg-surface-subtle hover-only:bg-line-soft text-ink-soft'
                }`}
              >
                <span>{c.name}</span>
                {c.ageGroup && (
                  <span className={`text-[10px] px-2 py-1 rounded font-normal ${
                    isSelected ? 'bg-surface-subtle/20 text-on-brand' : 'bg-surface-subtle text-ink-faint'
                  }`}>
                    {c.ageGroup === 'TK_A_4_5' ? '4-5 Thn' : '5-6 Thn'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Homeroom & Co-Teacher Banner */}
        {currentClass && (
          <div className="bg-surface-subtle border border-line-soft rounded-xl p-3 text-xs flex flex-wrap items-center gap-y-1 gap-x-4 text-ink-soft">
            <div className="flex items-center gap-1.5">
              <span className="text-ink-faint">Wali Kelas:</span>
              <b className="text-ink font-semibold">{homeroomTeacher?.fullName || 'Belum ditugaskan'}</b>
            </div>
            {coTeacher && (
              <div className="flex items-center gap-1.5">
                <span className="text-ink-faint">• Pendamping:</span>
                <b className="text-ink font-semibold">{coTeacher.fullName}</b>
              </div>
            )}
            <div className="flex items-center gap-1.5 medium:ml-auto">
              <span className="text-ink-faint">Ruangan:</span>
              <span className="font-medium text-ink">{currentClass.roomNumber || 'Ruang Kelas'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 expanded:grid-cols-2 gap-4">
        {students.map((s, index) => {
          return (
            <div 
              key={s.id} 
              className="bg-surface border border-line hover-only:border-brand-primary/40 transition-colors rounded-2xl p-5 shadow-hairline space-y-4 relative group"
            >
              {/* Header: Student Info */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-line-soft">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-brand-subtle text-brand-primary border border-brand-line flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-sm leading-tight">{s.person?.fullName || 'Siswa'}</h3>
                    <div className="text-xs text-ink-soft flex flex-wrap items-center gap-2 mt-1">
                      <span className="bg-surface-subtle px-2 py-1 rounded font-medium text-ink">
                        Panggilan: <b className="text-brand-deep">{s.person?.preferredName || '-'}</b>
                      </span>
                      <span>•</span>
                      <span>NIS: <b className="font-mono">{s.nis || s.id}</b></span>
                      {s.person?.nationalIdNumber && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-ink-faint font-mono">NIK: {s.person.nationalIdNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => openEditModal(s)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-subtle hover-only:bg-brand-primary hover-only:text-on-brand text-brand-primary border border-brand-line flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Edit Data Siswa & Golongan Darah"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-success-tint text-success-deep border border-success-line font-semibold whitespace-nowrap">
                    {s.status}
                  </span>
                </div>
              </div>

              {/* Detail Demographics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-subtle p-3 rounded-xl border border-line-soft space-y-1">
                  <span className="text-ink-faint block text-[10px] uppercase font-semibold tracking-wider">Kelahiran</span>
                  <span className="font-semibold text-ink block truncate">
                    {s.person?.birthPlace || 'Jakarta'}, {s.person?.birthDate || '-'}
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    {s.person?.gender === 'FEMALE' ? 'Perempuan' : 'Laki-laki'}
                  </span>
                </div>

                <div className="bg-surface-subtle p-3 rounded-xl border border-line-soft space-y-1">
                  <span className="text-ink-faint block text-[10px] uppercase font-semibold tracking-wider">Kesehatan & Gol. Darah</span>
                  <span className="font-semibold text-ink block">
                    Gol. Darah: <b className="text-brand-deep font-mono px-2 py-1 bg-brand-subtle rounded border border-brand-line">{s.bloodType || 'O'}</b>
                  </span>
                  <span className="text-[11px] text-ink-soft block truncate">
                    {s.allergies && s.allergies !== 'Tidak ada' ? `Alergi: ${s.allergies}` : 'Bebas alergi'}
                  </span>
                </div>
              </div>

              {/* Address */}
              {s.person?.address && (
                <div className="text-xs bg-surface-subtle/60 p-3 rounded-xl border border-line-soft flex items-start gap-2 text-ink-soft">
                  <MapPin className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed line-clamp-2">{s.person.address}</span>
                </div>
              )}

              {/* Guardians Relationship Mapping */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-brand-primary" />
                    Orang Tua / Wali Murid Terdaftar ({s.guardians?.length || 0})
                  </span>
                </div>

                <div className="space-y-2">
                  {s.guardians && s.guardians.length > 0 ? (
                    s.guardians.map((g: any, gIdx: number) => {
                      const relLabel = g.relation?.relationshipType === 'MOTHER' 
                        ? 'Ibu Kandung' 
                        : (g.relation?.relationshipType === 'FATHER' ? 'Ayah Kandung' : 'Wali Sah');

                      return (
                        <div 
                          key={gIdx} 
                          className="flex items-start justify-between text-xs bg-surface-subtle p-3 rounded-xl border border-line gap-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-ink text-xs">{g.person?.fullName || 'Wali'}</span>
                              <span className="text-[10px] px-2 py-1 rounded bg-surface border border-line text-ink-soft font-medium">
                                {relLabel}
                              </span>
                            </div>

                            {g.person?.phone && (
                              <div className="text-xs text-ink-soft flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                                <a 
                                  href={`tel:${g.person.phone}`}
                                  className="font-mono text-ink hover-only:underline"
                                >
                                  {g.person.phone}
                                </a>
                              </div>
                            )}

                            {g.person?.nationalIdNumber && (
                              <div className="text-[10px] text-ink-faint font-mono">
                                NIK: {g.person.nationalIdNumber}
                              </div>
                            )}
                          </div>

                          {g.relation?.isPrimaryContact && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-brand-subtle text-brand-primary border border-brand-line font-semibold shrink-0">
                              Kontak Utama
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-ink-faint italic p-2 bg-surface-subtle rounded-lg text-center">
                      Belum ada wali murid yang terhubung
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Edit Data Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 bg-surface-inset/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl shadow-floating border border-line max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 text-xs text-ink space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-brand-primary" />
                  Edit Profil Data Siswa
                </h2>
                <p className="text-[11px] text-ink-soft">
                  Perbarui informasi golongan darah, riwayat kesehatan, dan data kependudukan.
                </p>
              </div>
              <button 
                onClick={() => setEditingStudent(null)} 
                className="text-ink-soft hover-only:text-ink cursor-pointer p-1 rounded-lg hover-only:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-success-tint text-success-deep border border-success-line rounded-xl font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* Golongan Darah & Kesehatan (High Priority) */}
              <div className="p-4 bg-brand-subtle/50 border border-brand-line rounded-xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-deep flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-brand-primary" /> Data Kesehatan &amp; Golongan Darah
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <SelectSheet
                      label="Golongan Darah"
                      value={editBloodType}
                      onChange={(val) => setEditBloodType(val as any)}
                      options={[
                        { value: 'A', label: 'Golongan Darah A' },
                        { value: 'B', label: 'Golongan Darah B' },
                        { value: 'AB', label: 'Golongan Darah AB' },
                        { value: 'O', label: 'Golongan Darah O' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-ink mb-1">Riwayat Alergi</label>
                    <input
                      type="text"
                      value={editAllergies}
                      onChange={(e) => setEditAllergies(e.target.value)}
                      placeholder="Contoh: Alergi udang, telur / Tidak ada"
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs text-ink focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Kebutuhan Khusus / Catatan Tambahan</label>
                  <input
                    type="text"
                    value={editSpecialNeeds}
                    onChange={(e) => setEditSpecialNeeds(e.target.value)}
                    placeholder="Contoh: Menggunakan kacamata / Tidak ada"
                    className="w-full bg-surface border border-line rounded-xl p-3 text-xs text-ink focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Data Identitas */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-primary" /> Identitas Anak
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-soft mb-1">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      required
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs text-ink font-semibold focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-soft mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={editPreferredName}
                      onChange={(e) => setEditPreferredName(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs text-ink focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-soft mb-1">NIK (Nomor Induk Kependudukan)</label>
                    <input
                      type="text"
                      value={editNik}
                      onChange={(e) => setEditNik(e.target.value)}
                      placeholder="16 digit NIK"
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-mono text-ink focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <SelectSheet
                      label="Jenis Kelamin"
                      value={editGender}
                      onChange={(val) => setEditGender(val as any)}
                      options={[
                        { value: 'MALE', label: 'Laki-laki' },
                        { value: 'FEMALE', label: 'Perempuan' }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-soft mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={editBirthPlace}
                      onChange={(e) => setEditBirthPlace(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs text-ink focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-soft mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-mono text-ink focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-ink-soft mb-1">Alamat Tempat Tinggal</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Alamat lengkap domisili anak"
                    className="w-full bg-surface border border-line rounded-xl p-3 text-xs text-ink focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-subtle hover-only:bg-line-soft text-ink-soft cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-on-brand hover-only:bg-brand-deep flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
