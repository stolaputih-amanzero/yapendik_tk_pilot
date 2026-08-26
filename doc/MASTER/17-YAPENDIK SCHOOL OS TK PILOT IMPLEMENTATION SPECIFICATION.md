# YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION SPECIFICATION

**Versi:** 0.1  
**Organisasi:** Yayasan Pendidikan GPIB (Yapendik)  
**Sistem:** Yapendik Operating System  
**Produk:** School OS  
**Pilot:** TK / Early Childhood Education  
**Jenis Dokumen:** Implementation Specification  
**Status:** **LIVING — ACTIVE IMPLEMENTATION BASELINE**  
**Pendekatan:** Common Sense First  
**Prinsip:** **Make It Simple. Keep It Future-Proof.**

---

# 1. PURPOSE

Dokumen ini menerjemahkan seluruh design baseline menjadi instruksi implementasi yang cukup konkret untuk mulai membangun TK Pilot.

Rantai sebelumnya:

```text
CONSTITUTION
      ↓
ENTERPRISE INFORMATION ARCHITECTURE
      ↓
SCHOOL OS OPERATING MODEL
      ↓
PRODUCT BLUEPRINT
      ↓
UX ARCHITECTURE
      ↓
TECHNICAL ARCHITECTURE
      ↓
WORKFLOW
      ↓
AUTHORIZATION
      ↓
DATA MODEL
      ↓
DOMAIN MODEL
      ↓
DATABASE BLUEPRINT
      ↓
API & APPLICATION CONTRACT
      ↓
★ IMPLEMENTATION SPECIFICATION ★
```

Dokumen ini menjawab:

> **What exactly do we build first, how do we build it, and how do we know it is good enough to enter the real TK environment?**

---

# 2. IMPLEMENTATION PHILOSOPHY

Kita tidak akan membangun seluruh School OS sekaligus.

Kita menggunakan:

```text
BUILD
  ↓
USE
  ↓
LEARN
  ↓
EVOLVE
```

yang memang merupakan development philosophy yang ditetapkan Constitution. 

Implikasinya:

> **Implementation adalah bagian dari discovery.**

Jika realitas TK menunjukkan bahwa asumsi kita salah, implementasi tidak dipaksakan untuk mengikuti dokumen.

Dokumen yang lebih rendah harus berubah.

---

# 3. IMPLEMENTATION NORTH STAR

Target TK Pilot bukan:

> “semua modul selesai.”

Targetnya:

> **Satu sekolah TK dapat menjalankan pekerjaan pentingnya dengan School OS secara nyata dan memperoleh manfaat yang dapat diamati.**

Maka ukuran keberhasilan:

```text
REAL WORK
    ↓
SUPPORTED BY SYSTEM
    ↓
USED BY REAL PEOPLE
    ↓
TRUSTED INFORMATION
    ↓
OBSERVABLE IMPROVEMENT
```

---

# 4. WHAT WE ARE BUILDING

TK Pilot adalah:

> **smallest useful School OS capable of validating the most important operational and educational assumptions.**

Ini konsisten dengan MVP principle: MVP bukan versi kecil dari sistem final, melainkan sistem terkecil yang berguna untuk memvalidasi asumsi terpenting. 

---

# 5. WHAT WE ARE NOT BUILDING

Untuk pilot awal kita **tidak** membangun:

- Foundation OS;
- public portal lengkap;
- ERP sekolah;
- finance system lengkap;
- HRIS lengkap;
- advanced analytics;
- AI;
- payment gateway;
- social network orang tua;
- complex messaging platform;
- offline-first architecture;
- microservices;
- enterprise data warehouse;
- advanced integration platform.

Hal-hal tersebut bukan ditolak secara permanen.

Statusnya:

> **Deferred until evidence and justification exist.**

---

# 6. IMPLEMENTATION BOUNDARY

Initial boundary:

```text
YAPENDIK OS
    │
    └── SCHOOL OS
           │
           └── TK PILOT
                  │
                  ├── School
                  ├── People
                  ├── Students
                  ├── Academic Structure
                  ├── Daily Work
                  ├── Learning
                  └── Observation
```

---

# 7. CORE IMPLEMENTATION PRIORITY

Product Blueprint sebelumnya memprioritaskan discovery:

```text
01 Teacher Daily Work
02 Student Observation
03 Student Development
04 Attendance
05 Guardian Communication
06 Enrollment
07 School Review
08 Other Operations
```



Namun dari sisi technical dependency, build order harus dimulai dari foundation.

Maka kita membedakan:

### Product Priority

Apa yang paling penting bagi user.

### Technical Dependency

Apa yang harus tersedia agar feature tersebut dapat berjalan.

---

# 8. TECHNICAL BUILD ORDER

Urutan implementasi:

```text
01 Identity
      ↓
02 School Context
      ↓
03 Authorization
      ↓
04 People
      ↓
05 Academic Structure
      ↓
06 Student
      ↓
07 Enrollment / Placement
      ↓
08 Teacher Workspace
      ↓
09 Attendance
      ↓
10 Observation
      ↓
11 Learning
      ↓
12 Guardian
      ↓
13 Communication
      ↓
14 Review / Reporting
```

Ini mengikuti dependency yang sudah ditetapkan Technical Architecture:

```text
Canonical Identity
       ↓
Context
       ↓
Authorization
       ↓
Domain Rules
       ↓
Transactions
       ↓
Projections
```



---

# 9. IMPLEMENTATION STRATEGY

Kita tidak membangun berdasarkan:

```text
table by table
```

dan tidak juga:

```text
screen by screen
```

Kita membangun berdasarkan:

> **vertical slice.**

Contoh:

```text
Teacher
 ↓
Class
 ↓
Student
 ↓
Attendance
 ↓
Observation
 ↓
Database
 ↓
Authorization
 ↓
Audit
```

Satu vertical slice harus berjalan end-to-end.

---

# 10. FIRST VERTICAL SLICE

Vertical slice pertama:

# Teacher Daily Work

Flow:

```text
Login
 ↓
Teacher Context
 ↓
My Class
 ↓
Student List
 ↓
Student Profile
 ↓
Record Attendance
 ↓
Create Observation
 ↓
Save
 ↓
Review
```

Mengapa?

Karena satu slice ini menguji:

- identity;
- authentication;
- context;
- authorization;
- class;
- student;
- attendance;
- observation;
- application service;
- API contract;
- database;
- audit;
- UX.

---

# 11. IMPLEMENTATION PHASES

## Phase 0 — Foundation

Tujuan:

> Membuat technical foundation yang dapat dipercaya.

Deliverables:

- repository;
- environment;
- application shell;
- database connection;
- authentication foundation;
- basic authorization foundation;
- migration system;
- testing foundation;
- logging.

---

# 12. PHASE 0 — EXIT CRITERIA

Phase 0 selesai jika:

```text
[ ] Application runs
[ ] Database connects
[ ] Migration works
[ ] Authentication works
[ ] User identity resolved
[ ] Basic school context resolved
[ ] Protected route works
[ ] Unauthorized access rejected
[ ] Basic test pipeline works
[ ] Production-like environment deployable
```

Belum ada kebutuhan membuat UI yang indah.

---

# 13. PHASE 1 — SCHOOL FOUNDATION

Build:

```text
School
Academic Year
Class
```

dan relationship dasar.

Tujuan:

> Sistem mengetahui **sekolah mana, tahun ajaran mana, dan kelas mana**.

---

# 14. PHASE 1 — PEOPLE

Build:

```text
Person
Teacher
Guardian
Staff
```

Prinsip:

> Person adalah identity; role/relationship menentukan bagaimana identity digunakan.

Jangan membuat duplicate person hanya karena berbeda role.

---

# 15. PHASE 1 — STUDENT

Build:

```text
Student
```

Student menjadi canonical educational entity.

Hubungan:

```text
Person
  ↓
Student
  ↓
Enrollment
  ↓
Class Placement
```

---

# 16. PHASE 1 — ENROLLMENT

Build:

```text
Enrollment
```

Minimal lifecycle:

```text
Draft
   ↓
Active
   ↓
Completed / Withdrawn
```

Exact lifecycle dapat berubah setelah validasi TK.

---

# 17. PHASE 1 — CLASS PLACEMENT

Build:

```text
Student
 ↓
Class Placement
 ↓
Class
```

Historical placement harus dipertahankan jika memang dibutuhkan oleh data model.

---

# 18. PHASE 1 — TEACHER ASSIGNMENT

Build:

```text
Teacher
 ↓
Class Assignment
 ↓
Class
```

Teacher authorization kemudian dapat menggunakan relationship tersebut.

---

# 19. PHASE 1 — EXIT CRITERIA

```text
[ ] School exists
[ ] Academic Year exists
[ ] Class exists
[ ] Person exists
[ ] Teacher exists
[ ] Student exists
[ ] Enrollment works
[ ] Placement works
[ ] Teacher assignment works
[ ] Authorization respects context
```

---

# 20. PHASE 2 — TEACHER WORKSPACE

Build first real operational workspace.

```text
Teacher
 ↓
My Classes
 ↓
Class
 ↓
Students
```

UX Architecture sebelumnya memang mengasumsikan Teacher sebagai primary operational user dan Class sebagai kandidat important Teacher workspace, tetapi keduanya masih harus divalidasi di lapangan. 

---

# 21. TEACHER CLASS WORKSPACE

Minimum information:

```text
Class identity
Teacher
Student roster
Today's work
Attendance state
Recent activity
```

Tidak perlu dashboard besar.

---

# 22. PHASE 2 — ATTENDANCE

Build:

```text
Record Attendance
View Attendance
Edit Attendance
Attendance Summary
```

Core workflow:

```text
Teacher
 ↓
Class
 ↓
Attendance
 ↓
Mark students
 ↓
Save
 ↓
Confirm
```

---

# 23. ATTENDANCE RULE

Attendance tidak boleh hanya:

```text
INSERT attendance
```

Application harus memastikan:

```text
Teacher
+
Class
+
Student
+
Date
+
Authorization
```

valid.

---

# 24. PHASE 2 — EXIT CRITERIA

Teacher harus mampu:

```text
[ ] Open class
[ ] See correct students
[ ] Record attendance
[ ] Correct attendance
[ ] Re-open attendance
[ ] See saved state
[ ] Unauthorized teacher cannot modify unrelated class
```

---

# 25. PHASE 3 — STUDENT WORKSPACE

Build:

```text
Student Profile
```

Information hierarchy:

```text
Identity
 ↓
Current Class
 ↓
Attendance
 ↓
Learning
 ↓
Observation
 ↓
Development
```

Exact information ordering remains subject to field validation.

---

# 26. STUDENT TIMELINE

Jika berguna secara nyata, Student Workspace dapat memiliki:

```text
Timeline
```

Contoh:

```text
Enrollment
Attendance
Learning Activity
Observation
Development
Communication
```

Tetapi timeline tidak boleh menjadi dumping ground seluruh database.

---

# 27. PHASE 3 — OBSERVATION

Build:

```text
Create Observation
View Observation
Edit Observation
```

Core flow:

```text
Student
 ↓
Observe
 ↓
Record
 ↓
Save
 ↓
Review
```

---

# 28. OBSERVATION PRINCIPLE

Observation adalah educational information.

Karena itu:

> **Observation bukan sekadar note field.**

Ia harus mempertahankan:

- siapa yang mengamati;
- kapan;
- konteks;
- isi;
- relationship terhadap Student;
- bila perlu follow-up.

---

# 29. OBSERVATION PRIVACY

Observation access harus lebih restrictive daripada general Student information.

Minimum:

```text
Teacher
 ↓
Authorized Student
 ↓
Observation
```

Guardian tidak otomatis memperoleh raw observation.

---

# 30. PHASE 3 — LEARNING

Build minimal:

```text
Learning Activity
Participation / Result
```

Jangan langsung membangun comprehensive curriculum engine.

Karena Product Blueprint secara eksplisit menempatkan learning/development sebagai area yang masih perlu discovery. 

---

# 31. PHASE 3 — EXIT CRITERIA

```text
[ ] Student profile works
[ ] Observation works
[ ] Observation authorization works
[ ] Teacher can review observations
[ ] Learning activity can be recorded
[ ] Student context remains intact
```

---

# 32. PHASE 4 — DEVELOPMENT

Build hanya setelah observation workflow cukup tervalidasi.

Potential structure:

```text
Development Area
 ↓
Evidence
 ↓
Observation
 ↓
Development Record
```

Jangan mengunci pedagogical framework sebelum TK memberikan evidence.

---

# 33. DEVELOPMENT PRINCIPLE

System harus membantu teacher melihat perkembangan anak.

Bukan:

> memaksa teacher memasukkan anak ke dalam struktur data yang belum terbukti sesuai praktik pendidikan TK.

---

# 34. PHASE 5 — GUARDIAN

Setelah internal school workflows stabil:

```text
Guardian
 ↓
My Children
 ↓
Child
 ↓
Relevant Information
```

Guardian experience harus simplified.

UX Architecture juga menetapkan Guardian sebagai actor dengan simplified experience. 

---

# 35. GUARDIAN INFORMATION BOUNDARY

Guardian dapat melihat:

```text
Child identity
Relevant class information
Attendance
Approved communication
Relevant development information
```

tetapi tidak otomatis:

```text
Internal notes
Other students
Internal staff information
Internal review
Raw private observations
```

---

# 36. PHASE 6 — COMMUNICATION

Implementasi awal:

```text
Announcement
Targeted Communication
Acknowledgement
```

Tidak perlu membangun full chat application.

---

# 37. PHASE 7 — SCHOOL REVIEW

Setelah operational data cukup:

```text
School
 ↓
Operational Overview
 ↓
Review
```

Dashboard/reporting dibangun dari actual operational information.

Bukan sebaliknya.

Product Blueprint secara eksplisit menetapkan:

```text
WORK
 ↓
INFORMATION
 ↓
CONTEXT
 ↓
DECISION
 ↓
DASHBOARD
```



---

# 38. DATABASE IMPLEMENTATION SEQUENCE

Database implementation mengikuti dependency:

```text
01 identity / people
02 school
03 academic year
04 class
05 teacher assignment
06 student
07 enrollment
08 placement
09 attendance
10 learning
11 observation
12 development
13 evidence
14 communication
15 audit
```

Jangan membuat seluruh schema sekaligus jika belum dibutuhkan oleh vertical slice.

---

# 39. MIGRATION PRINCIPLE

Setiap migration harus:

```text
small
reviewable
reversible where practical
tested
```

Tidak:

```text
one giant migration
```

yang membangun seluruh future system.

---

# 40. DATABASE SEED

Development environment membutuhkan minimal:

```text
1 School
1 Academic Year
2 Classes
2 Teachers
10 Students
2 Guardians
sample enrollment
sample placement
```

Data seed harus synthetic.

Tidak menggunakan data anak nyata.

---

# 41. TEST DATA PRINCIPLE

Test data harus memungkinkan:

```text
authorized access
unauthorized access
multiple classes
multiple students
multiple guardians
historical states
```

untuk menguji context boundary.

---

# 42. AUTHENTICATION IMPLEMENTATION

Authentication harus menjawab:

```text
Who are you?
```

Authorization menjawab:

```text
What may you do?
```

Keduanya tidak boleh digabungkan.

---

# 43. AUTHORIZATION IMPLEMENTATION

Authorization pipeline:

```text
Request
 ↓
Authenticated Actor
 ↓
Resolve School Context
 ↓
Resolve Relationship
 ↓
Check Capability
 ↓
Execute
```

Authorization harus enforced server-side.

---

# 44. CONTEXT IMPLEMENTATION

Context minimum:

```text
school_id
academic_year_id
class_id
student_id
```

Tidak semua operation membutuhkan semuanya.

Context harus **minimal but sufficient**.

---

# 45. DOMAIN IMPLEMENTATION

Domain code harus berada di domain boundary.

Contoh:

```text
domains/
├── student/
├── attendance/
├── observation/
└── academic/
```

Jangan:

```text
utils/
  └── all-business-logic.ts
```

---

# 46. APPLICATION SERVICE

Application service mengorkestrasi:

```text
authorization
context
domain
repository
transaction
audit
```

Contoh:

```text
recordAttendance()
```

bukan sekadar wrapper:

```text
db.insert()
```

---

# 47. REPOSITORY

Repository menangani persistence.

Contoh:

```text
StudentRepository
AttendanceRepository
ObservationRepository
```

Repository tidak menentukan apakah teacher boleh mengakses data.

---

# 48. API / SERVER ACTION

API contract sebelumnya menjadi boundary.

Contoh:

```text
recordAttendance()
```

flow:

```text
UI
 ↓
Application Command
 ↓
Authorization
 ↓
Domain
 ↓
Repository
 ↓
Database
```

---

# 49. RESPONSE MODEL

Response harus berupa domain/application projection.

Contoh:

```text
StudentProfile
```

bukan raw relational rows.

---

# 50. ERROR MODEL

Minimum:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
NOT_FOUND
CONFLICT
CONTEXT_ERROR
BUSINESS_RULE_ERROR
SYSTEM_ERROR
```

UI harus mendapatkan error yang dapat dipahami tanpa mengetahui database implementation.

---

# 51. AUDIT

Semua important mutations:

```text
Create
Update
Delete
Status transition
Permission change
```

harus dapat diaudit sesuai kebutuhan.

Minimum metadata:

```text
actor
operation
context
timestamp
result
request_id
```

---

# 52. LOGGING

Application logging harus membantu menjawab:

```text
Who?
Did what?
Where?
When?
Succeeded?
If failed, why?
```

Sensitive child data tidak boleh dicatat sembarangan.

---

# 53. FILE STORAGE

Evidence/media menggunakan object storage bila diperlukan.

Flow:

```text
Authorize
 ↓
Upload
 ↓
Store object
 ↓
Save metadata
 ↓
Link to domain entity
```

Database menyimpan metadata/reference, bukan menjadi tempat default untuk binary.

---

# 54. NOTIFICATIONS

Initial implementation dapat menggunakan:

```text
In-App
```

Email/WhatsApp hanya ditambahkan jika workflow membutuhkan.

Jangan membangun notification infrastructure besar sebelum ada real use case.

---

# 55. INFRASTRUCTURE

Baseline:

```text
Web Application
      ↓
Managed Application Runtime
      ↓
Relational Database
      ↓
Object Storage
```

Technical Architecture memang menetapkan managed infrastructure sebagai initial direction, tetapi vendor belum dikunci. 

---

# 56. ENVIRONMENTS

Minimum:

```text
Development
Staging
Production
```

TK Pilot sebaiknya tidak langsung menggunakan production untuk development.

---

# 57. DEPLOYMENT PRINCIPLE

Deployment harus sederhana:

```text
Commit
 ↓
Test
 ↓
Build
 ↓
Deploy
 ↓
Smoke Test
```

Tidak perlu complex orchestration.

---

# 58. CI CHECKS

Minimum:

```text
Type check
Lint
Unit tests
Build
Migration validation
```

E2E dapat dijalankan pada relevant pipeline stages.

---

# 59. TESTING PYRAMID

```text
             E2E
              ▲
         Integration
              ▲
     Application / Domain
              ▲
            Unit
```

Technical Architecture juga menetapkan testing architecture dari unit → domain/application → integration → authorization → E2E → real pilot validation. 

---

# 60. AUTHORIZATION TESTING

Setiap critical operation minimal memiliki:

```text
ALLOW
DENY
WRONG CONTEXT
```

Contoh:

```text
Teacher A
 → Class A ✓

Teacher A
 → Class B ✗
```

---

# 61. E2E TESTING

E2E mengikuti real work.

Contoh:

```text
Teacher Login
 ↓
Open My Class
 ↓
Select Student
 ↓
Record Attendance
 ↓
Create Observation
 ↓
Save
 ↓
Reload
 ↓
Verify
```

Bukan sekadar:

```text
click button
expect visible
```

---

# 62. DATA INTEGRITY TEST

Test:

```text
Duplicate Student
Invalid Enrollment
Invalid Placement
Invalid Teacher Assignment
Cross-school access
Cross-class access
Invalid Attendance
```

---

# 63. PRIVACY TESTING

Test bahwa:

```text
Guardian A
```

tidak dapat melihat:

```text
Student B
```

dan:

```text
Teacher A
```

tidak dapat melihat observation yang berada di luar authorized context.

---

# 64. SECURITY TESTING

Minimum:

```text
Authentication bypass
Authorization bypass
Context manipulation
ID enumeration
Unauthorized mutation
Sensitive response exposure
```

---

# 65. PERFORMANCE

Untuk TK Pilot:

> **Correctness before optimization.**

Target awal bukan benchmark enterprise.

Yang harus dipastikan:

```text
normal user workflow
feels responsive
```

Jika evidence menunjukkan bottleneck:

```text
measure
 ↓
identify
 ↓
optimize
```

---

# 66. OBSERVABILITY

Pilot harus memungkinkan kita mengetahui:

```text
errors
failed operations
slow operations
authorization failures
system availability
```

Tanpa membuat observability platform berlebihan.

---

# 67. PILOT TELEMETRY

Minimal:

```text
Login success/failure
API/application errors
Attendance operations
Observation operations
Communication operations
Authorization denials
```

Data usage harus privacy-safe.

---

# 68. FEATURE FLAGS

Feature flags digunakan hanya jika memang membantu pilot.

Jangan membangun feature-flag platform kompleks.

Potential:

```text
development_module_enabled
guardian_enabled
communication_enabled
```

---

# 69. PILOT DATA MIGRATION

Jika TK sudah memiliki data spreadsheet:

```text
Existing Data
 ↓
Mapping
 ↓
Validation
 ↓
Cleaning
 ↓
Import
 ↓
Verification
```

Jangan langsung:

```text
Spreadsheet → Database
```

---

# 70. MIGRATION PRINCIPLE

Setiap imported record harus dapat ditelusuri:

```text
source
mapping
transformation
result
```

Jika data tidak dapat dipercaya:

> Jangan memaksakan migrasi hanya demi terlihat lengkap.

---

# 71. PILOT ONBOARDING

School onboarding:

```text
Create School
 ↓
Academic Year
 ↓
Classes
 ↓
Teachers
 ↓
Students
 ↓
Guardians
 ↓
Assignments
 ↓
Ready
```

---

# 72. PILOT TRAINING

Training tidak boleh hanya:

> “Ini menu A, ini menu B.”

Training harus berbasis workflow:

```text
Bagaimana membuka kelas
Bagaimana melihat siswa
Bagaimana mencatat kehadiran
Bagaimana mencatat observation
Bagaimana memperbaiki kesalahan
```

---

# 73. PILOT SUPPORT

Initial support channel harus sederhana.

Contoh:

```text
Issue
 ↓
Capture
 ↓
Classify
 ↓
Fix / Explain
 ↓
Learn
```

Setiap recurring issue menjadi evidence product improvement.

---

# 74. FEEDBACK LOOP

```text
User
 ↓
Feedback
 ↓
Observation
 ↓
Classify
 ├── Bug
 ├── UX Problem
 ├── Workflow Problem
 ├── Data Problem
 ├── Training Problem
 └── New Requirement
 ↓
Decision
 ↓
Implementation
```

Jangan semua feedback otomatis menjadi feature.

---

# 75. CHANGE CLASSIFICATION

### Type A — Bug

System tidak melakukan hal yang seharusnya.

### Type B — UX Friction

System benar tetapi sulit digunakan.

### Type C — Workflow Discovery

Cara kerja sekolah berbeda dari assumption.

### Type D — Data Discovery

Model informasi tidak tepat.

### Type E — New Capability

Kebutuhan baru.

### Type F — Governance Change

Fundamental principle/boundary berubah.

---

# 76. DOCUMENT EVOLUTION

Jika Type F:

```text
Proposal
 ↓
Impact Analysis
 ↓
Review
 ↓
Decision
 ↓
Update Constitution
 ↓
Update affected documents
```

Ini mengikuti governance hierarchy dan decision governance Constitution. 

Jika Type B:

cukup UX/Application adjustment.

Jika Type C:

Operating Model/Product/Workflow dapat berubah.

---

# 77. DEFINITION OF READY

Feature boleh mulai dibangun jika:

```text
[ ] Purpose understood
[ ] Actor known
[ ] Workflow understood
[ ] Context known
[ ] Domain identified
[ ] Authorization identified
[ ] Data required known
[ ] Application contract defined
[ ] Acceptance criteria defined
```

Tidak harus semuanya sempurna.

Tetapi ketidakpastian penting harus terlihat.

---

# 78. DEFINITION OF DONE

Feature selesai jika:

```text
[ ] Implemented
[ ] Domain rules tested
[ ] Authorization tested
[ ] Database migration tested
[ ] API/Application contract satisfied
[ ] Error state handled
[ ] Empty state handled
[ ] Audit considered
[ ] E2E workflow works
[ ] Documentation updated
```

---

# 79. PILOT READY

School OS siap masuk pilot jika:

```text
[ ] Authentication works
[ ] School context works
[ ] Authorization works
[ ] Student foundation works
[ ] Teacher workspace works
[ ] Attendance works
[ ] Observation works
[ ] Core data can be imported
[ ] Backup/recovery understood
[ ] Monitoring exists
[ ] Support process exists
[ ] Critical E2E tests pass
```

---

# 80. PILOT READINESS IS NOT PRODUCT COMPLETION

Pilot ready berarti:

> **safe enough to learn from reality.**

Bukan:

> **finished forever.**

---

# 81. PILOT SUCCESS SIGNALS

Success signals tetap mengikuti Product Blueprint:

Teacher:

> “Ini menghemat waktu saya.”

Teacher:

> “Saya lebih mudah melihat perkembangan anak.”

Guardian:

> “Saya lebih memahami apa yang terjadi di sekolah.”

Leadership:

> “Saya tidak perlu meminta data yang sama berulang kali.”

School:

> “Informasi lebih mudah ditemukan.”

Yapendik:

> “Kita mulai memiliki institutional visibility.”

Ini adalah qualitative validation signals, bukan KPI final. 

---

# 82. FIRST RELEASE

Release pertama sebaiknya sangat kecil.

### Release 0 — Internal Foundation

```text
Auth
School
Class
People
Student
```

### Release 1 — Teacher Work

```text
Teacher Workspace
Attendance
Student Profile
```

### Release 2 — Educational Work

```text
Observation
Learning
```

### Release 3 — Family

```text
Guardian
Communication
```

### Release 4 — Review

```text
Development
Review
Basic Insight
```

Release boundaries bersifat **working plan**, bukan frozen roadmap.

---

# 83. FIRST DEVELOPMENT SPRINT

Jika mulai coding sekarang, target pertama:

```text
SPRINT 0
```

### Deliverables

```text
Repository
Application shell
Database
Migration system
Authentication
User identity
School context
Basic authorization
Testing setup
Deployment setup
```

Tidak membangun dashboard.

---

# 84. SECOND DEVELOPMENT SPRINT

```text
SPRINT 1
```

### Deliverables

```text
School
Academic Year
Class
Person
Teacher
Student
Enrollment
Placement
```

Goal:

> School dapat dimodelkan secara nyata.

---

# 85. THIRD DEVELOPMENT SPRINT

```text
SPRINT 2
```

### Deliverables

```text
Teacher Workspace
My Classes
Class Workspace
Student Roster
Student Profile
```

Goal:

> Teacher dapat bekerja dari context yang benar.

---

# 86. FOURTH DEVELOPMENT SPRINT

```text
SPRINT 3
```

### Deliverables

```text
Attendance
Attendance history
Attendance correction
Authorization tests
```

Goal:

> Daily school work pertama benar-benar berjalan.

---

# 87. FIFTH DEVELOPMENT SPRINT

```text
SPRINT 4
```

### Deliverables

```text
Observation
Student timeline / recent observations
Observation authorization
Audit
```

Goal:

> Educational information mulai terbentuk.

---

# 88. SIXTH DEVELOPMENT SPRINT

```text
SPRINT 5
```

### Deliverables:

```text
Learning Activity
Development foundation
Evidence foundation
```

Tetapi hanya jika discovery menunjukkan model tersebut sudah cukup jelas.

---

# 89. SEVENTH DEVELOPMENT SPRINT

```text
SPRINT 6
```

### Deliverables:

```text
Guardian
My Children
Relevant information
Communication
```

Hanya setelah internal workflows stabil.

---

# 90. DEVELOPMENT RULE

Jangan melanjutkan sprint hanya karena:

> “sprint berikutnya sudah direncanakan.”

Lanjut jika:

```text
Previous capability
        ↓
Works
        ↓
Understood
        ↓
Useful
        ↓
Ready for next dependency
```

---

# 91. ARCHITECTURAL CHECKPOINT

Setelah setiap major phase:

```text
Does architecture still reflect reality?
```

Periksa:

```text
Identity
Context
Authorization
Domain
Data
API
UX
Infrastructure
```

---

# 92. NO PREMATURE FREEZE

Dokumen implementation ini:

> **LIVING — ACTIVE IMPLEMENTATION BASELINE**

bukan frozen.

Alasan:

Constitution sendiri menetapkan bahwa architecture berkembang melalui:

```text
Implementation
 ↓
Real Usage
 ↓
Evidence
 ↓
Learning
 ↓
Architecture Evolution
```



---

# 93. WHAT MAY CHANGE

Boleh berubah:

- technology;
- folder structure;
- API detail;
- UX;
- workflow;
- data model;
- implementation sequence;
- release sequence.

Jika evidence mendukung.

---

# 94. WHAT REQUIRES MORE GOVERNANCE

Perubahan besar terhadap:

- mission;
- School OS scope;
- privacy principles;
- authorization philosophy;
- canonical information;
- strategic boundary;
- architecture philosophy.

harus mengikuti governance process.

---

# 95. IMPLEMENTATION RISK REGISTER

Risiko utama:

| Risk | Response |
|---|---|
| Building before field validation | Validate real workflow |
| Over-engineering | Prefer simplest viable solution |
| Wrong student identity model | Canonical identity first |
| Context leakage | Server authorization |
| Premature pedagogical model | Keep development model adaptable |
| Too many features | Vertical slice |
| Poor data quality | Migration validation |
| Duplicate information | Canonical information |
| Excessive privacy exposure | Minimum disclosure |
| Technology lock-in | Clear boundaries |
| Premature offline | Online-first |
| Microservices complexity | Modular monolith |

---

# 96. IMPLEMENTATION ANTI-PATTERNS

Jangan:

### 1. Build all tables first.

### 2. Build dashboard first.

### 3. Build all CRUD screens.

### 4. Add AI because “future-proof.”

### 5. Add offline because “future-proof.”

### 6. Add microservices because “scalable.”

### 7. Add complex RBAC before workflows are understood.

### 8. Import all legacy data without validation.

### 9. Treat every feedback as a feature.

### 10. Freeze everything before real usage.

---

# 97. SIMPLE TEST

Sebelum menambahkan implementation complexity:

```text
Why?
Who?
Workflow?
Information?
Context?
Trust?
Simpler way?
Future option?
```

Ini langsung berasal dari constitutional test. 

Jika tidak ada jawaban yang kuat:

> **Do not build it yet.**

---

# 98. IMPLEMENTATION TRACEABILITY

Setiap significant implementation harus dapat ditelusuri:

```text
Requirement
 ↓
Workflow
 ↓
Capability
 ↓
Domain
 ↓
Application Contract
 ↓
Implementation
 ↓
Test
```

Jika suatu feature tidak dapat ditelusuri:

> Pertanyakan apakah feature tersebut memang diperlukan.

---

# 99. ARCHITECTURAL HEALTH CHECK

Secara berkala kita harus dapat menjawab:

### Can a new developer understand it?

### Can we trace a school workflow through the system?

### Can we explain why a user can access specific information?

### Can we explain where business rules live?

### Can we change implementation without rewriting the product?

### Can the system evolve beyond TK?

Ini juga merupakan ukuran keberhasilan Technical Architecture. 

---

# 100. FINAL IMPLEMENTATION MODEL

Seluruh pembangunan TK Pilot dapat diringkas:

```text
             REAL SCHOOL
                  │
                  ▼
             REAL WORK
                  │
                  ▼
             WORKFLOW
                  │
                  ▼
             USE CASE
                  │
                  ▼
          AUTHORIZATION
                  │
                  ▼
               DOMAIN
                  │
                  ▼
            APPLICATION
                  │
                  ▼
                DATA
                  │
                  ▼
             INFRASTRUCTURE
                  │
                  ▼
              REAL USER
                  │
                  ▼
               EVIDENCE
                  │
                  ▼
              LEARNING
                  │
                  └──────────────┐
                                 ▼
                            IMPROVEMENT
```

---

# 101. THE FIRST THING WE BUILD

Bukan:

```text
Dashboard
```

Bukan:

```text
Admin Panel
```

Bukan:

```text
Student CRUD
```

Melainkan:

# **Teacher can successfully do meaningful work.**

Vertical slice:

```text
Teacher Login
      ↓
My Class
      ↓
Student
      ↓
Attendance
      ↓
Observation
      ↓
Save
      ↓
Review
```

---

# 102. FINAL PRINCIPLE

> **We are not building a school application.**
>
> **We are building the first working piece of Yapendik's long-term educational operating foundation.**

Karena itu TK Pilot harus:

**cukup kecil untuk dibangun,  
cukup nyata untuk digunakan,  
cukup aman untuk dipercaya,  
dan cukup sehat untuk berkembang.**

---

# 103. STATUS

**YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION SPECIFICATION**

**Version:** 0.1

**Status:** **LIVING — ACTIVE IMPLEMENTATION BASELINE**

**Authority:** Derived from Yapendik OS Constitution

**Scope:** TK Pilot

**Architecture:** Modular Monolith / Online-First

**Implementation Philosophy:**

> **Build → Use → Learn → Evolve**

**Primary Principle:**

> **Build the smallest useful vertical slice, validate it in real school work, and let evidence guide what comes next.**

---

# 104. IMPLEMENTATION STARTING POINT

Dengan dokumen ini, menurut saya **fase dokumentasi arsitektur utama sudah cukup**.

Kita sekarang mempunyai:

```text
01  CONSTITUTION
02  ENTERPRISE INFORMATION ARCHITECTURE
03  SCHOOL OS OPERATING MODEL
04  PRODUCT BLUEPRINT — TK PILOT
05  UX ARCHITECTURE
06  TECHNICAL ARCHITECTURE
07  WORKFLOW SPECIFICATION
08  AUTHORIZATION MODEL
09  DATA MODEL
10  DOMAIN & ENTITY SPECIFICATION
11  VALIDATED DOMAIN MODEL
12  DATABASE BLUEPRINT
13  API & APPLICATION CONTRACT
14  ★ IMPLEMENTATION SPECIFICATION ★
```

Dan titik berikutnya **bukan dokumen arsitektur baru**.

Titik berikutnya adalah:

```text
IMPLEMENTATION SPECIFICATION
          ↓
       ADRs yang memang diperlukan
          ↓
   REPOSITORY / PROJECT FOUNDATION
          ↓
       SPRINT 0
          ↓
   FIRST VERTICAL SLICE
          ↓
     REAL TK VALIDATION
```

Hal yang sangat penting: **kita tidak perlu menunggu seluruh 14 dokumen ini “frozen”.** Itu justru bertentangan dengan Constitution yang secara eksplisit menetapkan model *Living Constitution* dan *Build → Use → Learn → Evolve*. 

Jadi, **saya menyarankan kita berhenti membuat dokumen besar untuk sementara dan masuk ke Sprint 0 / technical foundation.** Baru ketika implementasi menemukan sesuatu yang belum benar-benar jelas—misalnya authentication provider, tenancy strategy, atau detail database—kita buat **ADR kecil yang spesifik**, bukan kembali membuat dokumen arsitektur besar.