# YAPENDIK SCHOOL OS OPERATING MODEL

**Version:** 0.1  
**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System  
**Document Type:** School Operating Model  
**Status:** **LIVING — DISCOVERY**  
**Scope:** School OS  
**Current Validation Context:** TK / Early Childhood Education  
**Derived From:** YAPENDIK OS CONSTITUTION + YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE  
**Approach:** Common Sense First  
**Principle:** Make It Simple. Keep It Future-Proof.

---

# 1. PURPOSE

School OS Operating Model menjelaskan **bagaimana sebuah sekolah bekerja sebagai sebuah operating environment**.

Dokumen ini menjadi jembatan antara:

```text
YAPENDIK OS CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
SCHOOL OS OPERATING MODEL
        ↓
PRODUCT BLUEPRINT
```

Constitution menjawab:

> **Why are we building Yapendik OS?**

EIA menjawab:

> **What exists in the Yapendik information landscape?**

Operating Model menjawab:

> **How does a school actually work?**

Baru setelah itu Product Blueprint menjawab:

> **What should the software actually provide?**

---

# 2. FUNDAMENTAL PRINCIPLE

School OS bukan sekadar kumpulan fitur administrasi sekolah.

School OS adalah **digital operating environment** yang membantu manusia menjalankan pekerjaan pendidikan dan operasional sekolah.

Model sederhananya:

```text
PEOPLE
   ↓
RESPONSIBILITY
   ↓
WORK
   ↓
INFORMATION
   ↓
DECISION
   ↓
ACTION
   ↓
OUTCOME
```

Technology berada di belakang proses tersebut.

Bukan sebaliknya.

---

# 3. WHAT SCHOOL OS IS

School OS adalah:

> **A shared operating environment for people, information, work, decisions, and institutional knowledge within a school.**

School OS membantu sekolah:

- mengetahui siapa yang terlibat;
- memahami kondisi siswa;
- menjalankan aktivitas pendidikan;
- menjalankan operasi sekolah;
- menjaga institutional records;
- berkomunikasi;
- mengambil keputusan;
- melakukan follow-up;
- dan memberikan insight kepada pihak yang berwenang.

---

# 4. WHAT SCHOOL OS IS NOT

School OS bukan:

- sekadar academic information system;
- sekadar student database;
- sekadar attendance application;
- sekadar accounting system;
- sekadar parent communication app;
- sekadar dashboard;
- sekadar digitalisasi formulir;
- atau sekadar kumpulan menu.

Semua capability tersebut dapat menjadi bagian dari School OS apabila memang dibutuhkan oleh operating reality.

---

# 5. SCHOOL AS AN OPERATING ENVIRONMENT

Sebuah sekolah dapat dipahami sebagai:

```text
                         SCHOOL
                           │
          ┌────────────────┼────────────────┐
          │                │                │
        PEOPLE           WORK            INFORMATION
          │                │                │
          └────────────────┼────────────────┘
                           │
                       DECISIONS
                           │
                           ▼
                        OUTCOMES
```

Sekolah bukan hanya tempat data disimpan.

Sekolah adalah tempat:

- manusia bekerja;
- pendidikan berlangsung;
- keputusan dibuat;
- relationships terjadi;
- masalah muncul;
- tindakan dilakukan;
- dan knowledge terbentuk.

---

# 6. SCHOOL OS CORE LOOP

Operating loop utama:

```text
OBSERVE
   ↓
UNDERSTAND
   ↓
DECIDE
   ↓
ACT
   ↓
RECORD
   ↓
REVIEW
   ↓
IMPROVE
```

Contoh dalam pendidikan:

```text
Teacher observes student
        ↓
Understand student's condition
        ↓
Decide appropriate response
        ↓
Take educational action
        ↓
Record relevant information
        ↓
Review development
        ↓
Adjust next action
```

Software harus membantu loop tersebut menjadi lebih mudah.

---

# 7. SCHOOL OS ACTORS

Initial actor model:

```text
SCHOOL
│
├── School Leadership
│
├── Teacher
│
├── Administration / Staff
│
├── Guardian
│
├── Student
│
└── Supporting / External People
```

Kategori ini adalah working model.

Detail role akan mengikuti real-world discovery.

---

# 8. SCHOOL LEADERSHIP

School Leadership bertanggung jawab terhadap:

- direction;
- governance;
- quality;
- people;
- resources;
- decisions;
- institutional accountability.

Leadership membutuhkan:

```text
Information
   ↓
Context
   ↓
Insight
   ↓
Decision
```

Bukan sekadar dashboard.

---

# 9. TEACHER

Teacher adalah salah satu primary operational actors.

Teacher:

- interacts with students;
- plans learning;
- conducts learning;
- observes;
- records relevant information;
- communicates;
- follows up;
- evaluates;
- collaborates with other people.

School OS harus mengurangi administrative burden yang tidak memberi nilai langsung terhadap pendidikan.

---

# 10. ADMINISTRATION / STAFF

Administrative staff mendukung:

- records;
- enrollment;
- documents;
- communication;
- operational processes;
- scheduling;
- resources;
- other administrative work.

Tidak semua administrative activity harus masuk School OS sejak awal.

Prioritas ditentukan berdasarkan impact dan frequency.

---

# 11. GUARDIAN

Guardian adalah external-but-connected actor terhadap School.

Guardian membutuhkan akses terhadap informasi yang relevan mengenai:

- student;
- school communication;
- schedules;
- activities;
- required actions;
- relevant educational information.

Guardian bukan internal school operator.

Karena itu information boundary harus jelas.

---

# 12. STUDENT

Student adalah:

> **The primary beneficiary of the educational operating system.**

Student bukan sekadar object of administration.

School OS harus selalu mempertimbangkan:

```text
Administrative Efficiency
        +
Educational Quality
        +
Student Wellbeing
```

---

# 13. SCHOOL CONTEXT

Primary context:

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

Context dapat bertambah apabila real operation membutuhkannya.

---

# 14. SCHOOL IDENTITY

School harus memiliki canonical identity.

Minimal conceptual information:

- identity;
- name;
- location;
- contact;
- status;
- organizational relationship;
- relevant profile.

School identity menjadi anchor untuk School OS.

---

# 15. ACADEMIC YEAR

Academic Year menjadi temporal context untuk:

- enrollment;
- class;
- teaching;
- attendance;
- activities;
- reporting;
- student development.

Namun:

> **Academic Year is a context, not necessarily the center of every workflow.**

---

# 16. CLASS

Class adalah operational learning context.

Class menghubungkan:

```text
Teacher
   ↕
Class
   ↕
Students
```

dan dapat menjadi context untuk:

- attendance;
- learning;
- observations;
- activities;
- communication.

---

# 17. CORE SCHOOL WORK

Secara common sense, school work dapat dikelompokkan menjadi:

```text
1. Manage People
2. Manage Students
3. Run Education
4. Monitor Development
5. Run School Operations
6. Communicate
7. Manage Records
8. Make Decisions
9. Improve the School
```

Ini adalah operating categories, bukan software modules.

---

# 18. MANAGE PEOPLE

School perlu:

- mengetahui siapa yang bekerja di sekolah;
- mengetahui responsibility;
- mengetahui contact;
- mengetahui status;
- mengetahui relationship.

Namun:

> **People management ≠ HR system.**

HR complexity hanya dibangun jika benar-benar dibutuhkan.

---

# 19. STUDENT JOURNEY

Student journey menjadi salah satu operating backbone.

Initial conceptual model:

```text
Inquiry / Admission
       ↓
Enrollment
       ↓
Placement
       ↓
Learning
       ↓
Attendance
       ↓
Observation
       ↓
Development
       ↓
Communication
       ↓
Progress / Review
       ↓
Transition / Completion
```

Tidak semua tahap harus berada dalam MVP.

---

# 20. ENROLLMENT

Enrollment adalah relationship antara Student dan School dalam context tertentu.

```text
Student
   ↓
Enrollment
   ↓
School
   ↓
Academic Year
```

Enrollment dapat menjadi titik awal bagi banyak workflow berikutnya.

---

# 21. CLASS PLACEMENT

Setelah enrollment, Student dapat ditempatkan dalam Class.

```text
Student
   ↓
Enrollment
   ↓
Class Placement
   ↓
Class
```

Detail placement rules belum ditentukan.

---

# 22. DAILY SCHOOL LOOP

Operating reality sehari-hari secara sederhana:

```text
ARRIVE
  ↓
PREPARE
  ↓
LEARN
  ↓
OBSERVE
  ↓
INTERACT
  ↓
RESPOND
  ↓
RECORD
  ↓
COMMUNICATE
  ↓
REVIEW
```

Ini sangat penting terutama untuk TK.

Namun urutan tersebut harus divalidasi dengan praktik nyata.

---

# 23. LEARNING

Learning adalah core purpose School OS.

School OS harus memahami bahwa learning bukan sekadar:

```text
Lesson
+
Score
```

Learning dapat melibatkan:

- activity;
- interaction;
- participation;
- observation;
- development;
- evidence;
- teacher judgment.

Model pedagogis final tidak ditetapkan dalam Operating Model v0.1.

---

# 24. OBSERVATION

Observation adalah informasi yang muncul dari proses pendidikan.

Model:

```text
Student
   ↓
Observed Context
   ↓
Observation
   ↓
Interpretation
   ↓
Possible Action
```

Observation bukan automatically truth.

Observation harus mempertahankan:

- who;
- when;
- context;
- what was observed.

---

# 25. EVIDENCE

Evidence dapat mendukung observation atau educational record.

Contoh:

- note;
- document;
- photo;
- work sample;
- other approved evidence.

Namun:

> **Evidence must have purpose and context.**

School OS tidak boleh berubah menjadi unlimited digital archive tanpa governance.

---

# 26. ATTENDANCE

Attendance adalah bagian dari daily school operation.

Model:

```text
Student
   ↓
Date
   ↓
School / Class Context
   ↓
Attendance
```

Attendance dapat menjadi:

- operational information;
- guardian communication trigger;
- reporting information;
- follow-up trigger.

---

# 27. COMMUNICATION

Communication terjadi di banyak arah:

```text
School ↔ Teacher
School ↔ Guardian
Teacher ↔ Guardian
Teacher ↔ Teacher
Leadership ↔ Staff
```

Tetapi tidak semua communication harus menjadi chat.

Communication dapat berupa:

- announcement;
- notification;
- request;
- response;
- document;
- meeting;
- formal record.

---

# 28. SCHOOL OPERATIONS

School memiliki pekerjaan non-academic:

- schedules;
- facilities;
- resources;
- events;
- documents;
- requests;
- administrative tasks.

Operating Model menjaga agar operational work tetap dipandang sebagai bagian dari whole school, tetapi tidak memaksakan semuanya menjadi MVP.

---

# 29. DOCUMENT & RECORD MANAGEMENT

School menghasilkan banyak records.

School OS perlu membedakan:

```text
CANONICAL RECORD
        vs
DOCUMENT
        vs
EVIDENCE
```

Contoh:

```text
Student
   ↓
Canonical entity

Observation
   ↓
Operational record

Photo / File
   ↓
Evidence
```

---

# 30. INFORMATION FLOW

Informasi mengalir melalui:

```text
REAL WORLD EVENT
       ↓
CAPTURE
       ↓
CONTEXTUALIZE
       ↓
STORE
       ↓
USE
       ↓
REVIEW
       ↓
DECISION
       ↓
ACTION
```

Capture tidak selalu berarti user harus mengisi form.

Future interfaces dapat menggunakan:

- quick action;
- structured input;
- import;
- document;
- integration;
- other mechanisms.

---

# 31. INFORMATION SHOULD BE CAPTURED ONCE

Prinsip:

> **Capture once, reuse appropriately.**

Contoh:

Jika Student sudah terdaftar:

```text
Student
   ↓
Enrollment
   ↓
Attendance
   ↓
Learning
   ↓
Reporting
```

Teacher tidak seharusnya memasukkan ulang identitas Student untuk setiap aktivitas.

---

# 32. INFORMATION QUALITY

Information harus:

- accurate;
- contextual;
- timely;
- attributable;
- understandable;
- appropriately accessible.

Untuk informasi penting:

```text
Who created it?
When?
In what context?
For what purpose?
```

harus dapat diketahui.

---

# 33. DECISION MODEL

School OS tidak hanya menyimpan information.

Information harus membantu decision.

Model:

```text
Information
    ↓
Context
    ↓
Interpretation
    ↓
Decision
    ↓
Action
```

Contoh:

```text
Attendance pattern
      ↓
Contextual review
      ↓
Teacher / leadership interpretation
      ↓
Decision
      ↓
Follow-up
```

System tidak mengambil alih professional judgment.

---

# 34. RESPONSIBILITY MODEL

Setiap significant workflow harus dapat menjawab:

```text
WHO OWNS IT?
WHO DOES IT?
WHO REVIEWS IT?
WHO DECIDES?
WHO IS INFORMED?
```

Tidak semua workflow membutuhkan lima actor berbeda.

Tetapi responsibility harus jelas.

---

# 35. WORKFLOW PRINCIPLE

Kita tidak mendesain:

> "User clicks button A → screen B → screen C."

Kita desain:

> **"School needs to accomplish X."**

Kemudian:

```text
Goal
 ↓
Trigger
 ↓
Actor
 ↓
Work
 ↓
Information
 ↓
Decision
 ↓
Action
 ↓
Outcome
```

UI adalah implementation of this workflow.

---

# 36. COMMON WORKFLOW TEMPLATE

Setiap workflow yang nantinya masuk Product Blueprint sebaiknya dapat dijelaskan dengan template:

```text
WORKFLOW NAME

Purpose:
Trigger:
Primary Actor:
Supporting Actors:
Context:
Input:
Activity:
Information Created:
Decision:
Action:
Output:
Exception:
Follow-up:
Owner:
```

Ini menjadi bridge antara Operating Model dan Product Blueprint.

---

# 37. SCHOOL OPERATING CYCLES

Sekolah memiliki beberapa temporal cycles.

## Daily

```text
Attendance
Learning
Observation
Communication
Operations
```

## Weekly

```text
Planning
Review
Teacher coordination
Activities
```

## Monthly

```text
Review
Reporting
Administrative cycles
```

## Academic Year

```text
Admission
Enrollment
Placement
Learning
Development
Evaluation
Transition
```

Tidak semua cycle harus diwujudkan sebagai scheduler atau automated workflow.

---

# 38. SCHOOL MANAGEMENT LOOP

Leadership loop:

```text
OBSERVE
   ↓
UNDERSTAND
   ↓
PRIORITIZE
   ↓
DECIDE
   ↓
ACT
   ↓
REVIEW
```

School OS dapat menyediakan information untuk setiap tahap.

---

# 39. TEACHER OPERATING LOOP

Initial model:

```text
PLAN
 ↓
TEACH
 ↓
OBSERVE
 ↓
RESPOND
 ↓
RECORD
 ↓
REFLECT
 ↓
ADJUST
```

Ini kemungkinan menjadi salah satu core loops yang paling penting untuk TK.

---

# 40. GUARDIAN OPERATING LOOP

Initial model:

```text
RECEIVE
   ↓
UNDERSTAND
   ↓
RESPOND
   ↓
PARTICIPATE
   ↓
FOLLOW UP
```

School OS harus menjaga agar Guardian tidak dibebani dengan internal school complexity.

---

# 41. STUDENT DEVELOPMENT LOOP

Conceptual model:

```text
EXPERIENCE
   ↓
OBSERVATION
   ↓
EVIDENCE
   ↓
INTERPRETATION
   ↓
RESPONSE
   ↓
NEW EXPERIENCE
```

Ini bukan automated scoring engine.

---

# 42. EXCEPTIONS

Real school operations tidak selalu mengikuti happy path.

Contoh:

```text
Student absent
Teacher unavailable
Guardian cannot respond
Document incomplete
Schedule changes
Unexpected event
Student requires follow-up
```

Operating Model harus mengakui exceptions.

Namun kita tidak perlu mendesain seluruh exception sekarang.

---

# 43. WORKFLOW PRIORITY

Workflow diprioritaskan berdasarkan:

```text
FREQUENCY
    ×
IMPACT
    ×
PAIN
    ×
STRATEGIC VALUE
```

Bukan berdasarkan:

```text
"fitur ini keren"
```

atau:

```text
"aplikasi sekolah lain punya fitur ini."
```

---

# 44. MVP DISCOVERY FILTER

Sebuah capability layak dipertimbangkan untuk MVP jika:

### High Frequency

Digunakan sering.

### High Impact

Berpengaruh terhadap pendidikan atau operasi.

### High Friction

Saat ini sulit dilakukan.

### High Information Value

Menghasilkan information penting.

### Clear Ownership

Ada orang yang jelas bertanggung jawab.

Jika tidak memenuhi faktor tersebut, capability dapat ditunda.

---

# 45. TK AS VALIDATION CONTEXT

TK bukan architecture.

TK adalah:

> **Reality check.**

Model:

```text
COMMON SCHOOL MODEL
       ↓
       TK
       ↓
OBSERVE REALITY
       ↓
VALIDATE
       ↓
REFINE MODEL
       ↓
GENERALIZE
```

Kita tidak boleh:

```text
TK assumption
      ↓
Universal rule
```

tanpa evidence.

---

# 46. TK-SPECIFIC AREAS TO DISCOVER

Untuk TK, discovery terutama perlu memahami:

- student arrival;
- guardian handover;
- daily routines;
- classroom activities;
- play;
- learning;
- observation;
- development;
- communication;
- pickup;
- incidents;
- documentation;
- teacher collaboration;
- parent engagement.

Belum berarti semua akan menjadi feature.

---

# 47. WHAT WE SHOULD OBSERVE IN A REAL TK

Discovery sebaiknya melihat:

### Before School

Apa yang terjadi sebelum student datang?

### Arrival

Siapa bertemu siapa?

Apa yang dicatat?

### Classroom

Apa yang dilakukan teacher?

Apa yang dilakukan student?

### During Learning

Apa yang perlu diketahui teacher?

### Observation

Kapan observation dilakukan?

Bagaimana dicatat?

### Guardian Interaction

Kapan teacher dan guardian berinteraksi?

### End of Day

Informasi apa yang perlu disampaikan?

### After School

Apa pekerjaan administratif teacher?

---

# 48. SCHOOL OS INFORMATION MAP

Initial model:

```text
                    SCHOOL
                       │
       ┌───────────────┼────────────────┐
       │               │                │
     PEOPLE          LEARNING        OPERATIONS
       │               │                │
       │               │                │
       └───────────────┼────────────────┘
                       │
                 STUDENT JOURNEY
                       │
          ┌────────────┼────────────┐
          │            │            │
      Attendance    Development   Communication
          │            │            │
          └────────────┼────────────┘
                       │
                    RECORDS
                       │
                       ▼
                 INSIGHT / DECISION
```

---

# 49. SCHOOL OS AS A SYSTEM OF RECORD

School OS should become a trusted place for operational information.

Tetapi:

> **System of Record ≠ System of Everything.**

Kita tidak perlu memaksa semua information masuk School OS.

Jika information tidak memiliki operational value atau governance purpose yang jelas, jangan dikumpulkan.

---

# 50. SCHOOL OS AS A SYSTEM OF WORK

Lebih penting daripada sekadar system of record:

> **School OS should become a system of work.**

Artinya user datang ke system bukan hanya untuk:

```text
LOOK
```

tetapi untuk:

```text
DO
```

Contoh:

```text
Record attendance
Observe student
Respond to request
Review development
Communicate
Approve
Follow up
```

---

# 51. SCHOOL OS AS A SYSTEM OF MEMORY

Dalam jangka panjang:

```text
System of Work
       +
System of Record
       +
System of Memory
```

membentuk institutional capability.

School tidak kehilangan knowledge ketika:

- teacher pindah;
- leadership berubah;
- staff berganti;
- dokumen lama sulit ditemukan.

Tetapi institutional memory harus tetap governed.

---

# 52. SCHOOL OS AS A DECISION SUPPORT SYSTEM

Future maturity:

```text
Record
  ↓
Information
  ↓
Pattern
  ↓
Insight
  ↓
Decision
```

AI atau advanced analytics tidak menjadi prerequisite.

Common sense information architecture harus bekerja terlebih dahulu.

---

# 53. BOUNDARY BETWEEN SCHOOL AND YAPENDIK

School bekerja secara operational.

Yapendik bekerja pada:

- stewardship;
- governance;
- portfolio;
- strategic oversight;
- institutional improvement.

Conceptual boundary:

```text
SCHOOL
   │
   │ operational truth
   ▼
YAPENDIK
   │
   │ governance / support / insight
   ▼
SCHOOL
```

Tujuan bukan centralized control atas semua detail.

Tujuan:

> **Better support and better stewardship.**

---

# 54. BOUNDARY BETWEEN SCHOOL AND GUARDIAN

```text
SCHOOL INTERNAL
      │
      ▼
GOVERNED COMMUNICATION
      │
      ▼
GUARDIAN
```

Guardian tidak mendapat akses langsung ke seluruh School OS.

---

# 55. BOUNDARY BETWEEN SCHOOL AND STUDENT

Khususnya pada TK, student mungkin belum menjadi direct software operator.

Karena itu:

```text
Student
   ↓
Educational beneficiary
```

tidak otomatis berarti:

```text
Student
   ↓
Application user
```

Ini adalah important distinction.

---

# 56. INFORMATION PRIVACY BY CONTEXT

Informasi dapat memiliki visibility berbeda:

```text
School Internal
       ↓
Teacher Context
       ↓
Guardian Context
       ↓
Yapendik Context
       ↓
Public Context
```

Tidak semua information bergerak ke level berikutnya.

---

# 57. WHAT SCHOOL OS SHOULD OPTIMIZE

Primary optimization:

### 1. Reduce unnecessary administrative work

### 2. Improve information availability

### 3. Improve educational continuity

### 4. Improve communication

### 5. Preserve institutional knowledge

### 6. Improve decision quality

### 7. Reduce duplicated information

### 8. Increase operational clarity

---

# 58. WHAT SCHOOL OS SHOULD NOT OPTIMIZE

Jangan mengoptimalkan:

- jumlah fitur;
- jumlah menu;
- jumlah dashboard;
- jumlah automation;
- jumlah database tables;
- vanity metrics.

Success bukan:

> "Banyak functionality."

Success adalah:

> **"School work becomes clearer, easier, and more meaningful."**

---

# 59. DESIGN PRINCIPLES DERIVED FROM OPERATING MODEL

Operating Model menghasilkan beberapa prinsip:

### Principle 1 — Work Before Feature

Pahami pekerjaan sebelum membuat feature.

### Principle 2 — Context Before Screen

Pahami context sebelum membuat screen.

### Principle 3 — Information Before Form

Pahami information sebelum membuat form.

### Principle 4 — Responsibility Before Permission

Pahami responsibility sebelum membuat RBAC.

### Principle 5 — Outcome Before Automation

Pahami outcome sebelum mengotomasi.

### Principle 6 — Evidence Before Assumption

Validasi workflow melalui real school.

### Principle 7 — Simple Before Complete

Mulai dari workflow paling penting.

---

# 60. DISCOVERY METHOD

Operating Model ini akan berkembang melalui:

```text
Observe
   ↓
Interview
   ↓
Document
   ↓
Model
   ↓
Validate
   ↓
Prototype
   ↓
Use
   ↓
Measure
   ↓
Learn
```

Bukan:

```text
Assume
   ↓
Build
   ↓
Hope
```

---

# 61. DISCOVERY QUESTIONS

## School

1. Bagaimana school sebenarnya terorganisasi?
2. Apa pekerjaan paling penting setiap hari?
3. Apa pekerjaan paling menyita waktu?
4. Apa pekerjaan paling sering mengalami kesalahan?

## Teacher

5. Apa yang teacher lakukan setiap hari?
6. Apa yang harus teacher catat?
7. Apa yang sebenarnya ingin teacher ketahui tentang student?
8. Apa yang membuat teacher kehilangan waktu untuk student?

## Student

9. Apa yang paling penting diketahui school tentang student?
10. Apa yang sebenarnya dimaksud dengan student development?

## Guardian

11. Informasi apa yang paling dibutuhkan guardian?
12. Informasi apa yang school perlu dari guardian?
13. Apa communication pain terbesar?

## Leadership

14. Keputusan apa yang paling sering dibuat?
15. Informasi apa yang dibutuhkan untuk membuat keputusan?
16. Informasi apa yang sulit diperoleh?

## Administration

17. Apa pekerjaan repetitive?
18. Apa yang masih menggunakan paper/spreadsheet?
19. Apa yang sering diinput ulang?

---

# 62. CURRENT OPEN QUESTIONS

Beberapa hal sengaja belum diputuskan:

- exact admission workflow;
- exact enrollment workflow;
- academic year model;
- class model;
- teacher assignment;
- TK curriculum model;
- observation model;
- development framework;
- guardian relationship;
- communication model;
- document model;
- school operational workflows;
- Yapendik reporting requirements;
- governance boundaries.

Semua ini adalah **discovery topics**, bukan kekurangan architecture.

---

# 63. OPERATING MODEL MATURITY

Current state:

```text
School Philosophy       ████████░░  Working
Actors                  ███████░░░  Working
Context                 ██████░░░░  Initial
Student Journey         ██████░░░░  Initial
Daily Operations        ████░░░░░░  Discovery
Learning Model          ████░░░░░░  Discovery
Development Model       ███░░░░░░░  Discovery
Communication           ████░░░░░░  Discovery
Governance              █████░░░░░  Initial
TK Reality              ██░░░░░░░░  Needs Field Validation
```

Tidak ada bagian yang perlu dipaksakan menjadi "100%" sekarang.

---

# 64. NEXT DOCUMENT

Setelah Operating Model ini, kita **belum langsung membuat UI**.

Next:

```text
YAPENDIK TK PILOT PRODUCT BLUEPRINT
```

Dokumen tersebut akan menjawab:

> **Dari seluruh School Operating Model, bagian mana yang benar-benar akan kita bangun terlebih dahulu untuk TK?**

Dengan struktur:

```text
Operating Model
      ↓
Prioritize
      ↓
Define MVP
      ↓
Define Product Capabilities
      ↓
Define Core Workflows
      ↓
Define Product Boundaries
```

Baru setelah itu:

```text
Product Blueprint
      ↓
UX Architecture
```

---

# 65. STATUS

**LIVING — DISCOVERY**

Dokumen ini bukan frozen architecture.

Ia akan berubah ketika:

- kita melakukan discovery dengan sekolah;
- menemukan workflow nyata;
- menemukan contradiction;
- menemukan informasi yang hilang;
- atau menemukan bahwa asumsi awal salah.

Dan itu justru merupakan fungsi dokumen ini.

---

# 66. NORTH STAR

School OS harus membuat sekolah:

> **lebih mampu menjalankan pendidikan, bukan sekadar lebih mampu menggunakan software.**

Karena itu:

```text
Education First
      ↓
People First
      ↓
Work First
      ↓
Information First
      ↓
Simple Technology
      ↓
Continuous Improvement
```

---

# 67. CLOSING PRINCIPLE

> **We are not digitizing the school as it exists.**
>
> **We are understanding how the school works, preserving what is valuable, removing unnecessary friction, and then designing technology around that reality.**

**Status: LIVING — DISCOVERY**

**The Operating Model is a working model of the school, not a specification of the software.**