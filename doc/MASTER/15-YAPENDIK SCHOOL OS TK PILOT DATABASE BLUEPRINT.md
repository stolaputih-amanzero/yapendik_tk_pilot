# YAPENDIK SCHOOL OS TK PILOT DATABASE BLUEPRINT

**Version:** 0.1  
**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System  
**Product:** School OS  
**Pilot Context:** TK / Early Childhood Education  
**Document Type:** Database Blueprint  
**Status:** **LIVING — DESIGN BASELINE**  
**Authority:** Derived from Yapendik OS Constitution  
**Approach:** Common Sense First  
**Database Philosophy:** **Make It Simple. Keep It Future-Proof.**

---

# 1. PURPOSE

Dokumen ini menerjemahkan:

```text
YAPENDIK OS CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
SCHOOL OS OPERATING MODEL
        ↓
PRODUCT BLUEPRINT
        ↓
TECHNICAL ARCHITECTURE
        ↓
VALIDATED DOMAIN MODEL
        ↓
★ DATABASE BLUEPRINT ★
```

menjadi **blueprint struktur data** yang dapat digunakan sebagai dasar implementasi database.

Database Blueprint menjawab:

> **Bagaimana informasi canonical School OS disimpan, dihubungkan, dilindungi, dan dipelihara?**

Dokumen ini belum merupakan:

- SQL migration;
- final ORM schema;
- vendor-specific implementation;
- API specification;
- production RLS policy;
- physical infrastructure specification.

Dokumen ini adalah **logical-to-physical design direction**.

---

# 2. DATABASE NORTH STAR

Database School OS harus:

```text
SIMPLE
   +
TRUSTWORTHY
   +
CONTEXT-AWARE
   +
SECURE
   +
AUDITABLE
   +
EVOLVABLE
```

Bukan:

```text
COMPLEX
   ↓
MANY TABLES
   ↓
MANY FEATURES
   ↓
MANY REPORTS
```

Ukuran keberhasilan database bukan jumlah tabel.

Ukuran keberhasilannya:

> **Apakah database mampu menjadi sumber informasi yang dapat dipercaya untuk pekerjaan sekolah?**

---

# 3. FUNDAMENTAL PRINCIPLE

Database harus mengikuti domain.

Bukan domain mengikuti database.

```text
REALITY
   ↓
DOMAIN
   ↓
RELATIONSHIP
   ↓
DATA MODEL
   ↓
DATABASE
```

Bukan:

```text
TABLE
   ↓
CRUD
   ↓
FEATURE
   ↓
USER
```

Hal ini konsisten dengan prinsip Constitution:

> **Workflow Before Feature**

dan:

> **Canonical Information — One concept must have one governed meaning.** 

---

# 4. DATABASE ARCHITECTURAL ASSUMPTIONS

Baseline saat ini:

### Database model

**Relational**

### Application architecture

**Modular Monolith**

### Deployment approach

**Online-First**

### Primary operational boundary

**School**

### Primary educational entity

**Student**

### Primary Teacher context

**Class**

### Authorization

**Server-enforced and context-aware**

Technical Architecture menyatakan relational model sebagai working assumption, dengan School sebagai primary operational context dan Student sebagai canonical educational entity. 

---

# 5. DATABASE BOUNDARY

Untuk TK Pilot:

```text
YAPENDIK OS
│
└── SCHOOL OS
    │
    └── TK PILOT DATABASE
        │
        ├── School
        ├── People
        ├── Students
        ├── Academic
        ├── Attendance
        ├── Learning
        ├── Observation
        ├── Development
        ├── Evidence
        ├── Communication
        └── Review
```

Database Pilot **tidak mencoba menjadi database seluruh Yapendik**.

Namun struktur harus tidak menghalangi ekspansi:

```text
TK
 ↓
SD
 ↓
SMP
 ↓
SMA
 ↓
Yapendik School OS
```

TK adalah pilot context, bukan architectural boundary. 

---

# 6. DATABASE DESIGN PRINCIPLES

## DB-01 — Canonical Identity

Satu manusia tidak boleh dibuat berulang hanya karena memiliki berbagai peran.

```text
Person
 ├── Teacher responsibility
 ├── Staff responsibility
 └── Guardian relationship
```

---

## DB-02 — Stable Identity

Identity harus tetap stabil meskipun:

- class berubah;
- academic year berubah;
- teacher berubah;
- responsibility berubah;
- enrollment berubah.

---

## DB-03 — Context Explicitness

Record operational harus memiliki context yang jelas.

Minimal:

```text
school
academic context
actor
time
```

sesuai kebutuhan domain.

---

## DB-04 — No Duplicate Truth

Jangan menyimpan fakta yang sama di banyak tempat jika dapat diturunkan secara reliable.

Contoh:

Jangan menyimpan:

```text
student.class_name
```

sebagai source of truth jika Class Placement sudah menjadi sumber canonical.

---

## DB-05 — History Matters

Relationship yang berubah harus dapat mempertahankan history apabila historical truth memiliki nilai operasional atau governance.

---

## DB-06 — Privacy by Design

Child information tidak boleh dapat diakses hanya karena seseorang dapat membaca database.

Access harus melalui:

```text
Identity
+
Role
+
Context
+
Relationship
+
Action
```

Constitution menetapkan privacy dan security sebagai prinsip arsitektural, bukan sekadar konfigurasi UI. 

---

## DB-07 — Auditability

Record penting harus dapat menjawab:

```text
WHO
DID WHAT
WHEN
TO WHAT
IN WHAT CONTEXT
```

---

## DB-08 — Derived Data Is Not Source of Truth

Dashboard, report, summary, dan insight tidak menggantikan canonical records.

---

# 7. DATABASE DOMAIN MAP

Logical schema:

```text
01 SCHOOL
02 PEOPLE
03 STUDENT
04 ACADEMIC
05 ATTENDANCE
06 LEARNING
07 OBSERVATION
08 DEVELOPMENT
09 EVIDENCE
10 COMMUNICATION
11 REVIEW
12 SYSTEM / GOVERNANCE
```

Domain boundaries tetap logical.

Tidak berarti setiap domain menjadi database atau service terpisah.

---

# 8. NAMING CONVENTION

Working convention:

```text
snake_case
```

Table:

```text
schools
people
students
academic_years
classes
enrollments
class_placements
attendance_records
learning_activities
observations
evidence_items
communications
```

Primary key:

```text
id
```

Foreign key:

```text
school_id
student_id
person_id
class_id
```

Timestamp:

```text
created_at
updated_at
```

Actor:

```text
created_by
updated_by
```

Naming convention ini merupakan **working convention**, bukan constitutional requirement.

---

# 9. ID STRATEGY

Default logical decision:

> Semua canonical entities menggunakan stable opaque identifiers.

Contoh:

```text
school.id
person.id
student.id
class.id
observation.id
```

Identifier tidak boleh memiliki business meaning.

Hindari:

```text
TK-A-001
2026-TKA-001
GURU-003
```

sebagai primary identity.

---

# 10. HUMAN IDENTITY MODEL

Core:

```text
people
```

Relationship/context:

```text
teacher_assignments
staff_assignments
guardian_relationships
```

Student:

```text
students
```

Dengan demikian:

```text
people
   │
   ├── teacher_assignments
   ├── staff_assignments
   └── guardian_relationships
```

dan:

```text
students
   │
   └── guardian_relationships
```

---

# 11. TABLE: schools

Purpose:

> Canonical identity untuk unit sekolah.

Conceptual fields:

```text
schools
---------
id
name
code
status
metadata
created_at
updated_at
```

### Required meaning

`id`

Stable school identity.

`name`

Institutional name.

`code`

Optional governed identifier.

`status`

Operational lifecycle.

`metadata`

Hanya digunakan untuk informasi yang benar-benar tidak layak menjadi canonical structured field.

**Rule:**

`metadata` bukan tempat menyembunyikan schema design yang belum selesai.

---

# 12. SCHOOL STATUS

Potential states:

```text
ACTIVE
INACTIVE
ARCHIVED
```

Exact lifecycle masih dapat berubah berdasarkan governance Yapendik.

---

# 13. TABLE: people

Purpose:

> Canonical human identity.

Conceptual fields:

```text
people
------
id
full_name
date_of_birth
contact_information
status
created_at
updated_at
```

Tidak semua field di atas otomatis menjadi MVP.

Data harus mengikuti:

> **Collect only what is needed.**

EIA menetapkan privacy boundary sebagai:

```text
COLLECT
 ↓
Only what is needed
 ↓
DEFINED PURPOSE
 ↓
AUTHORIZED USE
 ↓
PROTECTION
 ↓
APPROPRIATE RETENTION
```



---

# 14. PERSON CONTACT INFORMATION

Contact information harus diperlakukan sebagai information category yang memiliki privacy implications.

Jangan menganggap semua contact information public.

Access:

```text
Need
+
Purpose
+
Authorization
```

---

# 15. TABLE: students

Purpose:

> Canonical educational identity.

Conceptual fields:

```text
students
--------
id
person_id
student_number
status
created_at
updated_at
```

Hubungan `person_id` masih merupakan **working design decision** dan harus divalidasi terhadap realitas TK.

Reason:

> Person / Student identity ambiguity merupakan salah satu critical technical risk. 

---

# 16. STUDENT IDENTITY RULE

Student identity tidak boleh berubah karena:

```text
Academic Year
Class
Teacher
Enrollment
Guardian
```

Semua itu adalah relationship/context.

---

# 17. TABLE: academic_years

Purpose:

> Contextual period pendidikan.

Conceptual fields:

```text
academic_years
-------------
id
school_id
name
start_date
end_date
status
created_at
updated_at
```

Constraint:

```text
academic_year.school_id
→ schools.id
```

Exact overlap rules masih membutuhkan validation.

---

# 18. TABLE: classes

Purpose:

> Educational operating context.

Conceptual fields:

```text
classes
-------
id
school_id
academic_year_id
name
code
status
created_at
updated_at
```

Relationship:

```text
School
 ↓
Academic Year
 ↓
Class
```

UX Architecture menetapkan Class sebagai important Teacher workspace. 

---

# 19. CLASS CONTEXT RULE

Class tidak boleh hanya memiliki:

```text
name
```

tanpa context.

Minimal:

```text
school
+
academic_year
```

agar:

```text
TK A
```

tidak ambigu antar academic year.

---

# 20. TABLE: teacher_assignments

Purpose:

> Menghubungkan Person dengan responsibility sebagai Teacher dalam context tertentu.

Conceptual:

```text
teacher_assignments
-------------------
id
person_id
school_id
academic_year_id
class_id
role_type
start_date
end_date
status
created_at
updated_at
```

Relationship:

```text
Person
 ↓
Teacher Assignment
 ↓
Class
```

Ini lebih future-proof daripada menaruh:

```text
classes.teacher_id
```

sebagai satu-satunya source of truth.

Karena sebuah Class dapat memiliki lebih dari satu responsibility dalam periode berbeda.

---

# 21. TABLE: staff_assignments

Purpose:

> Contextual responsibility untuk staff.

Conceptual:

```text
staff_assignments
-----------------
id
person_id
school_id
role_type
start_date
end_date
status
created_at
updated_at
```

Tidak perlu membangun HR system penuh pada tahap ini.

---

# 22. TABLE: guardian_relationships

Purpose:

> Relationship antara Person dan Student.

Conceptual:

```text
guardian_relationships
----------------------
id
person_id
student_id
relationship_type
is_primary
start_date
end_date
status
created_at
updated_at
```

Contoh:

```text
Person
 ↓
Mother
 ↓
Student
```

Relationship harus menjadi basis authorization untuk Guardian.

---

# 23. TABLE: enrollments

Purpose:

> Representasi formal Student berada dalam School pada academic context tertentu.

Conceptual:

```text
enrollments
-----------
id
student_id
school_id
academic_year_id
enrollment_status
start_date
end_date
created_at
updated_at
```

Relationship:

```text
Student
 ↓
Enrollment
 ↓
School + Academic Year
```

---

# 24. ENROLLMENT RULE

Enrollment bukan Class.

```text
Enrollment
    ≠
Class Placement
```

Student dapat:

```text
enrolled
```

tanpa langsung mengasumsikan:

```text
current class
```

jika operational reality memang memungkinkan keadaan tersebut.

---

# 25. TABLE: class_placements

Purpose:

> Menentukan Student ditempatkan di Class mana dalam context tertentu.

Conceptual:

```text
class_placements
----------------
id
student_id
class_id
enrollment_id
start_date
end_date
status
created_at
updated_at
```

Relationship:

```text
Student
 ↓
Enrollment
 ↓
Class Placement
 ↓
Class
```

---

# 26. CLASS PLACEMENT HISTORY

Jika Student berpindah Class:

```text
Placement A
   ↓
end_date
   ↓
Placement B
```

Jangan overwrite historical record jika history tersebut memiliki operational value.

---

# 27. TABLE: attendance_records

Purpose:

> Record kehadiran Student.

Conceptual:

```text
attendance_records
------------------
id
student_id
class_id
school_id
academic_year_id
attendance_date
status
recorded_by
recorded_at
note
created_at
updated_at
```

Potential status:

```text
PRESENT
ABSENT
SICK
EXCUSED
LATE
```

Namun exact vocabulary harus divalidasi dengan TK pilot.

---

# 28. ATTENDANCE SOURCE OF TRUTH

Attendance harus mempunyai satu canonical operational record.

Dashboard:

```text
Present Today: 18
```

adalah projection.

Bukan source of truth.

---

# 29. TABLE: learning_activities

Purpose:

> Mencatat meaningful educational activity.

Conceptual:

```text
learning_activities
-------------------
id
school_id
academic_year_id
class_id
title
description
activity_date
created_by
created_at
updated_at
```

Belum memasukkan:

```text
curriculum_engine
competency_tree
complex scoring
```

karena belum divalidasi.

---

# 30. TABLE: learning_activity_participants

Jika sebuah Learning Activity melibatkan subset Student:

```text
learning_activity_participants
------------------------------
id
learning_activity_id
student_id
participation_status
created_at
```

Ini menjaga separation:

```text
Activity
```

dari:

```text
Student participation
```

---

# 31. TABLE: observations

Purpose:

> Contextual observation terhadap Student.

Conceptual:

```text
observations
------------
id
student_id
school_id
academic_year_id
class_id
observed_by
observation_date
context
content
follow_up
status
created_at
updated_at
```

---

# 32. OBSERVATION PRINCIPLE

Observation tidak otomatis menjadi:

```text
score
grade
diagnosis
assessment result
```

Observation harus mempertahankan human judgment dan context.

---

# 33. OBSERVATION CONTEXT

`context` harus memiliki tujuan.

Contoh conceptual contexts:

```text
LEARNING
SOCIAL
BEHAVIOR
ACTIVITY
COMMUNICATION
DEVELOPMENT
```

Namun vocabulary final harus melalui TK validation.

Jangan mengunci taxonomy terlalu dini.

---

# 34. TABLE: development_records

Purpose:

> Menyimpan meaningful developmental understanding yang telah ditetapkan berdasarkan observation/evidence.

Conceptual:

```text
development_records
-------------------
id
student_id
school_id
academic_year_id
class_id
area
summary
recorded_by
recorded_at
status
created_at
updated_at
```

---

# 35. DEVELOPMENT MODEL WARNING

Development adalah salah satu area yang **belum boleh dibuat terlalu rigid**.

Jangan langsung membuat:

```text
development_score
```

sebagai pusat schema.

Belum ada evidence bahwa scoring harus menjadi canonical model.

Product Blueprint menempatkan Student Development sebagai area penting, tetapi juga menegaskan TK Pilot bukan tempat untuk membangun seluruh educational/analytics complexity. 

---

# 36. TABLE: evidence_items

Purpose:

> Supporting evidence terhadap operational record.

Conceptual:

```text
evidence_items
--------------
id
school_id
student_id
record_type
record_id
storage_reference
file_type
description
captured_at
created_by
created_at
```

---

# 37. EVIDENCE RELATIONSHIP

Evidence dapat mendukung:

```text
Observation
Development Record
Learning Activity
```

Tetapi jangan membuat semua entity mempunyai arbitrary file attachment tanpa governance.

---

# 38. OBJECT STORAGE SEPARATION

Database tidak menyimpan binary media secara langsung sebagai canonical record.

Model:

```text
DATABASE
  │
  └── evidence metadata
           │
           ▼
      OBJECT STORAGE
           │
           ▼
       actual file
```

Technical Architecture menetapkan separation antara canonical relational information dan file/media storage. 

---

# 39. TABLE: communications

Purpose:

> Contextual communication record.

Conceptual:

```text
communications
--------------
id
school_id
sender_person_id
context_type
context_id
subject
content
status
sent_at
created_at
updated_at
```

Recipient dapat dimodelkan terpisah apabila communication mendukung multiple recipients.

---

# 40. TABLE: communication_recipients

```text
communication_recipients
------------------------
id
communication_id
recipient_person_id
read_at
response_status
```

Namun jika pilot menemukan bahwa communication jauh lebih sederhana, model ini dapat disederhanakan.

---

# 41. COMMUNICATION IS NOT CHAT BY DEFAULT

Database tidak boleh langsung dirancang sebagai:

```text
threads
messages
reactions
typing_status
presence
```

hanya karena communication diperlukan.

Kita mulai dari:

```text
Communication
+
Recipient
+
Context
+
Response
```

Complex messaging hanya dibangun jika real workflow membutuhkan.

---

# 42. TABLE: reviews

Purpose:

> Mencatat review terhadap context tertentu.

Conceptual:

```text
reviews
-------
id
school_id
academic_year_id
review_type
context_type
context_id
review_date
reviewed_by
summary
action
created_at
updated_at
```

Review bukan dashboard.

---

# 43. REVIEW VS REPORT

Database source:

```text
Canonical records
```

Review:

```text
human interpretation
```

Report:

```text
derived presentation
```

Insight:

```text
derived understanding
```

Keempatnya tidak boleh dicampur.

---

# 44. TABLE: audit_events

Purpose:

> Governance and traceability.

Conceptual:

```text
audit_events
------------
id
actor_person_id
school_id
action
entity_type
entity_id
occurred_at
metadata
```

Contoh:

```text
Teacher A
created
Observation #123
at
Class TK A
```

---

# 45. AUDIT VS BUSINESS HISTORY

Audit log:

> siapa melakukan apa.

Business history:

> bagaimana keadaan bisnis berubah.

Keduanya berbeda.

Contoh:

```text
Class Placement
```

menyimpan business history.

```text
Audit Event
```

menyimpan action history.

Jangan menggantikan satu dengan yang lain.

---

# 46. SYSTEM TABLES

Minimal system/governance domain:

```text
audit_events
system_settings
```

Potential future:

```text
notifications
integration_logs
import_jobs
```

Tidak semuanya perlu pada MVP.

---

# 47. COMPLETE LOGICAL SCHEMA

```text
SCHOOLS
   │
   ├── ACADEMIC_YEARS
   │       │
   │       └── CLASSES
   │
   ├── PEOPLE
   │       ├── TEACHER_ASSIGNMENTS
   │       ├── STAFF_ASSIGNMENTS
   │       └── GUARDIAN_RELATIONSHIPS
   │
   └── STUDENTS
           │
           ├── ENROLLMENTS
           │       │
           │       └── CLASS_PLACEMENTS
           │
           ├── ATTENDANCE_RECORDS
           │
           ├── LEARNING_ACTIVITY_PARTICIPANTS
           │
           ├── OBSERVATIONS
           │       │
           │       └── EVIDENCE_ITEMS
           │
           ├── DEVELOPMENT_RECORDS
           │       │
           │       └── EVIDENCE_ITEMS
           │
           └── COMMUNICATION_RELATIONSHIPS
```

---

# 48. RELATIONSHIP OVERVIEW

```text
School
 ├── AcademicYear
 │      └── Class
 │
 ├── Person
 │      ├── TeacherAssignment
 │      ├── StaffAssignment
 │      └── GuardianRelationship
 │
 └── Student
        ├── Enrollment
        ├── ClassPlacement
        ├── Attendance
        ├── Learning
        ├── Observation
        ├── Development
        ├── Evidence
        └── Communication
```

---

# 49. CORE FOREIGN KEY RULE

Foreign keys harus merepresentasikan business relationship yang valid.

Contoh:

```text
classes.school_id
→ schools.id
```

```text
enrollments.student_id
→ students.id
```

```text
observations.student_id
→ students.id
```

Database integrity harus mencegah orphan records.

---

# 50. CONTEXT INTEGRITY

Masalah yang harus dicegah:

```text
Student A
School A
Class B
```

ketika:

```text
Class B
belongs to
School B
```

Karena itu foreign key saja mungkin belum cukup.

Database dan application layer harus memastikan:

```text
student.school_context
=
class.school_context
```

sesuai workflow.

---

# 51. AVOID REDUNDANT CONTEXT

Pertanyaan penting:

Apakah setiap table harus menyimpan:

```text
school_id
academic_year_id
class_id
```

Jawaban:

> **Tidak selalu.**

Context disimpan jika diperlukan untuk:

- integrity;
- authorization;
- query efficiency;
- historical meaning;
- explicit ownership.

Jangan menyalin context hanya demi convenience.

---

# 52. DENORMALIZATION RULE

Default:

> **Normalize first.**

Denormalization hanya jika:

```text
real performance problem
+
measured evidence
+
clear consistency strategy
```

Bukan karena:

> "Nanti dashboard akan cepat."

---

# 53. JSON / METADATA RULE

JSON/metadata boleh digunakan untuk:

```text
truly flexible attributes
temporary discovery fields
provider-specific payload
future extension points
```

Tidak boleh digunakan untuk:

```text
students
classes
teachers
enrollments
attendance
observations
```

yang sebenarnya sudah merupakan canonical structured information.

---

# 54. DATABASE NORMALIZATION

Default target:

> Practical relational normalization.

Tidak mengejar theoretical perfection.

Tujuan:

```text
No unnecessary duplication
+
Clear relationships
+
Understandable queries
+
Maintainable changes
```

---

# 55. DELETE STRATEGY

Default untuk important educational records:

> **Do not physically delete historical information casually.**

Prefer:

```text
status
archived_at
deleted_at
```

sesuai kebutuhan domain.

Namun privacy requirements dapat mengharuskan deletion tertentu.

Maka deletion policy harus mempertimbangkan:

```text
Purpose
Retention
Legal / institutional requirement
Privacy
Audit
```

---

# 56. RETENTION PRINCIPLE

Tidak semua data harus disimpan selamanya.

Retention harus ditentukan berdasarkan:

```text
Why collected?
↓
How useful?
↓
How sensitive?
↓
How long needed?
↓
Who may access?
↓
When should it be archived/deleted?
```

EIA secara eksplisit menetapkan appropriate retention sebagai bagian privacy boundary. 

---

# 57. CHILD DATA PROTECTION

Student data harus diperlakukan sebagai protected information.

Database architecture harus memastikan:

```text
Student Data
      ↓
Context Boundary
      ↓
Authorization
      ↓
Allowed Purpose
      ↓
Access
```

Bukan:

```text
Logged In
↓
Can Read Student Data
```

---

# 58. RLS / SERVER AUTHORIZATION DIRECTION

Technical Architecture menetapkan server-enforced authorization sebagai mandatory direction. 

Database security harus mendukung:

```text
School boundary
+
Role boundary
+
Relationship boundary
+
Action boundary
```

Implementasi exact RLS belum menjadi bagian blueprint ini.

---

# 59. EXAMPLE AUTHORIZATION QUERY

Teacher melihat Student:

```text
Teacher
 ↓
Teacher Assignment
 ↓
Class
 ↓
Class Placement
 ↓
Student
```

Jika relationship tersebut tidak valid:

> access denied.

Ini jauh lebih aman daripada:

```text
role = teacher
→
all students
```

---

# 60. GUARDIAN ACCESS

Guardian:

```text
Person
 ↓
Guardian Relationship
 ↓
Student
```

Guardian hanya mendapatkan governed projection dari Student information.

Tidak otomatis mendapatkan:

```text
internal observations
internal staff notes
internal leadership review
```

kecuali memang ditentukan sebagai information yang boleh dibagikan.

Guardian experience memang harus dimulai dari Student → relevant school information → action/response. 

---

# 61. YAPENDIK ACCESS

Future Yapendik visibility tidak berarti:

```text
Yapendik
 ↓
SELECT *
FROM school_database
```

Model:

```text
School Data
   ↓
Governed Projection
   ↓
Yapendik Insight
```

EIA menetapkan bahwa Foundation memperoleh governed information, bukan otomatis seluruh detail School. 

---

# 62. PUBLIC DATA BOUNDARY

Public Experience:

```text
Database
   ✕
```

Tidak boleh direct access.

Model:

```text
Internal Data
     ↓
Governed Projection
     ↓
Public Experience
```

Ini merupakan explicit EIA principle. 

---

# 63. INDEXING STRATEGY

Index berdasarkan workflow nyata.

Prioritas:

```text
students
classes
enrollments
class_placements
attendance_records
observations
```

Typical lookup:

```text
student by school
students by class
student attendance by date
student observations by date
class students
teacher assignments
guardian → student
```

Jangan membuat index untuk setiap column.

---

# 64. UNIQUE CONSTRAINTS

Potential logical uniqueness:

```text
school.code
```

```text
academic_year(school_id, name)
```

```text
class(school_id, academic_year_id, code)
```

```text
guardian_relationship(person_id, student_id, relationship_type)
```

Exact constraints harus disesuaikan setelah reality validation.

---

# 65. TRANSACTION BOUNDARIES

Transaction harus mengikuti meaningful business action.

Contoh:

```text
Create Student
+
Enrollment
```

dapat menjadi satu business transaction jika workflow memang mengharuskannya.

Namun:

```text
Create Student
+
Create Attendance
+
Create Observation
+
Send Guardian Message
```

tidak boleh dipaksakan menjadi satu transaction.

---

# 66. CONCURRENCY

MVP tidak membutuhkan distributed transaction architecture.

Database harus tetap mampu menangani:

```text
Two teachers
recording information
at similar time
```

dengan integrity constraints yang jelas.

Application layer menangani user experience.

Database menjaga correctness.

---

# 67. AUDIT REQUIREMENTS

Minimum audited operations:

```text
Create
Update
Delete / Archive
Permission-sensitive access
```

Untuk record tertentu:

```text
Observation
Development
Guardian communication
Student identity
Enrollment
Class placement
```

auditability lebih penting.

---

# 68. DATA PROVENANCE

Untuk important information, database harus mampu menjawab:

```text
WHO CREATED IT?
WHEN?
IN WHAT CONTEXT?
FROM WHAT WORKFLOW?
```

Evidence dan institutional knowledge harus mempertahankan provenance. EIA secara eksplisit menyebut ownership, provenance, access boundaries, dan human judgment sebagai hal yang tidak boleh hilang saat knowledge dikonsolidasikan. 

---

# 69. DATA QUALITY

Basic database quality rules:

```text
Required fields
Foreign keys
Unique constraints
Valid statuses
Valid dates
Context consistency
Audit metadata
```

Data quality bukan hanya tugas user.

Database harus membantu mencegah invalid state.

---

# 70. INVALID STATE EXAMPLES

Database/application harus mencegah:

```text
Observation → unknown Student
```

```text
Attendance → non-existing Class
```

```text
Placement → Class from another School
```

```text
Teacher Assignment → unrelated Person
```

```text
Guardian → non-existing Student
```

---

# 71. MIGRATION PRINCIPLE

School OS kemungkinan akan menggantikan atau coexist dengan:

- spreadsheet;
- paper;
- local records;
- existing applications.

Migration harus mengikuti:

```text
DISCOVER
 ↓
MAP
 ↓
CLEAN
 ↓
VALIDATE
 ↓
IMPORT
 ↓
VERIFY
 ↓
ARCHIVE SOURCE
```

Jangan:

```text
Spreadsheet
 ↓
Direct dump
 ↓
Production
```

---

# 72. LEGACY DATA

Legacy data tidak otomatis menjadi canonical data.

Setiap imported record harus memiliki provenance:

```text
source
imported_at
import_batch
```

jika migration dilakukan.

---

# 73. SEED DATA

Development/test seed:

```text
School
Academic Year
Class
Teacher
Student
Guardian
```

harus jelas sebagai:

```text
TEST DATA
```

dan tidak boleh tercampur dengan production data.

---

# 74. TEST DATABASE

Testing harus mencakup:

### Identity

```text
same person ≠ duplicate identity
```

### Context

```text
cross-school access blocked
```

### Relationship

```text
guardian sees only related student
```

### History

```text
class placement preserves expected history
```

### Security

```text
unauthorized observation access denied
```

---

# 75. DATABASE TEST PYRAMID

```text
                    E2E
                     ▲
                    / \
                   /   \
             Integration
                 ▲
                / \
               /   \
           Domain Tests
              ▲
             / \
            /   \
       Database Constraints
```

Database correctness tidak boleh hanya diuji melalui UI.

---

# 76. BACKUP PRINCIPLE

Database harus memiliki:

```text
Automated Backup
+
Recovery Procedure
+
Recovery Testing
```

Backup yang tidak pernah diuji bukan recovery strategy.

Exact provider dan infrastructure belum diputuskan.

---

# 77. OBSERVABILITY

Minimal database observability:

```text
availability
latency
error rate
connection usage
storage
backup status
```

Application observability:

```text
failed transactions
authorization failures
data validation failures
```

---

# 78. PERFORMANCE PRINCIPLE

Tidak ada target premature seperti:

```text
10 million students
```

untuk TK Pilot.

Performance target harus mengikuti real workload.

Initial priority:

```text
Correctness
>
Security
>
Maintainability
>
Usability
>
Performance optimization
```

---

# 79. SCALING STRATEGY

Future scaling:

```text
Single School
      ↓
Multiple Schools
      ↓
Yapendik-wide School OS
      ↓
Larger Educational Network
```

Architecture harus memungkinkan multi-school tanpa mengharuskan microservices.

---

# 80. MULTI-SCHOOL MODEL

School adalah primary operational boundary.

Model:

```text
schools
   │
   ├── school A
   ├── school B
   └── school C
```

Canonical entities yang school-owned harus memiliki clear relationship terhadap School.

---

# 81. TENANCY PRINCIPLE

Untuk current phase:

> **Logical school isolation is mandatory.**

Physical database separation antar-school belum diperlukan tanpa evidence.

Default:

```text
Shared database
+
explicit school ownership
+
strong authorization
```

Ini lebih sederhana dan konsisten dengan modular monolith direction.

---

# 82. FUTURE FOUNDATION OS

Foundation OS dapat membaca:

```text
Governed School Projections
```

tanpa membutuhkan seluruh operational schema.

Dengan demikian:

```text
School Database
      ↓
Projection Layer
      ↓
Foundation
```

bukan:

```text
Foundation
 ↓
Directly query every operational table
```

---

# 83. REPORTING DATA

MVP:

> query/projection dari operational database cukup.

Tidak perlu langsung:

```text
Data Warehouse
Data Lake
Analytics Cluster
```

Technical Architecture secara eksplisit menunda data warehouse, data lake, advanced BI, dan dedicated search infrastructure. 

---

# 84. DASHBOARD DATA

Dashboard merupakan:

```text
Projection
```

bukan canonical entity.

Contoh:

```text
Today's Attendance
```

diperoleh dari:

```text
attendance_records
```

bukan tabel:

```text
dashboard_attendance
```

kecuali performance evidence nantinya benar-benar membutuhkan materialization.

---

# 85. INSIGHT DATA

Insight pada tahap awal sebaiknya:

```text
derived at query/service layer
```

bukan langsung menjadi permanent database entity.

Permanent insight storage baru dipertimbangkan jika:

- human-reviewed;
- needs historical preservation;
- needs workflow;
- has governance value.

---

# 86. SEARCH

MVP tidak memerlukan dedicated search engine.

Database search cukup untuk:

```text
student name
person name
class
student number
```

Dedicated search hanya jika workload membuktikan kebutuhan.

---

# 87. FILE STORAGE

Object storage digunakan untuk:

```text
photos
documents
work samples
attachments
```

Database menyimpan:

```text
metadata
ownership
relationship
storage reference
access context
```

---

# 88. SECURITY LAYERS

Database security:

```text
Authentication
      ↓
Authorization
      ↓
Context Validation
      ↓
Database Policy
      ↓
Data Access
```

Client UI tidak boleh menjadi security boundary.

Technical Architecture menegaskan security harus enforced beyond the client. 

---

# 89. SECRET DATA

Database credentials:

> never exposed to browser.

Sensitive configuration:

> server-side only.

Object storage private assets:

> accessed through controlled mechanism.

---

# 90. SENSITIVE RECORDS

Potentially sensitive:

```text
Student personal information
Observation
Development
Guardian information
Internal communication
Staff information
```

Access harus lebih restrictive daripada generic school information.

---

# 91. DATA CLASSIFICATION

Initial classification:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
SENSITIVE
```

Potential classification:

| Data | Classification |
|---|---|
| School public name | PUBLIC / INTERNAL |
| Class structure | INTERNAL |
| Person contact | CONFIDENTIAL |
| Student identity | SENSITIVE |
| Student observation | SENSITIVE |
| Development record | SENSITIVE |
| Internal staff notes | SENSITIVE |
| Audit events | CONFIDENTIAL |

Exact classification policy harus dikonfirmasi dengan governance Yapendik.

---

# 92. DATABASE ANTI-PATTERNS

Jangan membangun:

```text
users_everything
school_data
student_data
```

sebagai generic dumping tables.

Jangan:

```text
one table per screen
```

Jangan:

```text
one table per report
```

Jangan:

```text
JSON for everything
```

Jangan:

```text
duplicate student master
```

Jangan:

```text
business logic entirely inside database triggers
```

tanpa alasan yang kuat.

---

# 93. ANTI-PATTERN: TABLE-DRIVEN UX

Database:

```text
observations
```

tidak berarti UI harus memiliki menu:

```text
Observations
```

UX Architecture secara eksplisit melarang menu yang dibentuk berdasarkan database tables. 

Database mengikuti domain.

UX mengikuti work.

---

# 94. ANTI-PATTERN: PREMATURE PEDAGOGICAL MODEL

Jangan langsung membuat:

```text
curriculum
competency
indicator
assessment
score
rubric
```

dalam bentuk kompleks sebelum reality validation.

Development dan Observation merupakan area penting, tetapi masih membutuhkan field validation.

---

# 95. ANTI-PATTERN: EVERYTHING IS HISTORY

Tidak semua perubahan harus menghasilkan immutable event stream.

Gunakan history ketika:

```text
historical state matters
```

Gunakan audit ketika:

```text
action trace matters
```

Gunakan current state ketika:

```text
only current truth matters
```

---

# 96. DATABASE LIFECYCLE

Model:

```text
DESIGN
 ↓
MIGRATION
 ↓
SEED
 ↓
TEST
 ↓
PILOT
 ↓
OBSERVE
 ↓
LEARN
 ↓
REVISE
```

Database bukan sesuatu yang selesai ketika migration pertama berhasil.

---

# 97. IMPLEMENTATION ORDER

Database implementation disarankan:

```text
01. Schools
02. People
03. Students
04. Academic Years
05. Classes
06. Responsibilities
07. Guardians
08. Enrollment
09. Class Placement
10. Attendance
11. Learning
12. Observation
13. Development
14. Evidence
15. Communication
16. Review
17. Audit / Governance
```

Urutan mengikuti dependency.

---

# 98. PHASE 1 — FOUNDATION

Build:

```text
schools
people
students
academic_years
classes
```

Acceptance:

```text
School exists
People exist
Student identity exists
Academic context exists
Class exists
```

---

# 99. PHASE 2 — RELATIONSHIPS

Build:

```text
teacher_assignments
staff_assignments
guardian_relationships
enrollments
class_placements
```

Acceptance:

```text
Who?
Belongs where?
Responsible for what?
Related to whom?
```

dapat dijawab dengan reliable data.

---

# 100. PHASE 3 — DAILY SCHOOL

Build:

```text
attendance_records
learning_activities
learning_activity_participants
```

Acceptance:

> Teacher dapat menjalankan daily work tanpa duplicate entry yang tidak perlu.

---

# 101. PHASE 4 — EDUCATIONAL UNDERSTANDING

Build:

```text
observations
development_records
evidence_items
```

Acceptance:

> School dapat mempertahankan meaningful educational context.

---

# 102. PHASE 5 — COMMUNICATION & REVIEW

Build:

```text
communications
communication_recipients
reviews
```

Acceptance:

> Information dapat bergerak dari operational record menuju communication dan review secara terkontrol.

---

# 103. PHASE 6 — INSIGHT

Hanya setelah operational data cukup trustworthy:

```text
reports
projections
basic insights
```

Tidak perlu dedicated analytics infrastructure.

---

# 104. MVP DATABASE

Core MVP:

```text
schools
people
students
academic_years
classes
teacher_assignments
guardian_relationships
enrollments
class_placements
attendance_records
learning_activities
observations
```

Potential Phase 2:

```text
development_records
evidence_items
communications
reviews
```

---

# 105. WHAT IS DELIBERATELY NOT IN MVP DATABASE

Belum diperlukan:

```text
finance
payments
payroll
full HR
inventory ERP
procurement
advanced analytics
AI
data warehouse
data lake
event mesh
microservices infrastructure
offline sync database
```

Constitution dan Technical Architecture secara eksplisit menempatkan area-area tersebut di luar current MVP boundary.  

---

# 106. DATABASE READINESS TEST

Sebelum schema dianggap siap implementation, harus dapat menjawab:

### Identity

```text
Siapa orang ini?
```

### Context

```text
Dia berada di sekolah mana?
Academic year mana?
Class mana?
```

### Relationship

```text
Apa hubungan orang tersebut dengan Student?
```

### Work

```text
Apa yang dilakukan?
```

### Information

```text
Apa yang dicatat?
```

### Evidence

```text
Apa dasar informasinya?
```

### Governance

```text
Siapa yang boleh melihat/mengubah?
```

### History

```text
Apa yang terjadi sebelumnya?
```

---

# 107. DATABASE QUALITY GATE

Database blueprint dapat masuk implementation apabila:

```text
[ ] Canonical identity defined
[ ] School boundary defined
[ ] Student identity defined
[ ] Academic context defined
[ ] Class relationship defined
[ ] Enrollment defined
[ ] Placement defined
[ ] Core operational records defined
[ ] Privacy boundaries defined
[ ] Authorization relationships defined
[ ] Audit direction defined
[ ] Migration strategy defined
[ ] Backup direction defined
```

---

# 108. OPEN QUESTIONS

Hal yang masih harus divalidasi:

```text
1. Person ↔ Student exact identity model
2. Academic Year actual school workflow
3. Class structure in TK reality
4. Teacher assignment model
5. Guardian relationship model
6. Enrollment lifecycle
7. Attendance vocabulary
8. Observation workflow
9. Development model
10. Evidence lifecycle
11. Communication workflow
12. Retention requirements
13. Exact data classification
14. Exact authentication architecture
15. Exact database provider
```

Technical Architecture memang mencatat beberapa pertanyaan ini sebagai open technical questions dan menegaskan bahwa tidak semuanya perlu dijawab sekaligus. 

---

# 109. IMPORTANT: THIS IS NOT FROZEN

Status:

> **LIVING — DESIGN BASELINE**

Database Blueprint boleh berubah jika:

```text
Field Validation
      ↓
New Evidence
      ↓
Domain Model Change
      ↓
Database Model Change
```

Jangan mempertahankan schema hanya karena migration sudah pernah dibuat.

---

# 110. CHANGE GOVERNANCE

Perubahan significant mengikuti:

```text
Finding
 ↓
Evidence
 ↓
Impact Analysis
 ↓
Domain Review
 ↓
Database Decision
 ↓
Migration Plan
 ↓
Implementation
 ↓
Validation
```

Ini mengikuti governance model Constitution:

```text
Proposal
 ↓
Impact Analysis
 ↓
Review
 ↓
Decision
 ↓
Documentation
 ↓
Affected Documents Review
```



---

# 111. TRACEABILITY

Setiap major table harus dapat ditelusuri:

```text
Constitution Principle
        ↓
Domain
        ↓
Entity
        ↓
Workflow
        ↓
Database Structure
```

Contoh:

```text
C-04 Child-Centered Education
        ↓
Student Domain
        ↓
Student
        ↓
Student Observation Workflow
        ↓
observations
```

---

# 112. DATABASE TRACEABILITY MATRIX

| Database Concept | Domain | Primary Purpose |
|---|---|---|
| schools | School | Operational boundary |
| people | People | Canonical human identity |
| students | Student | Educational identity |
| academic_years | Academic | Educational context |
| classes | Academic | Teacher/class context |
| teacher_assignments | People/Academic | Responsibility |
| guardian_relationships | People/Student | Relationship |
| enrollments | Student/Academic | School membership |
| class_placements | Academic/Student | Class context |
| attendance_records | Attendance | Daily operation |
| learning_activities | Learning | Educational work |
| observations | Observation | Educational understanding |
| development_records | Development | Development understanding |
| evidence_items | Evidence | Supporting evidence |
| communications | Communication | Information exchange |
| reviews | Review | Human interpretation |
| audit_events | Governance | Traceability |

---

# 113. FINAL LOGICAL ARCHITECTURE

```text
                         YAPENDIK
                            │
                            ▼
                         SCHOOL
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          PEOPLE        ACADEMIC        STUDENTS
             │              │              │
       ┌─────┼─────┐        │        ┌─────┼──────────────┐
       ▼     ▼     ▼        ▼        ▼     ▼              ▼
    Teacher Staff Guardian Year     Enrollment Placement Attendance
                       │       │
                       └── Class
                              │
                              ▼
                           LEARNING
                              │
                              ▼
                         OBSERVATION
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
                 EVIDENCE         DEVELOPMENT
                     │                 │
                     └────────┬────────┘
                              ▼
                        COMMUNICATION
                              │
                              ▼
                            REVIEW
                              │
                              ▼
                           INSIGHT
```

---

# 114. DATABASE PHILOSOPHY

Database School OS harus mencerminkan:

```text
REALITY
  ↓
PEOPLE
  ↓
RELATIONSHIPS
  ↓
WORK
  ↓
INFORMATION
  ↓
CONTEXT
  ↓
TRUST
```

Bukan:

```text
FEATURE
 ↓
TABLE
 ↓
CRUD
```

---

# 115. FINAL ARCHITECTURAL PRINCIPLE

> **The database is the memory of the School OS, not the definition of the school itself.**

Database menyimpan apa yang perlu dipelihara.

Database tidak boleh menentukan bagaimana sekolah harus mendidik.

---

# 116. NEXT LAYER

Dengan dokumen ini, architecture chain kita sekarang menjadi:

```text
YAPENDIK OS CONSTITUTION
          ↓
ENTERPRISE INFORMATION ARCHITECTURE
          ↓
SCHOOL OS OPERATING MODEL
          ↓
PRODUCT BLUEPRINT — TK PILOT
          ↓
UX ARCHITECTURE
          ↓
TECHNICAL ARCHITECTURE
          ↓
WORKFLOW SPECIFICATION
          ↓
AUTHORIZATION MODEL
          ↓
DATA MODEL
          ↓
DOMAIN & ENTITY SPECIFICATION
          ↓
REALITY VALIDATION
          ↓
VALIDATED DOMAIN MODEL
          ↓
★ DATABASE BLUEPRINT ★
```

Dan sekarang **kita sudah cukup matang untuk mulai masuk ke implementation layer**, tetapi saya **tidak menyarankan langsung membuat SQL schema**.

Langkah berikutnya yang paling masuk akal adalah:

# `YAPENDIK SCHOOL OS TK PILOT API & APPLICATION CONTRACT`

Karena setelah kita tahu:

```text
WHAT DATA EXISTS
        ↓
WHO OWNS IT
        ↓
WHO MAY ACCESS IT
        ↓
WHAT WORKFLOWS USE IT
```

kita perlu menentukan:

```text
HOW THE APPLICATION
READS / CREATES / UPDATES
THAT INFORMATION
```

Barulah setelah itu **Implementation Blueprint → actual repository → migrations → application code**.

Ini juga menjaga keputusan Technical Architecture bahwa API harus mengikuti **domain dan use case**, bukan sekadar mengekspos database tables. Dan kita tetap konsisten dengan prinsip Constitution: **Build → Use → Learn → Evolve**, bukan menunggu seluruh arsitektur sempurna sebelum mulai membangun. 