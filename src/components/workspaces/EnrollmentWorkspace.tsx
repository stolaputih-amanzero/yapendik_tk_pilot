import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { ClassRoom, StudentProfile, Person, GuardianRelationship } from '../../domain/types';
import { Users, User, Heart, Shield, Phone, MapPin, Calendar, Activity, Info, Sparkles, GraduationCap } from 'lucide-react';
import { SelectSheet } from '../ui';

export const EnrollmentWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_maranatha_tka');
  const [students, setStudents] = useState<any[]>([]);

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
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-subtle text-brand-primary border border-brand-line">
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
            <div className="px-3.5 py-1.5 rounded-xl bg-surface-subtle border border-line text-xs flex items-center gap-2">
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
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-surface-subtle hover-only:bg-line-soft text-ink-soft'
                }`}
              >
                <span>{c.name}</span>
                {c.ageGroup && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-ink-faint'
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
              className="bg-surface border border-line hover:border-brand-primary/40 transition-colors rounded-2xl p-5 shadow-hairline space-y-4"
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
                      <span className="bg-surface-subtle px-2 py-0.5 rounded font-medium text-ink">
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

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold whitespace-nowrap">
                  {s.status}
                </span>
              </div>

              {/* Detail Demographics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-subtle p-2.5 rounded-xl border border-line-soft space-y-0.5">
                  <span className="text-ink-faint block text-[10px] uppercase font-semibold tracking-wider">Kelahiran</span>
                  <span className="font-semibold text-ink block truncate">
                    {s.person?.birthPlace || 'Jakarta'}, {s.person?.birthDate || '-'}
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    {s.person?.gender === 'FEMALE' ? 'Perempuan (👧)' : 'Laki-laki (👦)'}
                  </span>
                </div>

                <div className="bg-surface-subtle p-2.5 rounded-xl border border-line-soft space-y-0.5">
                  <span className="text-ink-faint block text-[10px] uppercase font-semibold tracking-wider">Kesehatan & Gol. Darah</span>
                  <span className="font-semibold text-ink block">
                    Gol. Darah: <b className="text-brand-deep">{s.bloodType || 'O'}</b>
                  </span>
                  <span className="text-[11px] text-ink-soft block truncate">
                    {s.allergies && s.allergies !== 'Tidak ada' ? `Alergi: ${s.allergies}` : 'Bebas alergi'}
                  </span>
                </div>
              </div>

              {/* Address */}
              {s.person?.address && (
                <div className="text-xs bg-surface-subtle/60 p-2.5 rounded-xl border border-line-soft flex items-start gap-2 text-ink-soft">
                  <MapPin className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed line-clamp-2">{s.person.address}</span>
                </div>
              )}

              {/* Guardians Relationship Mapping */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-brand-primary" />
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
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-line text-ink-soft font-medium">
                                {relLabel}
                              </span>
                            </div>

                            {g.person?.phone && (
                              <div className="text-xs text-ink-soft flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-brand-primary shrink-0" />
                                <a 
                                  href={`tel:${g.person.phone}`}
                                  className="font-mono text-ink hover:underline"
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
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-subtle text-brand-primary border border-brand-line font-semibold shrink-0">
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
    </div>
  );
};
