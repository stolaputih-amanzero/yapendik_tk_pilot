# YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE

## Version 0.1

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Enterprise Information Architecture  
**Status:** **LIVING — DISCOVERY**  
**Authority:** Derived from Yapendik OS Constitution  
**Scope:** Entire Yapendik OS  
**Current Focus:** Phase 1 — School OS / TK Pilot  
**Architecture Philosophy:** **Make It Simple. Keep It Future-Proof.**  
**Approach:** Common Sense First  
**Supersedes:** None

---

# 1. PURPOSE

Yapendik Enterprise Information Architecture (EIA) adalah peta awal mengenai **organisasi, people, context, domain, entity, relationship, dan information flow** yang membentuk Yapendik Operating System.

EIA menjawab pertanyaan sederhana:

> **Apa saja yang perlu dipahami oleh Yapendik OS agar dapat membantu Yapendik menjalankan pendidikan dengan lebih baik?**

EIA bukan:

- database schema;
- ERD teknis;
- daftar menu;
- desain UI;
- RBAC specification;
- API specification;
- technical architecture;
- atau final product scope.

EIA adalah **shared map of understanding** antara Constitution dan architecture berikutnya.

---

# 2. RELATIONSHIP TO THE CONSTITUTION

Yapendik OS Constitution adalah governance authority tertinggi.

EIA berada satu layer di bawah Constitution:

```text
YAPENDIK OS CONSTITUTION
          │
          ▼
ENTERPRISE INFORMATION ARCHITECTURE
          │
          ▼
DOMAIN / OPERATING MODEL
          │
          ▼
PRODUCT / UX / TECHNICAL ARCHITECTURE
          │
          ▼
IMPLEMENTATION
```

EIA tidak boleh bertentangan dengan Constitution.

Namun EIA tidak perlu mengubah Constitution hanya karena discovery menghasilkan detail baru.

Constitution mengatur **fundamental principles dan boundaries**.

EIA mengatur **shared understanding of information and structure**.

---

# 3. WHY EIA COMES NEXT

Constitution telah menetapkan prinsip:

> **Information Before Interface**

dan urutan:

```text
Purpose
   ↓
People
   ↓
Information
   ↓
Entity
   ↓
Relationship
   ↓
Context
   ↓
Workflow
   ↓
Action
   ↓
Experience
   ↓
Interface
   ↓
Technology
```

Karena itu kita tidak memulai dengan:

- dashboard;
- sidebar;
- mobile navigation;
- database table;
- API;
- atau component.

Kita mulai dengan memahami:

```text
WHO
WHAT
WHERE
IN WHAT CONTEXT
RELATED TO WHAT
USED FOR WHAT
```

---

# 4. COMMON SENSE FIRST

Pada tahap awal, kita tidak mencoba membuat model enterprise yang sempurna.

Kita mulai dari pertanyaan yang dapat dipahami manusia:

### People

Siapa yang terlibat?

### Organization

Organisasi dan unit apa yang ada?

### Context

Dalam konteks apa mereka bekerja?

### Information

Informasi apa yang mereka butuhkan?

### Entity

Apa saja "things" yang perlu dikenali oleh sistem?

### Relationship

Bagaimana things tersebut saling berhubungan?

### Information Flow

Bagaimana informasi bergerak dari aktivitas nyata menuju keputusan?

---

# 5. CORE MENTAL MODEL

Untuk sementara, Yapendik OS dapat dipahami melalui:

```text
                         YAPENDIK
                            │
                            ▼
                      ORGANIZATION
                            │
                ┌───────────┴───────────┐
                │                       │
             PEOPLE                  CONTEXT
                │                       │
                └───────────┬───────────┘
                            │
                         DOMAINS
                            │
                            ▼
                         ENTITIES
                            │
                            ▼
                       RELATIONSHIPS
                            │
                            ▼
                    INFORMATION FLOW
                            │
                            ▼
                     DECISION & ACTION
```

Ini bukan physical architecture.

Ini adalah **mental model** untuk memahami Yapendik OS.

---

# 6. ENTERPRISE SCOPE

Constitution menetapkan tiga strategic experience:

```text
                         YAPENDIK OS
                              │
             ┌────────────────┼────────────────┐
             │                │                │
          SCHOOL OS      FOUNDATION OS     PUBLIC EXPERIENCE
             │                │                │
           ACTIVE            FUTURE            FUTURE
```

## 6.1 SCHOOL OS

School OS mendukung operasi dan pendidikan sehari-hari di sekolah.

Current implementation:

> **Phase 1 — School Operating System**

Initial pilot:

> **TK / Early Childhood Education**

TK adalah **pilot context**, bukan architectural boundary.

---

## 6.2 FOUNDATION OS

Foundation OS adalah future experience untuk:

- stewardship;
- governance;
- school portfolio;
- consolidated information;
- organizational performance;
- strategic insight;
- resource stewardship;
- quality improvement.

Pada tahap ini kita belum memodelkan Foundation OS secara detail.

---

## 6.3 PUBLIC EXPERIENCE

Public Experience ditujukan bagi:

- masyarakat;
- calon orang tua;
- orang tua;
- mitra;
- supporter;
- calon tenaga pendidikan;
- komunitas.

Website Yapendik yang telah ada diperlakukan sebagai:

> **Existing Public Information Layer**

bukan sebagai bagian dari School OS MVP.

---

# 7. ORGANIZATION MODEL

Common-sense model:

```text
YAPENDIK
   │
   └── SCHOOL
          │
          ├── School A
          ├── School B
          └── School C
```

Untuk saat ini:

### Yapendik

Organisasi induk yang memiliki mandat pendidikan dan stewardship.

### School

Unit pendidikan tempat pendidikan dan operasi sekolah berlangsung.

### School Unit / Sub-unit

Belum ditetapkan sebagai canonical entity.

Jika nantinya ditemukan kebutuhan nyata seperti:

- campus;
- branch;
- unit pendidikan;
- atau struktur lain,

maka struktur tersebut dapat dimodelkan berdasarkan evidence.

> **Jangan membuat organizational layer hanya karena software mampu mendukungnya.**

---

# 8. PEOPLE MODEL

Yapendik OS berurusan dengan manusia terlebih dahulu, baru kemudian role.

Initial model:

```text
PERSON
  │
  ├── Student
  ├── Guardian
  ├── Teacher
  ├── Staff
  └── Other People
```

---

# 9. PERSON

**Person** adalah canonical concept untuk manusia yang dikenal oleh Yapendik OS.

Person adalah identity.

Seseorang dapat mempunyai beberapa relationship dengan organisasi.

Contoh:

```text
Person
   ├── Guardian
   └── Staff
```

Hal ini berarti architecture tidak boleh mengasumsikan:

> satu person = satu role.

---

# 10. STUDENT

Student adalah Person dalam konteks pendidikan sebagai peserta didik.

Student bukan sekadar profile.

Student memiliki relationship dengan:

- School;
- Academic Year;
- Class;
- Guardian;
- Enrollment;
- Attendance;
- Learning;
- Development;
- Observation;
- Evidence.

Model awal:

```text
Person
   ↓
Student
   ↓
School
   ↓
Academic Year
   ↓
Class
```

---

# 11. GUARDIAN

Guardian adalah Person yang memiliki responsibility atau relationship terhadap Student.

Kita menggunakan istilah **Guardian** sebagai canonical concept awal karena hubungan terhadap anak tidak selalu harus diasumsikan sebagai parent biologis.

Detail:

- father;
- mother;
- legal guardian;
- family relationship;
- emergency contact;

belum ditentukan di EIA.

Hal tersebut akan divalidasi melalui discovery.

---

# 12. TEACHER

Teacher adalah Person yang mempunyai responsibility dalam proses pendidikan.

Teacher dapat memiliki relationship dengan:

- School;
- Academic Year;
- Class;
- Learning Activity;
- Student;
- Development / Observation.

Detail assignment belum ditentukan.

---

# 13. STAFF

Staff adalah Person yang mendukung operasi sekolah atau organisasi.

Kita tidak perlu langsung membuat:

```text
Staff
├── Administration
├── Finance
├── HR
├── Security
├── IT
└── ...
```

kecuali real-world workflow menunjukkan bahwa kategorisasi tersebut memang diperlukan.

---

# 14. PERSON VS ROLE

EIA membedakan:

```text
PERSON
   ↓
RELATIONSHIP
   ↓
RESPONSIBILITY
   ↓
ROLE / AUTHORITY
```

Contoh:

```text
A Person
   ↓
works at School A
   ↓
has teaching responsibility
   ↓
acts as Teacher
```

Dengan demikian:

> **Person is identity. Role is responsibility in context.**

RBAC bukan bagian dari EIA detail.

---

# 15. CONTEXT MODEL

Context menjawab:

> **Dalam lingkungan apa informasi ini berlaku?**

Initial working model:

```text
Yapendik
   │
   └── School
          │
          └── Academic Year
                 │
                 └── Class
                        │
                        └── Student
```

Namun ini belum frozen.

Context hierarchy harus mengikuti real organizational dan educational context.

---

# 16. SCHOOL CONTEXT

School adalah primary context untuk School OS.

```text
School
   ├── People
   ├── Academic Years
   ├── Classes
   ├── Students
   ├── Teachers
   └── Operations
```

School menjadi anchor utama bagi sebagian besar informasi operasional.

---

# 17. ACADEMIC YEAR CONTEXT

Academic Year adalah temporal context yang mengikat berbagai aktivitas pendidikan.

Contoh:

```text
Student
   ↓
Academic Year
   ↓
Enrollment
   ↓
Class
```

Apakah semua sekolah menggunakan model Academic Year yang sama perlu divalidasi melalui discovery.

---

# 18. CLASS CONTEXT

Class adalah operational learning context.

Class dapat menghubungkan:

- Students;
- Teachers;
- Learning Activities;
- Attendance;
- Observations.

Class bukan sekadar data master.

Class adalah context tempat banyak aktivitas pendidikan berlangsung.

---

# 19. DOMAIN MODEL

Domain adalah area responsibility yang memiliki informasi dan workflow yang saling berkaitan.

Initial common-sense domain map:

```text
YAPENDIK OS
│
├── Organization
│
├── People
│
├── Academic Structure
│
├── Students & Enrollment
│
├── Teaching & Learning
│
├── Student Development
│
├── Attendance
│
├── Communication
│
├── School Operations
│
├── Resources & Assets
│
├── Documents & Records
│
├── Reporting & Insight
│
└── Governance
```

Ini adalah **discovery baseline**.

Tidak semua domain harus menjadi MVP.

Tidak semua domain harus menjadi software module.

> **Domain describes responsibility. It does not prescribe implementation.**

---

# 20. ORGANIZATION DOMAIN

Tujuan:

> Mengetahui organisasi dan unit pendidikan yang sedang dibicarakan.

Candidate concepts:

- Yapendik;
- School;
- School Unit.

Primary information:

- identity;
- name;
- status;
- organizational relationship;
- basic profile.

---

# 21. PEOPLE DOMAIN

Tujuan:

> Mengetahui siapa manusia yang terlibat dalam pendidikan dan operasi.

Candidate entities:

- Person;
- Student;
- Guardian;
- Teacher;
- Staff.

Primary information:

- identity;
- contact;
- relationship;
- responsibility;
- status.

Privacy menjadi concern utama.

---

# 22. ACADEMIC STRUCTURE DOMAIN

Tujuan:

> Menjelaskan struktur pendidikan dalam School.

Candidate concepts:

- Academic Year;
- Class;
- Learning Area;
- Teaching Assignment.

Tidak semuanya dipastikan masuk TK MVP.

---

# 23. STUDENTS & ENROLLMENT DOMAIN

Tujuan:

> Menjelaskan hubungan Student dengan School dan periode pendidikan.

Initial model:

```text
Student
   ↓
Enrollment
   ↓
School
   ↓
Academic Year
   ↓
Class
```

Enrollment dipahami sebagai **relationship / event**, bukan sekadar attribute Student.

---

# 24. TEACHING & LEARNING DOMAIN

Tujuan:

> Mendukung aktivitas pendidikan.

Candidate concepts:

- Learning Activity;
- Learning Area;
- Teacher Assignment;
- Evidence.

EIA tidak menentukan pedagogical model.

Pedagogical model harus ditemukan dari praktik pendidikan nyata.

---

# 25. STUDENT DEVELOPMENT DOMAIN

Tujuan:

> Membantu sekolah memahami perkembangan Student sebagai manusia.

Candidate concepts:

- Development Area;
- Observation;
- Evidence.

Important distinction:

```text
Observation ≠ Student
Observation ≠ Final Truth
Evidence ≠ Entire Person
```

Data harus tetap memberikan ruang bagi context dan human judgment.

---

# 26. ATTENDANCE DOMAIN

Tujuan:

> Mencatat kehadiran sebagai bagian dari operational information.

Candidate entity:

> Attendance Record

Initial relationship:

```text
Student
   ↓
Class / School Context
   ↓
Date
   ↓
Attendance Record
```

Detail status dan workflow belum ditetapkan.

---

# 27. COMMUNICATION DOMAIN

Tujuan:

> Mendukung komunikasi yang relevan antara pihak-pihak yang terlibat.

Potential participants:

- School;
- Teacher;
- Guardian;
- Student;
- Staff.

Complex messaging system bukan MVP commitment.

Kita akan membangun capability ini hanya jika workflow nyata membutuhkannya.

---

# 28. SCHOOL OPERATIONS DOMAIN

Mencakup pekerjaan operasional di luar core educational activity.

Possible concepts:

- schedule;
- facility;
- activity;
- request;
- operational record.

Detail masih membutuhkan discovery.

---

# 29. RESOURCES & ASSETS DOMAIN

Potential information:

- building;
- room;
- equipment;
- asset;
- resource.

Full asset management belum menjadi MVP requirement.

---

# 30. DOCUMENTS & RECORDS DOMAIN

Institutional knowledge dapat berada dalam:

```text
Documents
Records
Spreadsheets
Local Archives
Operational Practice
```

EIA membedakan:

```text
CANONICAL INFORMATION
        vs
SUPPORTING DOCUMENT / EVIDENCE
```

Dokumen tidak otomatis menjadi source of truth.

---

# 31. REPORTING & INSIGHT DOMAIN

Reporting tidak menciptakan canonical entity baru.

Reporting menggunakan information dari domain lain:

```text
Canonical Information
        ↓
     Reporting
        ↓
      Insight
        ↓
     Decision
```

Karena itu:

> **Dashboard is a projection of information, not a new source of truth.**

---

# 32. GOVERNANCE DOMAIN

Governance mencakup:

- responsibility;
- authority;
- stewardship;
- policy;
- auditability;
- institutional decisions.

Governance dapat bekerja pada berbagai context.

---

# 33. INITIAL ENTITY INVENTORY

| Area | Entity | Status |
|---|---|---|
| Organization | Yapendik | Candidate |
| Organization | School | Candidate |
| People | Person | Candidate |
| People | Student | Candidate |
| People | Guardian | Candidate |
| People | Teacher | Candidate |
| People | Staff | Candidate |
| Academic | Academic Year | Candidate |
| Academic | Class | Candidate |
| Academic | Learning Area | Open |
| Academic | Assignment | Open |
| Enrollment | Enrollment | Candidate |
| Learning | Learning Activity | Candidate |
| Development | Development Area | Candidate |
| Development | Observation | Candidate |
| Development | Evidence | Candidate |
| Attendance | Attendance Record | Candidate |
| Operations | Schedule | Open |
| Operations | Facility | Open |
| Resources | Asset | Open |
| Documents | Document | Candidate |
| Governance | Policy / Decision | Open |

Entity inventory ini sengaja kecil.

> **Entity ditambahkan karena kebutuhan nyata, bukan karena kita ingin terlihat lengkap.**

---

# 34. ENTITY CLASSIFICATION

Secara konseptual:

```text
CANONICAL / MASTER
    ↓
Person
School
Student
Teacher
Class
Academic Year

RELATIONSHIP / TRANSACTION
    ↓
Enrollment
Assignment
Attendance
Observation

SUPPORTING INFORMATION
    ↓
Evidence
Document

PROJECTION
    ↓
Report
Dashboard
Insight
```

Ini belum merupakan database classification.

---

# 35. CORE RELATIONSHIP MODEL

Initial model:

```text
YAPENDIK
   │
   └── School
          │
          ├── Person
          │     ├── Student
          │     ├── Guardian
          │     ├── Teacher
          │     └── Staff
          │
          └── Academic Year
                 │
                 └── Class
                        │
                        ├── Student
                        ├── Teacher
                        ├── Attendance
                        ├── Learning Activity
                        └── Observation
```

Conceptually:

```text
School ─────── Student
   │              │
   │              ├── Guardian
   │              ├── Enrollment
   │              ├── Attendance
   │              ├── Learning
   │              └── Development
   │
   └──── Teacher
```

Relationship ini harus divalidasi terhadap real workflow.

---

# 36. RELATIONSHIP TYPES

Common-sense relationship types:

### Stewardship

```text
Yapendik → School
```

### Membership

```text
Student → School
Student → Class
Teacher → School
```

### Responsibility

```text
Teacher → Class
Teacher → Learning Activity
```

### Guardianship

```text
Guardian → Student
```

### Participation

```text
Student → Learning Activity
```

### Observation

```text
Teacher / Authorized Person → Student
```

### Evidence

```text
Evidence → Observation
```

Meaning of relationship lebih penting daripada foreign key.

---

# 37. CANONICAL INFORMATION

Setiap canonical entity harus memiliki satu governed meaning.

Contoh:

```text
Student
   │
   ├── Enrollment
   ├── Attendance
   ├── Learning
   ├── Observation
   └── Reporting
```

Semua domain menggunakan konsep Student yang sama.

Tidak boleh berkembang menjadi:

```text
Student in Module A
Student in Module B
Student in Module C
```

yang akhirnya menjadi tiga master berbeda.

> **One concept → one canonical meaning → governed reuse.**

---

# 38. SOURCE OF TRUTH

Initial principle:

```text
CANONICAL ENTITY
      │
      ├── Operational use
      ├── Reporting
      ├── Insight
      └── Public projection where appropriate
```

Report dan dashboard bukan master data.

Public information adalah governed projection.

---

# 39. INFORMATION FLOW

Model sederhana:

```text
REAL WORLD
    │
    ▼
PEOPLE DO WORK
    │
    ▼
OPERATIONAL RECORD
    │
    ▼
TRUSTED INFORMATION
    │
    ▼
REPORT / INSIGHT
    │
    ▼
DECISION
    │
    ▼
ACTION / IMPROVEMENT
```

Contoh:

```text
Teacher observes Student
        ↓
Observation recorded
        ↓
Evidence attached where appropriate
        ↓
Information available in context
        ↓
Teacher / School reviews
        ↓
Educational decision
        ↓
Follow-up action
```

Sistem mendukung loop tersebut.

Sistem tidak menggantikan professional judgment.

---

# 40. INFORMATION CONTEXT

Setiap informasi penting harus dapat dijelaskan melalui:

```text
WHO?
WHAT?
WHEN?
IN WHAT CONTEXT?
WHY / FOR WHAT PURPOSE?
```

Terutama untuk:

- student information;
- observation;
- attendance;
- document;
- decision;
- report.

---

# 41. INFORMATION LIFECYCLE

Common-sense lifecycle:

```text
Created
   ↓
Used
   ↓
Updated
   ↓
Referenced
   ↓
Archived / Retained
   ↓
Disposed according to policy
```

Tidak semua information mempunyai lifecycle yang sama.

Retention policy akan ditentukan kemudian berdasarkan governance dan kebutuhan nyata.

---

# 42. PRIVACY BOUNDARY

Initial model:

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

Child data mendapat perhatian khusus.

Public Experience tidak boleh memperoleh akses ke internal information hanya karena information tersebut ada di system.

---

# 43. PUBLIC PROJECTION

Public Experience:

```text
INTERNAL INFORMATION
        │
        ▼
GOVERNED PROJECTION
        │
        ▼
PUBLIC EXPERIENCE
```

Bukan:

```text
DATABASE
   ↓
PUBLIC WEBSITE
```

Public Experience adalah consumer dari governed information.

---

# 44. INSTITUTIONAL KNOWLEDGE

Yapendik OS secara bertahap harus membantu menjaga knowledge yang sekarang dapat tersebar di:

- people;
- documents;
- spreadsheets;
- messaging;
- local archives;
- operational practice.

Tetapi consolidation tidak boleh menghilangkan:

- context;
- ownership;
- provenance;
- access boundaries;
- human judgment.

Tujuan:

> **Knowledge-preserving, not merely paperless.**

---

# 45. SCHOOL AND FOUNDATION INFORMATION FLOW

Future conceptual model:

```text
SCHOOL
  │
  │ governed information
  ▼
SHARED FOUNDATION
  │
  │ contextualized insight
  ▼
YAPENDIK
```

Foundation tidak otomatis membutuhkan seluruh detail School.

Information bergerak berdasarkan:

- purpose;
- authority;
- responsibility;
- privacy;
- governance.

---

# 46. SCHOOL AUTONOMY

Shared architecture tidak berarti semua School harus bekerja dengan cara identik.

```text
Shared Canonical Concepts
          │
          ▼
Shared Governance
          │
          ▼
School Context
          │
          ▼
Local Workflow
```

Prinsip:

> **Standardize what must be shared; preserve autonomy where context matters.**

Tujuannya:

> **Coherence, not unnecessary uniformity.**

---

# 47. WHAT WE DELIBERATELY DO NOT DECIDE YET

EIA ini belum menentukan:

- exact database tables;
- primary / foreign keys;
- UUID strategy;
- RLS implementation;
- authentication provider;
- API structure;
- frontend architecture;
- mobile navigation;
- dashboard design;
- offline architecture;
- AI architecture;
- detailed RBAC;
- detailed reporting model;
- complete finance model;
- complete HR model;
- complete public website architecture.

Semua itu adalah layer berikutnya.

Ini disengaja.

---

# 48. MVP BOUNDARY

EIA mendeskripsikan enterprise.

MVP tidak perlu mengimplementasikan seluruh enterprise.

Current direction:

```text
YAPENDIK OS
      │
      ▼
SCHOOL OS
      │
      ▼
GENERIC SCHOOL FOUNDATION
      │
      ▼
TK PILOT
```

TK Pilot dipakai untuk memvalidasi asumsi paling penting mengenai:

- People;
- School;
- Student;
- Guardian;
- Teacher;
- Class;
- Academic Year;
- Enrollment;
- Attendance;
- Learning;
- Development;
- Observation;
- Evidence;
- Basic Insight.

Exact MVP boundary akan ditentukan melalui **School OS Operating Model**.

---

# 49. FACT / ASSUMPTION / DECISION / OPEN QUESTION

Untuk menjaga kualitas discovery, setiap significant statement sebaiknya dapat dikategorikan sebagai:

### FACT

Verified dari Yapendik atau real school context.

### ASSUMPTION

Working assumption yang belum diverifikasi.

### DECISION

Pilihan yang sengaja ditetapkan.

### OPEN QUESTION

Sesuatu yang belum diketahui dan membutuhkan discovery.

Contoh:

| Topic | Classification |
|---|---|
| Yapendik memiliki beberapa sekolah | FACT — perlu sumber/validasi organisasi |
| TK adalah initial pilot | DECISION |
| Academic Year adalah core context | ASSUMPTION — validate |
| Semua school menggunakan class structure identik | OPEN QUESTION |
| Person adalah canonical concept | DECISION / working baseline |
| Offline-first diperlukan pada MVP | NOT REQUIRED |

---

# 50. DISCOVERY QUESTIONS

## Organization

1. Apa definisi School dalam struktur Yapendik?
2. Apakah terdapat campus atau sub-unit?
3. Apakah satu Person dapat terkait dengan lebih dari satu School?
4. Bagaimana authority mengalir dari Yapendik ke School?

## People

5. Kategori People apa saja yang benar-benar ada?
6. Apakah satu Person dapat memiliki beberapa responsibility?
7. Apa bentuk relationship Guardian yang sebenarnya?
8. Kategori Staff apa yang benar-benar penting secara operational?

## Academic

9. Bagaimana Academic Year didefinisikan?
10. Bagaimana Class dibentuk?
11. Bagaimana Teacher assignment dilakukan?
12. Bagaimana Student ditempatkan ke Class?

## Education

13. Apa yang sebenarnya dicatat oleh Teacher?
14. Apa yang disebut Observation?
15. Apa yang disebut Evidence?
16. Bagaimana School memahami Student Development khususnya di TK?

## Operations

17. Pekerjaan apa yang paling banyak memakan waktu?
18. Spreadsheet atau paper process apa yang digunakan?
19. Informasi apa yang berulang kali dimasukkan?
20. Informasi apa yang paling sulit ditemukan?

## Governance

21. Informasi apa yang harus dikendalikan School?
22. Informasi apa yang perlu dilihat Yapendik?
23. Informasi apa yang tidak boleh public?
24. Keputusan apa yang perlu auditability?

---

# 51. NEXT LAYER

Setelah EIA ini cukup dipahami, layer berikutnya adalah:

```text
YAPENDIK OS CONSTITUTION
          │
          ▼
YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
          │
          ▼
SCHOOL OS OPERATING MODEL
          │
          ▼
TK PILOT PRODUCT BLUEPRINT
          │
          ▼
UX ARCHITECTURE
          │
          ▼
TECHNICAL ARCHITECTURE
          │
          ▼
IMPLEMENTATION
```

Jadi setelah EIA ini, kita **belum coding**.

Kita akan masuk ke:

> **Bagaimana sebuah sekolah Yapendik sebenarnya bekerja?**

---

# 52. GOVERNANCE

EIA berada di bawah Constitution.

Jika EIA bertentangan dengan Constitution:

```text
CONSTITUTION
     ↑
     │
     └── EIA MUST CHANGE
```

Perubahan EIA tidak otomatis mengubah Constitution.

Constitution hanya perlu ditinjau apabila discovery menunjukkan perubahan terhadap:

- fundamental principle;
- strategic boundary;
- governance model;
- atau constitutional assumption.

---

# 53. LIVING ARCHITECTURE

EIA ini tidak frozen.

Model evolusinya:

```text
Discovery
   ↓
Model
   ↓
Validation
   ↓
Implementation
   ↓
Real Usage
   ↓
Evidence
   ↓
Learning
   ↓
EIA Evolution
```

Tujuan kita bukan mendapatkan perfect architecture sebelum mulai.

Tujuannya adalah memiliki **cukup clarity untuk mengambil keputusan berikutnya secara bertanggung jawab.**

> **We do not wait for certainty to begin.**

---

# 54. CURRENT STATUS

**Status:** LIVING — DISCOVERY

Qualitative confidence:

```text
Purpose              ██████████  High
Enterprise Scope     ███████░░░  Working
People Model         ███████░░░  Working
Context Model        ██████░░░░  Needs Validation
Domain Model         ██████░░░░  Initial
Entity Inventory     █████░░░░░  Initial
Relationships        █████░░░░░  Initial
Information Flow     ██████░░░░  Working
TK Specific Model    ███░░░░░░░  Discovery Required
```

Angka tersebut bukan measurement formal.

Ia hanya menunjukkan tingkat kematangan pemahaman saat ini.

---

# 55. NORTH STAR

Tujuan EIA bukan membuat Yapendik OS terlihat sophisticated.

Tujuannya adalah membuat system **understandable**.

> **If people can understand the organization, the information, the context, and the work, technology can follow.**

Karena itu:

```text
Understand first.
Model simply.
Validate in reality.
Build what matters.
Learn continuously.
Evolve deliberately.
```

---

# 56. CLOSING PRINCIPLE

> **The best Enterprise Information Architecture is not the one that models everything.**
>
> **It is the one that makes the important things clear, keeps their relationships understandable, and leaves room for reality to teach us what comes next.**

**YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE**

**Status: LIVING — DISCOVERY**

**The EIA is a working map, not a frozen territory.**