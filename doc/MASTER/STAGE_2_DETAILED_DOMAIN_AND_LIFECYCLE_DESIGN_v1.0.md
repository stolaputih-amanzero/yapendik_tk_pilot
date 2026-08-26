# YAPENDIK SCHOOL OS — STAGE 2: DETAILED DOMAIN & LIFECYCLE DESIGN
## Version 1.0 — Canonical Technical Design Baseline

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Detailed Domain & Lifecycle Design Document  
**Status:** **ACTIVE DESIGN BASELINE**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, ENTERPRISE INFORMATION ARCHITECTURE v0.1 & STAGE 2 SPECIFICATION v1.1  
**Upstream Runtime Baseline:** V2.1.5 Definitive Production Baseline (🔒 **FROZEN**)  

---

## 1. Canonical Entities Involved

Sesuai prinsip *One Concept, One Governed Meaning* dan *Capture Once, Reuse Appropriately*, entitas canonical untuk siklus hidup institusi didefinisikan sebagai berikut:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ORGANIZATIONAL CONTEXT                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. School (Unit Pendidikan / Sekolah)                                                  │
│    - id: UUID (PK)                                                                     │
│    - name: String (mis. "TK Yapendik 03 Rawamangun")                                   │
│    - npsn: String (Unique, mis. "20109988")                                            │
│    - school_level: Enum ('TK', 'SD', 'SMP', 'SMA', 'SMK')                              │
│    - address: String                                                                   │
│    - city: String                                                                      │
│    - phone: String                                                                     │
│    - email: String                                                                     │
│    - headmaster_person_id: UUID (FK -> Person.id, Nullable)                           │
│    - status: Enum ('ACTIVE', 'ARCHIVED')                                               │
│    - operational_readiness: Enum ('NOT_READY', 'READY')                                │
│    - created_at, updated_at: Timestamp                                                │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TEMPORAL CONTEXT                                                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. AcademicYear (Tahun Akademik)                                                       │
│    - id: UUID (PK)                                                                     │
│    - school_id: UUID (FK -> School.id)                                                 │
│    - name: String (mis. "2026/2027")                                                  │
│    - start_date: Date                                                                  │
│    - end_date: Date                                                                    │
│    - status: Enum ('PLANNED', 'ACTIVE', 'CLOSED')                                      │
│                                                                                        │
│ 3. AcademicPeriod (Semester / Periode Kalender)                                       │
│    - id: UUID (PK)                                                                     │
│    - academic_year_id: UUID (FK -> AcademicYear.id)                                    │
│    - name: String (mis. "Semester 1 (Ganjil)")                                         │
│    - period_type: Enum ('SEMESTER_1_GANJIL', 'SEMESTER_2_GENAP')                       │
│    - start_date: Date                                                                  │
│    - end_date: Date                                                                    │
│    - status: Enum ('PLANNED', 'ACTIVE', 'CLOSED')                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ OPERATIONAL LEARNING CONTEXT                                                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. ClassRoom (Rombongan Belajar / Kelas)                                               │
│    - id: UUID (PK)                                                                     │
│    - school_id: UUID (FK -> School.id)                                                 │
│    - academic_year_id: UUID (FK -> AcademicYear.id)                                    │
│    - name: String (mis. "Kelompok A (Bintang Ceria)")                                  │
│    - grade_level: String (mis. "TK_A", "TK_B")                                         │
│    - capacity: Integer (Default Pilot: 15, Configurable)                               │
│    - homeroom_teacher_id: UUID (FK -> TeacherProfile.id, Nullable)                     │
│    - status: Enum ('ACTIVE', 'ARCHIVED')                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CANONICAL HUMAN IDENTITIES & CONTEXTUAL ROLES                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. Person (Entitas Manusia Kanonikal Tunggal)                                          │
│    - id: UUID (PK)                                                                     │
│    - full_name: String                                                                 │
│    - nickname: String                                                                  │
│    - nik: String (Nullable)                                                            │
│    - gender: Enum ('MALE', 'FEMALE')                                                   │
│    - birth_date: Date                                                                  │
│    - birth_place: String                                                               │
│    - phone: String                                                                     │
│    - email: String                                                                     │
│    - address: String                                                                   │
│                                                                                        │
│ 6. TeacherProfile (Profil Pendidik Terkait Unit Sekolah)                               │
│    - id: UUID (PK)                                                                     │
│    - person_id: UUID (FK -> Person.id)                                                 │
│    - school_id: UUID (FK -> School.id)                                                 │
│    - employee_number: String                                                           │
│    - specialization: String                                                            │
│    - status: Enum ('ACTIVE', 'INACTIVE')                                               │
│                                                                                        │
│ 7. Student (Peserta Didik)                                                             │
│    - id: UUID (PK)                                                                     │
│    - person_id: UUID (FK -> Person.id)                                                 │
│    - nis: String                                                                       │
│    - nisn: String (Nullable)                                                           │
│    - blood_type: Enum ('A', 'B', 'AB', 'O', 'UNKNOWN')                                 │
│    - medical_notes: String (Catatan Alergi / Medis)                                    │
│    - special_needs: String (Kebutuhan Pendampingan Khusus)                             │
│                                                                                        │
│ 8. Enrollment (Relasi Admisi Siswa ke Sekolah per Tahun Ajaran)                        │
│    - id: UUID (PK)                                                                     │
│    - student_id: UUID (FK -> Student.id)                                               │
│    - school_id: UUID (FK -> School.id)                                                 │
│    - academic_year_id: UUID (FK -> AcademicYear.id)                                    │
│    - enrollment_date: Date                                                             │
│    - status: Enum ('ADMITTED', 'ACTIVE', 'WITHDRAWN', 'GRADUATED')                     │
│                                                                                        │
│ 9. ClassPlacement (Penempatan Siswa ke Rombel Belajar)                                 │
│    - id: UUID (PK)                                                                     │
│    - enrollment_id: UUID (FK -> Enrollment.id)                                         │
│    - class_id: UUID (FK -> ClassRoom.id)                                               │
│    - placement_date: Date                                                              │
│    - status: Enum ('ACTIVE', 'TRANSFERRED', 'COMPLETED')                               │
│                                                                                        │
│ 10. GuardianRelationship (Hubungan Wali Sah dengan Siswa)                              │
│     - id: UUID (PK)                                                                    │
│     - student_id: UUID (FK -> Student.id)                                              │
│     - guardian_person_id: UUID (FK -> Person.id)                                       │
│     - relationship_type: String (mis. "Ayah Kandung", "Ibu Kandung", "Wali Sah")      │
│     - is_primary_contact: Boolean                                                      │
│     - can_view_records: Boolean                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Relationships & Context Hierarchy

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONTEXT & RELATIONSHIP TOPOLOGY                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [YAPENDIK FOUNDATION]                                                                 │
│          │                                                                             │
│          └──► [School] (Primary Context: id, npsn, status, operational_readiness)      │
│                  │                                                                     │
│                  ├──► [AcademicYear] (Temporal Context: T.A. 2026/2027)                │
│                  │          │                                                          │
│                  │          └──► [AcademicPeriod] (Semester 1 Ganjil)                  │
│                  │                                                                     │
│                  ├──► [ClassRoom] (Operational Context: Kelompok A)                    │
│                  │          │                                                          │
│                  │          └─── [TeacherProfile] (Assigned Homeroom Teacher)          │
│                  │                     │                                               │
│                  │                     └──► [Person] (Teacher Identity)                │
│                  │                                                                     │
│                  └──► [Enrollment] (Student School Enrollment)                         │
│                             │                                                          │
│                             ├──► [ClassPlacement] ──► [ClassRoom]                      │
│                             │                                                          │
│                             └──► [Student]                                             │
│                                     │                                                  │
│                                     ├──► [Person] (Child Identity)                     │
│                                     │                                                  │
│                                     └──► [GuardianRelationship]                        │
│                                                 │                                      │
│                                                 └──► [Person] (Parent Identity)        │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Rantai Resolusi Akses Runtime (Data Access Chain):
1. **Pendidik (`TEACHER`):**  
   $$\text{UserAccount} \rightarrow \text{Person} \rightarrow \text{TeacherProfile} \rightarrow \text{ClassRoom.homeroom\_teacher\_id} \rightarrow \text{ClassPlacement} \rightarrow \text{Student}$$
2. **Wali Murid (`GUARDIAN`):**  
   $$\text{UserAccount} \rightarrow \text{Person} \rightarrow \text{GuardianRelationship} \rightarrow \text{Student}$$
3. **Kepala Sekolah (`HEADMASTER`):**  
   $$\text{UserAccount} \rightarrow \text{Person} \rightarrow \text{School.headmaster\_person\_id} \rightarrow \text{All School Data}$$

---

## 3. Lifecycle & Readiness Model

### 3.1. Ortogonalitas State Model
- **`School.status` (Legal Existence):** `ACTIVE` $\leftrightarrow$ `ARCHIVED`.
- **`School.operational_readiness` (Topological Readiness):** `NOT_READY` $\rightarrow$ `READY`.

### 3.2. Mesin Evaluasi Kesiapan Operasional (`EVALUATE_OPERATIONAL_READINESS`)

Fungsi deterministik murni yang mengevaluasi integritas topologi sebelum mengizinkan transisi ke `READY`:

```typescript
interface ReadinessDiagnostic {
  isReady: boolean;
  gates: {
    gate1_legalActive: boolean;
    gate2_academicYearActive: boolean;
    gate3_academicPeriodActive: boolean;
    gate4_headmasterAssigned: boolean;
    gate5_classroomStaffed: boolean;
    gate6_studentsPlaced: boolean;
  };
  missingRequirements: string[];
}
```

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              READINESS EVALUATION RULES                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Gate 1: School.status === 'ACTIVE'                                                     │
│ Gate 2: Count(AcademicYear WHERE school_id = :id AND status = 'ACTIVE') === 1          │
│ Gate 3: Count(AcademicPeriod WHERE academic_year_id = :year_id AND status = 'ACTIVE') === 1
│ Gate 4: School.headmaster_person_id IS NOT NULL                                        │
│ Gate 5: Count(ClassRoom WHERE school_id = :id AND status = 'ACTIVE'                    │
│                          AND homeroom_teacher_id IS NOT NULL) >= 1                     │
│ Gate 6: Count(ClassPlacement CP JOIN Enrollment E ON CP.enrollment_id = E.id           │
│                              WHERE E.school_id = :id AND CP.status = 'ACTIVE') >= 1    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Governed Commands & Authorization Boundaries

Seluruh aksi provisioning dimediasi oleh **Atomic Governed Commands** dengan validasi otorisasi fail-closed:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ COMMAND SPECIFICATION & AUDIT EVENT MAPPING                                             │
├───────────────────────────────┬──────────────────────┬──────────────────────────────────┤
│ Command Name                  │ Authorized Role      │ Audit Event Emitted              │
├───────────────────────────────┼──────────────────────┼──────────────────────────────────┤
│ `CREATE_SCHOOL`               │ `YAPENDIK_SUPERADMIN`│ `INSTITUTIONAL_SCHOOL_CREATED`   │
│ `ASSIGN_HEADMASTER`           │ `YAPENDIK_SUPERADMIN`│ `GOVERNANCE_HEADMASTER_ASSIGNED` │
│ `INITIALIZE_ACADEMIC_YEAR`    │ `YAPENDIK_SUPERADMIN`│ `ACADEMIC_YEAR_INITIALIZED`      │
│ `CONFIGURE_ACADEMIC_PERIOD`   │ `HEADMASTER`         │ `ACADEMIC_PERIOD_CONFIGURED`     │
│ `CREATE_CLASSROOM`            │ `HEADMASTER`         │ `ROSTER_CLASSROOM_CREATED`       │
│ `ASSIGN_HOMEROOM_TEACHER`     │ `HEADMASTER`         │ `ROSTER_TEACHER_ASSIGNED`        │
│ `ADMIT_STUDENT`               │ `HEADMASTER`         │ `ADMISSION_STUDENT_ADMITTED`     │
│ `PLACE_STUDENT_IN_CLASS`      │ `HEADMASTER`         │ `ADMISSION_STUDENT_PLACED`       │
│ `EVALUATE_READINESS`          │ `HEADMASTER` / SUPER │ `READINESS_EVALUATED`            │
└───────────────────────────────┴──────────────────────┴──────────────────────────────────┘
```

### Authorization Boundary Checks:
1. `YAPENDIK_SUPERADMIN` **tidak dapat** memodifikasi penempatan siswa ke rombel atau membuat agenda sentra harian (*Preserve School Autonomy*).
2. `HEADMASTER` **tidak dapat** mendirikan entitas sekolah baru (*Preserve Foundation Authority*).
3. `TEACHER` dan `GUARDIAN` **ditolak 100%** saat mencoba mengeksekusi perintah provisioning apapun (*Fail-Closed Boundary*).

---

```text
========================================================================================
 STAGE 2 DETAILED DOMAIN DESIGN COMPLETE — READY FOR IMPLEMENTATION & MIGRATION PLANNING
========================================================================================
```
