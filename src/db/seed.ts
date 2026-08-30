/**
 * Yapendik School OS — TK Pilot Seed Data
 * Real-world PAUD/TK Kurikulum Merdeka & Canonical Relational Fixtures
 */

import {
  School,
  AcademicYear,
  ClassRoom,
  Person,
  StudentProfile,
  GuardianRelationship,
  TeacherProfile,
  LearningActivity,
  DevelopmentalMilestone,
  ObservationRecord,
  DailyAttendanceEntry,
  GuardianNotice,
  AuditLogEntry
} from '../domain/types';

export const SEED_SCHOOLS: School[] = [
  {
    id: 'sch_tk_maranatha',
    npsn: '69820291',
    name: 'TK YAPENDIK GPIB Cabang Maranatha',
    level: 'TK',
    subType: 'PAUD_TERPADU',
    address: 'JL. BALADEWA NO. 32, TANAH TINGGI',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    phone: '081281310123',
    email: 'yapendikmaranathajkt@gmail.com',
    headmasterPersonId: 'per_headmaster_sheryl',
    academicYearActiveId: 'ay_maranatha_2026_2027_ganjil',
    status: 'ACTIVE',
    operationalReadiness: 'READY',
    createdAt: '2026-07-01T08:00:00Z'
  }
];

export const SEED_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay_maranatha_2026_2027_ganjil',
    schoolId: 'sch_tk_maranatha',
    name: 'Tahun Ajaran 2026/2027',
    semester: 'GANJIL',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'ay_2026_2027_ganjil',
    schoolId: 'sch_tk_yapendik_01',
    name: 'Tahun Ajaran 2026/2027',
    semester: 'GANJIL',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'ay_2026_2027_ganjil_02',
    schoolId: 'sch_tk_yapendik_02',
    name: 'Tahun Ajaran 2026/2027',
    semester: 'GANJIL',
    startDate: '2026-07-15',
    endDate: '2026-12-20',
    isActive: true
  }
];

export const SEED_CLASSES: ClassRoom[] = [
  {
    id: 'cls_maranatha_tka',
    schoolId: 'sch_tk_maranatha',
    academicYearId: 'ay_maranatha_2026_2027_ganjil',
    name: 'Kelompok A (TK A)',
    ageGroup: 'TK_A_4_5',
    roomNumber: 'Ruang TK A',
    capacity: 20,
    homeroomTeacherId: 'per_teacher_erna',
    coTeacherId: 'per_teacher_charlotha',
    isActive: true
  },
  {
    id: 'cls_maranatha_tkb',
    schoolId: 'sch_tk_maranatha',
    academicYearId: 'ay_maranatha_2026_2027_ganjil',
    name: 'Kelompok B (TK B)',
    ageGroup: 'TK_B_5_6',
    roomNumber: 'Ruang TK B',
    capacity: 20,
    homeroomTeacherId: 'per_teacher_evi',
    isActive: true
  },
  {
    id: 'cls_tka_01',
    schoolId: 'sch_tk_yapendik_01',
    academicYearId: 'ay_2026_2027_ganjil',
    name: 'Kelompok A (Bintang Ceria)',
    ageGroup: 'TK_A_4_5',
    roomNumber: 'Ruang Anggrek 1',
    capacity: 15,
    homeroomTeacherId: 'per_teacher_siti',
    isActive: true
  },
  {
    id: 'cls_tkb_01',
    schoolId: 'sch_tk_yapendik_01',
    academicYearId: 'ay_2026_2027_ganjil',
    name: 'Kelompok B (Matahari Cemerlang)',
    ageGroup: 'TK_B_5_6',
    roomNumber: 'Ruang Melati 2',
    capacity: 18,
    homeroomTeacherId: 'per_teacher_maria',
    isActive: true
  },
  {
    id: 'cls_tka_02',
    schoolId: 'sch_tk_yapendik_02',
    academicYearId: 'ay_2026_2027_ganjil_02',
    name: 'Kelompok A (Melati Harum)',
    ageGroup: 'TK_A_4_5',
    roomNumber: 'Ruang Kencana',
    capacity: 15,
    homeroomTeacherId: 'per_teacher_diana',
    isActive: true
  }
];

export const SEED_PERSONS: Person[] = [
  // TK Yapendik Maranatha Leadership & Teachers
  {
    id: 'per_superadmin_shirley',
    nationalIdNumber: '3171035906670007',
    fullName: 'SHIRLEY A.T.WAKKARY',
    preferredName: 'Ibu Shirley',
    gender: 'FEMALE',
    birthDate: '1967-06-19',
    birthPlace: 'Jakarta',
    phone: '081281310123',
    address: 'Kompleks Yapendik Graha, Jakarta',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_headmaster_sheryl',
    nationalIdNumber: '3171034909940005',
    fullName: 'SHERYL Y N UMBAS, S.IKOM, M.PD',
    preferredName: 'Ibu Sheryl',
    gender: 'FEMALE',
    birthDate: '1994-09-09',
    birthPlace: 'Jakarta',
    phone: '081219748487',
    address: 'JL. BALADEWA NO. 32, TANAH TINGGI JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_teacher_erna',
    nationalIdNumber: '3172025811680008',
    fullName: 'ERNA BOYKELA R',
    preferredName: 'Bu Erna',
    gender: 'FEMALE',
    birthDate: '1968-11-28',
    birthPlace: 'Jakarta',
    phone: '081218641392',
    address: 'Jakarta',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_teacher_charlotha',
    nationalIdNumber: '3172025108050013',
    fullName: 'CHARLOTHA JOVANNCA BLANDINNA R',
    preferredName: 'Bu Jovannca',
    gender: 'FEMALE',
    birthDate: '1985-05-01',
    birthPlace: 'Jakarta',
    phone: '081385868377',
    address: 'Jakarta',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_teacher_evi',
    nationalIdNumber: '3171054311980001',
    fullName: 'EVI TANIA',
    preferredName: 'Bu Evi',
    gender: 'FEMALE',
    birthDate: '1998-03-11',
    birthPlace: 'Jakarta',
    phone: '089536851668',
    address: 'Jakarta',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },

  // TK Maranatha Guardians & Children (Selection)
  {
    id: 'per_child_millen',
    nationalIdNumber: '3276054207210001',
    fullName: 'JEQUALINE ARABELLA MASPAITELLA',
    preferredName: 'MILLEN',
    gender: 'FEMALE',
    birthDate: '2021-07-02',
    birthPlace: 'DEPOK',
    address: 'JL LAUT HALMAHERA I BLOK N/12 KEL ABADIJAYA KEC SUKMAJAYA KOTA DEPOK JAWA BARAT 16417',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_julen_patricia',
    nationalIdNumber: '3276055507940003',
    fullName: 'JULEN PATRICIA',
    preferredName: 'Ibu Julen',
    gender: 'FEMALE',
    birthDate: '1994-07-15',
    phone: '081282276536',
    address: 'JL LAUT HALMAHERA I BLOK N/12 KEL ABADIJAYA KEC SUKMAJAYA KOTA DEPOK JAWA BARAT 16417',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_kayla',
    nationalIdNumber: '3171034407200004',
    fullName: 'KAYLA GABRIELLA ZEGA',
    preferredName: 'KAYLA',
    gender: 'FEMALE',
    birthDate: '2020-07-04',
    birthPlace: 'JAKARTA',
    address: 'JL. KRAMAT SENTIONG NO. 18 JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_mutiara_zega',
    nationalIdNumber: '3171035208950002',
    fullName: 'MUTIARA ZEGA',
    preferredName: 'Ibu Mutiara',
    gender: 'FEMALE',
    birthDate: '1995-08-12',
    phone: '081289123456',
    address: 'JL. KRAMAT SENTIONG NO. 18 JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },

  // Legacy Test Fixtures (kept for test isolation)
  {
    id: 'per_teacher_siti',
    fullName: 'Siti Rahmawati, S.Pd',
    preferredName: 'Bu Siti',
    gender: 'FEMALE',
    birthDate: '1992-04-12',
    birthPlace: 'Surakarta',
    phone: '0812-3456-7890',
    address: 'Jl. Percetakan Negara No. 15, Jakarta Pusat',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'per_teacher_maria',
    fullName: 'Maria Magdalena, S.Pd.Aud',
    preferredName: 'Bu Maria',
    gender: 'FEMALE',
    birthDate: '1989-11-20',
    birthPlace: 'Yogyakarta',
    phone: '0813-9876-5432',
    address: 'Jl. Salemba Tengah No. 8, Jakarta Pusat',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'per_headmaster_esther',
    fullName: 'Dra. Esther Nugroho, M.Pd',
    preferredName: 'Ibu Esther',
    gender: 'FEMALE',
    birthDate: '1976-08-17',
    birthPlace: 'Semarang',
    phone: '0811-2233-4455',
    address: 'Jl. Diponegoro No. 88, Menteng',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z'
  },
  {
    id: 'per_teacher_diana',
    fullName: 'Diana Sari, S.Pd',
    preferredName: 'Bu Diana',
    gender: 'FEMALE',
    birthDate: '1995-02-14',
    birthPlace: 'Bandung',
    phone: '0818-7766-5544',
    address: 'Jl. Wolter Monginsidi No. 22, Jakarta Selatan',
    createdAt: '2026-06-15T00:00:00Z',
    updatedAt: '2026-06-15T00:00:00Z'
  },
  {
    id: 'per_superadmin_andreas',
    fullName: 'Dr. Andreas Hendrawan',
    preferredName: 'Pak Andreas',
    gender: 'MALE',
    birthDate: '1970-03-25',
    birthPlace: 'Surabaya',
    phone: '0812-9988-7766',
    address: 'Kompleks Yapendik Graha Lt. 4, Jakarta Pusat',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },

  // Parents / Guardians
  {
    id: 'per_parent_budi',
    fullName: 'Budi Santoso, S.T.',
    preferredName: 'Pak Budi',
    gender: 'MALE',
    birthDate: '1988-06-10',
    birthPlace: 'Malang',
    phone: '0813-1122-3344',
    address: 'Jl. Cilosari No. 12, Cikini, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_parent_dewi',
    fullName: 'Dewi Anggraini, S.E.',
    preferredName: 'Ibu Dewi',
    gender: 'FEMALE',
    birthDate: '1990-09-15',
    birthPlace: 'Jakarta',
    phone: '0813-5566-7788',
    address: 'Jl. Cilosari No. 12, Cikini, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_parent_hendra',
    fullName: 'Hendra Wijaya, S.Kom',
    preferredName: 'Pak Hendra',
    gender: 'MALE',
    birthDate: '1987-12-05',
    birthPlace: 'Medan',
    phone: '0815-2244-6688',
    address: 'Jl. Kramat Raya No. 40, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },

  // Students (TK A & TK B)
  {
    id: 'per_child_kenzo',
    fullName: 'Kenzo Pratama Santoso',
    preferredName: 'Kenzo',
    gender: 'MALE',
    birthDate: '2022-03-14',
    birthPlace: 'Jakarta',
    phone: '',
    address: 'Jl. Cilosari No. 12, Cikini, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_alina',
    fullName: 'Alina Putri Wijaya',
    preferredName: 'Alina',
    gender: 'FEMALE',
    birthDate: '2022-05-22',
    birthPlace: 'Jakarta',
    phone: '',
    address: 'Jl. Kramat Raya No. 40, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_gabriel',
    fullName: 'Gabriel Christian Sihombing',
    preferredName: 'Gabriel',
    gender: 'MALE',
    birthDate: '2022-01-09',
    birthPlace: 'Jakarta',
    phone: '',
    address: 'Jl. Pegangsaan Timur No. 19, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_keisha',
    fullName: 'Keisha Amanda Larasati',
    preferredName: 'Keisha',
    gender: 'FEMALE',
    birthDate: '2021-08-30',
    birthPlace: 'Jakarta',
    phone: '',
    address: 'Jl. Raden Saleh No. 33, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_rafael',
    fullName: 'Rafael Jonathan Gunawan',
    preferredName: 'Rafael',
    gender: 'MALE',
    birthDate: '2021-10-18',
    birthPlace: 'Jakarta',
    phone: '',
    address: 'Jl. Gondangdia Lama No. 5, Jakarta Pusat',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  }
];

export const SEED_STUDENTS: StudentProfile[] = [
  {
    id: 'stu_kenzo_01',
    personId: 'per_child_kenzo',
    schoolId: 'sch_tk_yapendik_01',
    nisn: '3229871021',
    nis: 'TK-2026-001',
    currentClassId: 'cls_tka_01',
    bloodType: 'O',
    allergies: 'Alergi debu & bulu kucing ringan',
    specialNeedsNotes: 'Memerlukan dorongan saat transisi kegiatan kelompok besar',
    enrollmentDate: '2026-07-15',
    status: 'ACTIVE'
  },
  {
    id: 'stu_alina_02',
    personId: 'per_child_alina',
    schoolId: 'sch_tk_yapendik_01',
    nisn: '3229871022',
    nis: 'TK-2026-002',
    currentClassId: 'cls_tka_01',
    bloodType: 'A',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Sangat mandiri dan suka bernyanyi',
    enrollmentDate: '2026-07-15',
    status: 'ACTIVE'
  },
  {
    id: 'stu_gabriel_03',
    personId: 'per_child_gabriel',
    schoolId: 'sch_tk_yapendik_01',
    nisn: '3229871023',
    nis: 'TK-2026-003',
    currentClassId: 'cls_tka_01',
    bloodType: 'B',
    allergies: 'Alergi udang/seafood',
    specialNeedsNotes: 'Kuat di motorik kasar, suka permainan balok',
    enrollmentDate: '2026-07-15',
    status: 'ACTIVE'
  },
  {
    id: 'stu_keisha_04',
    personId: 'per_child_keisha',
    schoolId: 'sch_tk_yapendik_01',
    nisn: '3218765411',
    nis: 'TK-2025-014',
    currentClassId: 'cls_tkb_01',
    bloodType: 'AB',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Kemampuan bercerita dan kosa kata sangat kaya',
    enrollmentDate: '2025-07-15',
    status: 'ACTIVE'
  },
  {
    id: 'stu_rafael_05',
    personId: 'per_child_rafael',
    schoolId: 'sch_tk_yapendik_01',
    nisn: '3218765412',
    nis: 'TK-2025-015',
    currentClassId: 'cls_tkb_01',
    bloodType: 'O',
    allergies: 'Sensitif terhadap susu sapi (Lactose intolerant)',
    specialNeedsNotes: 'Fokus tinggi saat merangkai puzzle kompleks',
    enrollmentDate: '2025-07-15',
    status: 'ACTIVE'
  }
];

export const SEED_GUARDIAN_RELATIONSHIPS: GuardianRelationship[] = [
  {
    id: 'rel_kenzo_budi',
    studentPersonId: 'per_child_kenzo',
    guardianPersonId: 'per_parent_budi',
    relationshipType: 'FATHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'rel_kenzo_dewi',
    studentPersonId: 'per_child_kenzo',
    guardianPersonId: 'per_parent_dewi',
    relationshipType: 'MOTHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'rel_alina_hendra',
    studentPersonId: 'per_child_alina',
    guardianPersonId: 'per_parent_hendra',
    relationshipType: 'FATHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  }
];

export const SEED_DEVELOPMENT_MILESTONES: DevelopmentalMilestone[] = [
  {
    id: 'ms_nam_01',
    domain: 'NILAI_AGAMA_MORAL',
    ageGroup: 'TK_A_4_5',
    code: 'NAM.A.1',
    title: 'Mengenal Perilaku Baik & Berdoa Sebelum/Sesudah Kegiatan',
    description: 'Anak mampu melafalkan doa sederhana dengan bimbingan dan menunjukkan sikap menghormati ciptaan Tuhan.',
    standardAssessmentGuidelines: 'BSH jika berdoa dengan tertib secara mandiri; BSB jika mengajak rekan berdoa.'
  },
  {
    id: 'ms_fm_01',
    domain: 'FISIK_MOTORIK',
    ageGroup: 'TK_A_4_5',
    code: 'FM.A.1',
    title: 'Koordinasi Motorik Halus (Memegang Sendok & Menggunting Sederhana)',
    description: 'Anak mampu memegang alat tulis/gunting dengan genggaman jari yang tepat dan mengendalikan gerakan tangan.',
    standardAssessmentGuidelines: 'BSH bila menggunting mengikuti garis lurus tanpa robek berlebihan.'
  },
  {
    id: 'ms_kog_01',
    domain: 'KOGNITIF',
    ageGroup: 'TK_A_4_5',
    code: 'KOG.A.1',
    title: 'Mengenal Pola, Bentuk Geometri, dan Mengelompokkan Benda',
    description: 'Mampu memilah benda berdasarkan warna, ukuran (besar/kecil), atau bentuk (lingkaran, kotak, segitiga).',
    standardAssessmentGuidelines: 'BSH mampu memilah 3 atribut berbeda secara berurutan.'
  },
  {
    id: 'ms_bhs_01',
    domain: 'BAHASA',
    ageGroup: 'TK_A_4_5',
    code: 'BHS.A.1',
    title: 'Mengungkapkan Keinginan & Menjawab Pertanyaan Sederhana',
    description: 'Mampu mengekspresikan gagasan dalam kalimat 3-4 kata dan menyimak instruksi bertahap.',
    standardAssessmentGuidelines: 'BSH menjawab pertanyaan apa, siapa, dan di mana dengan jelas.'
  },
  {
    id: 'ms_sosem_01',
    domain: 'SOSIAL_EMOSIONAL',
    ageGroup: 'TK_A_4_5',
    code: 'SOSEM.A.1',
    title: 'Menunjukkan Empati, Berbagi Mainan, & Antre Giliran',
    description: 'Mampu berinteraksi dengan teman sebaya, menunggu giliran dalam permainan, serta merapikan mainan.',
    standardAssessmentGuidelines: 'BSH mampu berbagi mainan tanpa konflik dan merapikan alat main.'
  },
  {
    id: 'ms_seni_01',
    domain: 'SENI',
    ageGroup: 'TK_A_4_5',
    code: 'SENI.A.1',
    title: 'Mengekspresikan Diri Melalui Musik, Gerak, dan Finger Painting',
    description: 'Menikmati irama musik, bernyanyi bersama, dan menggunakan warna dalam karya lukis bebas.',
    standardAssessmentGuidelines: 'BSH menghasilkan perpaduan warna dan bergerak dinamis mengikuti irama.'
  }
];

export const SEED_LEARNING_ACTIVITIES: LearningActivity[] = [
  {
    id: 'act_001',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    date: '2026-08-24',
    theme: 'Diriku / Panca Indra Ciptaan Tuhan',
    subTheme: 'Mengenal Rasa (Manis, Asin, Asam, Pahit)',
    timeSlot: '08:00 - 09:30',
    activityName: 'Eksplorasi Rasa Buah & Bahan Alami di Sentra Bahan Alam',
    developmentalFocus: ['NILAI_AGAMA_MORAL', 'KOGNITIF', 'BAHASA'],
    materialsNeeded: [
      'Irisan buah jeruk manis',
      'Irisan jeruk nipis',
      'Larutan gula & garam dalam sendok kecil',
      'Kartu ekspresi rasa (tersenyum, meringis, kaget)',
      'Lembar dokumentasi anak'
    ],
    plannedSteps: [
      'Lingkaran pagi: Doa bersama dan apersepsi tentang indra pengecap lidah.',
      'Anak mencicipi sampel buah secara bergantian dalam kelompok kecil (3 anak).',
      'Anak mencocokkan rasa yang dirasakan dengan kartu ekspresi wajah.',
      'Refleksi bersama: mengucap syukur atas kemampuan mengecap aneka rasa.'
    ],
    teacherReflection: 'Anak-anak sangat antusias. Kenzo mulanya ragu mencicipi jeruk nipis, namun setelah melihat temannya ia berani mencoba dan tertawa bersama.',
    completed: true
  },
  {
    id: 'act_002',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    date: '2026-08-24',
    theme: 'Diriku / Panca Indra Ciptaan Tuhan',
    subTheme: 'Indra Penglihatan & Warna',
    timeSlot: '10:00 - 11:15',
    activityName: 'Finger Painting: Melukis Pelangi dengan Jari',
    developmentalFocus: ['FISIK_MOTORIK', 'SENI', 'SOSIAL_EMOSIONAL'],
    materialsNeeded: [
      'Cat pasta non-toksik 3 warna primer',
      'Kertas gambar A3 tebal',
      'Lap basah & celemek lukis'
    ],
    plannedSteps: [
      'Pemberian instruksi cara mencampur warna merah dan kuning menjadi jingga.',
      'Anak mengeksplorasi goresan jari tangan membentuk lengkungan pelangi.',
      'Gotong royong mencuci tangan dan merapikan alas lukis.'
    ],
    teacherReflection: 'Motorik halus anak berkembang baik saat meratakan cat dengan jari telunjuk dan jempol.',
    completed: true
  },
  {
    id: 'act_003',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    date: '2026-08-25',
    theme: 'Lingkunganku / Sekolahku yang Bersih',
    subTheme: 'Menjaga Kebersihan Kelas Bersama Sahabat',
    timeSlot: '08:00 - 09:30',
    activityName: 'Operasi Semut & Memilah Sampah Daun vs Plastik',
    developmentalFocus: ['NILAI_AGAMA_MORAL', 'SOSIAL_EMOSIONAL', 'KOGNITIF'],
    materialsNeeded: [
      '2 keranjang sampah warna hijau (organik) dan biru (anorganik)',
      'Sarung tangan kain kecil untuk anak',
      'Topi detektif lingkungan'
    ],
    plannedSteps: [
      'Cerita boneka tangan tentang taman bunga yang bersih.',
      'Anak berjalan mengelilingi halaman sekolah mengumpulkan sampah kering.',
      'Memilah bersama ke dalam keranjang sesuai kategori.'
    ],
    completed: false
  }
];

export const SEED_OBSERVATIONS: ObservationRecord[] = [
  {
    id: 'obs_001',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo_01',
    observerPersonId: 'per_teacher_siti',
    observedAt: '2026-08-24T09:15:00Z',
    domain: 'KOGNITIF',
    anecdoteDescription: 'Saat kegiatan sentra rasa, Kenzo mampu membedakan rasa gula dan garam. Ketika ditanya "Bagaimana rasanya?", Kenzo menjawab: "Yang ini manis seperti madu bu, yang ini asin seperti kuah bakso!" dengan ekspresi tersenyum gembira.',
    behaviorTrigger: 'Mencicipi air garam dan gula batu menggunakan sendok kecil',
    childReaction: 'Meringis saat mencicip garam lalu tertawa dan menjelaskan perbedaannya dengan antusias',
    teacherIntervention: 'Memberikan afirmasi verbal positif dan menantang Kenzo menceritakan makanan manis favoritnya di rumah',
    milestoneRating: 'BSH',
    indicatorsObserved: ['Membedakan rasa manis dan asin', 'Menjelaskan persepsi dengan kalimat lengkap'],
    isConfidentialToStaff: false,
    sharedWithGuardian: true,
    createdAt: '2026-08-24T09:30:00Z'
  },
  {
    id: 'obs_002',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo_01',
    observerPersonId: 'per_teacher_siti',
    observedAt: '2026-08-24T10:45:00Z',
    domain: 'SOSIAL_EMOSIONAL',
    anecdoteDescription: 'Ketika temannya Alina menjatuhkan wadah cat warna biru, Kenzo spontan mengambil lap bersih dan membantu Alina menyeka tumpahan tanpa diminta guru. Kenzo berkata: "Jangan nangis Alina, aku bantuin beresin ya."',
    behaviorTrigger: 'Cat air temannya tumpah di meja',
    childReaction: 'Menunjukkan inisiatif empati dan membantu teman yang cemas',
    teacherIntervention: 'Memuji sikap tolong-menolong Kenzo di hadapan kelompok',
    milestoneRating: 'BSB',
    indicatorsObserved: ['Menunjukkan empati terhadap teman sebaya', 'Inisiatif menolong secara sukarela'],
    isConfidentialToStaff: false,
    sharedWithGuardian: true,
    createdAt: '2026-08-24T11:00:00Z'
  },
  {
    id: 'obs_003',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_alina_02',
    observerPersonId: 'per_teacher_siti',
    observedAt: '2026-08-24T10:30:00Z',
    domain: 'SENI',
    anecdoteDescription: 'Alina membuat gradasi warna jingga dan merah muda pada lukisan bunganya menggunakan jari telunjuk. Pola garisnya rapi dan ia menceritakan bahwa bunganya sedang disinari matahari pagi.',
    milestoneRating: 'BSB',
    indicatorsObserved: ['Kreativitas finger painting', 'Menceritakan karya seni yang dibuat'],
    isConfidentialToStaff: false,
    sharedWithGuardian: true,
    createdAt: '2026-08-24T11:05:00Z'
  },
  {
    id: 'obs_004',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_gabriel_03',
    observerPersonId: 'per_teacher_siti',
    observedAt: '2026-08-24T08:45:00Z',
    domain: 'FISIK_MOTORIK',
    anecdoteDescription: 'Gabriel mampu melompati 4 rintangan busa berturut-turut dengan kedua kaki mendarat seimbang tanpa terjatuh di halaman bermain.',
    milestoneRating: 'BSH',
    indicatorsObserved: ['Keseimbangan motorik kasar', 'Melompat dengan dua kaki seimbang'],
    isConfidentialToStaff: false,
    sharedWithGuardian: true,
    createdAt: '2026-08-24T09:00:00Z'
  }
];

export const SEED_ATTENDANCE: DailyAttendanceEntry[] = [
  {
    id: 'att_001',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo_01',
    date: '2026-08-24',
    status: 'HADIR',
    recordedByPersonId: 'per_teacher_siti',
    recordedAt: '2026-08-24T07:45:00Z',
    temperatureCelsius: 36.4,
    arrivalMood: 'CERIA',
    notes: 'Datang diantar ayah, menyapa guru dengan senyum ramah.'
  },
  {
    id: 'att_002',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_alina_02',
    date: '2026-08-24',
    status: 'HADIR',
    recordedByPersonId: 'per_teacher_siti',
    recordedAt: '2026-08-24T07:50:00Z',
    temperatureCelsius: 36.5,
    arrivalMood: 'TENANG',
    notes: 'Membawa bekal buah naga dan roti gandum.'
  },
  {
    id: 'att_003',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_gabriel_03',
    date: '2026-08-24',
    status: 'HADIR',
    recordedByPersonId: 'per_teacher_siti',
    recordedAt: '2026-08-24T07:55:00Z',
    temperatureCelsius: 36.6,
    arrivalMood: 'CERIA',
    notes: 'Bersemangat bermain balok kayu sebelum bel masuk.'
  }
];

export const SEED_GUARDIAN_NOTICES: GuardianNotice[] = [
  {
    id: 'notif_001',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo_01',
    authorPersonId: 'per_teacher_siti',
    recipientPersonId: 'per_parent_budi',
    type: 'DAILY_SUMMARY',
    title: 'Catatan Harian Ananda Kenzo (24 Agustus 2026)',
    content: 'Selamat siang Ayah & Ibu Kenzo. Hari ini Ananda Kenzo sangat hebat dalam kegiatan eksplorasi panca indra. Kenzo mampu menjelaskan rasa manis & asin dengan kosa kata yang kaya, serta sangat berempati menolong temannya saat ada cat yang tumpah. Nafsu makan siang sangat baik (habis 1 porsi). Mohon ingatkan Kenzo minum air putih yang cukup sore ini.',
    requiresAcknowledgment: true,
    acknowledgedAt: '2026-08-24T12:30:00Z',
    acknowledgedByPersonId: 'per_parent_budi',
    guardianReply: 'Terima kasih banyak Bu Siti atas pendampingan penuh kasih hari ini. Di rumah Kenzo juga antusias bercerita tentang rasa jeruk dan teman-temannya di kelas.',
    createdAt: '2026-08-24T11:45:00Z'
  },
  {
    id: 'notif_002',
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    authorPersonId: 'per_teacher_siti',
    type: 'CLASS_ANNOUNCEMENT',
    title: 'Persiapan Kegiatan Operasi Semut & Peduli Lingkungan (Besok, 25 Agustus)',
    content: 'Bapak/Ibu Orang Tua Siswa Kelompok A yang terkasih, besok anak-anak akan belajar menjaga kebersihan lingkungan dengan kegiatan memilah dedaunan kering. Mohon anak-anak mengenakan seragam kaos olahraga dan membawa botol minum bertali.',
    requiresAcknowledgment: false,
    createdAt: '2026-08-24T12:00:00Z'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_001',
    schoolId: 'sch_tk_yapendik_01',
    userId: 'user_teacher_siti',
    personName: 'Siti Rahmawati, S.Pd',
    role: 'TEACHER',
    action: 'CREATE_OBSERVATION',
    resource: 'STUDENT_OBSERVATION',
    resourceId: 'obs_001',
    details: 'Merekam catatan anekdot perkembangan kognitif untuk siswa Kenzo Pratama (Rating: BSH)',
    timestamp: '2026-08-24T09:30:00Z'
  },
  {
    id: 'aud_002',
    schoolId: 'sch_tk_yapendik_01',
    userId: 'user_teacher_siti',
    personName: 'Siti Rahmawati, S.Pd',
    role: 'TEACHER',
    action: 'CREATE_OBSERVATION',
    resource: 'STUDENT_OBSERVATION',
    resourceId: 'obs_002',
    details: 'Merekam catatan perkembangan sosial-emosional Kenzo Pratama (Rating: BSB)',
    timestamp: '2026-08-24T11:00:00Z'
  },
  {
    id: 'aud_003',
    schoolId: 'sch_tk_yapendik_01',
    userId: 'user_parent_budi',
    personName: 'Budi Santoso, S.T.',
    role: 'GUARDIAN',
    action: 'ACKNOWLEDGE_NOTICE',
    resource: 'GUARDIAN_COMMUNICATION',
    resourceId: 'notif_001',
    details: 'Orang tua menandatangani tanda terima catatan harian dan mengirimkan respon apresiasi',
    timestamp: '2026-08-24T12:30:00Z'
  }
];
