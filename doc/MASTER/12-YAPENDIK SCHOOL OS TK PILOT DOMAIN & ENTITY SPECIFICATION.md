# YAPENDIK SCHOOL OS TK PILOT DOMAIN & ENTITY SPECIFICATION

Versi: 0.1  
Organisasi: Yayasan Pendidikan GPIB (Yapendik)  
Sistem: Yapendik Operating System  
Produk: School OS  
Pilot: TK / Early Childhood Education  
Jenis Dokumen: Domain & Entity Specification  
Status: LIVING — DISCOVERY  
Pendekatan: Common Sense First  
Prinsip: Make It Simple. Keep It Future-Proof.

Derived From:

- YAPENDIK OPERATING SYSTEM CONSTITUTION
- YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
- YAPENDIK SCHOOL OS OPERATING MODEL
- YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT
- YAPENDIK SCHOOL OS UX ARCHITECTURE
- YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE
- YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION
- YAPENDIK SCHOOL OS TK PILOT AUTHORIZATION MODEL
- YAPENDIK SCHOOL OS TK PILOT DATA MODEL

---

# 1. TUJUAN

Dokumen ini mendefinisikan **domain dan entity secara lebih konkret** sebagai jembatan antara:

```text
DATA MODEL
     ↓
DOMAIN & ENTITY SPECIFICATION
     ↓
DATABASE BLUEPRINT
```

Dokumen ini menjawab:

> Apa sebenarnya entity tersebut dalam realitas sekolah, mengapa ia diperlukan, bagaimana ia berhubungan dengan entity lain, siapa yang bertanggung jawab terhadapnya, dan dalam workflow apa ia digunakan?

Dokumen ini **belum** menentukan:

- database table;
- SQL;
- primary key;
- foreign key;
- index;
- RLS policy;
- API contract;
- UI component;
- physical storage;
- infrastructure.

---

# 2. POSITION DALAM ARSITEKTUR

Rantai arsitektur saat ini:

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
DATA MODEL
        ↓
★ DOMAIN & ENTITY SPECIFICATION ★
        ↓
DATABASE BLUEPRINT
        ↓
API / APPLICATION CONTRACT
        ↓
IMPLEMENTATION
```

Constitution sendiri menempatkan **Domain & Entity Discovery** sebagai bagian penting dari evolusi arsitektur. 

---

# 3. STATUS DOKUMEN

Dokumen ini:

**LIVING — DISCOVERY**

Artinya:

- dapat berubah;
- belum frozen;
- belum menjadi kontrak database;
- belum menjadi implementation specification;
- perubahan harus didasarkan pada evidence, discovery, atau kebutuhan nyata.

Ini konsisten dengan Constitution yang secara eksplisit menggunakan model:

```text
DISCOVERY
   ↓
DESIGN
   ↓
IMPLEMENTATION
   ↓
REAL USAGE
   ↓
LEARNING
   ↓
ARCHITECTURE EVOLUTION
```



---

# 4. DOMAIN PRINCIPLES

## D-01 — Real World Before Database

Entity harus merepresentasikan sesuatu yang memiliki makna dalam realitas sekolah.

Bukan dibuat hanya karena sebuah screen atau feature membutuhkannya.

---

## D-02 — One Canonical Meaning

Satu konsep harus mempunyai satu governed meaning.

Contoh:

```text
Person
```

tidak boleh memiliki beberapa identity hanya karena orang tersebut mempunyai beberapa role.

Principle ini merupakan turunan langsung dari Constitutional Principle **Canonical Information**. 

---

## D-03 — Context Before Data

Data harus dapat dipahami dalam konteks.

Canonical context:

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

UX Architecture menetapkan hierarchy ini sebagai context model utama. 

---

## D-04 — Relationship Is Meaningful

Relationship bukan sekadar hubungan teknis.

Contoh:

```text
Person
   ↓
Guardian Relationship
   ↓
Student
```

memiliki business meaning dan dapat menentukan authorization.

---

## D-05 — Identity ≠ Role

```text
Person
```

menjawab:

> siapa manusia ini?

Sedangkan:

```text
Teacher Responsibility
Staff Responsibility
Guardian Relationship
```

menjawab:

> apa hubungan atau tanggung jawab orang tersebut dalam context tertentu?

---

## D-06 — Current State Must Not Destroy History

Ketika hubungan berubah, historical context tidak boleh otomatis hilang.

---

## D-07 — Evidence Before Assumption

Hal-hal yang belum diketahui mengenai praktik TK harus tetap ditandai sebagai:

```text
OPEN QUESTION
```

bukan dipaksakan menjadi business rule.

Ini sesuai dengan Constitutional principle **Evidence Before Assumption**. 

---

## D-08 — Human Judgment

Data tidak boleh dianggap menggantikan professional judgment.

School OS membantu manusia memahami dan bertindak lebih baik.

Bukan menggantikan teacher.

---

## D-09 — Minimum Necessary Information

Data dikumpulkan karena memiliki purpose.

Bukan:

> "mungkin nanti berguna."

---

## D-10 — Future Without Premature Complexity

Model harus mampu berkembang ke SD, SMP, dan SMA.

Tetapi TK Pilot tidak boleh dibebani seluruh kompleksitas masa depan.

TK adalah **pilot context**, bukan architectural boundary. 

---

# 5. DOMAIN LANDSCAPE

Domain konseptual TK Pilot:

```text
01. INSTITUTION
02. PEOPLE & IDENTITY
03. ACADEMIC CONTEXT
04. STUDENT LIFECYCLE
05. DAILY SCHOOL WORK
06. LEARNING
07. OBSERVATION & DEVELOPMENT
08. EVIDENCE
09. COMMUNICATION
10. REVIEW
```

---

# 6. ENTITY INVENTORY

Current conceptual inventory:

### Institution

1. School

### People & Identity

2. Person
3. Teacher Responsibility
4. Staff Responsibility
5. Guardian Relationship

### Academic Context

6. Academic Year
7. Class

### Student Lifecycle

8. Student
9. Enrollment
10. Class Placement

### Daily Work

11. Attendance

### Learning

12. Learning Activity

### Observation & Development

13. Observation
14. Development

### Evidence

15. Evidence

### Communication

16. Communication

### Review

17. Review

Total:

**17 conceptual entities**

Ini adalah **working inventory**, bukan frozen schema.

---

# 7. ENTITY CLASSIFICATION

Entity diklasifikasikan menjadi:

```text
CANONICAL IDENTITY
        ↓
CONTEXT
        ↓
RELATIONSHIP
        ↓
OPERATIONAL RECORD
        ↓
INTERPRETATION
        ↓
SUPPORTING EVIDENCE
        ↓
REVIEW
```

---

# 8. CANONICAL ENTITIES

Canonical entities:

```text
School
Person
Student
Academic Year
Class
```

Karakteristik:

- memiliki identity stabil;
- digunakan lintas workflow;
- tidak boleh diduplikasi tanpa alasan;
- menjadi anchor untuk entity lain.

---

# 9. CONTEXT ENTITIES

```text
School
Academic Year
Class
Student
```

membentuk context hierarchy.

Tidak semua workflow membutuhkan seluruh hierarchy.

Contoh:

```text
Teacher
 ↓
School
 ↓
Academic Year
 ↓
Class
 ↓
Student
 ↓
Observation
```

Tetapi workflow School-level dapat berhenti di:

```text
Teacher
 ↓
School
 ↓
Academic Year
```

---

# 10. RELATIONSHIP ENTITIES

```text
Enrollment
Class Placement
Teacher Responsibility
Staff Responsibility
Guardian Relationship
```

Entity ini penting karena relationship memiliki lifecycle dan business meaning.

---

# 11. OPERATIONAL ENTITIES

```text
Attendance
Learning Activity
Observation
Communication
Review
```

Entity ini mencatat pekerjaan atau aktivitas yang terjadi.

---

# 12. INTERPRETATION ENTITY

```text
Development
```

Development bukan sekadar raw record.

Ia membantu merepresentasikan pemahaman mengenai perkembangan Student berdasarkan observation dan evidence.

---

# 13. SUPPORTING ENTITY

```text
Evidence
```

Evidence mendukung informasi lain.

Evidence bukan otomatis canonical truth.

---

# 14. ENTITY SPECIFICATION FORMAT

Setiap entity menggunakan struktur:

```text
ENTITY
Business Definition
Purpose
Why It Exists
Ownership
Context
Core Attributes
Relationships
Lifecycle
Business Rules
Authorization Boundary
Workflow Usage
Data Sensitivity
History Requirements
Open Questions
```

---

# 15. ENTITY 01 — SCHOOL

## Business Definition

School adalah unit pendidikan tempat School OS digunakan untuk menjalankan dan mendukung kegiatan pendidikan serta operasional sekolah.

## Purpose

Menjadi institutional context utama untuk data dan workflow School OS.

## Why It Exists

Tanpa School, informasi pendidikan tidak memiliki institutional boundary yang jelas.

## Ownership

Institutional ownership berada pada Yapendik / otoritas sekolah sesuai governance.

## Context

```text
YAPENDIK
   ↓
SCHOOL
```

## Core Attributes

Secara konseptual:

- identity;
- name;
- code;
- status;
- contact information;
- institutional metadata.

Exact attributes masih discovery.

## Relationships

School berhubungan dengan:

- Academic Year;
- Person;
- Class;
- Student;
- Enrollment;
- operational records.

## Lifecycle

Conceptually:

```text
Created
 ↓
Active
 ↓
Inactive / Archived
```

## Business Rules

- School harus memiliki identity stabil.
- Perubahan nama tidak boleh menciptakan identity baru.
- Data operational harus dapat ditelusuri ke School context.

## Authorization Boundary

School menjadi salah satu boundary utama contextual authorization.

## Workflow Usage

Hampir seluruh workflow School OS menggunakan School sebagai context.

## Data Sensitivity

Institutional data.

Sebagian data dapat bersifat public di masa depan melalui governed projection, tetapi tidak otomatis public.

## History Requirements

School identity harus dipertahankan.

---

# 16. ENTITY 02 — PERSON

## Business Definition

Person adalah representasi canonical dari seorang manusia.

## Purpose

Mencegah duplikasi identity manusia ketika orang tersebut memiliki berbagai relationship atau responsibility.

## Why It Exists

Satu manusia dapat menjadi:

```text
Teacher
Staff
Guardian
```

dalam context berbeda.

## Ownership

Person memiliki institutional stewardship sesuai privacy dan governance.

## Context

Person dapat berhubungan dengan satu atau lebih School.

## Core Attributes

Konseptual:

- identity;
- name;
- contact information;
- relevant personal information;
- lifecycle metadata.

Data personal yang tidak memiliki purpose tidak boleh otomatis dikumpulkan.

## Relationships

Person dapat memiliki:

```text
Teacher Responsibility
Staff Responsibility
Guardian Relationship
```

## Lifecycle

```text
Created
 ↓
Active
 ↓
Inactive
 ↓
Archived
```

## Business Rules

Satu human identity harus memiliki canonical Person.

## Authorization Boundary

Access terhadap Person tergantung pada:

- actor;
- role;
- School context;
- relationship;
- purpose.

## Workflow Usage

- onboarding;
- teacher assignment;
- staff administration;
- guardian relationship;
- communication.

## Data Sensitivity

**High**

Personal data harus protected by design.

## History Requirements

Identity history dan institutional relationships perlu dipertahankan sesuai retention policy.

## Open Questions

- Exact personal attributes?
- Apakah Person dapat berada pada beberapa School?
- Bagaimana duplicate detection dilakukan?

---

# 17. ENTITY 03 — TEACHER RESPONSIBILITY

## Business Definition

Teacher Responsibility merepresentasikan tanggung jawab Person sebagai Teacher dalam context School/Class tertentu.

## Purpose

Menghubungkan Teacher dengan pekerjaan yang menjadi tanggung jawabnya.

## Why It Exists

Role tidak cukup menjelaskan:

> Teacher ini bertanggung jawab atas Class mana?

## Ownership

School.

## Context

```text
Person
 ↓
School
 ↓
Academic Year
 ↓
Class
```

## Core Attributes

- Person;
- School;
- Academic Year;
- Class;
- responsibility type;
- effective period;
- status.

## Relationships

Person → Teacher Responsibility → Class.

## Lifecycle

```text
Assigned
 ↓
Active
 ↓
Ended
```

## Business Rules

Assignment harus memiliki context yang valid.

## Authorization Boundary

Menjadi salah satu basis utama Teacher access.

Technical Architecture menempatkan authorization sebagai dependency setelah canonical identity dan context. 

## Workflow Usage

- class work;
- attendance;
- learning;
- observation;
- development.

## Data Sensitivity

Internal institutional.

## History Requirements

Assignment history harus dapat ditelusuri.

## Open Questions

- Apakah satu Class dapat memiliki lebih dari satu Teacher?
- Apakah assignment dapat berlaku lintas Class?
- Apakah ada role seperti Teacher Assistant?

---

# 18. ENTITY 04 — STAFF RESPONSIBILITY

## Business Definition

Representasi tanggung jawab Person sebagai Staff dalam School.

## Purpose

Membedakan identity Person dari institutional responsibility.

## Context

```text
Person
 ↓
School
```

atau context lebih spesifik bila diperlukan.

## Core Attributes

- Person;
- School;
- responsibility;
- effective period;
- status.

## Relationships

Person → Staff Responsibility → School.

## Authorization Boundary

Access ditentukan berdasarkan responsibility dan context.

## Workflow Usage

- administration;
- school operation;
- relevant support workflows.

## Open Questions

Exact staff categories belum ditentukan.

---

# 19. ENTITY 05 — GUARDIAN RELATIONSHIP

## Business Definition

Relationship antara Person dan Student yang memiliki status sebagai Guardian.

## Purpose

Merepresentasikan hubungan manusia secara eksplisit dan menjadi basis Guardian access.

## Why It Exists

Guardian tidak boleh hanya menjadi:

```text
guardian_user_id
```

karena relationship memiliki business meaning.

## Context

```text
Person
 ↓
Guardian Relationship
 ↓
Student
```

## Core Attributes

- Person;
- Student;
- relationship type;
- status;
- effective period;
- communication/access relevance.

## Lifecycle

```text
Active
 ↓
Changed
 ↓
Ended
```

## Authorization Boundary

Guardian authorization harus diturunkan dari relationship yang valid.

UX Architecture menetapkan Guardian experience dimulai dari Student dan relevant school information, bukan dari internal school structure. 

## Data Sensitivity

**High**

## History Requirements

Relationship changes perlu dipertahankan.

## Open Questions

- Apakah Student dapat memiliki multiple active Guardians?
- Apakah ada primary Guardian?
- Apakah relationship memiliki legal distinction?
- Apa saja informasi yang dapat diakses Guardian?

---

# 20. ENTITY 06 — ACADEMIC YEAR

## Business Definition

Academic Year adalah temporal context utama untuk penyelenggaraan pendidikan.

## Purpose

Mengikat Class, enrollment, assignment, dan operational activity pada periode pendidikan tertentu.

## Context

```text
School
 ↓
Academic Year
```

## Core Attributes

- identity;
- label;
- start;
- end;
- status;
- School.

## Lifecycle

```text
Planned
 ↓
Active
 ↓
Closed
 ↓
Archived
```

## Business Rules

Academic Year harus memiliki temporal boundary yang jelas.

## Authorization Boundary

Digunakan sebagai context filter.

## Workflow Usage

- enrollment;
- class setup;
- teacher assignment;
- attendance;
- review.

## Open Questions

- Apakah struktur tahun ajaran seluruh Yapendik seragam?
- Apakah School dapat memiliki lebih dari satu active academic year?

---

# 21. ENTITY 07 — CLASS

## Business Definition

Class adalah educational grouping tempat Student dan Teacher menjalankan aktivitas pembelajaran.

## Purpose

Menjadi operational context utama Teacher.

UX Architecture menempatkan Class Workspace sebagai salah satu workspace paling penting dalam TK Pilot. 

## Context

```text
School
 ↓
Academic Year
 ↓
Class
```

## Core Attributes

- identity;
- name;
- School;
- Academic Year;
- status;
- relevant class metadata.

## Relationships

- Teacher Responsibility;
- Class Placement;
- Student;
- Learning Activity;
- Observation.

## Lifecycle

```text
Planned
 ↓
Active
 ↓
Closed
```

## Business Rules

Class harus berada pada School dan Academic Year yang valid.

## Authorization Boundary

Teacher access terhadap Class menjadi salah satu basis authorization.

## Workflow Usage

- attendance;
- daily work;
- learning;
- observation;
- review.

## Open Questions

- Exact TK class structure?
- Apakah class memiliki level seperti TK A/TK B?
- Apakah grouping dapat berubah selama tahun berjalan?

---

# 22. ENTITY 08 — STUDENT

## Business Definition

Student adalah canonical educational subject yang menjadi pusat educational context School OS.

## Purpose

Menjadi anchor bagi:

- enrollment;
- class placement;
- attendance;
- learning;
- observation;
- development;
- evidence;
- communication.

## Why It Exists

Constitution menempatkan child sebagai pusat educational purpose, bukan sekadar educational data. 

## Context

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Student
```

## Core Attributes

Konseptual:

- identity;
- relevant student information;
- educational status;
- School relationship.

## Relationships

Student memiliki:

- Enrollment;
- Class Placement;
- Guardian Relationship;
- Attendance;
- Learning Activity;
- Observation;
- Development;
- Evidence;
- Communication.

## Lifecycle

Working model:

```text
Prospective
 ↓
Enrolled
 ↓
Active
 ↓
Completed / Withdrawn
```

Status final masih discovery.

## Authorization Boundary

Student adalah salah satu resource utama authorization.

## Data Sensitivity

**Very High**

Karena merupakan child-related information.

## History Requirements

Educational history harus dipertahankan sesuai governance.

## Open Questions

### Critical:

Apakah Student:

```text
Person
```

atau:

```text
Student
   ↓
Person
```

atau model identity lain?

Ini belum boleh dipaksakan sebelum real-world validation.

---

# 23. ENTITY 09 — ENROLLMENT

## Business Definition

Enrollment menyatakan bahwa Student secara resmi terdaftar pada School untuk periode tertentu.

## Purpose

Memisahkan:

```text
Student identity
```

dari:

```text
Student participation in School
```

## Context

```text
Student
 ↓
Enrollment
 ↓
School
 ↓
Academic Year
```

## Core Attributes

- Student;
- School;
- Academic Year;
- enrollment status;
- effective dates;
- relevant enrollment information.

## Lifecycle

Working model:

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

## Business Rules

Student tidak boleh memiliki operational participation yang bertentangan dengan enrollment state.

## Authorization Boundary

Enrollment menentukan apakah Student berada dalam School context tertentu.

## Workflow Usage

- enrollment;
- student setup;
- class placement.

## Data Sensitivity

**High**

## History Requirements

Enrollment history harus dipertahankan.

## Open Questions

Product Blueprint menandai exact enrollment workflow sebagai critical unknown. 

---

# 24. ENTITY 10 — CLASS PLACEMENT

## Business Definition

Class Placement menentukan Student ditempatkan pada Class tertentu dalam periode tertentu.

## Purpose

Memisahkan:

```text
Student enrolled in School
```

dari:

```text
Student belongs operationally to Class X
```

## Context

```text
Student
 ↓
Enrollment
 ↓
Class Placement
 ↓
Class
```

## Core Attributes

- Student;
- Class;
- effective period;
- status;
- placement reason where necessary.

## Lifecycle

```text
Assigned
 ↓
Active
 ↓
Ended
```

## Business Rules

Placement harus mengacu pada Class yang valid dalam School/Academic Year context.

## Authorization Boundary

Membantu menentukan Student yang dapat diakses Teacher.

## Workflow Usage

- class setup;
- student transfer;
- teacher workspace;
- attendance;
- observation.

## History Requirements

**Required**

Perubahan Class tidak boleh menghilangkan history.

## Open Questions

- Apakah transfer antar-class diperbolehkan?
- Apakah effective date diperlukan?
- Apakah Student dapat memiliki dua placement aktif?

---

# 25. ENTITY 11 — ATTENDANCE

## Business Definition

Operational record yang mencatat kehadiran Student.

## Purpose

Mendukung daily school work dan memberikan operational visibility.

## Context

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Student
 ↓
Attendance
```

## Core Attributes

- Student;
- Class context;
- date/session;
- attendance status;
- recorded by;
- recorded at;
- optional note.

## Lifecycle

```text
Recorded
 ↓
Corrected
 ↓
Final / Archived
```

## Business Rules

Attendance harus memiliki Student dan context yang valid.

## Authorization Boundary

Teacher hanya dapat mencatat/mengubah sesuai scope yang diberikan melalui responsibility dan context.

## Workflow Usage

Primary workflow:

```text
Today's Class
 ↓
Students
 ↓
Attendance
```

UX Architecture memang memprioritaskan pengalaman Teacher berbasis Today → Class → Students → Work. 

## Data Sensitivity

High.

## History Requirements

Correction harus dapat diaudit.

## Open Questions

- Daily atau session-based?
- Apakah attendance perlu reason?
- Siapa yang dapat mengoreksi?

---

# 26. ENTITY 12 — LEARNING ACTIVITY

## Business Definition

Learning Activity adalah aktivitas pendidikan yang dilakukan dalam School/Class/Student context.

## Purpose

Menyimpan konteks mengenai apa yang benar-benar dilakukan dalam proses pembelajaran.

## Context

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Learning Activity
```

Dapat berhubungan dengan Student secara individual bila diperlukan.

## Core Attributes

- activity identity;
- date/time;
- class;
- activity description;
- responsible Teacher;
- participants/context.

## Relationships

Learning Activity dapat memiliki:

```text
Observation
Evidence
```

## Business Rules

Activity harus merepresentasikan real educational work.

## Authorization Boundary

Teacher hanya dapat membuat/mengubah sesuai Class responsibility.

## Data Sensitivity

Internal.

## Open Questions

Ini adalah area discovery utama.

Product Blueprint menempatkan learning sebagai area yang belum sepenuhnya tervalidasi. 

Belum ditentukan:

- curriculum model;
- lesson structure;
- competency framework;
- standardized learning taxonomy.

---

# 27. ENTITY 13 — OBSERVATION

## Business Definition

Observation adalah catatan professional observation terhadap Student.

## Purpose

Membantu Teacher menangkap educational context yang mungkin hilang jika hanya menggunakan attendance atau administrative records.

## Context

```text
Class
 ↓
Student
 ↓
Observation
```

## Core Attributes

- Student;
- observer;
- date/time;
- context;
- observation content;
- related activity if applicable;
- status.

## Lifecycle

Working model:

```text
Draft
 ↓
Recorded
 ↓
Reviewed
 ↓
Archived
```

## Business Rules

Observation harus memiliki:

```text
Who
What
When
For whom
Context
```

## Authorization Boundary

Observer dan authorized educational actors.

## Data Sensitivity

**Very High**

Observation dapat mengandung professional judgment dan sensitive child information.

## History Requirements

**Required**

## Open Questions

Product Blueprint secara eksplisit menyatakan exact observation method belum diketahui. 

Belum ditentukan:

- narrative only;
- structured;
- hybrid;
- rubric;
- indicator;
- domain taxonomy.

Jangan membekukan salah satunya sekarang.

---

# 28. ENTITY 14 — DEVELOPMENT

## Business Definition

Development merepresentasikan pemahaman mengenai perkembangan Student yang dibangun dari observation, context, dan professional judgment.

## Purpose

Membantu School OS bergerak dari:

```text
Record
```

menuju:

```text
Understanding
```

Product Blueprint menggunakan maturity model:

```text
RECORD
 ↓
WORK
 ↓
CONTEXT
 ↓
UNDERSTANDING
 ↓
DECISION
 ↓
IMPROVEMENT
```



## Core Attributes

Konseptual:

- Student;
- period;
- area/domain jika sudah divalidasi;
- observations;
- interpretation;
- teacher judgment;
- review status;
- follow-up where relevant.

## Business Rules

Development tidak boleh dipaksa menjadi numeric score tanpa pedagogical basis.

## Authorization Boundary

Educational actors yang memiliki legitimate need.

## Data Sensitivity

**Very High**

## History Requirements

**Required**

## Open Questions

Ini termasuk critical unknown:

- exact development framework;
- domain;
- indicators;
- assessment terminology;
- formal reporting requirement.

Product Blueprint menandai development sebagai discovery. 

---

# 29. ENTITY 15 — EVIDENCE

## Business Definition

Evidence adalah supporting information/material yang membantu memperkuat atau memberikan context terhadap record tertentu.

## Purpose

Menyimpan bukti tanpa menjadikannya sebagai canonical truth.

## Context

Evidence harus memiliki:

```text
Purpose
+
Context
+
Owner
```

## Core Attributes

- evidence identity;
- type;
- captured by;
- captured at;
- reference/location;
- related entity;
- purpose.

## Relationships

Dapat terkait dengan:

- Learning Activity;
- Observation;
- Development;
- Communication;
- Review.

## Lifecycle

```text
Captured
 ↓
Attached
 ↓
Referenced
 ↓
Archived / Retired
```

## Authorization Boundary

Access harus mengikuti resource yang didukung Evidence.

## Data Sensitivity

Potentially **Very High**, terutama jika berupa foto/video anak.

## History Requirements

Retention dan deletion harus governed.

## Open Questions

- Apa evidence types yang dibutuhkan?
- Apakah foto/video diperbolehkan?
- Berapa lama retention?
- Bagaimana consent/privacy dikelola?

---

# 30. ENTITY 16 — COMMUNICATION

## Business Definition

Communication adalah informasi yang dikirim atau dipertukarkan antara School dan connected participants.

## Purpose

Menghubungkan school information dengan Guardian atau pihak relevan lainnya.

## Context

```text
School
 ↓
Student / Class
 ↓
Communication
```

## Core Attributes

- sender;
- recipient;
- context;
- content;
- timestamp;
- status;
- related entity.

## Lifecycle

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

Lifecycle exact masih working model.

## Authorization Boundary

Sender dan recipient harus memiliki legitimate relationship.

## Data Sensitivity

High.

## Open Questions

Exact Guardian Communication Pattern merupakan critical unknown. 

Belum ditentukan:

- notification;
- messaging;
- announcement;
- daily summary;
- individual communication;
- combination.

---

# 31. ENTITY 17 — REVIEW

## Business Definition

Review adalah aktivitas memahami informasi yang telah dikumpulkan untuk menghasilkan interpretation, decision, atau follow-up.

## Purpose

Menghubungkan information dengan decision-making.

## Conceptual Flow

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
 ↓
Action
```

## Context

Dapat berada pada:

```text
School
Class
Student
```

## Core Attributes

- subject/context;
- period;
- reviewer;
- information references;
- interpretation;
- decision/action;
- status.

## Authorization Boundary

Reviewer harus memiliki appropriate responsibility.

## Data Sensitivity

Internal hingga High, tergantung context.

## History Requirements

Review decisions harus dapat ditelusuri.

## Open Questions

Exact school leadership review workflow belum divalidasi.

---

# 32. ENTITY RELATIONSHIP MAP

Conceptual relationship:

```text
                         SCHOOL
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      ACADEMIC YEAR      PERSON          CLASS
            │              │              │
            │       ┌──────┼──────┐       │
            │       ▼      ▼      ▼       │
            │    TEACHER  STAFF  GUARDIAN │
            │       │             │       │
            │       ▼             │       │
            │   RESPONSIBILITY    │       │
            │                     │       │
            └──────────┬──────────┘       │
                       │                  │
                       ▼                  │
                     STUDENT ◄────────────┘
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
         ENROLLMENT PLACEMENT ATTENDANCE
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                 LEARNING   OBSERVATION DEVELOPMENT
                    │           │           │
                    └───────────┼───────────┘
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

# 33. CANONICAL VS TRANSACTIONAL

## Canonical

```text
School
Person
Student
Academic Year
Class
```

## Relationship

```text
Teacher Responsibility
Staff Responsibility
Guardian Relationship
Enrollment
Class Placement
```

## Operational

```text
Attendance
Learning Activity
Observation
Communication
Review
```

## Interpretive

```text
Development
```

## Supporting

```text
Evidence
```

---

# 34. DEPENDENCY ORDER

Entity dependency secara konseptual:

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
Responsibility
 ↓
Attendance
 ↓
Learning Activity
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

Ini bukan migration order final.

Ini adalah **domain dependency order**.

---

# 35. IDENTITY DEPENDENCY

```text
School
Person
Student
Class
Academic Year
```

harus memiliki identity yang stabil sebelum relationship dan operational records dibangun.

Technical Architecture juga menempatkan:

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
```

sebagai dependency utama. 

---

# 36. CONTEXT DEPENDENCY

Context utama:

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Student
```

Tidak semua entity harus menyimpan seluruh context secara langsung.

Yang penting context dapat di-resolve secara reliable.

---

# 37. AUTHORIZATION DEPENDENCY

Authorization:

```text
Actor
 ↓
Person
 ↓
Responsibility / Relationship
 ↓
Context
 ↓
Resource
 ↓
Action
```

Contoh:

```text
Teacher
 ↓
Teacher Responsibility
 ↓
Class A
 ↓
Student B
 ↓
Observation
 ↓
Create
```

Ini membuat authorization dapat dipahami secara business terms.

---

# 38. WORKFLOW TRACEABILITY

## Enrollment

```text
Student
+
School
+
Academic Year
+
Enrollment
```

## Class Placement

```text
Student
+
Class
+
Placement
```

## Attendance

```text
Teacher
+
Class
+
Student
+
Attendance
```

## Learning

```text
Teacher
+
Class
+
Learning Activity
```

## Observation

```text
Teacher
+
Student
+
Observation
```

## Development

```text
Observation
+
Evidence
+
Teacher Judgment
+
Development
```

## Guardian Communication

```text
Student
+
Guardian Relationship
+
Communication
```

## Review

```text
Information
+
Context
+
Reviewer
+
Review
```

---

# 39. DATA SENSITIVITY CLASSIFICATION

## Level 1 — Institutional

```text
School
Class
Academic Year
```

## Level 2 — Internal Personal

```text
Person
Teacher Responsibility
Staff Responsibility
```

## Level 3 — Sensitive

```text
Enrollment
Attendance
Communication
```

## Level 4 — Highly Sensitive Child Information

```text
Student
Observation
Development
Evidence
Guardian Relationship
```

Classification ini masih dapat disempurnakan bersama privacy/security design.

---

# 40. HISTORY REQUIREMENTS

History penting terutama untuk:

```text
Enrollment
Class Placement
Teacher Responsibility
Guardian Relationship
Attendance
Observation
Development
Communication
Review
```

Canonical identity seperti:

```text
Person
Student
School
```

juga tidak boleh hilang hanya karena status berubah.

---

# 41. CURRENT STATE VS HISTORY

Model harus dapat membedakan:

```text
CURRENT
```

dan:

```text
HISTORICAL
```

Contoh:

```text
Student
 ↓
Current Class = TK B
```

tidak boleh menyebabkan history:

```text
TK A
```

hilang.

---

# 42. BUSINESS INTEGRITY RULES

### Rule 01

Setiap Class harus berada dalam School.

### Rule 02

Setiap Class harus memiliki Academic Year context.

### Rule 03

Enrollment harus menghubungkan Student dengan School.

### Rule 04

Class Placement harus menghubungkan Student dengan Class.

### Rule 05

Teacher Responsibility harus memiliki Person dan School context.

### Rule 06

Attendance harus memiliki Student yang valid.

### Rule 07

Observation harus memiliki Student dan observer.

### Rule 08

Development harus memiliki Student dan context.

### Rule 09

Evidence harus memiliki purpose/context.

### Rule 10

Guardian Relationship harus menghubungkan Person dan Student.

### Rule 11

Operational record tidak boleh orphaned dari School context.

---

# 43. DUPLICATION RULES

Tidak boleh membuat duplicate canonical identity hanya karena:

- berbeda role;
- berbeda workflow;
- berbeda screen;
- berbeda report.

Contoh yang **tidak dianjurkan**:

```text
TeacherProfile
GuardianProfile
StaffProfile
```

sebagai tiga manusia berbeda jika sebenarnya merujuk pada satu Person.

---

# 44. SCREEN-DRIVEN ENTITY RULE

Jangan membuat entity hanya karena ada screen.

Tidak boleh:

```text
TeacherDashboardData
StudentDashboardData
AttendanceReport
DevelopmentDashboard
```

menjadi canonical entities tanpa business meaning.

Dashboard dan report adalah projection.

---

# 45. REPORTING PRINCIPLE

```text
CANONICAL DATA
      ↓
CONTEXT
      ↓
QUERY / PROJECTION
      ↓
REPORT
```

Bukan:

```text
CANONICAL DATA
      ↓
COPY INTO REPORT TABLE
      ↓
REPORT BECOMES TRUTH
```

---

# 46. EVIDENCE PRINCIPLE

Evidence:

```text
supports information
```

bukan:

```text
automatically becomes truth
```

Contoh:

```text
Photo
 ↓
Evidence
 ↓
Observation
```

Photo tidak otomatis menjadi:

> "Student has achieved competency X."

Human interpretation tetap diperlukan.

---

# 47. DEVELOPMENT PRINCIPLE

Development:

```text
Observation
+
Context
+
Interpretation
+
Professional Judgment
```

bukan:

```text
Score only
```

Exact pedagogical structure belum boleh dibekukan.

---

# 48. CHILD-CENTERED DATA MODEL

Student harus menjadi:

```text
educational subject
```

bukan:

```text
administrative record
```

Artinya system harus mempertimbangkan:

- dignity;
- privacy;
- context;
- appropriate access;
- meaningful use.

Constitution menetapkan **Child-Centered Education** sebagai non-negotiable principle. 

---

# 49. DATA MINIMIZATION

Untuk setiap attribute, gunakan test:

```text
Why do we need this?
Who uses it?
In what workflow?
What happens if we don't collect it?
Is there a safer alternative?
```

Jika tidak ada jawaban:

> Jangan masukkan dulu.

---

# 50. DATA OWNERSHIP

Secara konseptual:

```text
School
 ↓
stewards institutional information
```

Person bukan "milik" School.

School memiliki legitimate institutional relationship terhadap informasi dalam context pendidikan.

---

# 51. PROVENANCE

Untuk information penting, system idealnya dapat mengetahui:

```text
Who
When
Where/context
How
Why
```

Ini sangat penting untuk:

- Observation;
- Development;
- Attendance correction;
- Review;
- Evidence.

---

# 52. AUDITABILITY

Auditability harus proportional terhadap risk.

High-risk child information membutuhkan traceability lebih kuat daripada low-risk configuration.

Ini konsisten dengan Product Blueprint yang menetapkan auditability proportional terhadap risk. 

---

# 53. PRIVACY BOUNDARY

Prinsip:

```text
COLLECT
   ↓
ONLY WHAT IS NEEDED
   ↓
DEFINED PURPOSE
   ↓
AUTHORIZED USE
   ↓
PROTECTION
   ↓
APPROPRIATE RETENTION
```

EIA juga menetapkan pola privacy tersebut dan memberi perhatian khusus pada child data. 

---

# 54. PUBLIC BOUNDARY

Data internal School OS tidak otomatis menjadi public data.

Jika suatu saat diperlukan:

```text
INTERNAL INFORMATION
       ↓
GOVERNED PROJECTION
       ↓
PUBLIC EXPERIENCE
```

Bukan:

```text
DATABASE
 ↓
PUBLIC WEBSITE
```



---

# 55. FUTURE EXTENSIBILITY

Model ini harus dapat berkembang:

```text
TK
 ↓
SD
 ↓
SMP
 ↓
SMA
```

tanpa mengubah canonical concepts seperti:

```text
School
Person
Student
Class
Academic Year
Enrollment
```

Tetapi detail pedagogical implementation dapat berbeda.

Ini sesuai prinsip School Autonomy:

> Standardize what must be shared; preserve autonomy where context matters. 

---

# 56. WHAT MUST BE SHARED

Potential enterprise-wide canonical concepts:

```text
Identity
School
Person
Student
Academic Context
Enrollment
Authorization
Security
Governance
```

---

# 57. WHAT MAY REMAIN CONTEXTUAL

Potentially school/type-specific:

```text
Learning approach
Observation method
Development framework
Communication style
Operational practice
Classroom workflow
```

Ini belum berarti setiap School bebas membuat definisi sendiri.

Shared definitions tetap dapat dibentuk ketika evidence sudah cukup.

---

# 58. CRITICAL UNKNOWN REGISTER

Saat ini terdapat beberapa area yang belum boleh dibekukan.

## Student Identity

Apakah Student merupakan extension dari Person?

## Class

Bagaimana struktur Class TK sebenarnya?

## Enrollment

Bagaimana workflow enrollment sebenarnya?

## Observation

Bagaimana Teacher melakukan observation?

## Development

Framework apa yang digunakan?

## Evidence

Apa bentuk evidence yang benar-benar diperlukan?

## Guardian

Bagaimana communication sebenarnya dilakukan?

## Leadership

Bagaimana review dilakukan?

Product Blueprint secara eksplisit menandai exact curriculum, development framework, observation method, guardian communication, enrollment workflow, class structure, reporting, dan leadership workflow sebagai critical unknown. 

---

# 59. ENTITY MATURITY

Setiap entity akan memiliki maturity:

```text
ASSUMPTION
   ↓
CONCEPT
   ↓
RELATIONSHIP DEFINED
   ↓
WORKFLOW VALIDATED
   ↓
FIELD VALIDATED
   ↓
DATABASE READY
```

Tidak semua entity harus mencapai maturity yang sama sekaligus.

---

# 60. CURRENT MATURITY

| Entity | Maturity |
|---|---|
| School | Concept / Working |
| Person | Concept / Working |
| Academic Year | Initial |
| Class | Initial |
| Student | Initial |
| Enrollment | Initial / Discovery |
| Class Placement | Initial |
| Teacher Responsibility | Initial |
| Staff Responsibility | Initial |
| Guardian Relationship | Initial / Discovery |
| Attendance | Initial |
| Learning Activity | Discovery |
| Observation | Discovery |
| Development | Discovery |
| Evidence | Discovery |
| Communication | Discovery |
| Review | Discovery |

---

# 61. VALIDATION PRIORITY

Karena Product Blueprint menetapkan urutan discovery:

```text
Teacher Daily Work
 ↓
Student Observation
 ↓
Student Development
 ↓
Attendance
 ↓
Guardian Communication
 ↓
Enrollment
 ↓
School Review
 ↓
Other Operations
```



maka entity validation sebaiknya mengikuti prioritas tersebut.

---

# 62. PRIORITY 1 — TEACHER DAILY WORK

Validasi:

```text
Teacher
Class
Student
Teacher Responsibility
Attendance
Learning Activity
Observation
```

Pertanyaan:

> Bagaimana sebenarnya Teacher bekerja sepanjang satu hari?

---

# 63. PRIORITY 2 — STUDENT OBSERVATION

Validasi:

```text
Student
Observation
Learning Activity
Evidence
```

Pertanyaan:

> Bagaimana Teacher mengetahui dan mencatat perkembangan anak?

---

# 64. PRIORITY 3 — STUDENT DEVELOPMENT

Validasi:

```text
Observation
Development
Evidence
Review
```

Pertanyaan:

> Bagaimana School memahami perkembangan seorang anak dari waktu ke waktu?

---

# 65. PRIORITY 4 — ATTENDANCE

Validasi:

```text
Student
Class
Attendance
Teacher Responsibility
```

Pertanyaan:

> Bagaimana kehadiran sebenarnya dicatat dan dikoreksi?

---

# 66. PRIORITY 5 — GUARDIAN COMMUNICATION

Validasi:

```text
Guardian
Student
Communication
Evidence
```

Pertanyaan:

> Informasi apa yang benar-benar perlu diketahui Guardian?

---

# 67. PRIORITY 6 — ENROLLMENT

Validasi:

```text
Student
Enrollment
Academic Year
Class Placement
```

Pertanyaan:

> Bagaimana Student masuk dan berpindah dalam School?

---

# 68. PRIORITY 7 — SCHOOL REVIEW

Validasi:

```text
School
Class
Student
Attendance
Development
Review
```

Pertanyaan:

> Bagaimana leadership memahami kondisi sekolah?

---

# 69. REALITY VALIDATION METHOD

Sebelum database dibangun, setiap critical entity idealnya divalidasi melalui:

```text
Observe
   ↓
Ask
   ↓
Map
   ↓
Compare
   ↓
Simplify
   ↓
Document
```

Bukan:

```text
Developer Guess
 ↓
Database
```

---

# 70. FIELD VALIDATION

Setiap candidate attribute harus melewati:

```text
Purpose
 ↓
User
 ↓
Workflow
 ↓
Frequency
 ↓
Sensitivity
 ↓
Retention
```

Baru kemudian dipertimbangkan sebagai actual field.

---

# 71. DOMAIN BOUNDARY TEST

Sebuah entity layak menjadi domain entity jika:

1. memiliki business meaning;
2. memiliki lifecycle atau identity yang jelas;
3. digunakan oleh satu atau lebih workflow;
4. memiliki relationship meaningful;
5. membutuhkan governance atau authorization sendiri.

Jika tidak:

> mungkin cukup menjadi attribute atau derived value.

---

# 72. ATTRIBUTE VS ENTITY TEST

Contoh:

```text
Class Name
```

kemungkinan attribute.

Sedangkan:

```text
Class Placement
```

adalah entity karena memiliki:

- relationship;
- lifecycle;
- context;
- history;
- authorization implications.

---

# 73. RELATIONSHIP VS ATTRIBUTE TEST

Contoh:

```text
Guardian Type = Mother
```

dapat terlihat seperti attribute.

Tetapi jika relationship tersebut menentukan:

- access;
- communication;
- history;
- status;

maka lebih tepat menjadi:

```text
Guardian Relationship
```

---

# 74. TEMPORAL TEST

Tanyakan:

> Apakah hubungan ini dapat berubah?

Jika ya, pertimbangkan entity relationship dengan effective period.

Contoh:

```text
Student → Class
Teacher → Class
Person → Student
```

---

# 75. HISTORY TEST

Tanyakan:

> Apakah kita perlu mengetahui bagaimana kondisi sebelumnya?

Jika ya:

```text
Current State
```

saja tidak cukup.

---

# 76. AUTHORIZATION TEST

Tanyakan:

> Apakah relationship ini menentukan siapa yang boleh melakukan apa?

Jika ya, relationship harus menjadi bagian eksplisit model.

---

# 77. PRIVACY TEST

Tanyakan:

> Apakah entity ini mengandung child/personal information yang membutuhkan boundary khusus?

Jika ya:

- minimize;
- classify;
- protect;
- audit.

---

# 78. FUTURE TEST

Tanyakan:

> Apakah model ini tetap masuk akal ketika School OS berkembang ke SD?

Jika tidak:

> Apakah perbedaan tersebut benar-benar domain-specific atau hanya akibat asumsi TK saat ini?

---

# 79. ANTI-PATTERN: TK-SPECIFIC CORE

Jangan membuat core model seperti:

```text
TKStudent
TKClass
TKObservation
TKDevelopment
```

hanya karena pilot pertama adalah TK.

Pilot harus menguji common school model.

---

# 80. ANTI-PATTERN: GENERIC EVERYTHING

Sebaliknya jangan langsung membuat:

```text
UniversalEntity
UniversalRelationship
UniversalWorkflow
UniversalAssessment
UniversalMetadata
```

demi future-proofing.

Future-proofing bukan berarti membuat semuanya generic.

---

# 81. ANTI-PATTERN: PEDAGOGICAL OVER-MODELING

Jangan langsung membuat:

```text
Curriculum
Subject
Competency
Indicator
Rubric
Assessment
Score
Learning Standard
Learning Outcome
```

sebelum pedagogical reality TK divalidasi.

---

# 82. ANTI-PATTERN: ROLE DUPLICATION

Hindari:

```text
Teacher Person
Guardian Person
Staff Person
```

sebagai identity berbeda.

Gunakan:

```text
Person
 ↓
Relationship / Responsibility
```

---

# 83. ANTI-PATTERN: GIANT STUDENT ENTITY

Jangan membuat satu Student object yang berisi seluruh:

```text
Attendance
Learning
Observation
Development
Communication
Evidence
```

Student adalah anchor.

Bukan tempat semua data ditumpuk.

---

# 84. ANTI-PATTERN: REPORT AS ENTITY

Report adalah projection.

Bukan source of truth.

---

# 85. ANTI-PATTERN: EVIDENCE AS TRUTH

Evidence mendukung interpretation.

Bukan menggantikan professional judgment.

---

# 86. ANTI-PATTERN: CURRENT STATE ONLY

Current state tanpa history akan menghilangkan institutional memory.

---

# 87. ANTI-PATTERN: HISTORY EVERYTHING

Tidak semua perubahan membutuhkan event-sourcing kompleks.

Gunakan history berdasarkan business meaning dan risk.

---

# 88. TRACEABILITY TO CONSTITUTION

Model ini secara langsung mendukung:

```text
C-01 Educational Mission
C-02 Stewardship
C-03 Human Dignity
C-04 Child-Centered Education
C-06 School Autonomy
C-07 Workflow Before Feature
C-08 Evidence Before Assumption
C-09 Institutional Knowledge
C-11 Simplicity
C-12 Future-Proofing
C-13 Canonical Information
C-14 Contextual Authorization
C-15 Privacy by Design
C-16 Security by Architecture
C-17 Service Before Surveillance
C-20 Evolution Over Perfection
```

Non-negotiables tersebut ditetapkan dalam Constitution. 

---

# 89. TRACEABILITY TO UX

Canonical UX model:

```text
ACTOR
 ↓
CONTEXT
 ↓
WORKSPACE
 ↓
ENTITY
 ↓
SECTION
 ↓
ACTION
 ↓
OUTCOME
```



Entity model menyediakan bagian:

```text
CONTEXT
ENTITY
ACTION TARGET
OUTCOME
```

---

# 90. TRACEABILITY TO TECHNICAL ARCHITECTURE

Technical Architecture menetapkan:

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

Domain & Entity Specification sekarang mengisi:

```text
Identity
Context
Domain Rules
Relationships
```

sebelum physical database dibuat. 

---

# 91. TRACEABILITY TO PRODUCT

Product Blueprint menetapkan:

```text
PEOPLE
 ↓
STUDENTS
 ↓
DAILY EDUCATION
 ↓
OBSERVATION
 ↓
DEVELOPMENT
 ↓
COMMUNICATION
 ↓
REVIEW
```

Entity model memetakan:

```text
Person
Student
Learning Activity
Observation
Development
Communication
Review
```



---

# 92. DOMAIN READINESS TEST

Sebuah domain siap masuk Database Blueprint apabila:

```text
[ ] Business meaning clear
[ ] Owner clear
[ ] Context clear
[ ] Identity clear
[ ] Relationships clear
[ ] Lifecycle understood
[ ] Authorization understood
[ ] Privacy understood
[ ] Workflow validated
[ ] Critical unknowns resolved
```

Tidak harus semua sempurna, tetapi critical uncertainty harus diketahui.

---

# 93. DATABASE READINESS RULE

Entity tidak boleh masuk physical schema hanya karena:

> "kita sudah punya nama entity."

Harus ada:

```text
Meaning
+
Relationship
+
Lifecycle
+
Workflow
+
Authorization
```

yang cukup jelas.

---

# 94. CURRENT DATABASE READINESS

### Ready / Near Ready

```text
School
Person
Academic Year
Class
```

### Needs Validation

```text
Student
Enrollment
Class Placement
Teacher Responsibility
Staff Responsibility
Guardian Relationship
Attendance
```

### Discovery Before Schema

```text
Learning Activity
Observation
Development
Evidence
Communication
Review
```

---

# 95. NEXT VALIDATION GATE

Sebelum:

```text
DATABASE BLUEPRINT
```

kita membutuhkan:

```text
TK PILOT REALITY VALIDATION
```

Tujuannya bukan melakukan redesign besar.

Tujuannya:

> memastikan model konseptual benar-benar mencerminkan cara TK bekerja.

---

# 96. VALIDATION QUESTIONS

Minimal kita perlu mendapatkan jawaban nyata mengenai:

### School

Bagaimana struktur dan governance School?

### People

Siapa saja actor sebenarnya?

### Teacher

Bagaimana Teacher bekerja sehari-hari?

### Class

Bagaimana Class dibentuk dan dikelola?

### Student

Bagaimana Student didefinisikan secara administratif dan pedagogis?

### Enrollment

Bagaimana Student masuk School?

### Attendance

Bagaimana kehadiran dicatat?

### Learning

Apa yang benar-benar dilakukan Teacher?

### Observation

Bagaimana Teacher melakukan observation?

### Development

Bagaimana perkembangan anak dipahami?

### Guardian

Informasi apa yang diberikan kepada Guardian?

### Leadership

Bagaimana leadership melakukan review?

---

# 97. THE MOST IMPORTANT VALIDATION

Pertanyaan paling penting bukan:

> "Table apa yang kita butuhkan?"

Tetapi:

> **"Bagaimana sebenarnya sebuah hari berjalan di TK?"**

Kemudian:

```text
DAY
 ↓
PEOPLE
 ↓
WORK
 ↓
INFORMATION
 ↓
OBSERVATION
 ↓
DECISION
```

Data model harus mengikuti realitas tersebut.

---

# 98. PILOT DISCOVERY LOOP

```text
CURRENT MODEL
      ↓
REAL TK
      ↓
OBSERVE
      ↓
DISCOVER
      ↓
COMPARE
      ↓
SIMPLIFY
      ↓
UPDATE MODEL
      ↓
VALIDATE AGAIN
```

Ini sesuai dengan prinsip:

> **Build → Use → Learn → Evolve.** 

---

# 99. GOVERNANCE

Perubahan significant terhadap entity model mengikuti:

```text
Observation
 ↓
Evidence
 ↓
Proposal
 ↓
Impact Analysis
 ↓
Decision
 ↓
Documentation
 ↓
Affected Documents Review
```

Ini mengikuti governance model Constitution. 

---

# 100. WHAT THIS DOCUMENT FREEZES

Dokumen ini **tidak freeze database**.

Yang menjadi working baseline:

```text
17 conceptual entities
10 domain groups
Canonical identity principle
Context model
Relationship model
Lifecycle principle
Authorization dependency
Privacy principle
Evidence / assumption distinction
```

---

# 101. WHAT THIS DOCUMENT DOES NOT FREEZE

Belum frozen:

```text
Exact attributes
Exact field names
Exact data types
Exact Student/Person relationship
Exact curriculum model
Exact development model
Exact observation model
Exact evidence model
Exact communication model
Exact reporting model
Exact retention
Exact RLS
Exact database schema
```

---

# 102. CURRENT STATUS

**YAPENDIK SCHOOL OS TK PILOT DOMAIN & ENTITY SPECIFICATION**

Version:

**0.1**

Status:

**LIVING — DISCOVERY**

Maturity:

**DOMAIN BASELINE**

Authority:

Derived from YAPENDIK OS Constitution.

Scope:

**School OS — TK Pilot**

Purpose:

**Bridge between Conceptual Data Model and Database Blueprint**

Not:

**Frozen Database Specification**

---

# 103. ARCHITECTURAL POSITION AFTER THIS DOCUMENT

Sekarang rantai kita menjadi:

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
DATA MODEL
        ↓
DOMAIN & ENTITY SPECIFICATION
        ↓
★ TK PILOT REALITY VALIDATION ★
        ↓
DATABASE BLUEPRINT
        ↓
API / APPLICATION CONTRACT
        ↓
IMPLEMENTATION
```

Dan menurut saya ini **lebih sehat** daripada langsung membuat Database Blueprint.

Karena kita sudah sampai pada titik di mana kita punya cukup model untuk mulai **menghadapkan desain dengan sekolah nyata**.

---

# 104. NORTH STAR

Pada akhirnya, tujuan Domain & Entity Specification bukan menghasilkan banyak entity.

Tujuannya adalah memastikan:

```text
REAL SCHOOL
      ↓
REAL PEOPLE
      ↓
REAL WORK
      ↓
REAL CONTEXT
      ↓
REAL INFORMATION
      ↓
TRUSTWORTHY MODEL
      ↓
SIMPLE TECHNOLOGY
```

Dan prinsip yang harus tetap kita pegang:

> **Kita tidak sedang mendesain database sekolah. Kita sedang memahami realitas sekolah, lalu membuat model informasi yang cukup sederhana untuk merepresentasikannya dengan benar dan cukup sehat untuk berkembang bersama Yapendik.**