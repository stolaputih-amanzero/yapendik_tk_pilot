import { SelectSheet } from '../ui';
/**
 * Yapendik School OS — Domain 06: Student Roster & Canonical Identity Registry
 * Clear separation of Person entity from StudentProfile and GuardianRelationship projections.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { ClassRoom, StudentProfile, Person, GuardianRelationship } from '../../domain/types';
import { Users, User, Heart, Shield, Phone, MapPin, Calendar, Activity, Info } from 'lucide-react';

export const EnrollmentWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_tka_01');
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

    if (clsList.length > 0 && !clsList.some(c => c.id === selectedClassId)) {
      setSelectedClassId(clsList[0].id);
    }

    let studentList = db.getStudents(securityContext.activeSchoolId, selectedClassId);
    if (isGuardian && securityContext.guardianChildrenPersonIds.length > 0) {
      studentList = studentList.filter(s => securityContext.guardianChildrenPersonIds.includes(s.personId));
    }
    setStudents(studentList);
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId]);

  return (
    <div className="space-y-6 pb-[160px] expanded:pb-8">
      {/* Header */}
      <div className="bg-surface border border-line rounded-lg p-4 shadow-hairline flex flex-col medium:flex-row medium:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-ink" />
            Data Induk Siswa & Keluarga
            <div className="group relative flex items-center ml-1">
              <Info className="w-4 h-4 text-ink-faint hover-only:text-ink transition-colors cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block w-64 p-2 bg-brand text-on-brand text-[11px] font-medium leading-relaxed rounded-field shadow-floating z-50">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand rotate-45"></div>
                Arsitektur Kanonikal: Data ini mengintegrasikan profil tunggal anak dengan akun orang tua sah (Person Entity Mapping).
              </div>
            </div>
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Manajemen profil lengkap peserta didik, data rekam medis, dan informasi kontak orang tua/wali.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-surface-subtle border border-line rounded-md px-3 py-1 text-xs">
          <span className="text-ink-soft font-medium">Kelas / Rombel:</span>
          <SelectSheet value={selectedClassId}   options={classes.map(c => ({ value: c.id, label: c.name }))} />
        </div>
      </div>

      {/* Students Cards */}
      <div className="grid grid-cols-1 expanded:grid-cols-2 gap-4">
        {students.map(s => {
          return (
            <div key={s.id} className="bg-surface border border-line rounded-lg p-4 shadow-hairline space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-line-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-subtle border border-line flex items-center justify-center font-bold text-ink-soft text-sm">
                    {(s.person?.fullName || s.nis || 'S').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-sm">{s.person?.fullName || 'Siswa'}</h3>
                    <div className="text-xs text-ink-soft flex items-center gap-2 mt-0.5">
                      <span>Panggilan: <b>{s.person?.preferredName || '-'}</b></span>
                      <span>•</span>
                      <span>NIS: <b className="font-mono">{s.nis || s.id}</b></span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-1 rounded bg-success-tint text-success-deep border border-success-line font-semibold whitespace-nowrap">
                  {s.status}
                </span>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-subtle p-2 rounded border border-line-soft">
                  <span className="text-ink-soft font-medium block text-[10px] uppercase tracking-wider">Kelahiran:</span>
                  <span className="font-semibold text-ink">
                    {s.person.birthPlace}, {s.person.birthDate}
                  </span>
                </div>

                <div className="bg-surface-subtle p-2 rounded border border-line-soft">
                  <span className="text-ink-soft font-medium block text-[10px] uppercase tracking-wider">Golongan Darah:</span>
                  <span className="font-semibold text-ink">
                    {s.bloodType || 'Belum terdata'}
                  </span>
                </div>
              </div>

              {/* Health and special notes */}
              <div className="text-xs space-y-1.5 bg-warning-tint/40 p-3 rounded border border-warning-line">
                <div>
                  <span className="font-semibold text-ink">Catatan Alergi:</span>{' '}
                  <span className="text-ink-soft">{s.allergies || 'Tidak ada riwayat alergi'}</span>
                </div>
                <div>
                  <span className="font-semibold text-ink">Kebutuhan Pendampingan:</span>{' '}
                  <span className="text-ink-soft">{s.specialNeedsNotes || 'Stabil & mandiri'}</span>
                </div>
              </div>

              {/* Guardians relationship mapping */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block mb-1.5">
                  Orang Tua / Wali Sah Terkait:
                </span>
                <div className="space-y-1.5">
                  {s.guardians.map((g: any, gIdx: number) => (
                    <div key={gIdx} className="flex items-center justify-between text-xs bg-surface-subtle p-2 rounded border border-line">
                      <div>
                        <span className="font-bold text-ink">{g.person.fullName}</span>{' '}
                        <span className="text-ink-soft">({g.relation.relationshipType})</span>
                        {g.person.phone && (
                          <div className="text-[11px] text-ink-soft flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-ink-faint" /> {g.person.phone}
                          </div>
                        )}
                      </div>
                      {g.relation.isPrimaryContact && (
                        <span className="text-[10px] px-1 py-1 rounded bg-info-tint text-info-deep font-semibold">
                          Kontak Utama
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
