/**
 * Yapendik School OS — Stage 3.4: Governance Error Translator
 * 
 * Maps canonical PostgreSQL & Supabase RPC exception codes into structured,
 * actionable, and localized user feedback.
 */

export interface TranslatedGovernanceError {
  title: string;
  message: string;
  actionSuggestion?: string;
  isGovernanceError: boolean;
  code?: string;
}

export function translateGovernanceError(error: any): TranslatedGovernanceError {
  const errMsg: string = error?.message || error?.error_description || (typeof error === 'string' ? error : '');

  if (errMsg.includes('PRECONDITION_FAILED')) {
    return {
      title: 'Prasyarat Penutupan Semester Belum Terpenuhi',
      message: 'Seluruh siswa aktif harus memiliki laporan perkembangan (LPPA) yang telah disetujui (APPROVED/PUBLISHED) oleh Kepala Sekolah.',
      actionSuggestion: 'Buka menu Rapor LPPA dan pastikan semua rapor kelas telah diverifikasi dan disetujui sebelum menutup semester.',
      isGovernanceError: true,
      code: 'PRECONDITION_FAILED'
    };
  }

  if (errMsg.includes('CAPACITY_EXCEEDED')) {
    return {
      title: 'Kapasitas Ruang Kelas Tidak Mencukupi',
      message: 'Jumlah siswa yang dipromosikan melebihi sisa daya tampung ruang kelas tujuan.',
      actionSuggestion: 'Kurangi jumlah siswa yang dipilih dalam rombel promosi atau sesuaikan kapasitas ruang kelas tujuan.',
      isGovernanceError: true,
      code: 'CAPACITY_EXCEEDED'
    };
  }

  if (errMsg.includes('ACTIVE_PERIOD_EXISTS')) {
    return {
      title: 'Semester Aktif Masih Berjalan',
      message: 'Tidak dapat membuka semester baru karena masih terdapat semester yang berstatus aktif pada unit sekolah ini.',
      actionSuggestion: 'Tutup semester aktif terlebih dahulu sebelum menginisialisasi semester baru.',
      isGovernanceError: true,
      code: 'ACTIVE_PERIOD_EXISTS'
    };
  }

  if (errMsg.includes('UNAUTHORIZED') || errMsg.includes('403') || errMsg.includes('jurisdiction')) {
    return {
      title: 'Akses Otoritas Ditolak',
      message: 'Akun Anda tidak memiliki wewenang tata kelola yang sah untuk mengeksekusi tindakan pada unit sekolah ini.',
      actionSuggestion: 'Pastikan Anda masuk sebagai Kepala Sekolah unit terkait atau Superadmin Yayasan.',
      isGovernanceError: true,
      code: 'UNAUTHORIZED'
    };
  }

  if (errMsg.includes('UNAUTHENTICATED') || errMsg.includes('401')) {
    return {
      title: 'Sesi Kedaluwarsa / Belum Terautentikasi',
      message: 'Identitas sesi pengguna tidak ditemukan atau telah kedaluwarsa.',
      actionSuggestion: 'Silakan masuk kembali (login) ke Amanaura OS.',
      isGovernanceError: true,
      code: 'UNAUTHENTICATED'
    };
  }

  if (errMsg.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
    return {
      title: 'Data Semester Terkunci Permanen (Arsip)',
      message: 'Semester ini telah resmi ditutup. Seluruh data presensi, catatan observasi, dan rapor berstatus read-only.',
      actionSuggestion: 'Buka semester aktif untuk melakukan pencatatan harian.',
      isGovernanceError: true,
      code: 'CANNOT_MUTATE_CLOSED_SEMESTER'
    };
  }

  if (errMsg.includes('CANNOT_MUTATE_TERMINAL_PLACEMENT')) {
    return {
      title: 'Riwayat Penempatan Telah Final',
      message: 'Catatan penempatan siswa yang telah selesai (COMPLETED/GRADUATED) dikunci secara permanen.',
      actionSuggestion: 'Riwayat kelulusan hanya dapat dibaca sebagai arsip longitudinal anak.',
      isGovernanceError: true,
      code: 'CANNOT_MUTATE_TERMINAL_PLACEMENT'
    };
  }

  if (errMsg.includes('SOURCE_SEMESTER_NOT_CLOSED')) {
    return {
      title: 'Semester Asal Belum Ditutup',
      message: 'Promosi rombel hanya dapat dilakukan setelah semester kelas asal berstatus CLOSED atau CLOSING.',
      actionSuggestion: 'Tutup semester berjalan sebelum memajukan rombel ke semester berikutnya.',
      isGovernanceError: true,
      code: 'SOURCE_SEMESTER_NOT_CLOSED'
    };
  }

  if (errMsg.includes('TEMPORAL_ALIGNMENT_MISMATCH')) {
    return {
      title: 'Ketidaksesuaian Periode Kelas Tujuan',
      message: 'Kelas tujuan promosi tidak terdaftar pada tahun/semester target yang dipilih.',
      actionSuggestion: 'Pilih kelas tujuan yang benar-benar aktif pada semester target.',
      isGovernanceError: true,
      code: 'TEMPORAL_ALIGNMENT_MISMATCH'
    };
  }

  if (errMsg.includes('INVALID_DATE_RANGE')) {
    return {
      title: 'Rentang Tanggal Tidak Valid',
      message: 'Tanggal akhir semester harus lebih besar (setelah) tanggal mulai semester.',
      actionSuggestion: 'Periksa kembali tanggal mulai dan selesai semester.',
      isGovernanceError: true,
      code: 'INVALID_DATE_RANGE'
    };
  }

  return {
    title: 'Operasi Gagal',
    message: errMsg || 'Terjadi kesalahan sistem internal saat mengeksekusi operasi tata kelola.',
    isGovernanceError: false
  };
}
