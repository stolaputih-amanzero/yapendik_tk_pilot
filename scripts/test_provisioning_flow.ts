import { db } from '../src/db/database';

async function testFlow() {
  const suffix = Date.now().toString().slice(-4);
  const schoolId = `sch_tk_test_${suffix}`;
  const ayId = `ay_${suffix}_2026_ganjil`;
  const hmId = `per_hm_${suffix}`;
  const npsn = `2010${suffix}`;

  console.log('1. Creating school...');
  const res1 = await db.createSchoolCommand({
    id: schoolId,
    npsn: npsn,
    name: `TK Test ${suffix}`,
    level: 'TK',
    subType: 'STANDARD',
    address: 'Jl. Test No. 1',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    phone: '021-123456',
    email: `test.${suffix}@yapendik.sch.id`,
    headmasterPersonId: hmId,
    academicYearActiveId: ayId
  });
  console.log('Create school result:', res1);

  console.log('2. Initializing academic year...');
  const res2 = await db.initializeAcademicYearCommand({
    id: ayId,
    schoolId: schoolId,
    name: 'T.A. 2026/2027',
    semester: 'GANJIL',
    startDate: '2026-07-15',
    endDate: '2026-12-20',
    isActive: true
  });
  console.log('Init AY result:', res2);

  console.log('3. Assigning headmaster...');
  const res3 = await db.assignHeadmasterCommand(schoolId, hmId);
  console.log('Assign HM result:', res3);

  console.log('4. Creating classroom...');
  const classId = `cls_${suffix}`;
  const res4 = await db.createClassroomCommand({
    id: classId,
    schoolId: schoolId,
    academicYearId: ayId,
    name: 'Kelompok A Test',
    ageGroup: 'TK_A_4_5',
    roomNumber: 'R-01',
    capacity: 15,
    homeroomTeacherId: 'per_teacher_01',
    isActive: true
  });
  console.log('Create classroom result:', res4);

  console.log('5. Evaluating readiness...');
  const r = await db.evaluateSchoolReadiness(schoolId);
  console.log('Readiness:', r);
}

testFlow().catch(console.error);
