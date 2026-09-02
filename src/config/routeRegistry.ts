/**
 * Amanaura OS × FLOW — Canonical Route & Page Title Registry
 * Architectural Specification: ADR-UX-011 §4.1, §6.1 & Amanaura v3.0 §6.1
 * 
 * Strict Law: Page Title <= 2 Words (Max 16 Characters).
 * Zero ritual names as page titles. Dignified, clean, and concise workspace titles.
 */

import { WorkspaceTab } from '../components/layout/TopBar';

export interface TabMetadata {
  id: WorkspaceTab;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  hash: string;
  contextualTitles?: Partial<Record<string, string>>;
}

export const ROUTE_REGISTRY: Record<WorkspaceTab, TabMetadata> = {
  TEACHER_HOME: {
    id: 'TEACHER_HOME',
    title: 'Beranda Kelas',
    shortTitle: 'Beranda Kelas',
    category: 'Ruang Kelas',
    description: 'Pusat komando sirkadian dan alur kerja harian pendidik.',
    hash: 'beranda-guru'
  },
  DAILY_WORK: {
    id: 'DAILY_WORK',
    title: 'Jurnal Harian',
    shortTitle: 'Jurnal Harian',
    category: 'Ruang Kelas',
    description: 'Catatan aktivitas harian dan log rencana pembelajaran sentra.',
    hash: 'kerja-harian'
  },
  OBSERVATIONS: {
    id: 'OBSERVATIONS',
    title: 'Momen Belajar',
    shortTitle: 'Momen Belajar',
    category: 'Ruang Kelas',
    description: 'Perekaman momen bermakna dan catatan narasi anekdot anak.',
    hash: 'observasi'
  },
  DEVELOPMENT: {
    id: 'DEVELOPMENT',
    title: 'Rapor LPPA',
    shortTitle: 'Rapor LPPA',
    category: 'Akademik',
    description: 'Laporan Perkembangan Profil Anak dan capaian tumbuh kembang.',
    hash: 'perkembangan',
    contextualTitles: {
      HEADMASTER: 'Verifikasi LPPA',
      GUARDIAN: 'Perkembangan Ananda',
      PARENT_BUDI: 'Perkembangan Ananda',
      TEACHER: 'Rapor LPPA',
      ASSISTANT_TEACHER: 'Rapor LPPA'
    }
  },
  ATTENDANCE: {
    id: 'ATTENDANCE',
    title: 'Presensi Harian',
    shortTitle: 'Presensi Harian',
    category: 'Ruang Kelas',
    description: 'Pencatatan kehadiran harian dan pemantauan ketidakhadiran.',
    hash: 'presensi'
  },
  COMMUNICATION: {
    id: 'COMMUNICATION',
    title: 'Buku Penghubung',
    shortTitle: 'Buku Penghubung',
    category: 'Kemitraan',
    description: 'Komunikasi dua arah dan pesan sirkadian keluarga.',
    hash: 'buku-penghubung'
  },
  ROSTER: {
    id: 'ROSTER',
    title: 'Data Roster',
    shortTitle: 'Data Roster',
    category: 'Administrasi',
    description: 'Manajemen profil siswa, NISN, dan rombongan belajar.',
    hash: 'data-roster'
  },
  STUDENT_JOURNEY: {
    id: 'STUDENT_JOURNEY',
    title: 'Jejak Anak',
    shortTitle: 'Jejak Anak',
    category: 'Observasi',
    description: 'Linimasa portofolio karya dan perkembangan holistik anak.',
    hash: 'jejak-anak'
  },
  GOVERNANCE: {
    id: 'GOVERNANCE',
    title: 'Audit Tata Kelola',
    shortTitle: 'Audit Tata Kelola',
    category: 'Tata Kelola',
    description: 'Audit jejak kanonikal dan pemantauan integritas institusi.',
    hash: 'evaluasi-sekolah'
  },
  INSTITUTIONAL_HEALTH: {
    id: 'INSTITUTIONAL_HEALTH',
    title: 'Statistik Unit',
    shortTitle: 'Statistik Unit',
    category: 'Pusat Komando',
    description: 'Indikator performa operasional dan kesehatan satuan.',
    hash: 'kesehatan-sekolah'
  },
  HEADMASTER_ADOPTION: {
    id: 'HEADMASTER_ADOPTION',
    title: 'Beranda Sekolah',
    shortTitle: 'Beranda Sekolah',
    category: 'Pusat Komando',
    description: 'Kokpit kepemimpinan, rekonsiliasi sirkadian, dan kedaulatan sekolah.',
    hash: 'beranda-sekolah'
  },
  FOUNDATION_GOVERNANCE: {
    id: 'FOUNDATION_GOVERNANCE',
    title: 'Console Yayasan',
    shortTitle: 'Console Yayasan',
    category: 'Standar Akademik',
    description: 'Wawasan strategis eksekutif yayasan dan perisai privasi FB-07.',
    hash: 'yayasan'
  },
  ADMISSIONS_PORTAL: {
    id: 'ADMISSIONS_PORTAL',
    title: 'Portal PPDB',
    shortTitle: 'Portal PPDB',
    category: 'Penerimaan',
    description: 'Pendaftaran peserta didik baru dan pemantauan status berkas.',
    hash: 'portal-ppdb',
    contextualTitles: {
      APPLICANT: 'Pendaftaran PPDB',
      GUARDIAN: 'Pendaftaran PPDB',
      PARENT_BUDI: 'Pendaftaran PPDB'
    }
  },
  ADMISSIONS_DESK: {
    id: 'ADMISSIONS_DESK',
    title: 'Meja PPDB',
    shortTitle: 'Meja PPDB',
    category: 'Penerimaan',
    description: 'Verifikasi berkas pendaftaran calon siswa oleh Kepala Sekolah.',
    hash: 'meja-ppdb'
  },
  GUARDIAN_WORKSPACE: {
    id: 'GUARDIAN_WORKSPACE',
    title: 'Portal Keluarga',
    shortTitle: 'Portal Keluarga',
    category: 'Keluarga',
    description: 'Galeri momen harian, refleksi Surat Sore, dan rapor anak.',
    hash: 'portal-keluarga'
  },
  ACADEMIC_LIFECYCLE: {
    id: 'ACADEMIC_LIFECYCLE',
    title: 'Tahun Ajaran',
    shortTitle: 'Tahun Ajaran',
    category: 'Tata Kelola',
    description: 'Manajemen semester, kalender pendidikan, dan transisi periode.',
    hash: 'siklus-akademik'
  },
  COHORT_PROMOTION: {
    id: 'COHORT_PROMOTION',
    title: 'Kenaikan Kelas',
    shortTitle: 'Kenaikan Kelas',
    category: 'Akademik',
    description: 'Proses penentuan kenaikan kelompok bermain dan kelas TK.',
    hash: 'kenaikan-kelas'
  },
  GRADUATION_REGISTRY: {
    id: 'GRADUATION_REGISTRY',
    title: 'Buku Induk',
    shortTitle: 'Buku Induk',
    category: 'Akademik',
    description: 'Penerbitan surat tanda tamat belajar dan arsip kelulusan.',
    hash: 'kelulusan'
  },
  PROVISIONING: {
    id: 'PROVISIONING',
    title: 'Kesiapan Unit',
    shortTitle: 'Kesiapan Unit',
    category: 'Tata Kelola',
    description: 'Manajemen hak akses, akun pendidik, dan profil institusi.',
    hash: 'manajemen-pengguna'
  },
  TESTS: {
    id: 'TESTS',
    title: 'Uji Otorisasi',
    shortTitle: 'Uji Otorisasi',
    category: 'Pengembang',
    description: 'Simulator pengujian hak akses dan gerbang keamanan institusi.',
    hash: 'uji-otorisasi'
  },
  PERCONTOHAN: {
    id: 'PERCONTOHAN',
    title: 'Percontohan',
    shortTitle: 'Percontohan',
    category: 'Desain Sistem',
    description: 'Living Contract & visual specimen token FLOW oklch.',
    hash: 'percontohan'
  }
};

export function getTabMetadata(tab: string | WorkspaceTab): TabMetadata {
  return ROUTE_REGISTRY[tab as WorkspaceTab] || {
    id: tab as WorkspaceTab,
    title: 'Ruang Kerja',
    shortTitle: 'Ruang Kerja',
    category: 'Operasional',
    description: 'Sistem Operasi Amanaura OS',
    hash: String(tab).toLowerCase().replace(/_/g, '-')
  };
}

/**
 * Returns contextual route label tailored to user role, strictly respecting
 * the Amanaura Law (<= 2 words, max 16 chars).
 */
export function getRouteLabel(tab: string | WorkspaceTab, role?: string): string {
  const meta = getTabMetadata(tab);
  if (role && meta.contextualTitles && meta.contextualTitles[role]) {
    return meta.contextualTitles[role]!;
  }
  return meta.title;
}

