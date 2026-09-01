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
    name: 'Kelas TK A',
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
    name: 'Kelas TK B',
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

  // ==========================================================================
  // TK MARANATHA GENESIS PERSONS — CLASS A & B STUDENTS & GUARDIANS
  // ==========================================================================
  // Class A Students & Guardians
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
    id: 'per_guard_michael_maspaitella',
    nationalIdNumber: '3171044609930003',
    fullName: 'MICHAEL MASPAITELLA',
    preferredName: 'Pak Michael',
    gender: 'MALE',
    address: 'JL LAUT HALMAHERA I BLOK N/12 KEL ABADIJAYA KEC SUKMAJAYA KOTA DEPOK JAWA BARAT 16417',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_julen_patricia',
    nationalIdNumber: '3171044609930002',
    fullName: 'JULEN PATRICIA',
    preferredName: 'Ibu Julen',
    gender: 'FEMALE',
    phone: '081296970087',
    address: 'JL LAUT HALMAHERA I BLOK N/12 KEL ABADIJAYA KEC SUKMAJAYA KOTA DEPOK JAWA BARAT 16417',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_carissa',
    nationalIdNumber: '3171088804210002',
    fullName: 'CARISSA ELEANOR NAPITUPULU',
    preferredName: 'CARISSA',
    gender: 'FEMALE',
    birthDate: '2021-04-28',
    birthPlace: 'JAKARTA',
    address: 'KP RAWA SELATAN I NO 45 RT 011/005 KEL GALUR KEC JOHAR BARU JAKARTA PUSAT 10530',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_dulpri',
    nationalIdNumber: '3275027012920008',
    fullName: 'DULPRI',
    preferredName: 'Pak Dulpri',
    gender: 'MALE',
    address: 'KP RAWA SELATAN I NO 45 RT 011/005 KEL GALUR KEC JOHAR BARU JAKARTA PUSAT 10530',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_herni_tiurma',
    nationalIdNumber: '3275027012920009',
    fullName: 'HERNI TIURMA',
    preferredName: 'Ibu Herni',
    gender: 'FEMALE',
    phone: '081294212158',
    address: 'KP RAWA SELATAN I NO 45 RT 011/005 KEL GALUR KEC JOHAR BARU JAKARTA PUSAT 10530',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_rainer',
    nationalIdNumber: '3171081711210005',
    fullName: 'RAINER ALDEV NATASHA SUMUAL',
    preferredName: 'RAINER',
    gender: 'MALE',
    birthDate: '2021-11-17',
    birthPlace: 'JAKARTA',
    address: 'JL TANAH TINGGI SAWAH RT 015/008 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT 10540',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_alfredo_diego',
    nationalIdNumber: '3171086710990004',
    fullName: 'ALFREDO DIEGO OKTAVIO',
    preferredName: 'Pak Alfredo',
    gender: 'MALE',
    address: 'JL TANAH TINGGI SAWAH RT 015/008 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT 10540',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_devia_permata',
    nationalIdNumber: '3171086710990005',
    fullName: 'DEVIA PERMATA SARI',
    preferredName: 'Ibu Devia',
    gender: 'FEMALE',
    phone: '089633240559',
    address: 'JL TANAH TINGGI SAWAH RT 015/008 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT 10540',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_falen',
    nationalIdNumber: '1214344602220001',
    fullName: 'BRIELLA FALERIE HALKA HULU',
    preferredName: 'FALEN',
    gender: 'FEMALE',
    birthDate: '2022-02-06',
    birthPlace: 'JAKARTA',
    address: 'JL TANAH TINGGI 2 NO 16 RT 07/002 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_hasamuda_hulu',
    nationalIdNumber: '1204144710970001',
    fullName: 'HASAMUDA HULU',
    preferredName: 'Pak Hasamuda',
    gender: 'MALE',
    address: 'JL TANAH TINGGI 2 NO 16 RT 07/002 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_senimawati_zega',
    nationalIdNumber: '1204144710970002',
    fullName: 'SENIMAWATI ZEGA',
    preferredName: 'Ibu Senimawati',
    gender: 'FEMALE',
    phone: '085261401671',
    address: 'JL TANAH TINGGI 2 NO 16 RT 07/002 KEL TANAH TINGGI KEC JOHAR BARU JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_adrian',
    nationalIdNumber: '3171051103210003',
    fullName: 'ADRIAN MAHVERT PUTRA',
    preferredName: 'ADRIAN',
    gender: 'MALE',
    birthDate: '2023-01-07',
    birthPlace: 'JAKARTA',
    address: 'JL CEMPAKA PUTIH BARAT RT 03/010 KEL CEMPAKA PUTIH BARAT KEC CEMPAKA PUTIH JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_catur_putranto',
    nationalIdNumber: '3305114507940003',
    fullName: 'CATUR PUTRANTO',
    preferredName: 'Pak Catur',
    gender: 'MALE',
    address: 'JL CEMPAKA PUTIH BARAT RT 03/010 KEL CEMPAKA PUTIH BARAT KEC CEMPAKA PUTIH JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_salamah',
    nationalIdNumber: '3305114507940004',
    fullName: 'SALAMAH',
    preferredName: 'Ibu Salamah',
    gender: 'FEMALE',
    phone: '083111687805',
    address: 'JL CEMPAKA PUTIH BARAT RT 03/010 KEL CEMPAKA PUTIH BARAT KEC CEMPAKA PUTIH JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_adhi',
    nationalIdNumber: '3171041509210004',
    fullName: 'ADHINATA RAJENDRA',
    preferredName: 'ADHI',
    gender: 'MALE',
    birthDate: '2021-09-15',
    birthPlace: 'JAKARTA',
    address: 'JL CULAN NO 1 KEL KRAMAT KEC SENEN JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_herluin_karyadi',
    nationalIdNumber: '3171046711790001',
    fullName: 'HERLUIN KARYADI PRAPTO U',
    preferredName: 'Pak Herluin',
    gender: 'MALE',
    address: 'JL CULAN NO 1 KEL KRAMAT KEC SENEN JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_nancy_ferawati',
    nationalIdNumber: '3171046711790002',
    fullName: 'NANCY FERAWATI',
    preferredName: 'Ibu Nancy',
    gender: 'FEMALE',
    phone: '085892291422',
    address: 'JL CULAN NO 1 KEL KRAMAT KEC SENEN JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_liora',
    nationalIdNumber: '3175027012210002',
    fullName: 'LIORA OLIWIIA HUTAGAOL',
    preferredName: 'LIORA',
    gender: 'FEMALE',
    birthDate: '2021-12-30',
    birthPlace: 'Jakarta',
    address: 'JL. PULOMAS BARAT DAYA R5 KAYU PUTIH PULO GADUNG, JAKARTA TIMUR',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_david_ardy',
    nationalIdNumber: '1208016308890002',
    fullName: 'DAVID ARDY MARULITUA HUTAGAOL',
    preferredName: 'Pak David',
    gender: 'MALE',
    address: 'JL. PULOMAS BARAT DAYA R5 KAYU PUTIH PULO GADUNG, JAKARTA TIMUR',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_rani_sinaga',
    nationalIdNumber: '1208016308890001',
    fullName: 'RANI RIDAHYANTA SINAGA',
    preferredName: 'Ibu Rani',
    gender: 'FEMALE',
    phone: '08118167854',
    address: 'JL. PULOMAS BARAT DAYA R5 KAYU PUTIH PULO GADUNG, JAKARTA TIMUR',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_zio',
    nationalIdNumber: '3175021804210005',
    fullName: 'ZIONATHAN ELEAZAR PUTRA',
    preferredName: 'ZIO',
    gender: 'MALE',
    birthDate: '2021-04-18',
    birthPlace: 'JAKARTA',
    address: 'JL. BATU BIDURI BULAN NO. 52 KAYU PUTIH PULOGADUNG, JAKARTA TIMUR',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_george_alexandre',
    nationalIdNumber: '2171105802900001',
    fullName: 'GEORGE ALEXANDRE PUTRA',
    preferredName: 'Pak George',
    gender: 'MALE',
    address: 'JL. BATU BIDURI BULAN NO. 52 KAYU PUTIH PULOGADUNG, JAKARTA TIMUR',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_penta_romla',
    nationalIdNumber: '2171105802900002',
    fullName: 'PENTA ROMLA FRYLAN',
    preferredName: 'Ibu Penta',
    gender: 'FEMALE',
    phone: '085284560857',
    address: 'JL. BATU BIDURI BULAN NO. 52 KAYU PUTIH PULOGADUNG, JAKARTA TIMUR',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_brian',
    nationalIdNumber: '3175092011210006',
    fullName: 'THEODOR BRIANMBICAR BANCIN',
    preferredName: 'BRIAN',
    gender: 'MALE',
    birthDate: '2021-11-20',
    birthPlace: 'MEDAN',
    address: 'JALAN SEDERHANA NO. 5 PANJI DABUTAR SITINJO, SUMATERA UTARA',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_favor_bancin',
    nationalIdNumber: '6204065404850003',
    fullName: 'FAVOR ADELAIDE BANCIN',
    preferredName: 'Pak Favor',
    gender: 'MALE',
    address: 'JALAN SEDERHANA NO. 5 PANJI DABUTAR SITINJO, SUMATERA UTARA',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_muliathy_briany',
    nationalIdNumber: '6204065404850004',
    fullName: 'MULIATHY BRIANY',
    preferredName: 'Ibu Muliathy',
    gender: 'FEMALE',
    phone: '081350350144',
    address: 'JALAN SEDERHANA NO. 5 PANJI DABUTAR SITINJO, SUMATERA UTARA',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },

  // Class B Students & Guardians
  {
    id: 'per_child_kayla',
    nationalIdNumber: '3171086202220006',
    fullName: 'ADELINE MIKAYLA HAREFA',
    preferredName: 'KAYLA',
    gender: 'FEMALE',
    birthDate: '2022-02-22',
    birthPlace: 'JAKARTA',
    address: 'JL. RAWA SELATAN I TOWN HOUSE ONASIS B-10 NO. 37, GALUR JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_andi_harefa',
    nationalIdNumber: '1204024604890001',
    fullName: 'ANDI NOVA HAREFA',
    preferredName: 'Pak Andi',
    gender: 'MALE',
    address: 'JL. RAWA SELATAN I TOWN HOUSE ONASIS B-10 NO. 37, GALUR JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_mutiara_zega',
    nationalIdNumber: '1204024604890002',
    fullName: 'MUTIARA ZEGA',
    preferredName: 'Ibu Mutiara',
    gender: 'FEMALE',
    phone: '081394642219',
    address: 'JL. RAWA SELATAN I TOWN HOUSE ONASIS B-10 NO. 37, GALUR JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_dominic',
    nationalIdNumber: '3171032810200001',
    fullName: 'DOMINIC JOVAN',
    preferredName: 'DOMINIC',
    gender: 'MALE',
    birthDate: '2020-10-28',
    birthPlace: 'JAKARTA',
    address: 'JL. HARAPAN MULIA II NO. 5, HARAPAN MULIA KEMAYORAN, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_henky_santoso',
    nationalIdNumber: '3171034202790003',
    fullName: 'HENKY SANTOSO',
    preferredName: 'Pak Henky',
    gender: 'MALE',
    address: 'JL. HARAPAN MULIA II NO. 5, HARAPAN MULIA KEMAYORAN, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_friny',
    nationalIdNumber: '3171034202790004',
    fullName: 'FRINY',
    preferredName: 'Ibu Friny',
    gender: 'FEMALE',
    phone: '081288525181',
    address: 'JL. HARAPAN MULIA II NO. 5, HARAPAN MULIA KEMAYORAN, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_lyra',
    nationalIdNumber: '3171085508210001',
    fullName: 'LYRA HENNESSY SUPUSEPA',
    preferredName: 'LYRA',
    gender: 'FEMALE',
    birthDate: '2021-08-15',
    birthPlace: 'JAKARTA',
    address: 'JL. KR PULO GUNDUL K.207, TANAH TINGGI JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_bram_kevin',
    nationalIdNumber: '3175017001950003',
    fullName: 'BRAM KEVIN SUPUSEPA',
    preferredName: 'Pak Bram',
    gender: 'MALE',
    address: 'JL. KR PULO GUNDUL K.207, TANAH TINGGI JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_lillyanti_posumah',
    nationalIdNumber: '3175017001950004',
    fullName: 'LILLYANTI FENI POSUMAH',
    preferredName: 'Ibu Lillyanti',
    gender: 'FEMALE',
    phone: '082128900375',
    address: 'JL. KR PULO GUNDUL K.207, TANAH TINGGI JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_levin',
    nationalIdNumber: '3171052211200002',
    fullName: 'LEVIN BENEDICT NEDEZ SITUMORANG',
    preferredName: 'LEVIN',
    gender: 'MALE',
    birthDate: '2020-11-22',
    birthPlace: 'JAKARTA',
    address: 'KP. JAWA RAWASARI CEMPAKA PUTIH, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_veron_situmorang',
    nationalIdNumber: '3171054810810006',
    fullName: 'VERON NEDEZ SITUMORANG',
    preferredName: 'Pak Veron',
    gender: 'MALE',
    address: 'KP. JAWA RAWASARI CEMPAKA PUTIH, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_henny_sitindaon',
    nationalIdNumber: '3171054810810007',
    fullName: 'HENNY RAYA SITINDAON',
    preferredName: 'Ibu Henny',
    gender: 'FEMALE',
    phone: '08158351971',
    address: 'KP. JAWA RAWASARI CEMPAKA PUTIH, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_adriel',
    nationalIdNumber: '3175042710200006',
    fullName: 'ADRIEL',
    preferredName: 'ADRIEL',
    gender: 'MALE',
    birthDate: '2020-10-27',
    birthPlace: 'JAKARTA',
    address: 'JL. CEMPAKA PUTIH UTARA BLOK O NO. 112, CEMPAKA BARU KEMAYORAN JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_andri_syawali',
    nationalIdNumber: '1204106401960002',
    fullName: 'ANDRI SYAWALI',
    preferredName: 'Pak Andri',
    gender: 'MALE',
    address: 'JL. CEMPAKA PUTIH UTARA BLOK O NO. 112, CEMPAKA BARU KEMAYORAN JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_bilief_zebua',
    nationalIdNumber: '1204106401960001',
    fullName: 'BILIEF SENNIAR ZEBUA',
    preferredName: 'Ibu Bilief',
    gender: 'FEMALE',
    phone: '085311302763',
    address: 'JL. CEMPAKA PUTIH UTARA BLOK O NO. 112, CEMPAKA BARU KEMAYORAN JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_zane',
    nationalIdNumber: '3171080909200005',
    fullName: 'ZANE ELEANOR SIMANGUNSONG',
    preferredName: 'ZANE',
    gender: 'MALE',
    birthDate: '2020-09-09',
    birthPlace: 'JAKARTA',
    address: 'JL. RAWA TENGAH NO. 8, GALUR JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_remon',
    nationalIdNumber: '1212047003920002',
    fullName: 'REMON',
    preferredName: 'Pak Remon',
    gender: 'MALE',
    address: 'JL. RAWA TENGAH NO. 8, GALUR JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_yanti_siagian',
    nationalIdNumber: '1212047003920003',
    fullName: 'YANTI MARTHALENA SIAGIAN',
    preferredName: 'Ibu Yanti',
    gender: 'FEMALE',
    phone: '081293181442',
    address: 'JL. RAWA TENGAH NO. 8, GALUR JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_clea',
    nationalIdNumber: '3171084212200002',
    fullName: 'CLEA SERAPHINA DESELLA',
    preferredName: 'CLEA',
    gender: 'MALE',
    birthDate: '2020-12-02',
    birthPlace: 'JAKARTA',
    address: 'JL. KP RAWA SAWAH JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_denis',
    nationalIdNumber: '3171085911910002',
    fullName: 'DENIS',
    preferredName: 'Pak Denis',
    gender: 'MALE',
    address: 'JL. KP RAWA SAWAH JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_marshella_novita',
    nationalIdNumber: '3171085911910001',
    fullName: 'MARSHELLA NOVITA',
    preferredName: 'Ibu Marshella',
    gender: 'FEMALE',
    phone: '087888316350',
    address: 'JL. KP RAWA SAWAH JOHAR BARU, JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_child_nathan',
    nationalIdNumber: '3171081704210004',
    fullName: 'SHAWN ELNATHAN DOLOKSARIBU',
    preferredName: 'NATHAN',
    gender: 'MALE',
    birthDate: '2021-04-17',
    birthPlace: 'JAKARTA',
    address: 'JL. GALUR SELATAN NO. 20, GALUR JOHAR BARU JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_hengki_adi',
    nationalIdNumber: '1207055011910002',
    fullName: 'HENGKI PRIANDO HALOMOAN ADI CHANDRA',
    preferredName: 'Pak Hengki',
    gender: 'MALE',
    address: 'JL. GALUR SELATAN NO. 20, GALUR JOHAR BARU JAKARTA PUSAT',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'per_guard_novita_ginting',
    nationalIdNumber: '1207055011910001',
    fullName: 'NOVITA SARI BR GINTING',
    preferredName: 'Ibu Novita',
    gender: 'FEMALE',
    phone: '087889569850',
    address: 'JL. GALUR SELATAN NO. 20, GALUR JOHAR BARU JAKARTA PUSAT',
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

  // Parents / Guardians (Test Fixture)
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
  }
];

export const SEED_STUDENTS: StudentProfile[] = [
  // 17 Real Students of TK Yapendik Maranatha
  {
    id: 'stu_maranatha_01',
    personId: 'per_child_millen',
    schoolId: 'sch_tk_maranatha',
    nisn: '3276054207210001',
    nis: '20260101',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'O',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Aktif, suka bernyanyi dan bermain sentra balok',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_02',
    personId: 'per_child_carissa',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171088804210002',
    nis: '20260102',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'A',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Kreatif dan suka mewarnai',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_03',
    personId: 'per_child_rainer',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171081711210005',
    nis: '20260103',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'B',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Kuat di motorik kasar',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_04',
    personId: 'per_child_falen',
    schoolId: 'sch_tk_maranatha',
    nisn: '1214344602220001',
    nis: '20260104',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'O',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Ceria dan ramah',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_05',
    personId: 'per_child_adrian',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171051103210003',
    nis: '20260105',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'AB',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Suka bereksplorasi loose parts',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_06',
    personId: 'per_child_adhi',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171041509210004',
    nis: '20260106',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'A',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Mandiri dan suka membantu teman',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_07',
    personId: 'per_child_liora',
    schoolId: 'sch_tk_maranatha',
    nisn: '3175027012210002',
    nis: '20260107',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'B',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Suka membaca buku bergambar',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_08',
    personId: 'per_child_zio',
    schoolId: 'sch_tk_maranatha',
    nisn: '3175021804210005',
    nis: '20260108',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'O',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Antusias dalam kegiatan gerak dan lagu',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_09',
    personId: 'per_child_brian',
    schoolId: 'sch_tk_maranatha',
    nisn: '3175092011210006',
    nis: '20260109',
    currentClassId: 'cls_maranatha_tka',
    bloodType: 'A',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Suka bermain peran',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },

  // Class B (8 Students)
  {
    id: 'stu_maranatha_10',
    personId: 'per_child_kayla',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171086202220006',
    nis: '20260201',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'O',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Suka menyusun puzzle dan bercerita',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_11',
    personId: 'per_child_dominic',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171032810200001',
    nis: '20260202',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'A',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Kuat di sentra seni',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_12',
    personId: 'per_child_lyra',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171085508210001',
    nis: '20260203',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'B',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Percaya diri dan aktif',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_13',
    personId: 'per_child_levin',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171052211200002',
    nis: '20260204',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'O',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Suka bermain angka dan pola',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_14',
    personId: 'per_child_adriel',
    schoolId: 'sch_tk_maranatha',
    nisn: '3175042710200006',
    nis: '20260205',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'AB',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Tekun dalam merangkai balok',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_15',
    personId: 'per_child_zane',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171080909200005',
    nis: '20260206',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'A',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Suka bercerita tentang pengalaman di rumah',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_16',
    personId: 'per_child_clea',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171084212200002',
    nis: '20260207',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'B',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Ramah dan senang bermain bersama',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },
  {
    id: 'stu_maranatha_17',
    personId: 'per_child_nathan',
    schoolId: 'sch_tk_maranatha',
    nisn: '3171081704210004',
    nis: '20260208',
    currentClassId: 'cls_maranatha_tkb',
    bloodType: 'O',
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Kuat di motorik dan suka olahraga cilik',
    enrollmentDate: '2026-07-01',
    status: 'ACTIVE'
  },

  // Test Fixtures (kept for unit test isolation)
  {
    id: 'stu_kenzo_01',
    personId: 'per_child_kenzo',
    schoolId: 'sch_tk_yapendik_01',
    nisn: '3229871021',
    nis: 'TK-2026-001',
    currentClassId: 'cls_tka_01',
    bloodType: 'O',
    allergies: 'Alergi debu ringan',
    specialNeedsNotes: 'Test Fixture',
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
    specialNeedsNotes: 'Test Fixture',
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
    allergies: 'Tidak ada',
    specialNeedsNotes: 'Test Fixture',
    enrollmentDate: '2026-07-15',
    status: 'ACTIVE'
  }
];

export const SEED_GUARDIAN_RELATIONSHIPS: GuardianRelationship[] = [
  // Class A (9 Students × 2 Parents = 18 Relationships)
  {
    id: 'gr_millen_father',
    studentPersonId: 'per_child_millen',
    guardianPersonId: 'per_guard_michael_maspaitella',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_millen_mother',
    studentPersonId: 'per_child_millen',
    guardianPersonId: 'per_guard_julen_patricia',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_carissa_father',
    studentPersonId: 'per_child_carissa',
    guardianPersonId: 'per_guard_dulpri',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_carissa_mother',
    studentPersonId: 'per_child_carissa',
    guardianPersonId: 'per_guard_herni_tiurma',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_rainer_father',
    studentPersonId: 'per_child_rainer',
    guardianPersonId: 'per_guard_alfredo_diego',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_rainer_mother',
    studentPersonId: 'per_child_rainer',
    guardianPersonId: 'per_guard_devia_permata',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_falen_father',
    studentPersonId: 'per_child_falen',
    guardianPersonId: 'per_guard_hasamuda_hulu',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_falen_mother',
    studentPersonId: 'per_child_falen',
    guardianPersonId: 'per_guard_senimawati_zega',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_adrian_father',
    studentPersonId: 'per_child_adrian',
    guardianPersonId: 'per_guard_catur_putranto',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_adrian_mother',
    studentPersonId: 'per_child_adrian',
    guardianPersonId: 'per_guard_salamah',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_adhi_father',
    studentPersonId: 'per_child_adhi',
    guardianPersonId: 'per_guard_herluin_karyadi',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_adhi_mother',
    studentPersonId: 'per_child_adhi',
    guardianPersonId: 'per_guard_nancy_ferawati',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_liora_father',
    studentPersonId: 'per_child_liora',
    guardianPersonId: 'per_guard_david_ardy',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_liora_mother',
    studentPersonId: 'per_child_liora',
    guardianPersonId: 'per_guard_rani_sinaga',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_zio_father',
    studentPersonId: 'per_child_zio',
    guardianPersonId: 'per_guard_george_alexandre',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_zio_mother',
    studentPersonId: 'per_child_zio',
    guardianPersonId: 'per_guard_penta_romla',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_brian_father',
    studentPersonId: 'per_child_brian',
    guardianPersonId: 'per_guard_favor_bancin',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_brian_mother',
    studentPersonId: 'per_child_brian',
    guardianPersonId: 'per_guard_muliathy_briany',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },

  // Class B (8 Students × 2 Parents = 16 Relationships)
  {
    id: 'gr_kayla_father',
    studentPersonId: 'per_child_kayla',
    guardianPersonId: 'per_guard_andi_harefa',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_kayla_mother',
    studentPersonId: 'per_child_kayla',
    guardianPersonId: 'per_guard_mutiara_zega',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_dominic_father',
    studentPersonId: 'per_child_dominic',
    guardianPersonId: 'per_guard_henky_santoso',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_dominic_mother',
    studentPersonId: 'per_child_dominic',
    guardianPersonId: 'per_guard_friny',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_lyra_father',
    studentPersonId: 'per_child_lyra',
    guardianPersonId: 'per_guard_bram_kevin',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_lyra_mother',
    studentPersonId: 'per_child_lyra',
    guardianPersonId: 'per_guard_lillyanti_posumah',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_levin_father',
    studentPersonId: 'per_child_levin',
    guardianPersonId: 'per_guard_veron_situmorang',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_levin_mother',
    studentPersonId: 'per_child_levin',
    guardianPersonId: 'per_guard_henny_sitindaon',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_adriel_father',
    studentPersonId: 'per_child_adriel',
    guardianPersonId: 'per_guard_andri_syawali',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_adriel_mother',
    studentPersonId: 'per_child_adriel',
    guardianPersonId: 'per_guard_bilief_zebua',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_zane_father',
    studentPersonId: 'per_child_zane',
    guardianPersonId: 'per_guard_remon',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_zane_mother',
    studentPersonId: 'per_child_zane',
    guardianPersonId: 'per_guard_yanti_siagian',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_clea_father',
    studentPersonId: 'per_child_clea',
    guardianPersonId: 'per_guard_denis',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_clea_mother',
    studentPersonId: 'per_child_clea',
    guardianPersonId: 'per_guard_marshella_novita',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },
  {
    id: 'gr_nathan_father',
    studentPersonId: 'per_child_nathan',
    guardianPersonId: 'per_guard_hengki_adi',
    relationshipType: 'FATHER',
    isPrimaryContact: false,
    isLegalGuardian: true,
    emergencyContactPriority: 2
  },
  {
    id: 'gr_nathan_mother',
    studentPersonId: 'per_child_nathan',
    guardianPersonId: 'per_guard_novita_ginting',
    relationshipType: 'MOTHER',
    isPrimaryContact: true,
    isLegalGuardian: true,
    emergencyContactPriority: 1
  },

  // Test Fixture
  {
    id: 'rel_kenzo_budi',
    studentPersonId: 'per_child_kenzo',
    guardianPersonId: 'per_parent_budi',
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

export const SEED_LEARNING_ACTIVITIES: LearningActivity[] = [];

export const SEED_OBSERVATIONS: ObservationRecord[] = [];

export const SEED_ATTENDANCE: DailyAttendanceEntry[] = [];

export const SEED_GUARDIAN_NOTICES: GuardianNotice[] = [];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [];
