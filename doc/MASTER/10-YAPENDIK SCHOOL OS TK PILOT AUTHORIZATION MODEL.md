# YAPENDIK SCHOOL OS TK PILOT AUTHORIZATION MODEL

Versi: 0.1  
Organisasi: Yayasan Pendidikan GPIB (Yapendik)  
Sistem: Yapendik Operating System  
Produk: School OS  
Pilot: TK / Pendidikan Anak Usia Dini  
Jenis Dokumen: Model Otorisasi  
Status: **LIVING — DISCOVERY**  
Pendekatan: **Common Sense First**  
Prinsip: **Make It Simple. Keep It Future-Proof.**

Derived From:

- YAPENDIK OPERATING SYSTEM CONSTITUTION
- YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
- YAPENDIK SCHOOL OS OPERATING MODEL
- YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT
- YAPENDIK SCHOOL OS UX ARCHITECTURE
- YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE
- YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT
- YAPENDIK SCHOOL OS TK PILOT — SPESIFIKASI DOMAIN & ENTITAS
- YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION

---

# 1. TUJUAN DOKUMEN

Dokumen ini mendefinisikan bagaimana Yapendik School OS menentukan:

> **Siapa yang boleh melakukan apa, terhadap informasi apa, dalam konteks apa, dan dengan batasan apa.**

Authorization bukan sekadar daftar:

```text
Admin = full access
Teacher = limited access
Guardian = read only
```

Model seperti itu terlalu sederhana untuk School OS.

Constitution telah menetapkan:

> **C-14 — Contextual Authorization: Access depends on who, role, context, relationship, and action.** 

Karena itu model authorization School OS harus mempertimbangkan:

```text
WHO
+
ROLE / RESPONSIBILITY
+
CONTEXT
+
RELATIONSHIP
+
RESOURCE
+
ACTION
+
POLICY
```

---

# 2. TUJUAN AUTHORIZATION

Authorization bertujuan menjaga tiga hal sekaligus:

### 1. Enable

Orang yang memang bertanggung jawab dapat bekerja tanpa hambatan yang tidak perlu.

### 2. Protect

Informasi hanya dapat diakses oleh pihak yang memang memiliki alasan dan kewenangan.

### 3. Preserve Trust

School, Teacher, Student, Guardian, dan Yapendik dapat mempercayai bagaimana informasi digunakan.

Authorization bukan dibuat untuk menghambat pekerjaan.

> **Good authorization enables legitimate work while protecting legitimate boundaries.**

---

# 3. AUTHENTICATION VS AUTHORIZATION

Keduanya harus dibedakan.

### Authentication

Menjawab:

> Siapa Anda?

### Authorization

Menjawab:

> Setelah kami mengetahui siapa Anda, apa yang boleh Anda lakukan?

Model:

```text
Authentication
      ↓
Identity
      ↓
Authorization
      ↓
Context Validation
      ↓
Action
```

Login yang berhasil tidak berarti user otomatis memiliki akses terhadap seluruh School OS.

---

# 4. CONSTITUTIONAL SECURITY MODEL

Constitution menetapkan bahwa security harus dibangun ke dalam architecture. Model minimum:

```text
Authentication
      ↓
Authorization
      ↓
Context Validation
      ↓
Server Enforcement
      ↓
Database Enforcement
      ↓
Auditability
```

Client-side visibility bukan security boundary. 

Maka:

> **UI hiding is not authorization.**

Jika sebuah tombol tidak ditampilkan kepada user, itu hanya UX behavior.

Authorization tetap harus ditegakkan di server dan database.

---

# 5. AUTHORIZATION MODEL

Model konseptual:

```text
PERSON
   │
   ▼
IDENTITY
   │
   ▼
ROLE / RESPONSIBILITY
   │
   ▼
CONTEXT
   │
   ▼
RELATIONSHIP
   │
   ▼
RESOURCE
   │
   ▼
ACTION
   │
   ▼
POLICY
   │
   ▼
ALLOW / DENY
```

---

# 6. WHO — PERSON

Authorization selalu berawal dari manusia.

Contoh:

```text
Person A
```

Namun Person saja belum cukup untuk menentukan access.

Person yang sama dapat memiliki responsibility berbeda.

---

# 7. ROLE VS RESPONSIBILITY

School OS sebaiknya tidak menganggap role sebagai label global yang selalu berlaku di semua context.

Contoh:

Seseorang dapat menjadi:

```text
Teacher
```

di satu School,

dan memiliki responsibility lain dalam context berbeda.

Karena itu model kita menggunakan konsep:

> **Role / Responsibility**

---

# 8. CORE ACTORS TK PILOT

Initial actors:

1. Teacher
2. Administrator / Staff
3. School Leadership
4. Guardian

Aktor tambahan dapat muncul berdasarkan kebutuhan nyata.

---

# 9. TEACHER

Teacher memiliki responsibility utama terhadap proses pendidikan dan Student yang berada dalam assignment-nya.

Teacher dapat:

- melihat Student yang relevan;
- mencatat Attendance;
- membuat Observation;
- mencatat Learning information;
- melihat informasi Student yang diperlukan untuk pekerjaannya;
- membuat Follow-up;
- melakukan komunikasi yang diizinkan.

Teacher **tidak otomatis memiliki akses terhadap seluruh Student di School**.

---

# 10. ADMINISTRATOR / STAFF

Administrator menangani operational administration.

Contoh responsibility:

- School setup;
- People;
- Student;
- Enrollment;
- Class;
- Teacher Assignment;
- Guardian Relationship.

Administrator juga tidak otomatis membutuhkan seluruh informasi pedagogical yang sensitif.

---

# 11. SCHOOL LEADERSHIP

Leadership membutuhkan visibility untuk:

- memahami kondisi School;
- melakukan review;
- mengambil keputusan;
- memastikan follow-up;
- melakukan stewardship.

Namun:

> visibility tidak sama dengan unrestricted access.

Leadership harus mendapatkan informasi yang relevan dengan tanggung jawabnya.

---

# 12. GUARDIAN

Guardian memiliki hubungan khusus terhadap Student.

Akses Guardian terutama berasal dari:

```text
Person
 ↓
Guardian Relationship
 ↓
Student
```

Bukan karena Guardian memiliki role "user" semata.

Guardian hanya dapat melihat informasi yang:

- berkaitan dengan anaknya;
- diizinkan School;
- sesuai dengan privacy policy;
- relevan untuk tujuan komunikasi / pendidikan.

---

# 13. CONTEXT

Authorization tidak dapat dipisahkan dari context.

Context hierarchy:

```text
School
   ↓
Academic Year
   ↓
Class
   ↓
Student
```

Tidak semua action membutuhkan seluruh hierarchy.

Namun access harus tetap dapat ditelusuri ke context yang valid.

---

# 14. SCHOOL CONTEXT

School adalah boundary utama.

Contoh:

Teacher A:

```text
School A
```

tidak otomatis dapat mengakses:

```text
School B
```

meskipun memiliki role Teacher yang sama.

---

# 15. ACADEMIC YEAR CONTEXT

Academic Year menentukan periode operasional.

Contoh:

Teacher dapat memiliki responsibility:

```text
School A
2026/2027
Class TK B
```

Perubahan Academic Year dapat mengubah assignment tanpa mengubah Person atau Student identity.

---

# 16. CLASS CONTEXT

Class adalah salah satu authorization boundary terpenting untuk Teacher.

Contoh:

```text
Teacher A
   ↓
Assigned
   ↓
TK B
```

maka Teacher A memiliki operational access terhadap Student yang berada dalam TK B.

Teacher A tidak otomatis memiliki access terhadap:

```text
TK A
TK C
```

---

# 17. STUDENT CONTEXT

Student adalah data subject yang membutuhkan protection lebih tinggi.

Access terhadap Student harus mempertimbangkan:

- siapa user;
- responsibility;
- School;
- Class;
- relationship;
- jenis informasi;
- action.

---

# 18. RELATIONSHIP

Relationship dapat menjadi dasar authorization.

Contoh:

```text
Guardian
   ↓
Guardian Relationship
   ↓
Student
```

Relationship tersebut memberikan dasar bagi akses tertentu.

Tetapi relationship tidak otomatis memberikan akses terhadap seluruh informasi Student.

---

# 19. RESOURCE

Resource adalah sesuatu yang hendak diakses.

Contoh:

```text
School
Person
Student
Class
Enrollment
Attendance
Observation
Development
Evidence
Communication
```

---

# 20. ACTION

Action menjelaskan apa yang ingin dilakukan user.

Initial action vocabulary:

```text
VIEW
CREATE
UPDATE
DELETE
SUBMIT
REVIEW
APPROVE
ASSIGN
ARCHIVE
EXPORT
COMMUNICATE
```

Tidak semua entity mendukung semua action.

---

# 21. ACTION HARUS BERMAKNA

Contoh:

```text
Teacher → Student → DELETE
```

mungkin bukan action yang valid secara business meaning.

Lebih tepat:

```text
Administrator → Enrollment → CLOSE
```

atau:

```text
Administrator → Student → UPDATE
```

Authorization harus mengikuti business meaning, bukan hanya CRUD.

---

# 22. RESOURCE CLASSIFICATION

Initial classification:

### Institutional

School

Class

Academic Year

### Identity

Person

User Identity

### Educational

Student

Enrollment

Attendance

Learning

Observation

Development

Evidence

### Engagement

Communication

### Governance

Review

Follow-up

---

# 23. INFORMATION SENSITIVITY

Tidak semua data memiliki sensitivity yang sama.

Conceptual levels:

### Level 1 — Institutional Basic

Contoh:

Nama School

Class name

Academic Year

### Level 2 — Operational

Contoh:

Enrollment

Attendance

Assignment

### Level 3 — Personal

Contoh:

Student profile

Guardian information

### Level 4 — Sensitive Educational

Contoh:

Observation

Development information

Evidence

### Level 5 — Restricted

Informasi yang memerlukan policy dan authorization khusus.

Level final harus divalidasi bersama School dan policy Yapendik.

---

# 24. PRINCIPLE OF LEAST PRIVILEGE

User seharusnya mendapatkan:

> **minimum access necessary to perform legitimate responsibility.**

Bukan:

> maximum access because it is easier to configure.

---

# 25. PRINCIPLE OF NEED TO KNOW

Memiliki role tertentu tidak otomatis berarti mengetahui semua informasi.

Contoh:

Teacher membutuhkan informasi tertentu untuk mengajar Student.

Teacher tidak otomatis membutuhkan seluruh administrative atau sensitive information Student.

---

# 26. PRINCIPLE OF CONTEXTUAL ACCESS

Contoh:

```text
Teacher
+
Assigned Class
+
Current Academic Year
+
Student in Class
+
Attendance
+
CREATE
=
ALLOW
```

Tetapi:

```text
Teacher
+
Different Class
+
Student
+
Attendance
+
CREATE
=
DENY
```

---

# 27. CORE AUTHORIZATION FORMULA

Secara konseptual:

```text
ALLOW
IF

Identity is authenticated
AND
Role / Responsibility is valid
AND
Context is valid
AND
Relationship permits access
AND
Resource is within scope
AND
Action is permitted
AND
Policy allows it
```

Jika salah satu critical condition gagal:

```text
DENY
```

---

# 28. DEFAULT DENY

Default behavior:

> **Deny unless explicitly allowed.**

Jangan menggunakan:

> Allow everything, kemudian blacklist beberapa hal.

Untuk informasi Student dan educational records, default deny sangat penting.

---

# 29. TEACHER AUTHORIZATION

## Teacher dapat:

### School

VIEW limited institutional information relevant to work.

### Class

VIEW assigned Class.

### Student

VIEW assigned Students.

### Attendance

CREATE / UPDATE sesuai policy.

### Observation

CREATE / VIEW relevant records.

### Learning

CREATE / VIEW relevant records.

### Development

VIEW / contribute sesuai responsibility.

### Evidence

CREATE / VIEW evidence yang relevan.

### Communication

CREATE / SEND sesuai policy.

### Administration

Limited.

---

# 30. TEACHER NON-AUTHORIZATION

Teacher tidak otomatis dapat:

- mengelola seluruh School;
- membuat School;
- mengubah Academic Year;
- mengubah seluruh Class;
- mengubah Teacher Assignment;
- melihat Student dari Class lain tanpa legitimate responsibility;
- mengakses Guardian information yang tidak diperlukan;
- melihat seluruh restricted information.

---

# 31. ADMINISTRATOR AUTHORIZATION

Administrator dapat memiliki akses lebih luas terhadap:

School

People

Student

Class

Enrollment

Teacher Assignment

Guardian Relationship

Academic Year

Namun administrator tetap tidak otomatis memiliki unrestricted access terhadap sensitive educational information.

---

# 32. SCHOOL LEADERSHIP AUTHORIZATION

Leadership dapat:

VIEW School operational information.

VIEW relevant Class information.

VIEW permitted Student-level information.

REVIEW Follow-up.

VIEW aggregate reporting.

Dalam kondisi tertentu dapat memperoleh access lebih tinggi berdasarkan responsibility.

Namun:

> leadership access harus tetap governed.

---

# 33. GUARDIAN AUTHORIZATION

Guardian:

```text
Person
 ↓
Guardian Relationship
 ↓
Own Child
```

dapat:

VIEW permitted child information.

VIEW permitted communication.

RESPOND to permitted communication.

Guardian tidak dapat:

- melihat Student lain;
- melihat Teacher internal notes yang restricted;
- mengubah official Student records;
- mengubah Attendance;
- mengubah Observation;
- melihat internal School information yang tidak relevan.

---

# 34. AUTHORIZATION MATRIX — INITIAL

| Resource | Teacher | Administrator | Leadership | Guardian |
|---|---|---|---|---|
| School | View limited | Manage | View/Review | Limited |
| Academic Year | View | Manage | Manage/Review | No |
| Class | Assigned | Manage | View/Manage | Limited |
| Student | Assigned | Manage | Permitted | Own child |
| Enrollment | View | Manage | Review | Limited |
| Attendance | Create/Update assigned | Manage | Review | View permitted |
| Learning | Create/View assigned | Limited | Review | Permitted projection |
| Observation | Create/View assigned | Limited | Review permitted | Policy-based |
| Development | Contribute/View | Limited | Review | Policy-based |
| Evidence | Create/View assigned | Govern | Review permitted | Policy-based |
| Communication | Send permitted | Manage | Review | Own child |
| Follow-up | Create/Update assigned | Manage | Review/Manage | Limited |

**Catatan:** Matriks ini adalah baseline discovery, bukan final permission specification.

---

# 35. IMPORTANT: "LIMITED" MUST BE DEFINED

Istilah seperti:

> Limited

belum cukup untuk implementation.

Nanti harus diterjemahkan menjadi:

```text
Resource
+
Scope
+
Action
+
Condition
```

Contoh:

```text
Guardian
Student
VIEW
Own Child
AND
Published / Guardian-visible information
```

---

# 36. SCOPE

Scope menentukan seberapa luas access berlaku.

Initial scopes:

```text
SYSTEM
SCHOOL
ACADEMIC YEAR
CLASS
STUDENT
SELF
OWN CHILD
ASSIGNED
```

---

# 37. ASSIGNED SCOPE

Teacher access dapat menggunakan:

```text
ASSIGNED CLASS
```

Contoh:

```text
Teacher A
Assigned Class = TK B
```

Teacher A mendapatkan operational access terhadap Student dalam TK B.

---

# 38. OWN CHILD SCOPE

Guardian:

```text
Guardian A
 ↓
Relationship
 ↓
Student X
```

Guardian A dapat mengakses Student X sesuai policy.

Tidak berlaku terhadap:

Student Y.

---

# 39. SELF SCOPE

Beberapa information hanya dapat diakses oleh Person sendiri.

Contoh:

User profile

Authentication settings

Personal communication preferences

---

# 40. SYSTEM SCOPE

Hanya system-level responsibility tertentu yang membutuhkan system-wide access.

TK Pilot tidak perlu langsung memiliki banyak system-wide roles.

> Keep privileged roles rare.

---

# 41. PRIVILEGED ACCESS

Privileged access harus:

- explicit;
- limited;
- auditable;
- justified.

Tidak boleh ada "super user" yang menjadi solusi default untuk semua authorization problem.

---

# 42. TEMPORARY ACCESS

Jika suatu saat diperlukan temporary access:

```text
Grant
 ↓
Purpose
 ↓
Scope
 ↓
Expiration
 ↓
Audit
```

Temporary access tidak boleh menjadi permanent hidden permission.

---

# 43. DELEGATION

Jika Teacher A menggantikan Teacher B:

Jangan mengubah identity Teacher.

Buat responsibility / assignment yang sesuai.

```text
Person A
 ↓
Temporary Responsibility
 ↓
Class B
```

Hal tersebut harus memiliki start/end boundary jika memang temporary.

---

# 44. SUBSTITUTE TEACHER

Potential future workflow:

```text
Regular Teacher
       ↓
Unavailable
       ↓
Substitute Assignment
       ↓
Substitute Teacher
       ↓
Temporary Class Access
```

Belum menjadi MVP requirement kecuali pilot membuktikan kebutuhan.

---

# 45. AUTHORIZATION INHERITANCE

Access dapat diturunkan dari context.

Contoh:

```text
Teacher
 ↓
Assigned Class
 ↓
Students
```

Tetapi inheritance harus eksplisit.

Jangan berasumsi:

```text
Access School
=
Access everything inside School
```

---

# 46. CONTEXT BOUNDARY

School context adalah boundary utama.

```text
School A
├── Class A
│    ├── Student 1
│    └── Student 2
│
└── Class B
     ├── Student 3
     └── Student 4
```

Teacher assigned to Class A:

```text
ALLOW → Student 1
ALLOW → Student 2

DENY → Student 3
DENY → Student 4
```

kecuali ada explicit additional responsibility.

---

# 47. CROSS-CONTEXT ACCESS

Cross-context access harus selalu memiliki alasan.

Contoh:

Leadership membutuhkan School-level review.

Maka:

```text
Leadership
+
School Responsibility
+
Review Action
=
ALLOW
```

Bukan karena Leadership "can see everything".

---

# 48. YAPENDIK-LEVEL ACCESS

Enterprise / Yayasan-level access akan menjadi penting ketika School OS berkembang.

Namun pada TK Pilot:

> jangan membangun enterprise-wide access model yang kompleks sebelum use case nyata tersedia.

Future model dapat:

```text
Yapendik
 ↓
School
 ↓
Academic Context
 ↓
Class
 ↓
Student
```

---

# 49. SCHOOL AUTONOMY

Constitution menetapkan:

> **Standardize what must be shared; preserve autonomy where context matters.** 

Authorization harus mengikuti prinsip ini.

Shared:

- identity;
- security;
- canonical concepts;
- core authorization principles.

Configurable:

- local responsibility;
- workflow;
- operational details;
- school-specific policy.

---

# 50. POLICY VS PERMISSION

Permission menjawab:

> Apakah action ini secara umum dapat dilakukan role ini?

Policy menjawab:

> Dalam kondisi apa action tersebut boleh dilakukan?

Contoh:

Teacher:

```text
Permission:
CREATE Observation
```

Policy:

```text
Only for assigned Student
within assigned School/Class context
```

---

# 51. AUTHORIZATION DECISION

Conceptual engine:

```text
Request
 ↓
Identify Actor
 ↓
Resolve Role
 ↓
Resolve Context
 ↓
Resolve Relationship
 ↓
Resolve Resource
 ↓
Evaluate Action
 ↓
Evaluate Policy
 ↓
ALLOW / DENY
```

---

# 52. SERVER-SIDE ENFORCEMENT

Authorization harus diperiksa di server.

Contoh:

User mengirim request:

```text
Create Observation
Student = X
```

Server tidak boleh percaya bahwa UI sudah memastikan Student X adalah milik Class user.

Server harus memvalidasi sendiri.

---

# 53. DATABASE ENFORCEMENT

Technical Architecture menetapkan security layers sampai database enforcement. 

Karena itu database harus menjadi defense-in-depth layer.

Application authorization dan database authorization tidak boleh saling bertentangan.

---

# 54. CLIENT-SIDE AUTHORIZATION

Client boleh:

- menyembunyikan action;
- disable action;
- menampilkan context;
- memberikan UX yang sesuai.

Tetapi:

> Client tidak dipercaya sebagai security boundary.

---

# 55. NEGATIVE AUTHORIZATION

Testing harus membuktikan bukan hanya:

> User yang benar dapat melakukan action.

Tetapi juga:

> User yang salah tidak dapat melakukan action.

Constitutional technical architecture secara eksplisit menetapkan negative authorization tests. 

---

# 56. AUTHORIZATION TEST EXAMPLE

### Test A

Teacher A + Class A + Student A

```text
Record Attendance
→ ALLOW
```

### Test B

Teacher A + Class A + Student B dari Class B

```text
Record Attendance
→ DENY
```

### Test C

Guardian A + Student A

```text
View permitted child information
→ ALLOW
```

### Test D

Guardian A + Student B

```text
View
→ DENY
```

---

# 57. OBSERVATION AUTHORIZATION

Observation adalah information yang lebih sensitive.

Teacher dapat membuat observation jika:

```text
Teacher
+
Assigned Student
+
Valid School Context
+
CREATE Observation
```

Leadership dapat review jika:

```text
Leadership
+
School Responsibility
+
REVIEW
+
Permitted Observation
```

Guardian visibility:

> policy-based, not automatic.

---

# 58. DEVELOPMENT AUTHORIZATION

Development information membutuhkan extra care.

System harus membedakan:

```text
Internal Working Information
```

dan:

```text
Guardian-Visible Information
```

Jangan otomatis menganggap semua internal information dapat menjadi parent-facing information.

---

# 59. EVIDENCE AUTHORIZATION

Evidence harus mengikuti parent record.

Contoh:

Observation X

↓

Evidence A

Jika user tidak berhak melihat Observation X:

> user juga tidak boleh memperoleh Evidence A hanya karena mengetahui file identifier.

---

# 60. FILE ACCESS

Object storage URL tidak boleh menjadi authorization shortcut.

Pattern:

```text
Request Evidence
 ↓
Authorize Parent Context
 ↓
Authorize Evidence
 ↓
Generate Controlled Access
 ↓
Deliver
```

Bukan:

```text
Public File URL
```

---

# 61. COMMUNICATION AUTHORIZATION

Communication harus mempertimbangkan:

Sender

Recipient

Student relationship

School context

Purpose

Visibility

Contoh:

Teacher dapat mengirim communication kepada Guardian Student yang berada dalam assigned Class jika policy mengizinkan.

---

# 62. GUARDIAN DATA IS NOT PUBLIC

Guardian information termasuk personal information.

Teacher hanya mendapatkan informasi Guardian yang diperlukan untuk legitimate work.

Student relationship tidak berarti seluruh contact information otomatis visible.

---

# 63. EXPORT AUTHORIZATION

Export adalah action dengan risk lebih tinggi daripada VIEW.

Maka:

```text
VIEW
```

tidak otomatis berarti:

```text
EXPORT
```

Export harus memiliki policy sendiri.

---

# 64. REPORT AUTHORIZATION

Report adalah projection.

Access ke report harus mempertahankan underlying information boundary.

Contoh:

Teacher dapat melihat report Class yang menjadi tanggung jawabnya.

Tidak otomatis dapat melihat cross-school report.

---

# 65. AGGREGATED DATA

Aggregate information dapat memiliki risk berbeda.

Contoh:

```text
School:
Attendance rate = 94%
```

dapat diberikan kepada Leadership.

Namun:

```text
Student-level attendance details
```

memerlukan access yang lebih spesifik.

---

# 66. PUBLIC PROJECTION

Public information harus berasal dari governed projection.

Constitution menyatakan:

> **Public information is a governed projection of institutional information.** 

School OS operational data tidak boleh langsung menjadi public data.

---

# 67. AUDITABILITY

Aktivitas penting harus dapat ditelusuri:

```text
WHO
WHAT
WHEN
IN WHAT CONTEXT
```

Constitution secara eksplisit menetapkan pola tersebut. 

Contoh audited actions:

- Create Student
- Update Student
- Create Enrollment
- Change Enrollment
- Record Attendance
- Update Attendance
- Create Observation
- Update Observation
- Change Teacher Assignment
- Change Guardian Relationship
- Export sensitive information

---

# 68. AUDIT IS NOT SURVEILLANCE

Audit digunakan untuk:

- accountability;
- security;
- integrity;
- troubleshooting;
- governance.

Bukan untuk mengubah School OS menjadi alat surveillance terhadap Teacher.

Hal ini konsisten dengan:

> **C-17 — Service Before Surveillance.** 

---

# 69. PRIVACY BY DESIGN

Authorization harus meminimalkan:

- unnecessary access;
- unnecessary exposure;
- unnecessary collection;
- unnecessary retention.

Constitution menetapkan privacy sebagai architectural concern. 

---

# 70. BREAK-GLASS ACCESS

Potential future capability:

Dalam keadaan khusus, authorized leadership dapat memperoleh temporary elevated access.

Namun harus:

```text
Reason
+
Explicit confirmation
+
Limited scope
+
Audit
```

Tidak diperlukan untuk MVP kecuali ada use case nyata.

---

# 71. EMERGENCY ACCESS

Emergency access bukan alasan untuk membuat semua user privileged.

Jika dibutuhkan:

> desain sebagai explicit workflow.

---

# 72. ROLE CREATION RULE

Role baru tidak boleh dibuat hanya karena:

> "User ini butuh satu permission tambahan."

Pertama periksa apakah kebutuhan tersebut sebenarnya:

- context;
- relationship;
- assignment;
- policy;
- atau exception.

Role explosion harus dihindari.

---

# 73. ROLE EXPLOSION

Jangan membuat:

```text
Teacher
Senior Teacher
Teacher Assistant
Teacher Temporary
Teacher TK A
Teacher TK B
Teacher Observation
Teacher Attendance
...
```

jika semua itu sebenarnya dapat dimodelkan melalui:

```text
Role
+
Responsibility
+
Context
+
Policy
```

---

# 74. PERMISSION EXPLOSION

Jangan membuat permission yang terlalu granular sebelum dibutuhkan.

Initial vocabulary harus tetap kecil.

---

# 75. INITIAL PERMISSION VOCABULARY

```text
VIEW
CREATE
UPDATE
DELETE
REVIEW
ASSIGN
SUBMIT
APPROVE
COMMUNICATE
EXPORT
ARCHIVE
```

Vocabulary dapat berkembang berdasarkan evidence.

---

# 76. DELETE PRINCIPLE

DELETE adalah action berisiko tinggi.

Untuk canonical information:

Prefer:

```text
Archive
Deactivate
Close
Correct
```

daripada physical delete.

---

# 77. DATA CORRECTION

Jika data salah:

```text
Correction
+
Audit
```

lebih baik daripada menghapus history tanpa trace.

Contoh:

Attendance salah.

System dapat mempertahankan:

Original

↓

Correction

↓

Current State

sesuai kebutuhan audit.

---

# 78. AUTHORIZATION FAILURE UX

Jika access ditolak, jangan hanya:

> "403 Forbidden."

User harus mendapatkan pesan yang dapat dipahami.

Contoh:

> "Anda tidak memiliki tanggung jawab pada kelas ini."

atau:

> "Informasi ini hanya tersedia untuk pihak yang memiliki kewenangan tertentu."

Tetapi jangan mengungkap informasi sensitif melalui error message.

---

# 79. SECURITY WITHOUT CONFUSION

Security tidak boleh membuat user legitimate merasa system rusak.

Contoh:

Jika Teacher hanya memiliki satu Class:

System langsung membuka Class tersebut.

Tidak perlu menampilkan permission matrix kepada Teacher.

Complexity berada di architecture.

Simplicity berada di user experience.

---

# 80. AUTHORIZATION IN THE USER EXPERIENCE

User sebaiknya melihat:

```text
What I can do here
```

bukan:

```text
Why the authorization engine has 37 rules
```

---

# 81. AUTHORIZATION AND WORKSPACE

Workspace membantu membatasi context.

Contoh:

```text
Teacher
 ↓
My Class
 ↓
Students
```

Dengan demikian authorization dan UX saling memperkuat.

---

# 82. AUTHORIZATION AND WORKFLOW

Workflow:

```text
Teacher
 ↓
Class
 ↓
Student
 ↓
Observation
```

Authorization harus mengikuti workflow tersebut.

Tidak boleh ada authorization model yang memaksa workflow menjadi tidak natural.

---

# 83. AUTHORIZATION AND DATA MODEL

Data model harus mampu menjawab:

> Mengapa user ini memiliki access?

Contoh:

```text
Teacher
 ↓
Teacher Assignment
 ↓
Class
 ↓
Enrollment
 ↓
Student
```

Relationship ini menjadi dasar authorization.

Jika relationship tidak dapat ditelusuri, authorization akan menjadi fragile.

---

# 84. AUTHORIZATION AND FUTURE SCHOOL TYPES

TK adalah pilot, bukan architectural boundary.

Authorization harus dapat berkembang:

```text
TK
 ↓
SD
 ↓
SMP
 ↓
SMA
```

tanpa membuat role baru untuk setiap school type.

---

# 85. SCHOOL-SPECIFIC POLICY

Sekolah dapat memiliki perbedaan tertentu.

Contoh:

School A:

Teacher dapat melakukan action X.

School B:

Action X memerlukan Leadership review.

Architecture harus memungkinkan policy/configuration apabila memang terbukti diperlukan.

Namun:

> core security semantics tetap canonical.

---

# 86. POLICY HIERARCHY

Potential future hierarchy:

```text
Yapendik Policy
      ↓
School Policy
      ↓
Context Policy
      ↓
User Responsibility
      ↓
Resource Rule
```

Belum perlu diimplementasikan secara kompleks pada TK Pilot.

---

# 87. INITIAL TK PILOT POLICY

Untuk pilot:

> Prefer explicit, simple, understandable authorization rules.

Jangan membangun policy engine generik sebelum ada kebutuhan.

---

# 88. AUTHORIZATION DECISION EXAMPLES

## Example 1 — Attendance

```text
Actor:
Teacher A

Role:
Teacher

Context:
School A / 2026-2027 / TK B

Resource:
Student A / Attendance

Action:
CREATE

Assignment:
Teacher A → TK B

Decision:
ALLOW
```

---

# 89. EXAMPLE 2 — WRONG CLASS

```text
Actor:
Teacher A

Context:
School A / TK B

Resource:
Student X in TK C

Action:
CREATE Attendance

Decision:
DENY
```

---

# 90. EXAMPLE 3 — GUARDIAN

```text
Actor:
Guardian A

Relationship:
Guardian → Student A

Resource:
Student A

Action:
VIEW permitted information

Decision:
ALLOW
```

---

# 91. EXAMPLE 4 — OTHER CHILD

```text
Actor:
Guardian A

Relationship:
Guardian → Student A

Resource:
Student B

Action:
VIEW

Decision:
DENY
```

---

# 92. EXAMPLE 5 — LEADERSHIP REVIEW

```text
Actor:
School Leadership

Context:
School A

Resource:
Class B

Action:
REVIEW

Responsibility:
School A

Decision:
ALLOW
```

---

# 93. EXAMPLE 6 — TEACHER ASSIGNMENT

```text
Actor:
Teacher

Resource:
Teacher Assignment

Action:
UPDATE

Decision:
DENY
```

kecuali Teacher tersebut memang memiliki explicit administrative responsibility.

---

# 94. EXAMPLE 7 — ADMINISTRATOR

```text
Actor:
Administrator

Resource:
Teacher Assignment

Action:
ASSIGN

Context:
School A

Decision:
ALLOW
```

---

# 95. EXAMPLE 8 — EXPORT

```text
Actor:
Teacher

Resource:
Student Development Data

Action:
EXPORT

Decision:
DENY
```

kecuali policy secara eksplisit memberikan authorization.

---

# 96. AUTHORIZATION BOUNDARY PRINCIPLE

Boundary yang salah dapat menyebabkan:

Data leakage

Privilege escalation

Accidental exposure

Confusing UX

Difficult auditing

Karena itu:

> **Authorization boundary harus mengikuti real responsibility boundary.**

---

# 97. PRIVILEGE ESCALATION

System harus mencegah user mendapatkan privilege hanya dengan mengubah request payload.

Contoh:

```text
teacher_id
class_id
school_id
```

yang dikirim dari client tidak boleh dipercaya.

Server harus menentukan ownership / assignment dari canonical data.

---

# 98. IDOR PROTECTION

Mengetahui ID sebuah Student, Observation, atau Evidence tidak boleh cukup untuk memperoleh access.

Pattern:

```text
Known ID
   ≠
Authorized Access
```

---

# 99. AUTHORIZATION QUALITY TEST

Authorization dianggap sehat jika:

### Legitimate user

dapat menyelesaikan pekerjaannya.

### Unauthorized user

tidak dapat menembus boundary.

### Context

selalu dapat dijelaskan.

### Relationship

dapat ditelusuri.

### Sensitive information

tidak exposed secara berlebihan.

### Audit

critical action dapat ditelusuri.

---

# 100. AUTHORIZATION TEST MATRIX

Minimal testing:

```text
Correct User
Correct Role
Correct Context
Correct Resource
Correct Action
        ↓
ALLOW
```

dan:

```text
Wrong User
OR
Wrong Role
OR
Wrong Context
OR
Wrong Relationship
OR
Wrong Action
        ↓
DENY
```

---

# 101. TEST CATEGORIES

Authorization tests harus mencakup:

### Positive

Authorized access works.

### Negative

Unauthorized access fails.

### Boundary

Cross-school / cross-class access fails.

### Relationship

Guardian cannot cross child boundary.

### Privilege

Teacher cannot become administrator through request manipulation.

### Regression

Permission changes do not accidentally open unrelated resources.

---

# 102. IMPLEMENTATION DIRECTION

Technical implementation nantinya dapat menggunakan kombinasi:

```text
Identity
+
Role / Responsibility
+
Context Resolver
+
Policy Check
+
Server Authorization
+
Database Enforcement
```

Exact technology belum ditetapkan di dokumen ini.

---

# 103. MODULAR AUTHORIZATION

Authorization logic sebaiknya tidak tersebar di setiap UI component.

Prefer:

```text
Authorization Boundary
        ↓
Reusable Policy
        ↓
Application Use Case
        ↓
Database Enforcement
```

---

# 104. BUSINESS RULE VS AUTHORIZATION RULE

Bedakan:

### Authorization

> Apakah Teacher boleh mencatat Attendance?

### Business Rule

> Satu Student hanya boleh memiliki satu Attendance record untuk session tertentu.

Keduanya berbeda.

---

# 105. CONTEXT RULE VS AUTHORIZATION RULE

Context resolver menentukan:

> Student ini berada di Class mana?

Authorization menentukan:

> Apakah user ini boleh melakukan action terhadap Student tersebut?

Keduanya harus bekerja bersama.

---

# 106. AUTHORIZATION AND CANONICAL IDENTITY

Canonical identity harus stabil.

Jika Student identity duplicate:

authorization juga dapat menjadi salah.

Karena itu:

```text
Canonical Identity
 ↓
Relationship
 ↓
Context
 ↓
Authorization
```

adalah dependency penting.

---

# 107. AUTHORIZATION AND INSTITUTIONAL KNOWLEDGE

Institutional knowledge harus mempertahankan:

- context;
- ownership;
- access boundary.

Constitution menegaskan bahwa knowledge tidak cukup hanya disimpan; context dan access boundary harus dipertahankan. 

---

# 108. AUTHORIZATION AND CHILD-CENTERED PRINCIPLE

Student adalah child, bukan sekadar data object.

Constitution menetapkan:

> **C-04 — Child-Centered Education: The child is the center of educational purpose, not merely educational data.** 

Maka authorization harus dirancang dengan prinsip:

> protect the child's dignity, privacy, safety, and educational context.

---

# 109. AUTHORIZATION AND HUMAN DIGNITY

Data Student bukan keseluruhan manusia.

Observation bukan keseluruhan perkembangan.

Dashboard bukan keseluruhan realitas.

Constitution secara eksplisit mengingatkan hal ini. 

Authorization karena itu bukan sekadar technical access control.

Ia merupakan bagian dari stewardship.

---

# 110. CURRENT OPEN QUESTIONS

Authorization masih membutuhkan validasi:

1. Exact Teacher responsibility model.
2. Apakah Teacher dapat menangani beberapa Class?
3. Substitute Teacher workflow.
4. Exact Leadership roles.
5. Administrator boundaries.
6. Guardian visibility policy.
7. Development information visibility.
8. Observation confidentiality.
9. Evidence sharing policy.
10. Export policy.
11. Cross-school Yapendik access.
12. Temporary delegation.
13. Emergency access.
14. School-specific authorization variations.

Semua ini **OPEN QUESTIONS**, bukan defect pada architecture.

---

# 111. AUTHORIZATION MATURITY

### Level 0 — Assumption

Role dan access masih berdasarkan asumsi.

### Level 1 — Conceptual

Model WHO / ROLE / CONTEXT / RESOURCE / ACTION telah didefinisikan.

### Level 2 — Observed

Responsibility diverifikasi melalui praktik nyata.

### Level 3 — Validated

School menerima authorization behavior.

### Level 4 — Implemented

Authorization benar-benar diterapkan.

### Level 5 — Proven

Authorization terbukti aman dan tidak menghambat legitimate work.

Target TK Pilot:

> **Core authorization minimal Level 3 sebelum production pilot.**

---

# 112. PILOT AUTHORIZATION PRIORITY

Prioritas validasi:

### Priority 1

Teacher → Class → Student

### Priority 2

Teacher → Attendance

### Priority 3

Teacher → Observation

### Priority 4

Administrator → Student / Enrollment / Class

### Priority 5

Guardian → Own Child

### Priority 6

Leadership → School Review

---

# 113. FIRST AUTHORIZATION SLICE

Authorization pertama yang harus benar:

```text
Teacher
   ↓
School
   ↓
Academic Year
   ↓
Assigned Class
   ↓
Student
   ↓
Attendance
```

Jika boundary ini benar, sebagian besar fondasi authorization School OS mulai terbentuk.

---

# 114. SECOND AUTHORIZATION SLICE

```text
Teacher
 ↓
Assigned Student
 ↓
Observation
 ↓
Evidence
```

Karena sensitivity informasi meningkat.

---

# 115. THIRD AUTHORIZATION SLICE

```text
Guardian
 ↓
Guardian Relationship
 ↓
Own Child
 ↓
Permitted Information
```

Ini akan menjadi validasi penting terhadap relationship-based authorization.

---

# 116. FOURTH AUTHORIZATION SLICE

```text
Leadership
 ↓
School Responsibility
 ↓
Class / Student / Review
```

Untuk memastikan School-level visibility tidak berubah menjadi unrestricted access.

---

# 117. AUTHORIZATION GOVERNANCE

Perubahan authorization yang signifikan harus mengikuti governance:

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

Ini konsisten dengan governance hierarchy Constitution. 

---

# 118. CHANGE IMPACT

Perubahan authorization dapat mempengaruhi:

Domain Specification

Workflow Specification

UX Architecture

Technical Architecture

Database / RLS

Audit

Privacy policy

Maka perubahan access boundary tidak boleh dianggap sekadar perubahan UI.

---

# 119. AUTHORIZATION PRINCIPLES — BASELINE

Untuk TK Pilot, baseline kita adalah:

**A-01 — Context Before Access**

Access harus memiliki context.

**A-02 — Responsibility Before Privilege**

Responsibility menentukan privilege.

**A-03 — Least Privilege**

Berikan access minimum yang diperlukan.

**A-04 — Default Deny**

Tidak ada access tanpa authorization.

**A-05 — Relationship Matters**

Relationship dapat menjadi dasar access.

**A-06 — Server Enforced**

Client bukan security boundary.

**A-07 — Database Enforced**

Database menjadi defense-in-depth.

**A-08 — Audit Important Actions**

Critical actions harus traceable.

**A-09 — Privacy by Design**

Minimalkan unnecessary exposure.

**A-10 — Simplicity**

Authorization harus cukup sederhana untuk dipahami dan dipelihara.

**A-11 — No Role Explosion**

Jangan membuat role hanya untuk menyelesaikan exception.

**A-12 — No Privilege by ID**

Mengetahui identifier tidak berarti memiliki access.

**A-13 — Human-Centered**

Authorization melindungi manusia, bukan hanya records.

**A-14 — Evidence Before Complexity**

Jangan membangun authorization machinery yang belum dibutuhkan.

**A-15 — Future-Proof, Not Future-Overbuilt**

Pertahankan extension points tanpa membangun hypothetical complexity.

---

# 120. COMPLETE AUTHORIZATION MODEL

Model final konseptual:

```text
                         PERSON
                            │
                            ▼
                        IDENTITY
                            │
                            ▼
                 ROLE / RESPONSIBILITY
                            │
                            ▼
                         CONTEXT
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
           SCHOOL       CLASS / YEAR     RELATIONSHIP
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                         RESOURCE
                            │
                            ▼
                          ACTION
                            │
                            ▼
                          POLICY
                            │
                     ┌──────┴──────┐
                     ▼             ▼
                   ALLOW          DENY
                     │
                     ▼
               AUDIT / TRACE
```

---

# 121. HUBUNGAN DENGAN WORKFLOW

Workflow sebelumnya mendefinisikan:

> apa yang dilakukan manusia.

Authorization sekarang mendefinisikan:

> siapa yang boleh melakukan setiap bagian workflow.

Contoh:

```text
WORKFLOW

Teacher
 ↓
Class
 ↓
Student
 ↓
Record Attendance
```

menjadi:

```text
AUTHORIZATION

Teacher
+
Assigned Class
+
Student in Class
+
Attendance
+
CREATE
=
ALLOW
```

---

# 122. HUBUNGAN DENGAN DATA MODEL

Setelah dokumen ini, kita sudah memiliki tiga layer yang saling terkait:

```text
ENTITY
 ↓
WORKFLOW
 ↓
AUTHORIZATION
```

Contoh:

```text
Student
 ↓
Record Attendance
 ↓
Teacher + Assigned Class + CREATE
```

Ini jauh lebih kuat sebagai dasar database daripada langsung membuat tabel.

---

# 123. NEXT DOCUMENT

Dengan Authorization Model ini, layer berikutnya sudah dapat mulai diturunkan menjadi:

# YAPENDIK SCHOOL OS TK PILOT DATA MODEL

Dokumen tersebut akan menjawab:

> **Bagaimana canonical entities, relationships, context, ownership, lifecycle, dan authorization boundary diterjemahkan menjadi model data konseptual yang konsisten?**

Urutannya menjadi:

```text
DOMAIN & ENTITY
        ↓
WORKFLOW
        ↓
AUTHORIZATION
        ↓
DATA MODEL
        ↓
API / APPLICATION CONTRACT
        ↓
BUILD
```

Dan baru setelah **Data Model** cukup matang kita masuk ke physical database / SQL.

---

# 124. STATUS

**YAPENDIK SCHOOL OS TK PILOT AUTHORIZATION MODEL**

Version: **0.1**

Status: **LIVING — DISCOVERY**

Scope: **TK Pilot**

Authority: Derived from Yapendik OS Constitution

Primary Principle:

> **Contextual Authorization**

Core Model:

> **Who + Role/Responsibility + Context + Relationship + Resource + Action + Policy**

Security Principle:

> **Authentication → Authorization → Context Validation → Server Enforcement → Database Enforcement → Auditability**

Current Maturity:

**CONCEPTUAL BASELINE — NOT YET FROZEN**

Validation Target:

**Core authorization must be observed and validated against real TK responsibility structures before final implementation.**

---

# PENUTUP

Dengan dokumen ini, kita sudah menyelesaikan satu bagian yang sangat penting.

Kita sekarang tidak lagi hanya mengetahui:

> **apa yang ada di School OS**

dan:

> **bagaimana pekerjaan dilakukan**

tetapi juga:

> **siapa yang berhak melakukan pekerjaan tersebut.**

Dan ini membawa kita ke titik yang tepat untuk mulai membangun **Data Model**.

Urutannya sekarang:

```text
WHAT
Entity
   ↓
HOW
Workflow
   ↓
WHO CAN
Authorization
   ↓
HOW STORED
Data Model
   ↓
HOW EXECUTED
Application / API
   ↓
BUILD
```

Saya sengaja belum membuat permission matrix menjadi sangat granular atau membuat policy engine generik. Itu akan bertentangan dengan prinsip Constitution: **complexity must be earned** dan **evidence before assumption**. 

**Dokumen berikutnya: `YAPENDIK SCHOOL OS TK PILOT DATA MODEL`.**