import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Heart,
  Pencil,
  Camera,
  Phone,
  X,
} from 'lucide-react';
import type { StudentWithGuardians } from '../../types/class';
import { AvatarChild } from '../ui/AvatarChild';
import { StudentPhotoUpload } from './StudentPhotoUpload';
import { useSecurityContext } from '../../auth/context';

// ═══════════════════════════════════════════════════════════════════
// SIGNATURE #4: Status Dot Capsule
// ═══════════════════════════════════════════════════════════════════
function StatusDotCapsule({ status }: { status: 'Aktif' | 'Pindah' | 'Keluar' | 'ACTIVE' | 'TRANSFERRED' | 'INACTIVE' }) {
  const isAktif = status === 'Aktif' || status === 'ACTIVE';
  const isPindah = status === 'Pindah' || status === 'TRANSFERRED';

  const config = isAktif
    ? { dot: 'bg-success', text: 'text-success-deep', bg: 'bg-success-tint', border: 'border-success-line', label: 'Aktif' }
    : isPindah
    ? { dot: 'bg-warning', text: 'text-warning-deep', bg: 'bg-warning-tint', border: 'border-warning-line', label: 'Pindah' }
    : { dot: 'bg-danger', text: 'text-danger-deep', bg: 'bg-danger-tint', border: 'border-danger-line', label: 'Keluar' };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border} shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className={`font-mono text-xs font-medium ${config.text}`}>{config.label}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRIVACY HELPER: Masked NIK (Tier 4 Protection)
// ═══════════════════════════════════════════════════════════════════
function maskNik(nik?: string): string {
  if (!nik) return '—';
  const clean = nik.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return `••••••••••••${clean.slice(-4)}`;
}

export interface StudentListItemProps {
  student: StudentWithGuardians;
  index: number;
  onUpdatePhoto?: (studentId: string, photoUrl: string) => Promise<void> | void;
  onEditStudent?: (student: StudentWithGuardians) => void;
}

export const StudentListItem: React.FC<StudentListItemProps> = ({
  student,
  index,
  onUpdatePhoto,
  onEditStudent,
}) => {
  const { currentPersona } = useSecurityContext();
  const canEditMasterData =
    currentPersona?.role === 'HEADMASTER' ||
    currentPersona?.role === 'YAPENDIK_SUPERADMIN';

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState<boolean>(false);

  const birthDate = new Date(student.birth_date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const handleSavePhoto = async (newPhotoUrl: string) => {
    if (onUpdatePhoto) {
      await onUpdatePhoto(student.id, newPhotoUrl);
    }
    student.photo_url = newPhotoUrl;
  };

  return (
    <div className="w-full bg-surface border border-line rounded-card overflow-hidden hover-only:shadow-luminescent transition-shadow">
      {/* ═══════════════════════════════════════════════════════════
          HEADER: Always Visible Edge-to-Edge Bar
          ═══════════════════════════════════════════════════════════ */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full min-h-[56px] p-4 medium:p-5 flex items-start justify-between gap-3 cursor-pointer select-none hover-only:bg-surface-subtle/40 transition-colors"
      >
        {/* Left Section: Avatar (Click to Preview) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPhotoPreview(true);
          }}
          title="Klik untuk melihat foto"
          aria-label={`Lihat foto ${student.full_name}`}
          className="shrink-0 relative cursor-pointer rounded-field overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.full_name}
              className="w-10 h-10 rounded-field object-cover border border-line shadow-hairline hover-only:opacity-90 transition-opacity"
            />
          ) : (
            <AvatarChild
              name={student.full_name}
              id={student.nis}
              size="md"
              showSymbol={false}
              uniformColor={true}
            />
          )}
        </button>

        {/* Right Section: 2-Row Stack */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Row 1: Number + Full Name (Left) & Chevron (Right) */}
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-2 min-w-0 flex-1">
              <span className="shrink-0 font-mono text-xs font-semibold text-ink-faint">
                #{index + 1}
              </span>
              <h3 className="font-sans font-bold text-ink text-sm medium:text-base leading-snug break-words">
                {student.full_name}
              </h3>
            </div>
            <div className="w-6 h-6 flex items-center justify-center text-ink-soft hover-only:text-ink transition-colors shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-accent-valor" />
              ) : (
                <ChevronDown className="w-4 h-4 text-ink-faint" />
              )}
            </div>
          </div>

          {/* Row 2: Metadata (Left) & Status Badge (Right) */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-ink-soft">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Panggilan: <strong className="text-ink font-semibold">{student.call_name}</strong>
              </span>
              <span className="text-ink-faint">•</span>
              <span className="font-mono text-xs">
                NIS: <strong className="text-ink-soft">{student.nis}</strong>
              </span>
              {student.nik && (
                <>
                  <span className="text-ink-faint hidden medium:inline">•</span>
                  <span
                    className="font-mono text-xs text-ink-faint select-none hidden medium:inline"
                    onCopy={(e) => e.preventDefault()}
                    title="NIK Terproteksi"
                  >
                    NIK: {maskNik(student.nik)}
                  </span>
                </>
              )}
            </div>

            {/* Status Capsule di Kanan Bawah */}
            <StatusDotCapsule status={student.status} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          COLLAPSIBLE DETAIL BODY (Hukum 2: Max Depth = 1)
          ═══════════════════════════════════════════════════════════ */}
      {isExpanded && (
        <div className="border-t border-line bg-canvas/30 animate-in fade-in duration-150">
          <div className="p-4 medium:p-5 space-y-4">
            {/* Grid 2 Kolom: Kelahiran & Kesehatan */}
            <div className="grid grid-cols-1 medium:grid-cols-2 gap-3 medium:gap-4">
              {/* Kelahiran */}
              <div className="bg-surface p-3 medium:p-4 rounded-xl border border-line space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
                  Kelahiran &amp; Jenis Kelamin
                </p>
                <p className="text-ink text-sm font-medium">
                  {student.birth_place}, {birthDate}
                </p>
                <p className="text-ink-soft text-xs">{student.gender}</p>
              </div>

              {/* Kesehatan & Gol. Darah */}
              <div className="bg-surface p-3 medium:p-4 rounded-xl border border-line space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
                  Kesehatan &amp; Golongan Darah
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-ink text-sm font-medium">Gol. Darah:</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-surface-subtle border border-line font-mono text-xs font-bold text-ink">
                    {student.blood_type || '—'}
                  </span>
                </div>
                <p className="text-ink-soft text-xs mt-1">{student.allergies}</p>
              </div>
            </div>

            {/* NIK & Alamat Lengkap (Full Display Tanpa Truncate) */}
            <div className="bg-surface p-3 medium:p-4 rounded-xl border border-line space-y-2 text-xs text-ink-soft">
              {student.nik && (
                <div className="flex items-center justify-between pb-2 border-b border-line-soft">
                  <span className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
                    NIK Siswa
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink select-none" onCopy={(e) => e.preventDefault()}>
                    {maskNik(student.nik)}
                  </span>
                </div>
              )}

              {student.address && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
                    Alamat Tempat Tinggal
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-ink-faint" />
                    <p className="text-ink break-words leading-relaxed">{student.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Orang Tua / Wali */}
            {student.guardians.length > 0 ? (
              <div className="bg-surface p-3 medium:p-4 rounded-xl border border-line space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-accent-valor" />
                  Orang Tua / Wali Terdaftar ({student.guardians.length})
                </p>
                <div className="space-y-2 divide-y divide-line-soft">
                  {student.guardians.map((g) => (
                    <div key={g.id} className="pt-2 first:pt-0 flex flex-wrap items-center justify-between text-sm gap-2">
                      <div className="min-w-0">
                        <p className="text-ink font-semibold text-xs medium:text-sm">{g.name}</p>
                        <p className="text-ink-faint text-xs">{g.relationship}</p>
                      </div>
                      {g.phone && (
                        <a
                          href={`tel:${g.phone}`}
                          className="flex items-center gap-1.5 font-mono text-xs text-ink-soft hover-only:text-ink hover-only:underline"
                        >
                          <Phone className="w-4 h-4 text-accent-valor" />
                          <span>{g.phone}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-surface p-3 rounded-xl border border-line text-xs text-ink-faint italic text-center">
                Belum ada data orang tua/wali yang terdaftar
              </div>
            )}

            {/* Action Bar Bawah */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-surface border border-line text-ink font-semibold text-xs flex items-center gap-2 hover-only:bg-surface-subtle hover-only:text-ink cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4 text-accent-valor" />
                <span>Ubah Foto Profil</span>
              </button>

              {canEditMasterData && onEditStudent && (
                <button
                  type="button"
                  onClick={() => onEditStudent(student)}
                  className="min-h-[48px] px-4 py-2 rounded-xl bg-brand text-on-brand font-semibold text-xs flex items-center gap-2 shadow-sm hover-only:bg-brand-deep cursor-pointer transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Ubah Data Siswa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Foto Profil (Pop-up Perbesar) */}
      {showPhotoPreview && (
        <div
          className="fixed inset-0 z-50 bg-surface-inset/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div
            className="bg-surface border border-line-strong rounded-card p-5 max-w-sm w-full space-y-4 shadow-hairline text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h4 className="font-display font-bold text-ink text-sm">Foto Profil Siswa</h4>
              <button
                type="button"
                onClick={() => setShowPhotoPreview(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle text-ink-soft hover-only:text-ink flex items-center justify-center cursor-pointer"
                aria-label="Tutup Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 flex justify-center">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="w-48 h-48 rounded-2xl object-cover border border-line shadow-md mx-auto"
                />
              ) : (
                <div className="my-4">
                  <AvatarChild
                    name={student.full_name}
                    id={student.nis}
                    size="lg"
                    showSymbol={false}
                    uniformColor={true}
                    className="scale-125"
                  />
                </div>
              )}
            </div>

            <div className="pt-1">
              <p className="font-bold text-ink text-base">{student.full_name}</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoPreview(false);
                  setShowPhotoModal(true);
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-surface-subtle border border-line text-xs font-semibold text-ink hover-only:bg-surface flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-accent-valor" />
                <span>Ubah Foto Profil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload / Camera Foto Siswa */}
      {showPhotoModal && (
        <StudentPhotoUpload
          studentId={student.id}
          studentName={student.full_name}
          studentNis={student.nis}
          currentPhotoUrl={student.photo_url}
          onSavePhoto={handleSavePhoto}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </div>
  );
};
