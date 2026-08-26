# YAPENDIK SCHOOL OS TK PILOT DATA MODEL

Versi: 0.1  
Organisasi: Yayasan Pendidikan GPIB (Yapendik)  
Sistem: Yapendik Operating System  
Produk: School OS  
Pilot: TK  
Jenis Dokumen: Conceptual Data Model  
Status: **LIVING — DISCOVERY**  
Pendekatan: **Common Sense First**  
Prinsip: **Make It Simple. Keep It Future-Proof.**

---

# 1. TUJUAN DOKUMEN

Dokumen ini mendefinisikan model informasi konseptual yang menjadi dasar School OS TK Pilot.

Dokumen menjawab:

> **Informasi apa yang harus ada, apa arti setiap informasi, bagaimana informasi saling berhubungan, siapa pemilik konteksnya, bagaimana lifecycle-nya, dan bagaimana model tersebut mendukung workflow serta authorization.**

Dokumen ini **bukan**:

- physical database schema;
- SQL migration;
- ERD final;
- API specification;
- RLS implementation;
- UI data model;
- reporting warehouse;
- analytics model.

Tujuannya adalah memastikan bahwa ketika nanti database dibuat:

> **database merepresentasikan business reality, bukan sebaliknya.**

---

# 2. LANDASAN

Model ini diturunkan dari:

```text
YAPENDIK OS CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
SCHOOL OS OPERATING MODEL
        ↓
PRODUCT BLUEPRINT
        ↓
UX ARCHITECTURE
        ↓
WORKFLOW SPECIFICATION
        ↓
AUTHORIZATION MODEL
        ↓
DATA MODEL
```

Constitution menetapkan **Canonical Information**:

> Satu konsep harus memiliki satu governed meaning. 

Karena itu Data Model tidak boleh membuat beberapa representasi berbeda untuk konsep yang sama hanya karena digunakan oleh workflow berbeda.

---

# 3. DATA MODEL PRINCIPLES

## D-01 — Canonical Identity

Satu entitas nyata harus memiliki satu canonical identity.

Contoh:

```text
Person
```

tidak dibuat ulang sebagai:

```text
TeacherPerson
GuardianPerson
StaffPerson
```

jika sebenarnya semuanya merupakan orang yang sama.

---

## D-02 — Context Matters

Data tanpa context dapat kehilangan makna.

Contoh:

```text
Student
```

belum cukup.

Kita juga perlu mengetahui:

```text
School
Academic Year
Class
Enrollment
```

UX Architecture menetapkan canonical context:

```text
YAPENDIK
 ↓
SCHOOL
 ↓
ACADEMIC YEAR
 ↓
CLASS
 ↓
STUDENT
```



---

## D-03 — Relationship Is Data

Relationship bukan sekadar technical foreign key.

Contoh:

```text
Guardian
 ↓
Guardian Relationship
 ↓
Student
```

Relationship tersebut memiliki business meaning dan dapat menjadi dasar authorization.

---

## D-04 — History Matters

Informasi pendidikan berubah.

Maka:

> current state tidak selalu cukup.

Contoh:

Student berpindah Class.

Kita tidak cukup hanya menyimpan:

```text
student.class_id = TK B
```

karena kita kehilangan:

> sebelumnya berada di TK A kapan?

Karena itu placement / enrollment harus mempertimbangkan history.

---

## D-05 — Separate Identity From Role

Person:

> siapa orangnya.

Responsibility:

> apa perannya.

Context:

> di mana dan kapan responsibility tersebut berlaku.

---

## D-06 — Separate Canonical Information From Evidence

Model:

```text
Canonical Information
        +
Operational Record
        +
Evidence
```

Product Blueprint secara eksplisit membedakan ketiganya. 

---

## D-07 — Human Judgment Is Not Fully Structured

Observation dan development tidak boleh dipaksa menjadi angka semata.

Constitution mengingatkan:

> observation bukan keseluruhan perkembangan. 

Data model harus memberikan ruang bagi professional judgment.

---

## D-08 — Capture Once

Informasi yang sudah tersedia tidak boleh diminta ulang tanpa alasan.

Maka entity harus reusable oleh berbagai workflow.

---

## D-09 — Ownership Is Explicit

Setiap informasi penting harus dapat diketahui:

```text
Who owns it?
Who created it?
In what context?
Who may change it?
```

---

## D-10 — Future Without Premature Complexity

Data model harus mampu berkembang ke SD/SMP/SMA tanpa membuat TK Pilot menjadi enterprise ERP.

---

# 4. CORE DATA MODEL

Secara konseptual:

```text
                         YAPENDIK
                            │
                            ▼
                          SCHOOL
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        ACADEMIC YEAR     PEOPLE          CLASS
             │              │              │
             │              │              │
             │        ┌─────┴─────┐        │
             │        ▼           ▼        │
             │      PERSON    RESPONSIBILITY
             │        │                  │
             │        ▼                  │
             │     GUARDIAN              │
             │        │                  │
             └────────┼──────────────────┘
                      ▼
                   STUDENT
                      │
                      ▼
                  ENROLLMENT
                      │
                      ▼
                 CLASS PLACEMENT
                      │
          ┌───────────┼────────────┐
          ▼           ▼            ▼
      ATTENDANCE   LEARNING   OBSERVATION
                                    │
                                    ▼
                               DEVELOPMENT
                                    │
                                    ▼
                                  EVIDENCE
                                    │
                                    ▼
                              COMMUNICATION
```

Ini adalah **conceptual relationship map**, bukan physical ERD.

---

# 5. DOMAIN GROUPS

Untuk TK Pilot, entity dikelompokkan menjadi:

```text
01. Institutional
02. People & Identity
03. Academic Context
04. Student Lifecycle
05. Daily School Work
06. Learning & Observation
07. Development
08. Evidence
09. Communication
10. Review
```

---

# 6. DOMAIN 01 — INSTITUTIONAL

Core entities:

```text
School
```

Future:

```text
Yapendik Organization
School Unit
Campus
Location
```

Untuk TK Pilot kita mulai sederhana.

---

# 7. SCHOOL

School adalah unit pendidikan tempat School OS beroperasi.

Conceptual attributes:

```text
School
├── identity
├── name
├── code
├── status
├── contact information
├── location
└── governance metadata
```

Tidak semua attribute di atas otomatis menjadi MVP.

---

# 8. SCHOOL IDENTITY

School harus memiliki canonical identity yang stabil.

Contoh:

```text
School A
```

tidak boleh berubah menjadi identity baru hanya karena:

- nama berubah;
- kepala sekolah berubah;
- tahun akademik berubah.

Identity harus bertahan sepanjang lifecycle School.

---

# 9. SCHOOL OWNERSHIP

School memiliki institutional context.

Semua data operational TK Pilot harus dapat ditelusuri kembali ke School.

Pattern:

```text
School
 ↓
Operational Data
```

atau melalui relationship yang valid:

```text
School
 ↓
Class
 ↓
Student
 ↓
Attendance
```

---

# 10. DOMAIN 02 — PEOPLE & IDENTITY

Core entities:

```text
Person
Teacher
Staff
Guardian
Responsibility / Assignment
```

Namun perlu diperhatikan:

> Teacher, Staff, dan Guardian tidak harus menjadi tiga identity manusia yang berbeda.

Canonical human identity adalah:

```text
Person
```

---

# 11. PERSON

Person adalah canonical representation of a human being.

Conceptual:

```text
Person
├── identity
├── name
├── contact
├── demographic information
└── lifecycle metadata
```

Detail personal information akan ditentukan berdasarkan kebutuhan nyata.

---

# 12. PERSON IDENTITY PRINCIPLE

Jika satu orang:

```text
Teacher
+
Guardian
```

maka model seharusnya memungkinkan:

```text
Person X
 ├── Teacher responsibility
 └── Guardian relationship
```

bukan:

```text
Teacher X
Guardian X
```

sebagai dua manusia berbeda.

---

# 13. TEACHER

Teacher adalah responsibility / role yang diberikan kepada Person dalam educational context.

Conceptually:

```text
Person
 ↓
Teacher Responsibility
 ↓
School
 ↓
Academic Year
 ↓
Class
```

Jika implementasi nantinya membutuhkan `Teacher` sebagai entity tersendiri, ia tetap harus mereferensikan canonical Person.

---

# 14. STAFF

Staff mengikuti prinsip yang sama.

```text
Person
 ↓
Staff Responsibility
 ↓
School
```

Staff tidak perlu menjadi duplicate identity.

---

# 15. GUARDIAN

Guardian juga merupakan Person yang memiliki relationship terhadap Student.

```text
Person
 ↓
Guardian Relationship
 ↓
Student
```

Guardian relationship adalah entity penting.

---

# 16. GUARDIAN RELATIONSHIP

Jangan hanya menyimpan:

```text
student.guardian_id
```

karena hubungan dapat memiliki:

- jenis relationship;
- status;
- primary/non-primary;
- start/end;
- communication permission;
- legal / administrative meaning.

Conceptual:

```text
Guardian Relationship
├── Person
├── Student
├── relationship type
├── status
├── effective period
└── communication permissions
```

Detail final masih discovery.

---

# 17. RESPONSIBILITY / ASSIGNMENT

Untuk menghubungkan Person dengan operational responsibility:

```text
Person
 ↓
Responsibility / Assignment
 ↓
Context
```

Contoh:

```text
Teacher A
 ↓
Teacher Assignment
 ↓
School A
 ↓
Academic Year 2026/2027
 ↓
Class TK B
```

Assignment menjadi salah satu fondasi authorization.

---

# 18. DOMAIN 03 — ACADEMIC CONTEXT

Core entities:

```text
Academic Year
Class
Teacher Assignment
```

---

# 19. ACADEMIC YEAR

Academic Year adalah temporal context untuk kegiatan sekolah.

Contoh:

```text
2026/2027
```

Academic Year bukan attribute yang ditempel sembarangan ke setiap table.

Ia harus menjadi canonical context.

---

# 20. ACADEMIC YEAR ATTRIBUTES

Conceptual:

```text
Academic Year
├── identity
├── label
├── start date
├── end date
├── status
└── School context
```

---

# 21. CLASS

Class adalah educational grouping dalam School dan Academic Year.

Conceptual:

```text
Class
├── identity
├── name
├── School
├── Academic Year
├── status
└── metadata
```

Contoh:

```text
School A
 ↓
2026/2027
 ↓
TK B
```

---

# 22. CLASS IS NOT STUDENT

Class adalah grouping.

Student adalah Person/child-related canonical entity.

Jangan menggabungkan keduanya.

---

# 23. CLASS IS NOT TEACHER

Teacher memiliki responsibility terhadap Class.

Relationship:

```text
Teacher
 ↓
Assignment
 ↓
Class
```

Bukan:

```text
Class.teacher_id
```

sebagai satu-satunya model, karena seorang Class dapat memiliki lebih dari satu educator/responsibility sepanjang waktu.

---

# 24. DOMAIN 04 — STUDENT LIFECYCLE

Core entities:

```text
Student
Enrollment
Class Placement
```

---

# 25. STUDENT

Student adalah canonical educational subject.

Student bukan sekadar:

```text
Person
```

karena educational context membutuhkan information tambahan.

Namun Student tetap harus memiliki identity yang stabil.

Conceptual:

```text
Student
├── identity
├── Person reference where applicable
├── School relationship
├── educational status
└── lifecycle metadata
```

---

# 26. STUDENT VS PERSON

Pada level konseptual:

```text
PERSON
= human identity

STUDENT
= educational identity / participation context
```

Hal ini memungkinkan satu human identity memiliki berbagai contextual relationships tanpa menduplikasi manusia.

Implementasi exact relationship:

> **OPEN QUESTION**

Apakah Student harus langsung menjadi subtype/extension dari Person, atau entity educational tersendiri, perlu divalidasi terhadap data nyata TK.

---

# 27. ENROLLMENT

Enrollment menjawab:

> Apakah Student secara resmi terdaftar pada School dalam periode tertentu?

Relationship:

```text
Student
 ↓
Enrollment
 ↓
School
 ↓
Academic Year
```

---

# 28. ENROLLMENT LIFECYCLE

Conceptual:

```text
Application
 ↓
Pending
 ↓
Enrolled
 ↓
Active
 ↓
Completed / Withdrawn
```

Status final perlu mengikuti workflow nyata.

Product Blueprint masih menandai exact enrollment workflow sebagai critical unknown. 

Karena itu lifecycle di atas adalah **working model**, bukan final decision.

---

# 29. CLASS PLACEMENT

Enrollment dan Class Placement harus dibedakan.

Enrollment:

> Student terdaftar di School.

Placement:

> Student ditempatkan di Class tertentu.

Contoh:

```text
Student A
 ↓
Enrollment
 ↓
School A
 ↓
Class Placement
 ↓
TK B
```

---

# 30. WHY SEPARATE ENROLLMENT AND PLACEMENT?

Karena Student dapat:

- enrolled tetapi belum ditempatkan;
- berpindah Class;
- memiliki history placement.

Maka:

```text
Enrollment ≠ Class Placement
```

---

# 31. PLACEMENT HISTORY

Model harus mampu merepresentasikan:

```text
Student A
 ↓
TK A
 ↓
2026-07 → 2026-09

Student A
 ↓
TK B
 ↓
2026-10 → ...
```

Tanpa kehilangan history.

---

# 32. DOMAIN 05 — DAILY SCHOOL WORK

Core entity:

```text
Attendance
```

Potential future:

```text
Daily Activity
Operational Task
Schedule
```

Belum semuanya diperlukan.

---

# 33. ATTENDANCE

Attendance adalah operational record tentang kehadiran Student pada context tertentu.

Conceptual:

```text
Attendance
├── Student
├── School
├── Class
├── date / session
├── status
├── recorded by
├── recorded at
└── context metadata
```

---

# 34. ATTENDANCE CONTEXT

Attendance tidak boleh hanya:

```text
student_id
date
status
```

jika context penting untuk interpretasi.

Idealnya dapat diketahui:

```text
Student
School
Academic Year
Class
Date / Session
Recorded By
```

---

# 35. ATTENDANCE OWNERSHIP

Attendance adalah operational record.

Creator:

> Person yang mencatat.

Subject:

> Student.

Context owner:

> School / Class.

---

# 36. ATTENDANCE CORRECTION

Attendance dapat dikoreksi.

Jangan menghapus history tanpa alasan.

Conceptual:

```text
Original Record
      ↓
Correction
      ↓
Current State
```

Audit detail akan mengikuti Technical Architecture.

---

# 37. DOMAIN 06 — LEARNING & OBSERVATION

Core entities:

```text
Learning Activity
Observation
```

Model pedagogis final masih discovery. Product Blueprint secara eksplisit menyatakan learning dan development sebagai area yang harus divalidasi. 

Karena itu kita tidak akan membuat curriculum engine terlebih dahulu.

---

# 38. LEARNING ACTIVITY

Learning Activity merepresentasikan aktivitas pendidikan yang benar-benar dilakukan.

Contoh conceptual:

```text
Learning Activity
├── activity identity
├── Class / Student context
├── date
├── activity description
├── participants
├── created by
└── supporting information
```

---

# 39. LEARNING ACTIVITY ≠ CURRICULUM

Jangan langsung membuat:

```text
Curriculum
Subject
Competency
Standard
Indicator
Rubric
Score
```

hanya karena secara umum sistem pendidikan memiliki konsep tersebut.

Exact TK pedagogical framework belum divalidasi.

> Evidence before assumption.

---

# 40. OBSERVATION

Observation merepresentasikan professional observation terhadap Student dalam educational context.

Conceptual:

```text
Observation
├── Student
├── Class
├── School
├── observed at
├── observed by
├── observation content
├── context
├── status
└── related evidence
```

---

# 41. OBSERVATION IS NOT SCORE

Observation dapat berupa:

- narrative;
- structured observation;
- selected characteristic;
- professional note;
- evidence reference.

Model tidak boleh memaksa semua observation menjadi numeric score.

---

# 42. OBSERVATION CONTEXT

Observation harus menjawab:

```text
Who observed?
What was observed?
For whom?
When?
In what context?
Why?
```

Ini sejalan dengan prinsip institutional memory dalam UX Architecture. 

---

# 43. OBSERVATION LIFECYCLE

Conceptual:

```text
Draft
 ↓
Recorded
 ↓
Reviewed
 ↓
Archived
```

Namun lifecycle final harus mengikuti workflow Teacher.

---

# 44. DOMAIN 07 — DEVELOPMENT

Core entity:

```text
Development
```

Namun model development harus dibuat hati-hati.

Constitution menyatakan bahwa data hanyalah representasi dan human judgment tetap diperlukan. 

---

# 45. DEVELOPMENT

Development bukan sekadar:

```text
Student
+
Score
```

Conceptual:

```text
Student
 ↓
Observation
 ↓
Interpretation
 ↓
Development Understanding
 ↓
Action
```

Model tersebut langsung berasal dari Product Blueprint. 

---

# 46. DEVELOPMENT CONTEXT

Potential conceptual components:

```text
Development
├── Student
├── period
├── domain / area
├── observation references
├── interpretation
├── teacher judgment
├── review status
└── follow-up
```

Tetapi:

> `domain / area`, scoring, framework, dan assessment structure masih **OPEN QUESTION**.

---

# 47. DEVELOPMENT MUST PRESERVE HUMAN JUDGMENT

Data model tidak boleh menghapus interpretasi Teacher.

Misalnya:

```text
Observation:
"Mulai berani berbicara dalam kelompok."
```

tidak harus diterjemahkan menjadi:

```text
Confidence = 73
```

tanpa pedagogical basis.

---

# 48. DOMAIN 08 — EVIDENCE

Core entity:

```text
Evidence
```

Evidence bukan canonical truth.

Evidence adalah supporting material.

---

# 49. EVIDENCE

Conceptual:

```text
Evidence
├── identity
├── type
├── location / reference
├── purpose
├── captured by
├── captured at
├── context
└── related entity
```

---

# 50. EVIDENCE RELATIONSHIP

Evidence harus menjawab:

> Evidence of what?

Contoh:

```text
Observation
   ↓
Evidence
```

atau:

```text
Learning Activity
   ↓
Evidence
```

Evidence tidak boleh menjadi media dump.

UX Architecture menegaskan bahwa Evidence harus attached to purpose dan context. 

---

# 51. EVIDENCE OWNERSHIP

Evidence harus memiliki:

```text
Owner
Creator
Context
Purpose
Access boundary
```

Hal ini juga diperlukan untuk authorization.

---

# 52. DOMAIN 09 — COMMUNICATION

Core entities:

```text
Communication
Message / Announcement
Recipient
```

Namun TK Pilot tidak perlu langsung menjadi full messaging platform.

Product Blueprint menetapkan communication sebagai limited scope. 

---

# 53. COMMUNICATION

Communication dapat berkaitan dengan:

```text
School
Class
Student
Guardian
Teacher
```

Conceptual:

```text
Communication
├── sender
├── recipient
├── context
├── subject
├── content
├── created at
├── status
└── related entity
```

---

# 54. COMMUNICATION CONTEXT

Communication tentang Student harus dapat dikaitkan dengan Student.

Contoh:

```text
Teacher
 ↓
Student A
 ↓
Guardian A
 ↓
Communication
```

Ini memungkinkan history yang bermakna.

---

# 55. DOMAIN 10 — REVIEW

Core entity:

```text
Review
```

Review bukan sekadar dashboard.

Model:

```text
Information
 ↓
Pattern
 ↓
Review
 ↓
Insight
 ↓
Decision
```

Product Blueprint menetapkan **Simple Review First**. 

---

# 56. REVIEW

Conceptual:

```text
Review
├── subject/context
├── period
├── information references
├── reviewer
├── interpretation
├── action / follow-up
└── status
```

Tidak perlu membangun generic AI insight entity pada tahap ini.

---

# 57. CORE RELATIONSHIP MAP

Relationship utama:

```text
SCHOOL
 │
 ├── ACADEMIC YEAR
 │       │
 │       └── CLASS
 │              │
 │              ├── TEACHER ASSIGNMENT
 │              │
 │              └── CLASS PLACEMENT
 │                       │
 │                       └── STUDENT
 │
 └── PEOPLE
        │
        ├── TEACHER RESPONSIBILITY
        ├── STAFF RESPONSIBILITY
        └── GUARDIAN RELATIONSHIP
```

Student kemudian berhubungan dengan:

```text
Enrollment
Attendance
Learning Activity
Observation
Development
Evidence
Communication
```

---

# 58. COMPLETE CONCEPTUAL MODEL

```text
                              SCHOOL
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
          ACADEMIC YEAR      PEOPLE          CLASS
                 │              │              │
                 │       ┌──────┼──────┐       │
                 │       ▼      ▼      ▼       │
                 │    Teacher  Staff Guardian  │
                 │       │             │       │
                 │       │             │       │
                 │       ▼             │       │
                 │   Assignment        │       │
                 │       │             │       │
                 └───────┼─────────────┼───────┘
                         │             │
                         ▼             ▼
                       STUDENT ◄── GUARDIAN RELATIONSHIP
                         │
               ┌─────────┼─────────┐
               ▼         ▼         ▼
          ENROLLMENT  PLACEMENT  ATTENDANCE
                                   │
                         ┌─────────┼─────────┐
                         ▼         ▼         ▼
                      LEARNING OBSERVATION DEVELOPMENT
                                   │         │
                                   └────┬────┘
                                        ▼
                                     EVIDENCE
                                        │
                                        ▼
                                  COMMUNICATION
                                        │
                                        ▼
                                      REVIEW
```

---

# 59. IDENTITY MODEL

Canonical identity:

```text
Person
Student
School
Academic Year
Class
```

Transactional identity:

```text
Enrollment
Assignment
Placement
Attendance
Observation
Communication
Review
```

Supporting identity:

```text
Evidence
```

---

# 60. MASTER VS TRANSACTIONAL INFORMATION

Model sederhana:

### Master / Canonical

```text
School
Person
Student
Class
Academic Year
```

### Relationship / Context

```text
Enrollment
Guardian Relationship
Teacher Assignment
Class Placement
```

### Operational Records

```text
Attendance
Learning Activity
Observation
Communication
Review
```

### Supporting

```text
Evidence
```

---

# 61. WHY THIS DISTINCTION MATTERS

Tanpa distinction tersebut, database mudah berubah menjadi:

```text
students
teachers
attendance
everything
```

yang sulit dipahami.

Dengan distinction:

```text
WHO
WHERE
WHEN
RELATIONSHIP
WORK
EVIDENCE
REVIEW
```

lebih mudah ditelusuri.

---

# 62. TEMPORAL MODEL

Beberapa entity membutuhkan effective period.

Terutama:

```text
Enrollment
Teacher Assignment
Class Placement
Guardian Relationship
```

Conceptual:

```text
effective_from
effective_until
```

Exact implementation belum ditentukan.

---

# 63. CURRENT STATE VS HISTORY

Data model harus membedakan:

```text
CURRENT STATE
```

dari:

```text
HISTORICAL RECORD
```

Contoh:

Student sekarang:

```text
TK B
```

tetapi history:

```text
TK A → TK B
```

History adalah bagian dari institutional memory.

---

# 64. AUDIT METADATA

Operational records minimal secara konseptual membutuhkan:

```text
created_by
created_at
updated_by
updated_at
```

Untuk high-risk changes dapat diperlukan:

```text
reviewed_by
reviewed_at
```

Detail final mengikuti Technical Architecture.

---

# 65. SOFT DELETE / ARCHIVE

Canonical data sebaiknya tidak langsung dihapus.

Prefer:

```text
Active
Inactive
Archived
Closed
```

sesuai entity.

Ini menjaga institutional history.

---

# 66. OWNERSHIP MODEL

Secara konseptual:

```text
School
 ↓
owns / stewards
 ↓
School Information
```

Person tidak otomatis "dimiliki" School.

School memiliki relationship dan responsibility terhadap informasi dalam konteks pendidikan.

Ini penting untuk menjaga distinction antara:

> human identity

dan:

> institutional record.

---

# 67. DATA STEWARDSHIP

Untuk setiap canonical entity, perlu ditentukan:

```text
Business Owner
Data Steward
Creator
Editor
Viewer
```

Namun tidak semuanya harus menjadi fields dalam database.

Ini adalah governance metadata.

---

# 68. AUTHORIZATION LINK

Data model harus mendukung Authorization Model.

Contoh:

```text
Teacher
 ↓
Assignment
 ↓
Class
 ↓
Placement
 ↓
Student
 ↓
Attendance
```

Sehingga system dapat menjawab:

> Mengapa Teacher ini boleh mengubah Attendance ini?

Jawaban:

```text
Teacher Assignment
+
Class Context
+
Student Placement
+
Attendance Scope
```

---

# 69. GUARDIAN AUTHORIZATION LINK

```text
Guardian Person
 ↓
Guardian Relationship
 ↓
Student
 ↓
Permitted Information
```

Ini jauh lebih kuat daripada:

```text
guardian_user_id
```

di berbagai table.

---

# 70. DATA ACCESS BOUNDARY

Setiap operational record harus memiliki atau dapat ditelusuri ke:

```text
School
```

dan bila relevan:

```text
Academic Year
Class
Student
```

Tidak semua table harus menyimpan semua foreign key secara fisik.

Yang penting:

> context harus dapat di-resolve secara reliable.

---

# 71. DERIVED CONTEXT VS STORED CONTEXT

Contoh Attendance:

```text
Attendance
 ↓
Student
 ↓
Placement
 ↓
Class
 ↓
Academic Year
 ↓
School
```

School mungkin dapat diperoleh melalui relationship.

Tidak perlu menyimpan duplicate context hanya karena "lebih mudah".

Namun denormalization dapat dipertimbangkan nanti jika evidence menunjukkan kebutuhan performance.

---

# 72. NO PREMATURE DENORMALIZATION

Jangan menambahkan:

```text
attendance.school_id
attendance.academic_year_id
attendance.class_id
attendance.student_id
```

semuanya hanya karena terlihat praktis.

Pertama pahami canonical relationship.

Baru kemudian physical design menentukan apakah duplication tersebut diperlukan.

---

# 73. DATA QUALITY PRINCIPLES

System harus mencegah:

### Duplicate Person

Tanpa alasan.

### Duplicate Student identity

Tanpa alasan.

### Invalid Enrollment

Student aktif tanpa valid School context.

### Invalid Placement

Placement ke Class yang tidak berada pada Academic Year yang benar.

### Invalid Attendance

Attendance terhadap Student yang tidak valid dalam Class context.

---

# 74. INTEGRITY RULES

Contoh conceptual rules:

### Rule 1

Class harus belongs to School.

### Rule 2

Class harus memiliki Academic Year.

### Rule 3

Enrollment harus menghubungkan Student dan School.

### Rule 4

Placement harus menghubungkan Student dan Class.

### Rule 5

Class harus berada dalam School dan Academic Year yang valid.

### Rule 6

Teacher Assignment harus memiliki valid Person dan Class/School context.

### Rule 7

Attendance harus memiliki Student dan valid educational context.

### Rule 8

Observation harus memiliki Student dan observer.

### Rule 9

Evidence harus memiliki purpose/context.

### Rule 10

Guardian Relationship harus memiliki valid Person dan Student.

---

# 75. DATA LIFECYCLE

Secara umum:

```text
IDENTITY
   ↓
RELATIONSHIP
   ↓
ACTIVE CONTEXT
   ↓
OPERATIONAL RECORD
   ↓
REVIEW
   ↓
HISTORY / ARCHIVE
```

Tidak semua entity mengikuti lifecycle identik.

---

# 76. INFORMATION LIFECYCLE EXAMPLE

Student:

```text
Identity
 ↓
Enrollment
 ↓
Placement
 ↓
Daily Participation
 ↓
Development Records
 ↓
Completion / Exit
 ↓
Historical Record
```

Ini lebih representatif daripada sekadar:

```text
student.created_at
```

---

# 77. OBSERVATION LIFECYCLE EXAMPLE

```text
Observation Context
 ↓
Teacher Records
 ↓
Review / Interpretation
 ↓
Development Understanding
 ↓
Possible Follow-up
```

---

# 78. EVIDENCE LIFECYCLE EXAMPLE

```text
Captured
 ↓
Attached to Purpose
 ↓
Referenced
 ↓
Retained
 ↓
Archived / Retired
```

Retention policy final masih OPEN QUESTION.

---

# 79. COMMUNICATION LIFECYCLE

Conceptual:

```text
Draft
 ↓
Sent
 ↓
Delivered
 ↓
Read / Responded
 ↓
Archived
```

Tidak semua communication membutuhkan seluruh lifecycle tersebut.

---

# 80. REPORTING DATA

Report tidak perlu menjadi canonical entity pada tahap awal.

Prefer:

```text
Canonical Data
 ↓
Context
 ↓
Query / Projection
 ↓
Report
```

Jangan membuat:

```text
student_report
attendance_report
development_report
```

sebagai duplicate truth tanpa alasan.

---

# 81. DASHBOARD DATA

Dashboard juga projection.

```text
Canonical Information
 ↓
Relevant Context
 ↓
Derived View
 ↓
Dashboard
```

Constitution menekankan bahwa dashboard bukan keseluruhan realitas sekolah. 

---

# 82. ANALYTICS BOUNDARY

TK Pilot belum membutuhkan:

```text
Data Warehouse
Data Lake
OLAP Cube
Predictive Model
AI Knowledge Graph
```

Technical Architecture juga secara eksplisit menunda infrastructure tersebut. 

---

# 83. DOCUMENTS

Documents dapat muncul sebagai supporting information.

Untuk MVP:

```text
Document
 ↓
Context / Entity
```

Tetapi document management penuh belum perlu.

---

# 84. NOTIFICATIONS

Notification bukan canonical educational information.

Ia adalah delivery mechanism.

Contoh:

```text
Communication
 ↓
Notification
```

Jangan membuat notification menjadi duplicate truth.

---

# 85. ACTIVITY VS OBSERVATION

Ini perlu dibedakan.

### Learning Activity

> Apa kegiatan pendidikan yang dilakukan?

### Observation

> Apa yang Teacher amati?

Contoh:

```text
Activity:
"Kelompok bermain dengan balok."

Observation:
"Anak mulai mampu bekerja sama dan meminta giliran."
```

Relationship:

```text
Learning Activity
       ↓
Observation
```

jika memang relevan.

---

# 86. OBSERVATION VS DEVELOPMENT

Juga berbeda.

```text
Observation
=
what was observed
```

sedangkan:

```text
Development
=
understanding / interpretation over time
```

Dengan demikian:

```text
Observation
 ↓
Development Understanding
```

bukan:

```text
Observation = Development
```

---

# 87. DEVELOPMENT VS ASSESSMENT

Assessment formal mungkin diperlukan suatu hari.

Namun jangan mengasumsikan:

```text
Development
=
Assessment Score
```

Exact pedagogical framework belum ditentukan.

---

# 88. STUDENT PROFILE VS STUDENT DEVELOPMENT

Student Profile:

> siapa Student tersebut.

Development:

> bagaimana understanding terhadap perkembangan Student dibangun dari waktu ke waktu.

Keduanya berbeda.

---

# 89. PERSON PROFILE VS SCHOOL ROLE

Person Profile:

```text
Who is this person?
```

School Role:

```text
What responsibility does this person have here?
```

Relationship:

```text
Person
 ↓
Role / Responsibility
 ↓
School Context
```

---

# 90. CANONICAL DATA RULE

Jika informasi sudah tersedia:

```text
Person
```

jangan membuat ulang:

```text
Teacher Name
Guardian Name
Staff Name
```

sebagai independent canonical truth.

Reference canonical identity.

---

# 91. DUPLICATION RULE

Duplication hanya boleh dilakukan bila ada alasan yang jelas:

- performance;
- snapshot;
- historical preservation;
- external integration;
- reporting requirement.

Jika tidak:

> **single source of truth.**

---

# 92. DATA MODEL AND PRIVACY

Data model harus mempermudah privacy enforcement.

Sensitive information harus dapat diisolasi berdasarkan:

```text
Entity
Context
Relationship
Purpose
Access
```

Bukan semuanya dicampur dalam satu Student blob.

---

# 93. DATA MODEL AND CHILD PROTECTION

Karena Student adalah child, model harus meminimalkan:

- unnecessary personal data;
- unnecessary exposure;
- uncontrolled evidence;
- uncontrolled communication.

Child-centered principle bukan sekadar UX principle.

Ia mempengaruhi data architecture.

---

# 94. DATA MODEL AND INSTITUTIONAL MEMORY

Data model harus memungkinkan pertanyaan:

```text
What happened?
When?
Who recorded it?
For whom?
In what context?
What happened afterward?
```

Jika model tidak dapat menjawab pertanyaan tersebut, institutional memory belum cukup kuat.

---

# 95. DATA MODEL AND HUMAN JUDGMENT

System harus mampu menyimpan:

```text
Structured Information
+
Narrative
+
Context
+
Evidence
+
Interpretation
```

tanpa menganggap structured field selalu lebih "benar".

---

# 96. INITIAL ENTITY INVENTORY

### Foundation

1. School
2. Academic Year
3. Class

### People

4. Person
5. Teacher Responsibility
6. Staff Responsibility
7. Guardian Relationship

### Student

8. Student
9. Enrollment
10. Class Placement

### Daily Work

11. Attendance

### Learning

12. Learning Activity
13. Observation

### Development

14. Development

### Evidence

15. Evidence

### Communication

16. Communication

### Review

17. Review

**Total conceptual entities: 17**

Ini adalah working inventory, bukan frozen schema.

---

# 97. ENTITY PRIORITY

## Tier 1 — Foundation

```text
School
Person
Academic Year
Class
Student
```

## Tier 2 — Relationships

```text
Enrollment
Class Placement
Teacher Responsibility
Guardian Relationship
```

## Tier 3 — Daily Work

```text
Attendance
```

## Tier 4 — Educational Context

```text
Learning Activity
Observation
Development
```

## Tier 5 — Supporting

```text
Evidence
Communication
Review
```

---

# 98. MVP BUILD ORDER

Data model implementation sebaiknya mengikuti dependency:

```text
School
 ↓
Academic Year
 ↓
Person
 ↓
Class
 ↓
Student
 ↓
Enrollment
 ↓
Class Placement
 ↓
Teacher Assignment
 ↓
Attendance
 ↓
Learning
 ↓
Observation
 ↓
Development
 ↓
Evidence
 ↓
Communication
 ↓
Review
```

Ini bukan release roadmap.

Ini adalah **dependency order**.

---

# 99. WHY SCHOOL FIRST?

Tanpa School:

```text
Context
Ownership
Authorization
```

menjadi ambigu.

---

# 100. WHY PERSON BEFORE ROLE?

Karena:

```text
Role
```

adalah responsibility dari:

```text
Person
```

bukan identity manusia.

---

# 101. WHY STUDENT BEFORE ENROLLMENT?

Karena Enrollment adalah relationship antara:

```text
Student
+
School
+
Academic Context
```

---

# 102. WHY ENROLLMENT BEFORE PLACEMENT?

Karena:

```text
Placement
```

seharusnya tidak valid jika Student belum memiliki valid educational participation.

---

# 103. WHY PLACEMENT BEFORE ATTENDANCE?

Attendance bergantung pada:

```text
Student
+
Class Context
+
Academic Context
```

---

# 104. WHY OBSERVATION AFTER ATTENDANCE?

Bukan karena observation kurang penting.

Tetapi karena:

```text
Identity
+
Context
+
Student
+
Class
```

harus sudah stabil sebelum observation bermakna.

---

# 105. WHY DEVELOPMENT AFTER OBSERVATION?

Karena development understanding seharusnya dapat dibangun dari educational context dan observation, bukan berdiri sebagai angka tanpa foundation.

---

# 106. DATA MODEL AND AUTHORIZATION

Mapping:

```text
DATA MODEL
     │
     ├── Identity
     ├── Context
     ├── Relationship
     └── Record
            │
            ▼
AUTHORIZATION
     │
     ├── Who
     ├── Where
     ├── Relationship
     ├── Resource
     └── Action
```

Authorization Model tidak dapat berdiri dengan baik tanpa relationship model yang benar.

---

# 107. DATA MODEL AND WORKFLOW

Workflow:

```text
Enroll Student
```

Data:

```text
Student
+
Enrollment
```

Workflow:

```text
Place Student
```

Data:

```text
Class Placement
```

Workflow:

```text
Record Attendance
```

Data:

```text
Attendance
```

Workflow:

```text
Observe Student
```

Data:

```text
Observation
```

Dengan demikian:

> workflow dapat ditelusuri ke information model.

---

# 108. TRACEABILITY

Setiap entity sebaiknya memiliki:

```text
Purpose
 ↓
Workflow
 ↓
Context
 ↓
Authorization
 ↓
Data
```

Contoh:

```text
Attendance
 ↓
Daily School Work
 ↓
Class / Student
 ↓
Teacher Assignment
 ↓
Attendance Record
```

---

# 109. ANTI-PATTERN: GIANT STUDENT RECORD

Jangan membuat:

```text
Student
├── attendance
├── learning
├── observation
├── development
├── guardian
├── communication
├── documents
├── everything...
```

sebagai satu massive record.

Student adalah anchor entity.

Information terkait harus memiliki lifecycle dan relationship sendiri.

---

# 110. ANTI-PATTERN: ROLE-CENTRIC DATA

Jangan:

```text
teacher_student
teacher_guardian
staff_student
```

jika sebenarnya relationship tersebut dapat dijelaskan melalui canonical entities.

---

# 111. ANTI-PATTERN: SCREEN-DRIVEN DATABASE

Jangan membuat entity karena:

> "Ada screen ini."

Contoh:

```text
dashboard_data
teacher_dashboard
student_dashboard
admin_dashboard
```

Dashboard adalah projection, bukan canonical information.

---

# 112. ANTI-PATTERN: REPORT AS SOURCE OF TRUTH

Jangan menyimpan:

```text
attendance_report
```

sebagai source of truth jika report dapat dihasilkan dari Attendance.

---

# 113. ANTI-PATTERN: EVIDENCE AS TRUTH

Evidence bukan canonical fact.

Evidence mendukung:

```text
Observation
Learning Activity
Development
```

---

# 114. ANTI-PATTERN: EVERYTHING IS CURRENT STATE

Jika hanya menyimpan current state:

```text
Current Class
Current Teacher
Current Guardian
```

institutional history hilang.

Relationship yang berubah perlu lifecycle.

---

# 115. ANTI-PATTERN: EVERYTHING IS HISTORY

Sebaliknya, jangan membuat semua hal menjadi event sourcing yang kompleks.

TK Pilot belum membutuhkan event-sourced enterprise model.

Gunakan history hanya ketika business meaning memang membutuhkan.

---

# 116. SIMPLE DATA MODEL TEST

Untuk setiap entity, tanyakan:

### 1. Why does it exist?

### 2. What real-world concept does it represent?

### 3. Who owns/stewards it?

### 4. What context does it belong to?

### 5. What relationship does it have?

### 6. What workflow creates it?

### 7. What workflow changes it?

### 8. What workflow consumes it?

### 9. Who may access it?

### 10. What happens to it over time?

Jika pertanyaan tersebut tidak dapat dijawab:

> entity belum siap menjadi canonical model.

---

# 117. FACT / DECISION / ASSUMPTION / UNKNOWN

## DECISION / WORKING BASELINE

```text
School
Person
Student
Academic Year
Class
Enrollment
Attendance
Observation
Development
Evidence
Communication
```

sebagai core conceptual entities.

---

## ASSUMPTION

```text
Student membutuhkan educational identity yang stabil.
Class terkait dengan Academic Year.
Teacher responsibility terkait dengan Class.
Guardian relationship menjadi basis access.
```

---

## OPEN QUESTIONS

1. Apakah Student merupakan extension dari Person?
2. Apakah semua School menggunakan Academic Year yang sama?
3. Bagaimana struktur Class TK sebenarnya?
4. Apakah satu Student dapat memiliki multiple active Guardian?
5. Bagaimana Teacher assignment sebenarnya dilakukan?
6. Apakah Class dapat memiliki multiple Teacher?
7. Bagaimana Attendance sebenarnya dicatat?
8. Apakah Attendance daily atau session-based?
9. Apa exact observation method?
10. Apa development framework yang digunakan?
11. Apakah evidence wajib atau optional?
12. Bagaimana Guardian communication dilakukan?
13. Apa lifecycle Enrollment sebenarnya?
14. Berapa lama historical information dipertahankan?
15. Apa data yang diwajibkan Yapendik?

---

# 118. DATA MODEL MATURITY

### Level 0

Entity assumptions.

### Level 1

Conceptual entities identified.

### Level 2

Relationships defined.

### Level 3

Workflow traceability validated.

### Level 4

School reality validated.

### Level 5

Physical schema implemented.

TK Pilot saat ini:

> **Level 2 — Conceptual Relationship Baseline**

Target sebelum physical schema:

> **Level 3–4**

---

# 119. WHAT WE SHOULD NOT DO YET

Jangan langsung:

- membuat 50+ tables;
- menentukan semua columns;
- membuat SQL migration;
- membuat RLS;
- membuat indexes;
- membuat triggers;
- membuat generic metadata engine;
- membuat assessment framework;
- membuat analytics warehouse.

Kita belum memiliki evidence yang cukup untuk beberapa keputusan tersebut.

---

# 120. NEXT DATA LAYER

Setelah conceptual model ini, langkah berikutnya bukan langsung coding.

Yang paling masuk akal adalah membuat:

# YAPENDIK SCHOOL OS TK PILOT DOMAIN MODEL & ENTITY SPECIFICATION

Dokumen itu akan memperdalam setiap entity:

```text
Entity
 ↓
Purpose
 ↓
Definition
 ↓
Attributes
 ↓
Relationships
 ↓
Lifecycle
 ↓
Business Rules
 ↓
Authorization Boundary
 ↓
Workflow Usage
 ↓
Data Stewardship
 ↓
Open Questions
```

Barulah setelah itu kita dapat membuat:

```text
YAPENDIK SCHOOL OS TK PILOT DATABASE BLUEPRINT
```

yang mulai membahas:

```text
Tables
Primary Keys
Foreign Keys
Constraints
Indexes
Audit Fields
RLS Boundaries
```

---

# 121. COMPLETE ARCHITECTURAL CHAIN

Posisi kita sekarang:

```text
YAPENDIK OS CONSTITUTION
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
WORKFLOW SPECIFICATION
        ↓
AUTHORIZATION MODEL
        ↓
★ DATA MODEL ★
        ↓
DOMAIN & ENTITY SPECIFICATION
        ↓
DATABASE BLUEPRINT
        ↓
API / APPLICATION CONTRACT
        ↓
IMPLEMENTATION
```

Ini lebih aman daripada langsung melompat dari Product Blueprint ke database.

---

# 122. GOVERNANCE STATUS

**YAPENDIK SCHOOL OS TK PILOT DATA MODEL**

Version:

**0.1**

Status:

**LIVING — DISCOVERY**

Authority:

Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION.

Scope:

**School OS — TK Pilot**

Maturity:

**CONCEPTUAL RELATIONSHIP BASELINE**

Not Frozen.

Not Production Schema.

Not SQL Specification.

---

# 123. FINAL PRINCIPLE

Data Model ini harus selalu mengingat satu hal:

> **We are not modeling a database. We are modeling the information reality of a school.**

Database nantinya hanya menjadi salah satu cara untuk menyimpan dan menjaga model tersebut.

Karena Constitution menetapkan bahwa Yapendik OS harus menjaga **people, information, knowledge, context, ownership, dan trust**, maka model data tidak boleh hanya mengejar normalization atau technical elegance. 

Target akhirnya sederhana:

```text
REAL SCHOOL
     ↓
REAL PEOPLE
     ↓
REAL WORK
     ↓
REAL INFORMATION
     ↓
CLEAR CONTEXT
     ↓
TRUSTWORTHY SYSTEM
```

Dan prinsip utamanya tetap:

> **Jangan membuat database untuk mengakomodasi asumsi kita. Bangun model yang cukup sederhana untuk mengikuti kenyataan sekolah — lalu biarkan kenyataan mengajari kita bagaimana model itu harus berkembang.**