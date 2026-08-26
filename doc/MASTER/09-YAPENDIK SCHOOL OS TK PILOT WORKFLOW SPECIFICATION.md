# YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION

Versi: 0.1  
Organisasi: Yayasan Pendidikan GPIB (Yapendik)  
Sistem: Yapendik Operating System  
Produk: School OS  
Pilot: TK  
Jenis Dokumen: Spesifikasi Workflow  
Status: LIVING — DISCOVERY  
Pendekatan: Common Sense First  
Prinsip: Make It Simple. Keep It Future-Proof.

Derived From:

YAPENDIK OPERATING SYSTEM CONSTITUTION

YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE

YAPENDIK SCHOOL OS OPERATING MODEL

YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT

YAPENDIK SCHOOL OS UX ARCHITECTURE

YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE

YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT

YAPENDIK SCHOOL OS TK PILOT — SPESIFIKASI DOMAIN & ENTITAS

---

# 1. TUJUAN DOKUMEN

Dokumen ini mendefinisikan bagaimana pengguna School OS menyelesaikan pekerjaan nyata melalui system.

Jika Domain & Entity Specification menjawab:

> "Apa yang ada di dalam system?"

maka Workflow Specification menjawab:

> "Apa yang dilakukan manusia dengan hal-hal tersebut?"

Workflow menjadi penghubung antara:

PERSON

↓

CONTEXT

↓

WORK

↓

ENTITY

↓

ACTION

↓

OUTCOME

---

# 2. PRINSIP WORKFLOW

## 2.1 Workflow Berasal dari Pekerjaan Nyata

System tidak boleh menentukan workflow hanya berdasarkan struktur database.

Workflow harus mengikuti cara kerja sekolah.

---

## 2.2 Context First

User harus memahami:

> Saya sedang berada di mana?

sebelum system meminta:

> Apa yang ingin Anda lakukan?

---

## 2.3 Action Harus Memiliki Context

Action harus dapat dijelaskan:

WHO

+

WHERE

+

WHAT

+

WHEN

+

WHY / PURPOSE

---

## 2.4 Jangan Membuat User Mencari Context Berulang Kali

Jika Teacher sedang bekerja di Class tertentu, system seharusnya mempertahankan context tersebut.

Teacher tidak perlu berulang kali:

School → Academic Year → Class

untuk setiap action.

---

## 2.5 Workflow Harus Sesingkat yang Masuk Akal

Bukan:

> sesingkat mungkin dengan mengorbankan clarity.

Tetapi:

> sesingkat mungkin tanpa mengorbankan accuracy, context, dan trust.

---

# 3. WORKFLOW MODEL

Model dasar School OS:

```text
PERSON
   ↓
IDENTITY
   ↓
CONTEXT
   ↓
WORKSPACE
   ↓
ENTITY
   ↓
ACTION
   ↓
OUTCOME
```

Contoh:

```text
Teacher
   ↓
School / Academic Year / Class
   ↓
Class Workspace
   ↓
Student
   ↓
Record Attendance
   ↓
Attendance Saved
```

---

# 4. AKTOR UTAMA

TK Pilot memiliki empat kelompok aktor utama:

1. Teacher
2. Administrator / Staff Sekolah
3. Leadership Sekolah
4. Guardian

Beberapa aktor dapat memiliki lebih dari satu responsibility.

---

# 5. CONTEXT HIERARCHY

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

Tidak semua workflow membutuhkan seluruh hierarchy.

Namun setiap workflow harus memiliki context yang dapat dijelaskan.

---

# 6. WORKFLOW GROUPS

Workflow TK Pilot dibagi menjadi:

A. Foundation Workflows

B. School Setup Workflows

C. Teacher Daily Workflows

D. Student Workflows

E. Development Workflows

F. Guardian Workflows

G. Leadership Workflows

H. Administrative Workflows

I. System / Governance Workflows

---

# 7. FOUNDATION WORKFLOW

## WF-001 — Login

### Aktor

Semua pengguna authenticated.

### Tujuan

Masuk ke School OS.

### Flow

```text
User
 ↓
Open School OS
 ↓
Authentication
 ↓
Identity Resolution
 ↓
Context Resolution
 ↓
Home / Relevant Workspace
```

### Outcome

User masuk ke context yang sesuai.

### Failure

Authentication gagal.

### Prinsip

Login bukan tujuan.

Login hanya pintu menuju pekerjaan.

---

# 8. WF-002 — RESOLVE SCHOOL CONTEXT

### Aktor

Authenticated User.

### Tujuan

Menentukan School context tempat user bekerja.

### Flow

```text
User
 ↓
Person
 ↓
School Membership
 ↓
Role / Responsibility
 ↓
School Context
```

Jika user hanya memiliki satu School context:

System sebaiknya langsung masuk.

Jika memiliki beberapa context:

System meminta pilihan yang diperlukan.

---

# 9. WF-003 — RESOLVE ACADEMIC CONTEXT

### Flow

```text
School
 ↓
Academic Year
 ↓
Current Context
```

System sebaiknya memiliki default current academic year.

User tetap dapat berpindah context jika memiliki authorization.

---

# 10. WF-004 — OPEN CLASS WORKSPACE

### Aktor

Teacher

### Flow

```text
Teacher
 ↓
School
 ↓
Academic Year
 ↓
Class
 ↓
Class Workspace
```

### Class Workspace menampilkan:

- identity Class;
- Student list;
- current work;
- attendance;
- relevant observations;
- quick actions.

---

# 11. SCHOOL SETUP WORKFLOWS

# WF-101 — CREATE SCHOOL

### Aktor

Authorized Administrator.

### Flow

```text
Administrator
 ↓
Create School
 ↓
Enter Basic Information
 ↓
Validate
 ↓
Save
 ↓
School Created
```

### Outcome

School menjadi operational context.

---

# 12. WF-102 — CREATE ACADEMIC YEAR

### Flow

```text
School
 ↓
Academic Year
 ↓
Create
 ↓
Define Period
 ↓
Save
```

### Outcome

Academic context tersedia.

---

# 13. WF-103 — CREATE CLASS

### Flow

```text
School
 ↓
Academic Year
 ↓
Classes
 ↓
Create Class
 ↓
Define Class Information
 ↓
Save
```

---

# 14. WF-104 — ASSIGN TEACHER

### Flow

```text
Teacher
 ↓
Class
 ↓
Assignment
 ↓
Define Responsibility
 ↓
Save
```

### Authorization

Hanya authorized administrator / leadership.

---

# 15. WF-105 — REGISTER STUDENT

### Flow

```text
Administrator
 ↓
Student
 ↓
Create / Find Person
 ↓
Student Information
 ↓
Guardian Relationship
 ↓
Enrollment
 ↓
Save
```

### Prinsip penting

Sebelum membuat Student baru, system harus dapat membantu mencegah duplicate identity.

---

# 16. WF-106 — ENROLL STUDENT

### Flow

```text
Student
 ↓
Academic Year
 ↓
Enrollment
 ↓
Class
 ↓
Save
```

### Outcome

Student menjadi bagian dari Class dalam Academic Year tertentu.

---

# 17. WF-107 — UPDATE STUDENT INFORMATION

### Aktor

Authorized user.

### Flow

```text
Student
 ↓
Profile
 ↓
Edit
 ↓
Validate
 ↓
Save
```

Tidak semua information dapat diubah oleh semua actor.

---

# 18. TEACHER DAILY WORKFLOW

Teacher workflow adalah prioritas utama TK Pilot.

Model:

```text
Teacher
 ↓
Class
 ↓
Today's Work
 ↓
Students
 ↓
Action
```

---

# 19. WF-201 — START DAILY WORK

### Aktor

Teacher.

### Tujuan

Teacher langsung melihat pekerjaan yang relevan hari ini.

### Flow

```text
Teacher Login
 ↓
Current School
 ↓
Current Class
 ↓
Today's Work
```

### Possible actions:

Attendance

Student

Observation

Learning

Communication

---

# 20. WF-202 — VIEW CLASS STUDENTS

### Flow

```text
Class Workspace
 ↓
Student List
 ↓
Select Student
 ↓
Student Context
```

### Outcome

Teacher memahami:

Siapa Student?

Apa context-nya?

Apa informasi penting yang relevan?

---

# 21. WF-203 — RECORD ATTENDANCE

Ini adalah **Vertical Slice #1**.

### Aktor

Teacher.

### Context

School

Academic Year

Class

Date / Session

### Flow

```text
Teacher
 ↓
Class
 ↓
Attendance
 ↓
Student List
 ↓
Set Attendance Status
 ↓
Review
 ↓
Save
 ↓
Confirmation
```

---

# 22. ATTENDANCE STATUS

Status awal dapat berupa:

Hadir

Sakit

Izin

Alpa / Tidak hadir

Status final harus divalidasi dengan praktik TK Pilot.

---

# 23. ATTENDANCE VALIDATION

Sebelum save:

System harus memastikan:

Student belongs to Class context.

Class belongs to current Academic Year.

Teacher has authorization.

Date / session valid.

Tidak ada duplicate logical record.

---

# 24. ATTENDANCE OUTCOME

Success:

> Attendance berhasil dicatat.

Failure:

> User mendapat informasi yang jelas dan dapat melakukan recovery.

System tidak boleh membuat user bertanya:

> "Tadi sudah tersimpan atau belum?"

---

# 25. WF-204 — EDIT ATTENDANCE

### Flow

```text
Class
 ↓
Attendance
 ↓
Existing Record
 ↓
Edit
 ↓
Reason / appropriate metadata
 ↓
Save
```

Jika perubahan attendance memiliki governance requirement, perubahan harus dapat diaudit.

---

# 26. WF-205 — VIEW STUDENT

### Flow

```text
Class
 ↓
Student
 ↓
Student Workspace
```

Student Workspace menjadi pusat informasi Student.

---

# 27. STUDENT WORKSPACE

Minimum sections:

```text
Overview
Profile
Attendance
Learning
Development
Evidence
Communication
```

Tidak semua section harus langsung aktif pada MVP.

---

# 28. WF-206 — RECORD OBSERVATION

Ini adalah **Vertical Slice #2**.

### Aktor

Teacher.

### Context

Class

Student

Activity / Context

### Flow

```text
Teacher
 ↓
Class
 ↓
Student
 ↓
Observe
 ↓
Record Observation
 ↓
Context
 ↓
Observation Content
 ↓
Optional Evidence
 ↓
Optional Follow-up
 ↓
Save
```

---

# 29. OBSERVATION UX PRINCIPLE

Form harus membantu Teacher mencatat pengamatan tanpa mengubah observation menjadi administrative burden.

Jika Teacher harus mengisi terlalu banyak field untuk setiap observation:

> workflow harus disederhanakan.

---

# 30. WF-207 — VIEW OBSERVATIONS

### Flow

```text
Student
 ↓
Development
 ↓
Observations
 ↓
Relevant Observation
 ↓
Detail
```

Teacher melihat observation dalam context.

---

# 31. WF-208 — ATTACH EVIDENCE

### Flow

```text
Observation
 ↓
Add Evidence
 ↓
Capture / Select
 ↓
Add Context
 ↓
Upload
 ↓
Attach
```

### Prinsip

Evidence harus terhubung dengan record yang jelas.

---

# 32. WF-209 — RECORD LEARNING

### Flow

```text
Class
 ↓
Learning Activity
 ↓
Student / Group
 ↓
Record Relevant Information
 ↓
Save
```

Detail pedagogical workflow masih discovery.

---

# 33. WF-210 — REVIEW STUDENT

### Aktor

Teacher.

### Flow

```text
Student
 ↓
Overview
 ↓
Attendance
 ↓
Learning
 ↓
Observation
 ↓
Development
 ↓
Review
```

Tujuan:

Memberikan gambaran bermakna tanpa mengharuskan Teacher membuka banyak lokasi.

---

# 34. WF-211 — CREATE FOLLOW-UP

### Flow

```text
Observation / Review
 ↓
Identify Need
 ↓
Create Follow-up
 ↓
Assign Owner
 ↓
Set Status
 ↓
Save
```

---

# 35. FOLLOW-UP STATES

Initial model:

Open

↓

In Progress

↓

Completed

atau

Cancelled

Model dapat disederhanakan setelah pilot.

---

# 36. DEVELOPMENT WORKFLOWS

Development tidak dimulai dari score.

Model:

```text
Observation
 ↓
Evidence
 ↓
Review
 ↓
Development Understanding
 ↓
Follow-up
```

---

# 37. WF-301 — REVIEW DEVELOPMENT

### Aktor

Teacher / Authorized Reviewer.

### Flow

```text
Student
 ↓
Development
 ↓
Review Relevant Information
 ↓
Observation
 ↓
Evidence
 ↓
Interpretation
 ↓
Development Record
```

---

# 38. DEVELOPMENT RECORD PRINCIPLE

System membantu manusia melihat pola.

System tidak boleh mengklaim:

> "System menentukan perkembangan anak."

Human professional remains responsible for interpretation.

---

# 39. WF-302 — UPDATE DEVELOPMENT RECORD

### Flow

```text
Student
 ↓
Development
 ↓
Existing Record
 ↓
Update
 ↓
Save
```

History penting untuk menjaga traceability.

---

# 40. WF-303 — DEVELOPMENT FOLLOW-UP

### Flow

```text
Development Review
 ↓
Identify Follow-up
 ↓
Assign
 ↓
Action
 ↓
Review Outcome
```

---

# 41. GUARDIAN WORKFLOWS

Guardian memiliki context yang lebih sempit.

Guardian harus melihat:

> information relevant to their child and permitted by School.

---

# 42. WF-401 — GUARDIAN LOGIN

### Flow

```text
Guardian
 ↓
Authentication
 ↓
Person Resolution
 ↓
Guardian Relationship
 ↓
Student Context
 ↓
Guardian Experience
```

---

# 43. WF-402 — VIEW CHILD

### Flow

```text
Guardian
 ↓
Child
 ↓
Overview
```

Information harus difilter berdasarkan authorization.

---

# 44. WF-403 — RECEIVE COMMUNICATION

### Flow

```text
School / Teacher
 ↓
Communication
 ↓
Guardian
 ↓
Read
 ↓
Acknowledge / Respond if required
```

---

# 45. WF-404 — RESPOND TO COMMUNICATION

### Flow

```text
Communication
 ↓
Respond
 ↓
Message / Response
 ↓
Submit
 ↓
School receives response
```

---

# 46. WF-405 — VIEW RELEVANT DEVELOPMENT INFORMATION

Jika policy sekolah mengizinkan:

```text
Guardian
 ↓
Child
 ↓
Relevant Development Information
```

Tidak semua internal observation otomatis visible kepada Guardian.

Visibility adalah policy + authorization decision.

---

# 47. LEADERSHIP WORKFLOWS

Leadership membutuhkan:

> visibility without unnecessary operational detail.

---

# 48. WF-501 — SCHOOL OVERVIEW

### Flow

```text
Leadership
 ↓
School
 ↓
Overview
 ↓
Current Signals
```

---

# 49. SCHOOL OVERVIEW

Potential information:

Jumlah Student

Jumlah Class

Attendance signal

Important follow-ups

Development signals

Operational notices

Data completeness

Semua harus berasal dari canonical information.

---

# 50. WF-502 — REVIEW CLASS

### Flow

```text
School
 ↓
Class
 ↓
Class Overview
 ↓
Relevant Signals
 ↓
Review
```

Leadership tidak otomatis mendapatkan akses ke seluruh detail pribadi jika tidak diperlukan.

---

# 51. WF-503 — REVIEW FOLLOW-UP

### Flow

```text
Leadership
 ↓
Follow-up Queue
 ↓
Open Item
 ↓
Review
 ↓
Action
 ↓
Close / Escalate
```

---

# 52. ADMINISTRATIVE WORKFLOWS

Administrator bertanggung jawab terhadap operational setup.

Priority:

School setup

Academic Year

Class

People

Student

Enrollment

Guardian relationship

Teacher assignment

---

# 53. WF-601 — MANAGE PEOPLE

### Flow

```text
Administration
 ↓
People
 ↓
Find / Create Person
 ↓
Relationship / Responsibility
 ↓
Save
```

---

# 54. WF-602 — MANAGE CLASS

### Flow

```text
Administration
 ↓
Academic Year
 ↓
Class
 ↓
Students
 ↓
Teachers
```

---

# 55. WF-603 — MANAGE ENROLLMENT

### Flow

```text
Student
 ↓
Enrollment
 ↓
Academic Year
 ↓
Class
 ↓
Status
```

---

# 56. WF-604 — MANAGE GUARDIAN RELATIONSHIP

### Flow

```text
Student
 ↓
Guardian
 ↓
Find / Create Person
 ↓
Define Relationship
 ↓
Authorization Scope
 ↓
Save
```

---

# 57. WORKFLOW: SEARCH

Search bukan primary navigation.

Search digunakan ketika user sudah mengetahui sesuatu yang ingin ditemukan.

Contoh:

```text
Teacher
 ↓
Current Class
 ↓
Search Student
```

Bukan:

```text
Search Everything
 ↓
Figure out context later
```

---

# 58. WORKFLOW: NOTIFICATION

Notification bukan workflow utama.

Pattern:

```text
Business Event
 ↓
Determine Relevance
 ↓
Determine Recipient
 ↓
Notification
 ↓
User Action
```

---

# 59. WORKFLOW: ERROR RECOVERY

Setiap workflow penting harus memiliki recovery.

Pattern:

```text
Action
 ↓
Failure
 ↓
Explain
 ↓
Preserve User Intent
 ↓
Retry / Correct
```

Contoh:

Attendance save gagal.

System tidak boleh menghapus seluruh input tanpa penjelasan.

---

# 60. WORKFLOW: NETWORK INTERRUPTION

Untuk MVP:

Jika transaction gagal karena network:

System harus memberikan status yang jelas.

Offline-first synchronization belum menjadi requirement default.

Jika evidence pilot menunjukkan kebutuhan:

Workflow dapat berkembang menjadi:

```text
Local Pending State
 ↓
Sync
 ↓
Confirmation
```

---

# 61. WORKFLOW: DUPLICATE PREVENTION

Contoh:

Administrator mencoba membuat Student yang kemungkinan sudah ada.

System harus membantu:

Find existing Person / Student

↓

Confirm identity

↓

Create relationship / enrollment

bukan langsung membuat duplicate.

---

# 62. WORKFLOW: CONTEXT SWITCH

Jika user memiliki beberapa context:

```text
Current Context
 ↓
Switch Context
 ↓
Select School / Academic Year / Class
 ↓
New Context
```

Context switch harus terlihat jelas.

---

# 63. CONTEXT VISIBILITY

UI harus selalu memberikan indicator:

School

Academic Year

Class

Student

sesuai kedalaman context saat itu.

---

# 64. WORKFLOW STATE MODEL

Workflow dapat memiliki:

Not Started

↓

In Progress

↓

Completed

atau:

Failed

↓

Retry

---

# 65. TRANSACTION BOUNDARY

Setiap action harus jelas:

Apa yang sebenarnya dilakukan?

Contoh:

"Record Attendance"

adalah satu logical operation.

"Create Student"

mungkin merupakan beberapa underlying database operations tetapi harus terasa sebagai satu coherent workflow kepada user.

---

# 66. WORKFLOW VS SCREEN

Satu workflow tidak selalu sama dengan satu screen.

Contoh:

Record Student:

```text
Student Search
 ↓
Student Form
 ↓
Guardian
 ↓
Enrollment
 ↓
Confirmation
```

Tetap satu workflow.

---

# 67. WORKFLOW VS FEATURE

Feature dapat mendukung banyak workflow.

Contoh:

Student Workspace mendukung:

View Student

Attendance review

Observation

Development

Communication

---

# 68. WORKFLOW PRIORITY

### Tier 1 — Pilot Critical

Login

Context

Class

Student

Attendance

Observation

Student Review

### Tier 2 — Pilot Important

Enrollment

Guardian

Evidence

Development

Communication

### Tier 3 — Later

Advanced reporting

Automation

Advanced intelligence

Complex integrations

---

# 69. FIRST VERTICAL SLICE

Workflow pertama yang harus benar-benar selesai:

```text
Teacher
 ↓
Login
 ↓
School
 ↓
Academic Year
 ↓
Class
 ↓
Students
 ↓
Attendance
 ↓
Save
 ↓
Confirmation
```

---

# 70. SECOND VERTICAL SLICE

```text
Teacher
 ↓
Class
 ↓
Student
 ↓
Observation
 ↓
Evidence
 ↓
Save
 ↓
Student Development Context
```

---

# 71. THIRD VERTICAL SLICE

```text
Student
 ↓
Guardian
 ↓
Relevant Communication
 ↓
Response
```

---

# 72. FOURTH VERTICAL SLICE

```text
Leadership
 ↓
School
 ↓
Current Signals
 ↓
Review
 ↓
Follow-up
```

---

# 73. WORKFLOW ACCEPTANCE CRITERIA

Workflow dianggap valid jika:

1. Actor jelas.
2. Context jelas.
3. Starting point jelas.
4. Action jelas.
5. Required information jelas.
6. Authorization jelas.
7. Outcome jelas.
8. Error path jelas.
9. Data persisted correctly.
10. User dapat memahami status akhir.

---

# 74. USER JOURNEY ACCEPTANCE

User tidak boleh perlu memahami internal architecture untuk menyelesaikan workflow.

Teacher tidak perlu tahu:

database

API

domain service

transaction

authorization layer

User hanya perlu memahami pekerjaannya.

---

# 75. WORKFLOW TESTING

Testing harus menggunakan bahasa pekerjaan.

Bukan:

"Endpoint returns 200."

Tetapi:

> "Teacher dapat mencatat kehadiran seluruh siswa di kelas yang menjadi tanggung jawabnya."

Technical tests tetap diperlukan, tetapi tidak menggantikan workflow acceptance.

---

# 76. AUTHORIZATION TESTING

Untuk setiap workflow:

Pertanyaan pertama:

> Siapa yang boleh melakukan ini?

Pertanyaan kedua:

> Dalam context apa?

Pertanyaan ketiga:

> Terhadap entity apa?

Pertanyaan keempat:

> Apa yang tidak boleh dilakukan?

---

# 77. DATA TRACEABILITY

Setiap workflow penting harus dapat ditelusuri:

Actor

↓

Context

↓

Action

↓

Entity

↓

Record

↓

Outcome

---

# 78. EXAMPLE — ATTENDANCE TRACE

```text
Teacher: Person X
Context: School A
Academic Year: 2026/2027
Class: TK B
Action: Record Attendance
Entity: Student Y
Date: Today
Outcome: Present
```

---

# 79. EXAMPLE — OBSERVATION TRACE

```text
Teacher: Person X
Context: School A / TK B
Student: Y
Activity: Free Play
Action: Record Observation
Observation: ...
Evidence: Optional
Follow-up: Optional
```

---

# 80. WORKFLOW AUDITABILITY

Workflow dengan risk lebih tinggi harus memiliki audit trail yang memadai.

Minimum:

WHO

WHAT

WHEN

CONTEXT

---

# 81. WORKFLOW PRIVACY

Workflow tidak boleh memperluas visibility hanya karena user sedang berada di context tertentu.

Contoh:

Teacher dapat melihat Student di Class.

Tidak berarti Teacher otomatis dapat melihat seluruh historical information Student yang sensitif.

---

# 82. WORKFLOW SIMPLICITY TEST

Untuk setiap workflow:

Apakah user tahu harus mulai dari mana?

Apakah context terlihat?

Apakah action utama jelas?

Apakah jumlah langkah masuk akal?

Apakah system memberi feedback?

Apakah user tahu hasil akhirnya?

---

# 83. WORKFLOW DISCOVERY RULE

Workflow yang tertulis dalam dokumen ini adalah:

> baseline hypothesis.

Bukan klaim bahwa semua TK Yapendik bekerja persis seperti ini.

Validasi dengan sekolah diperlukan.

---

# 84. PILOT VALIDATION METHOD

Untuk setiap workflow utama:

1. Observe user melakukan pekerjaan sekarang.
2. Catat actual steps.
3. Identifikasi manual work.
4. Identifikasi decision points.
5. Identifikasi data yang digunakan.
6. Identifikasi siapa yang terlibat.
7. Bandingkan dengan proposed workflow.
8. Perbaiki workflow.
9. Baru implementasikan.

---

# 85. WHAT WE SHOULD NOT DO

Jangan:

membuat workflow berdasarkan database table.

Jangan:

membuat menu untuk setiap entity.

Jangan:

membuat form panjang sebelum memahami pekerjaan.

Jangan:

menganggap semua school memiliki workflow identik.

Jangan:

memaksakan AI atau automation ke workflow yang belum stabil.

---

# 86. WORKFLOW → TECHNICAL IMPLEMENTATION

Setelah workflow tervalidasi:

```text
Workflow
 ↓
Use Case
 ↓
Application Service
 ↓
Domain Rule
 ↓
Persistence
 ↓
Authorization
 ↓
Audit
 ↓
UI
```

---

# 87. WORKFLOW → DATA MODEL

Contoh:

Record Attendance

membutuhkan:

Student

Class

Academic Year

Teacher / Recorder

Attendance Record

Date / Session

Status

Maka data model dapat diturunkan dari workflow.

Bukan sebaliknya.

---

# 88. WORKFLOW → AUTHORIZATION MODEL

Contoh:

Record Attendance:

Teacher

+

Assigned Class

+

Current Academic Year

↓

Allowed

Teacher

+

Different Class

↓

Denied

Teacher

+

Different School

↓

Denied

---

# 89. WORKFLOW → UX

Teacher workflow:

```text
Class
 ↓
Today
 ↓
Attendance
```

lebih natural daripada:

```text
Dashboard
 ↓
Operations
 ↓
Attendance Module
 ↓
Select School
 ↓
Select Year
 ↓
Select Class
```

Jika context sudah diketahui, jangan meminta user mengulanginya.

---

# 90. WORKFLOW → OBSERVABILITY

Core workflow harus memiliki telemetry yang cukup untuk mengetahui:

Started

Completed

Failed

Duration

Failure reason

Context

Tetapi jangan memasukkan sensitive student content ke telemetry secara sembarangan.

---

# 91. WORKFLOW GOVERNANCE

Jika workflow berubah secara signifikan:

Review:

Product Blueprint

UX Architecture

Technical Architecture

Domain Specification

Authorization Model

Dokumen yang terkena dampak harus diperbarui.

---

# 92. WORKFLOW CHANGE RULE

Perubahan kecil:

Dapat dilakukan pada implementation.

Perubahan business meaning:

Review Product / Operating Model.

Perubahan entity relationship:

Review Domain Specification.

Perubahan access boundary:

Review Authorization Model.

Perubahan technical boundary:

Review Technical Architecture / ADR.

---

# 93. OPEN WORKFLOW QUESTIONS

Masih perlu divalidasi:

1. Bagaimana Teacher memulai hari kerja?
2. Apakah Teacher menangani satu atau beberapa Class?
3. Bagaimana attendance sebenarnya dilakukan?
4. Apakah attendance dilakukan per Student atau batch?
5. Kapan Teacher melakukan observation?
6. Apakah observation dilakukan individual atau group?
7. Bagaimana evidence dikumpulkan?
8. Bagaimana development review dilakukan?
9. Apa yang dikomunikasikan kepada Guardian?
10. Apa yang perlu direview Leadership?
11. Bagaimana Administrator menangani enrollment?
12. Bagaimana school menangani perubahan data?

---

# 94. WORKFLOW MATURITY

### Level 0 — Assumption

Workflow hanya berdasarkan asumsi.

### Level 1 — Documented

Workflow sudah ditulis.

### Level 2 — Observed

Workflow dibandingkan dengan praktik nyata.

### Level 3 — Validated

Workflow disetujui / diterima oleh pengguna pilot.

### Level 4 — Implemented

Workflow tersedia di system.

### Level 5 — Proven

Workflow digunakan dan memberikan outcome yang terbukti.

Target TK Pilot:

> Core workflows minimal mencapai Level 3 sebelum production pilot.

---

# 95. CORE WORKFLOW BASELINE

Untuk TK Pilot, baseline awal:

WF-001 Login

WF-002 School Context

WF-003 Academic Context

WF-004 Class Workspace

WF-105 Register Student

WF-106 Enrollment

WF-201 Start Daily Work

WF-202 View Class Students

WF-203 Record Attendance

WF-205 View Student

WF-206 Record Observation

WF-207 View Observations

WF-208 Attach Evidence

WF-210 Review Student

WF-211 Create Follow-up

WF-401 Guardian Login

WF-403 Receive Communication

WF-501 School Overview

WF-503 Review Follow-up

---

# 96. WORKFLOW SUCCESS

Workflow berhasil bukan ketika:

> semua langkah dapat dilakukan.

Workflow berhasil ketika:

> pekerjaan nyata menjadi lebih mudah, lebih jelas, lebih aman, dan menghasilkan informasi yang lebih berguna.

---

# 97. NEXT DOCUMENT

Dokumen berikutnya setelah Workflow Specification adalah:

# YAPENDIK SCHOOL OS TK PILOT AUTHORIZATION MODEL

Dokumen tersebut akan memformalkan:

```text
WHO
 ↓
ROLE / RESPONSIBILITY
 ↓
CONTEXT
 ↓
RESOURCE
 ↓
ACTION
 ↓
ALLOW / DENY
```

Ini penting karena setelah kita mengetahui:

**entitas apa yang ada**

dan

**workflow apa yang dilakukan**

kita sekarang perlu menetapkan:

> **siapa yang boleh melakukan apa terhadap apa, dan dalam konteks apa.**

---

# 98. COMPLETE DESIGN CHAIN

```text
CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
OPERATING MODEL
        ↓
PRODUCT BLUEPRINT
        ↓
UX ARCHITECTURE
        ↓
TECHNICAL ARCHITECTURE
        ↓
IMPLEMENTATION BLUEPRINT
        ↓
DOMAIN & ENTITY SPECIFICATION
        ↓
WORKFLOW SPECIFICATION
        ↓
AUTHORIZATION MODEL
        ↓
DATA MODEL
        ↓
API / APPLICATION CONTRACTS
        ↓
BUILD
        ↓
REAL TK PILOT
```

---

# 99. STATUS

YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION

Versi: 0.1

Status:

LIVING — DISCOVERY

Scope:

TK Pilot

Pendekatan:

Common Sense First

Prinsip:

> Make It Simple. Keep It Future-Proof.

Status Workflow:

**BASELINE HYPOTHESIS — NOT YET FROZEN**

Validation Target:

**Core workflows must be observed and validated in a real TK environment before final implementation.**

---

# PENUTUP

Kita sekarang sudah mulai masuk ke bagian yang sangat konkret.

Sampai titik sebelumnya kita banyak menjawab:

> **Apa itu School OS?**

Sekarang kita sudah mulai menjawab:

> **Bagaimana School OS digunakan?**

Urutan berikutnya sangat natural:

**Domain & Entity → Workflow → Authorization → Data Model.**

Dan saya menyarankan kita **tetap menahan diri untuk belum membuat ERD/SQL** sampai Authorization Model selesai, karena authorization akan sangat memengaruhi bagaimana context, relationship, dan data boundary akhirnya dibentuk.