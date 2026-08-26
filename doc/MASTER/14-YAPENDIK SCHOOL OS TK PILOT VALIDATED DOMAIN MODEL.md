# YAPENDIK SCHOOL OS TK PILOT VALIDATED DOMAIN MODEL

Version: 0.1  
Organization: Yayasan Pendidikan GPIB (Yapendik)  
System: Yapendik Operating System  
Product: School OS  
Pilot Context: TK / Early Childhood Education  
Document Type: Validated Domain Model  
Status: LIVING — VALIDATION BASELINE  
Authority: Derived from YAPENDIK OS Constitution  
Approach: Common Sense First  
Principle: Make It Simple. Keep It Future-Proof.

---

# 1. PURPOSE

Dokumen ini mendefinisikan **domain model yang saat ini dianggap cukup matang untuk menjadi baseline desain**, setelah melewati rangkaian:

```text
Enterprise Information Architecture
        ↓
School OS Operating Model
        ↓
Product Blueprint
        ↓
Technical Architecture
        ↓
Workflow Specification
        ↓
Authorization Model
        ↓
Data Model
        ↓
Domain & Entity Specification
        ↓
Reality Validation
        ↓
★ VALIDATED DOMAIN MODEL ★
```

Dokumen ini menjadi jembatan antara:

```text
BUSINESS / SCHOOL REALITY
        ↓
DOMAIN MODEL
        ↓
DATABASE BLUEPRINT
```

Tujuan utamanya adalah memastikan bahwa database nanti dibangun berdasarkan **makna bisnis yang jelas**, bukan sekadar berdasarkan daftar tabel.

---

# 2. IMPORTANT STATUS DECLARATION

Status dokumen:

**LIVING — VALIDATION BASELINE**

Istilah **Validated** dalam dokumen ini berarti:

> Model telah divalidasi terhadap prinsip, operating model, workflow, product architecture, dan technical architecture yang telah kita bangun.

Ini **belum berarti seluruh model telah divalidasi melalui field observation dengan TK pilot**.

Dengan demikian:

```text
ARCHITECTURALLY VALIDATED
        ≠
FIELD VALIDATED
```

Area yang belum memiliki evidence lapangan tetap ditandai sebagai:

```text
OPEN
ASSUMED
DISCOVERY
```

Pendekatan ini konsisten dengan prinsip bahwa Yapendik OS tidak perlu menunggu certainty sempurna sebelum bergerak. Constitution memang ditetapkan sebagai **LIVING — ACTIVE GOVERNANCE DOCUMENT**. 

---

# 3. DOMAIN MODEL NORTH STAR

School OS memahami sekolah melalui:

```text
PEOPLE
   ↓
RESPONSIBILITY
   ↓
WORK
   ↓
INFORMATION
   ↓
CONTEXT
   ↓
DECISION
   ↓
ACTION
   ↓
OUTCOME
   ↓
LEARNING
   ↓
IMPROVEMENT
```

Domain model harus mendukung loop tersebut.

Technology tidak menjadi tujuan.

---

# 4. CORE DOMAIN PRINCIPLE

School OS menggunakan prinsip:

> **One concept → one canonical meaning → one governed representation.**

Artinya, apabila `Student` adalah satu konsep bisnis, maka semua domain harus menggunakan konsep Student yang sama.

Tidak boleh muncul:

```text
StudentAttendance
StudentLearning
StudentObservation
StudentReport
```

sebagai master Student yang berbeda.

Sebaliknya:

```text
Student
 ├── Enrollment
 ├── Attendance
 ├── Learning
 ├── Observation
 ├── Development
 └── Communication
```

menggunakan satu canonical Student.

Prinsip canonical information ini telah ditetapkan sejak Constitution dan EIA. 

---

# 5. DOMAIN MAP

Validated domain structure saat ini:

```text
YAPENDIK OS
│
└── SCHOOL OS
    │
    ├── 01. SCHOOL
    │
    ├── 02. PEOPLE
    │
    ├── 03. STUDENT
    │
    ├── 04. ACADEMIC
    │
    ├── 05. ATTENDANCE
    │
    ├── 06. LEARNING
    │
    ├── 07. OBSERVATION
    │
    ├── 08. DEVELOPMENT
    │
    ├── 09. RECORDS & EVIDENCE
    │
    ├── 10. COMMUNICATION
    │
    └── 11. REVIEW & INSIGHT
```

Domain boundaries ini bersifat **logical boundaries**, bukan microservices.

Technical Architecture secara eksplisit memilih modular monolith dengan domain boundaries yang jelas. 

---

# 6. DOMAIN 01 — SCHOOL

## Purpose

Merepresentasikan unit pendidikan tempat operating context berlangsung.

Canonical entity:

```text
School
```

School merupakan primary operational boundary untuk School OS.

---

# 7. SCHOOL DOMAIN ENTITIES

Core:

```text
School
Academic Year
Class
```

Relationship:

```text
School
 │
 ├── Academic Year
 │       │
 │       └── Class
 │
 └── People / Students
```

School Foundation memang ditetapkan sebagai MVP karena semua capability lain membutuhkan context sekolah. 

---

# 8. SCHOOL

School memiliki:

- stable identity;
- institutional identity;
- basic profile;
- operational context;
- relationship dengan Yapendik.

School bukan:

- user;
- account;
- subscription;
- dashboard.

School adalah **institutional entity**.

---

# 9. ACADEMIC YEAR

Academic Year merupakan contextual period.

Hubungan konseptual:

```text
School
   ↓
Academic Year
```

Academic Year menjadi bagian penting dari context karena banyak informasi School memiliki makna berbeda berdasarkan periode pendidikan.

Namun:

**exact Academic Year rules masih harus divalidasi dengan TK reality.**

---

# 10. CLASS

Class merupakan operational educational context.

```text
Academic Year
       ↓
Class
       ↓
Students
       ↓
Teacher Responsibility
```

Class juga merupakan primary workspace context bagi Teacher.

UX Architecture menetapkan Class Workspace sebagai salah satu workspace utama TK Pilot. 

---

# 11. DOMAIN 02 — PEOPLE

People domain bertanggung jawab terhadap:

- canonical identity;
- responsibility;
- relationship;
- school participation.

Core entity:

```text
Person
```

Derived/contextual relationships:

```text
Teacher
Staff
Guardian
Student
```

Technical Architecture juga menetapkan Person sebagai canonical identity untuk berbagai relationships. 

---

# 12. PERSON

Person adalah canonical identity manusia.

Prinsip:

```text
Person
   │
   ├── Teacher responsibility
   ├── Staff responsibility
   ├── Guardian relationship
   └── Student relationship / identity
```

Satu Person tidak boleh diduplikasi hanya karena mempunyai lebih dari satu relationship.

Contoh:

```text
Person A
 ├── Teacher
 └── Guardian
```

tetap merupakan satu Person.

---

# 13. TEACHER

Teacher bukan harus diperlakukan sebagai independent human identity.

Lebih tepat dipahami sebagai:

```text
Person
   ↓
Teacher Responsibility
   ↓
School / Academic Year / Class
```

Ini penting karena responsibility dapat berubah tanpa mengubah identity Person.

Authorization juga harus diturunkan dari:

```text
Responsibility
 ↓
Context
 ↓
Authority
 ↓
Action
```

bukan hanya dari label "Teacher". 

---

# 14. STAFF

Staff mengikuti prinsip yang sama.

```text
Person
   ↓
Staff Responsibility
   ↓
School Context
```

Kita tidak membangun HRIS penuh hanya untuk merepresentasikan Staff.

HR complexity ditunda sampai ada kebutuhan nyata.

---

# 15. GUARDIAN

Guardian merupakan relationship antara Person dan Student.

```text
Person
   ↓
Guardian Relationship
   ↓
Student
```

Guardian bukan sekadar account type.

Relationship dengan Student menjadi bagian penting dari authorization.

---

# 16. DOMAIN 03 — STUDENT

Student adalah:

> **Canonical educational entity.**

Student merupakan anchor utama School OS.

Relationship:

```text
Student
 │
 ├── Enrollment
 ├── Class Placement
 ├── Attendance
 ├── Learning
 ├── Observation
 ├── Development
 ├── Evidence
 └── Communication
```

Technical Architecture secara eksplisit menetapkan Student sebagai canonical educational entity. 

---

# 17. STUDENT IDENTITY

Student harus memiliki stable identity.

Identity tidak berubah hanya karena:

- academic year berubah;
- class berubah;
- teacher berubah;
- enrollment berubah;
- relationship berubah.

Prinsip:

```text
Student Identity
        ↓
Relationships change
        ↓
Identity remains
```

---

# 18. PERSON VS STUDENT

Model saat ini mempertahankan dua konsep:

```text
Person
Student
```

karena:

```text
Person = human identity
Student = educational identity
```

Namun hubungan physical antara keduanya **tidak boleh difinalkan sebelum field validation** apabila TK reality menunjukkan struktur yang berbeda.

Ini termasuk salah satu architectural risk yang sebelumnya telah diidentifikasi sebagai:

> Ambiguous Person / Student identity. 

---

# 19. DOMAIN 04 — ACADEMIC

Academic domain mengatur konteks pendidikan.

Core:

```text
Academic Year
Class
Teacher Responsibility
Class Placement
Learning Activity
```

Relationship utama:

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Student
```

Teacher:

```text
Person
 ↓
Teacher Responsibility
 ↓
Class
```

---

# 20. ENROLLMENT

Enrollment merupakan relationship formal:

```text
Student
   ↓
Enrollment
   ↓
School
   ↓
Academic Year
```

Enrollment menjawab:

> Apakah Student secara resmi berada dalam School pada context tertentu?

Enrollment bukan sekadar status Student.

Enrollment adalah **contextual relationship**.

Operating Model menetapkan Enrollment sebagai salah satu backbone student journey. 

---

# 21. CLASS PLACEMENT

Class Placement menjawab:

> Dalam Class mana Student ditempatkan pada context tertentu?

Model:

```text
Student
   ↓
Enrollment
   ↓
Class Placement
   ↓
Class
```

Placement berbeda dari Enrollment.

Student dapat tetap enrolled pada School tetapi mengalami perubahan placement.

Exact placement rules:

**DISCOVERY**

---

# 22. DOMAIN 05 — ATTENDANCE

Attendance merupakan operational record.

Concept:

```text
Student
+
Class / Context
+
Date / Session
+
Status
+
Recorder
```

Attendance harus memiliki context.

Attendance tidak boleh diperlakukan sebagai representasi penuh terhadap:

- engagement;
- wellbeing;
- learning;
- development.

Technical Architecture juga menempatkan Attendance sebagai contextual operational record. 

---

# 23. ATTENDANCE OWNERSHIP

Minimal conceptual information:

```text
WHO?
WHAT?
WHEN?
IN WHAT CONTEXT?
```

Dengan demikian setiap attendance dapat ditelusuri.

Modification terhadap attendance dapat memiliki audit requirement yang lebih tinggi daripada read biasa.

---

# 24. DOMAIN 06 — LEARNING

Learning merupakan core purpose domain.

Namun domain ini sengaja **tidak dikunci sebagai curriculum engine**.

Core conceptual entity:

```text
Learning Activity
```

Relationship:

```text
Class
   ↓
Learning Activity
   ↓
Student participation / observation
```

Learning dapat mencakup:

- activity;
- interaction;
- participation;
- observation;
- development;
- teacher judgment.

Operating Model secara eksplisit belum menetapkan pedagogical model final. 

---

# 25. LEARNING ACTIVITY

Learning Activity harus memiliki:

- educational purpose;
- context;
- responsible actor;
- time;
- relevant participants;
- optional relationship dengan Observation.

Tidak semua activity harus menjadi complex record.

Prinsip:

> **Capture only information that supports meaningful educational work.**

---

# 26. DOMAIN 07 — OBSERVATION

Observation merupakan salah satu domain paling penting untuk TK Pilot.

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
Possible Follow-up
```

Observation bukan:

```text
Student
 ↓
Score
```

Observation adalah contextual information.

UX Architecture juga menetapkan minimum conceptual information:

```text
Who
When
Context
Observation
Optional Evidence
Possible Follow-up
```



---

# 27. OBSERVATION

Observation harus mempertahankan:

```text
Subject
Recorder
Time
Context
Content
```

Optional:

```text
Evidence
Follow-up
```

Observation tidak otomatis berarti:

- assessment;
- diagnosis;
- score;
- judgment;
- permanent truth.

Professional interpretation tetap berada pada manusia.

---

# 28. DOMAIN 08 — DEVELOPMENT

Development merupakan domain penting dan sensitive.

Conceptual chain:

```text
Observation
      ↓
Context
      ↓
Evidence
      ↓
Interpretation
      ↓
Development Understanding
      ↓
Follow-up
```

Development bukan sekadar numeric score.

Technical Architecture secara eksplisit menetapkan model ini. 

---

# 29. DEVELOPMENT STATUS

Development masih memiliki:

**FIELD VALIDATION REQUIRED**

Yang belum ditentukan:

- exact development framework;
- indicators;
- assessment method;
- scoring;
- reporting structure;
- interpretation model.

Karena itu:

> **Jangan membuat database yang mengunci pedagogical model terlalu dini.**

---

# 30. DOMAIN 09 — RECORDS & EVIDENCE

Domain ini membedakan:

```text
CANONICAL ENTITY
        vs
OPERATIONAL RECORD
        vs
DOCUMENT
        vs
EVIDENCE
```

Contoh:

```text
Student
    ↓
Canonical Entity

Observation
    ↓
Operational Record

Photo / File / Work Sample
    ↓
Evidence
```

Operating Model secara eksplisit meminta perbedaan ini dipertahankan. 

---

# 31. EVIDENCE

Evidence mendukung suatu record atau interpretation.

Contoh:

- photo;
- work sample;
- document;
- note;
- approved media.

Evidence harus mempunyai:

```text
Purpose
Context
Owner / Steward
Access Boundary
Lifecycle
```

Tidak boleh menjadi:

> unlimited digital media dump.

---

# 32. FILE SEPARATION

Binary content tidak dianggap sebagai canonical domain data.

Model:

```text
Canonical Record
      ↓
Evidence Metadata
      ↓
Secure Object Storage
```

Technical Architecture menetapkan bahwa file/media storage harus dipisahkan dari canonical relational information. 

---

# 33. DOMAIN 10 — COMMUNICATION

Communication adalah contextual interaction.

Model:

```text
Actor
 ↓
Context
 ↓
Recipient
 ↓
Message / Request
 ↓
Response
 ↓
Outcome
```

Communication tidak otomatis berarti chat.

Possible forms:

- announcement;
- notification;
- request;
- response;
- document;
- meeting;
- formal record.

Operating Model secara eksplisit mempertahankan definisi tersebut. 

---

# 34. COMMUNICATION CONTEXT

Communication harus tetap dapat menjawab:

```text
Who sent it?
Who received it?
About what?
For whom?
In what context?
When?
What happened afterward?
```

Ini penting untuk institutional memory.

---

# 35. GUARDIAN COMMUNICATION

Guardian experience tidak boleh mengekspos internal School OS.

Model:

```text
Student
 ↓
Relevant School Information
 ↓
Guardian
 ↓
Action / Response
```

Guardian tidak perlu memahami:

- internal school structure;
- administrative workflow;
- permission model;
- technical terminology.

UX Architecture menetapkan Guardian sebagai connected participant. 

---

# 36. DOMAIN 11 — REVIEW & INSIGHT

Review bukan sekadar reporting.

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
   ↓
Action
```

Review menjawab:

> What does it mean?

Decision menjawab:

> What should we do?

Monitoring menjawab:

> What is happening?

UX Architecture secara eksplisit membedakan ketiga konsep tersebut. 

---

# 37. REVIEW

Review dapat berada pada beberapa context:

```text
Student Review
Class Review
School Review
```

Namun tidak semuanya harus menjadi separate entity.

Sebagian dapat merupakan **review activity / projection** atas canonical information.

Ini harus dipastikan dalam database design berdasarkan workflow aktual.

---

# 38. INSIGHT

Insight bukan master data.

Insight merupakan derived information.

```text
Canonical Information
        ↓
Aggregation
        ↓
Pattern
        ↓
Insight
```

Insight tidak menggantikan source records.

---

# 39. COMPLETE CANONICAL MODEL

Model konseptual saat ini:

```text
                           SCHOOL
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ACADEMIC YEAR          PEOPLE
                    │                   │
                  CLASS              PERSON
                    │             ┌─────┼──────┐
                    │             │     │      │
                    │          Teacher Staff Guardian
                    │
                    │
                 STUDENT
                    │
          ┌─────────┼──────────────┐
          │         │              │
      Enrollment  Placement    Attendance
          │         │              │
          └─────────┴──────┬───────┘
                           │
                        LEARNING
                           │
                      OBSERVATION
                           │
                 ┌─────────┴─────────┐
                 │                   │
              EVIDENCE          DEVELOPMENT
                 │                   │
                 └─────────┬─────────┘
                           │
                     COMMUNICATION
                           │
                         REVIEW
                           │
                        INSIGHT
```

Ini adalah **conceptual domain model**, bukan ERD.

---

# 40. CONTEXT MODEL

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
```

Context harus selalu cukup untuk menjawab:

```text
WHERE AM I?
WHAT AM I LOOKING AT?
WHO / WHAT DOES THIS BELONG TO?
WHAT CAN I DO HERE?
```

Model ini telah ditetapkan dalam UX Architecture. 

---

# 41. RELATIONSHIP MODEL

Relationship types:

```text
STEWARDSHIP
Yapendik → School

MEMBERSHIP
Person → School
Student → School

RESPONSIBILITY
Person → Teacher Responsibility → Class

GUARDIANSHIP
Person → Guardian Relationship → Student

ENROLLMENT
Student → Enrollment → School / Academic Year

PLACEMENT
Student → Class Placement → Class

PARTICIPATION
Student → Learning Activity

OBSERVATION
Person → Observation → Student

EVIDENCE
Evidence → Observation / Record

COMMUNICATION
Actor → Communication → Recipient

REVIEW
Authorized Actor → Review → Context
```

Meaning relationship lebih penting daripada bagaimana relationship tersebut nantinya diwujudkan dalam database.

---

# 42. INFORMATION FLOW

Validated information flow:

```text
REAL WORLD EVENT
       ↓
PEOPLE DO WORK
       ↓
CAPTURE
       ↓
CONTEXTUALIZE
       ↓
OPERATIONAL RECORD
       ↓
TRUSTED INFORMATION
       ↓
REVIEW
       ↓
DECISION
       ↓
ACTION
       ↓
OUTCOME
       ↓
LEARNING
```

Model ini berasal dari Operating Model dan EIA. 

---

# 43. CANONICAL RECORD PRINCIPLE

Setiap record penting harus memiliki:

```text
WHO
WHAT
WHEN
CONTEXT
PURPOSE
```

Untuk record sensitif, dapat ditambahkan:

```text
AUTHORITY
ACCESS
AUDIT
LIFECYCLE
```

---

# 44. DOMAIN OWNERSHIP

Logical ownership:

```text
School
    → School Domain

Person / Responsibility
    → People Domain

Student
    → Student Domain

Academic Year / Class / Placement
    → Academic Domain

Attendance
    → Attendance Domain

Learning Activity
    → Learning Domain

Observation
    → Observation Domain

Development
    → Development Domain

Evidence / Records
    → Records Domain

Communication
    → Communication Domain

Review / Insight
    → Review & Insight Domain
```

Domain ownership berarti:

> domain memiliki business meaning dan rules.

Bukan berarti domain harus menjadi service terpisah.

---

# 45. DOMAIN DEPENDENCY

Dependency utama:

```text
School
  ↓
Context
  ↓
People
  ↓
Academic
  ↓
Student
  ↓
Operational Records
  ↓
Educational Understanding
  ↓
Communication
  ↓
Review
  ↓
Insight
```

Namun hubungan tidak selalu linear dalam runtime.

---

# 46. CRITICAL DOMAIN DEPENDENCY

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

Karena itu:

> **Identity dan context harus benar sebelum database dan authorization dikunci.**



---

# 47. AUTHORIZATION BOUNDARY

Authorization tidak melekat hanya pada entity.

Authorization bergantung pada:

```text
WHO
+
ROLE
+
CONTEXT
+
RELATIONSHIP
+
ACTION
```

Contoh:

```text
Teacher
 ↓
School A
 ↓
Academic Year 2026/2027
 ↓
Class TK A
 ↓
Student B
 ↓
Record Observation
```

Bukan:

```text
Teacher = can edit all observations
```

---

# 48. STUDENT AS INFORMATION ANCHOR

Student menjadi anchor:

```text
Student
 ├── Identity
 ├── School Relationship
 ├── Enrollment
 ├── Class Placement
 ├── Attendance
 ├── Learning
 ├── Observation
 ├── Development
 ├── Evidence
 └── Communication
```

Tetapi:

> Student tidak boleh menjadi dumping ground seluruh informasi sekolah.

Setiap relationship harus mempunyai purpose.

---

# 49. WHAT IS CANONICAL

Canonical:

```text
School
Person
Student
Academic Year
Class
Enrollment
Class Placement
Attendance
Learning Activity
Observation
Development
Guardian Relationship
Teacher Responsibility
Staff Responsibility
```

---

# 50. WHAT IS CONTEXTUAL

Contextual information:

```text
Teacher responsibility
Guardian relationship
Class placement
Enrollment
Attendance
Observation
Communication
Review
```

Karena semuanya memiliki meaning berdasarkan context.

---

# 51. WHAT IS DERIVED

Derived information:

```text
Insight
Aggregated reporting
Patterns
Summaries
Dashboard projections
```

Derived information bukan source of truth.

---

# 52. WHAT IS SUPPORTING INFORMATION

Supporting information:

```text
Evidence
Documents
Media
Attachments
Notes
```

Supporting information harus tetap memiliki relationship dengan canonical atau operational record.

---

# 53. WHAT IS NOT YET CANONICAL

Hal berikut belum boleh dikunci:

```text
Curriculum Framework
Development Framework
Assessment Framework
Scoring Model
Advanced Reporting Model
Communication Channel Model
Detailed Review Model
```

Karena belum cukup field validated.

---

# 54. FIELD VALIDATION MATRIX

| Domain | Architectural Status | Field Validation |
|---|---|---|
| School | Validated baseline | Required |
| Person | Validated baseline | Required |
| Teacher Responsibility | Working | Required |
| Staff Responsibility | Working | Required |
| Guardian Relationship | Working | Required |
| Student | Critical baseline | Critical |
| Academic Year | Working | Required |
| Class | Working | Critical |
| Enrollment | Working | Critical |
| Class Placement | Working | Critical |
| Attendance | Working | Critical |
| Learning Activity | Working | Required |
| Observation | Strong conceptual baseline | Critical |
| Development | Conceptual only | Critical |
| Evidence | Conceptual baseline | Required |
| Communication | Conceptual baseline | Critical |
| Review | Conceptual baseline | Required |
| Insight | Future/derived | Later |

---

# 55. DOMAIN MATURITY

```text
School                 ████████░░
Person                 ████████░░
Student                ███████░░░
Enrollment             ███████░░░
Class                  ██████░░░░
Attendance             ██████░░░░
Learning               █████░░░░░
Observation            ███████░░░
Development            ████░░░░░░
Evidence               █████░░░░░
Communication          █████░░░░░
Review                 ████░░░░░░
Insight                ███░░░░░░░
```

Ini bukan numerical score.

Ini hanya maturity indicator untuk governance.

---

# 56. CURRENT MODEL RISKS

Risiko utama:

### 1. Person / Student ambiguity

Belum cukup field validation.

### 2. Academic Year model

Belum diketahui seberapa penting dan bagaimana implementasinya di TK nyata.

### 3. Class model

Belum diketahui apakah struktur Class benar-benar seragam.

### 4. Development model

Risiko terbesar premature modeling.

### 5. Observation model

Harus menghindari berubah menjadi assessment engine.

### 6. Communication

Berisiko berkembang menjadi chat platform yang tidak diperlukan.

### 7. Evidence

Berisiko menjadi media archive tanpa purpose.

### 8. Review

Berisiko berubah menjadi reporting bureaucracy.

---

# 57. SIMPLICITY RULE

Untuk setiap entity tanyakan:

```text
WHY DOES IT EXIST?
```

Kemudian:

```text
WHO USES IT?
```

Kemudian:

```text
WHAT WORK DOES IT SUPPORT?
```

Kemudian:

```text
WHAT DECISION DOES IT ENABLE?
```

Jika tidak ada jawaban:

> entity belum layak menjadi core model.

---

# 58. FUTURE-PROOF TEST

Model TK harus diuji terhadap:

```text
TK
 ↓
SD
 ↓
SMP
 ↓
SMA
```

Jika konsep tetap valid:

> **Common School Domain**

Jika hanya berbeda workflow:

> **Contextual variation**

Jika benar-benar berbeda educational meaning:

> **Specialized domain behavior**

Bukan membuat duplicate School OS.

---

# 59. COMMON CORE VS LOCAL CONTEXT

Model:

```text
COMMON CANONICAL MODEL
          ↓
SCHOOL CONTEXT
          ↓
LOCAL WORKFLOW
```

Prinsip:

> Standardize what must be shared; preserve autonomy where context matters.

EIA menetapkan prinsip tersebut secara eksplisit. 

---

# 60. DATABASE READINESS

Domain model sekarang **cukup matang untuk mulai Database Blueprint**, dengan syarat:

```text
Database Blueprint
        ↓
must preserve
        ↓
known uncertainty
```

Artinya database blueprint tidak boleh berpura-pura bahwa semua domain telah final.

---

# 61. WHAT DATABASE BLUEPRINT MAY LOCK

Database Blueprint boleh mulai mengunci:

```text
School identity
Person identity
Student identity
Academic context
Class context
Core relationships
Enrollment concept
Attendance concept
Observation concept
Basic authorization boundaries
Audit requirements
```

---

# 62. WHAT DATABASE BLUEPRINT SHOULD NOT LOCK TOO EARLY

Hindari premature locking untuk:

```text
Complex curriculum hierarchy
Development scoring
Advanced assessment
AI-derived data
Advanced analytics
Complex communication threads
Sophisticated workflow engine
Full HR
Full Finance
```

Ini mengikuti prinsip Product Blueprint bahwa TK Pilot bukan ERP dan bukan AI-first system. 

---

# 63. DATABASE DESIGN PRINCIPLE

Database nanti harus mengikuti:

```text
DOMAIN MEANING
      ↓
RELATIONSHIP
      ↓
INTEGRITY
      ↓
TRANSACTION
      ↓
IMPLEMENTATION
```

Bukan:

```text
TABLE
 ↓
CRUD
 ↓
MENU
```

Technical Architecture juga menetapkan bahwa API harus mengikuti domain dan use case, bukan database table semata. 

---

# 64. VALIDATED DOMAIN MODEL → DATABASE BLUEPRINT

Transisi:

```text
VALIDATED DOMAIN
        ↓
Canonical Entities
        ↓
Relationships
        ↓
Context Boundaries
        ↓
Ownership
        ↓
Lifecycle
        ↓
Integrity Rules
        ↓
DATABASE BLUEPRINT
```

Database Blueprint kemudian menjawab:

> **How should these validated concepts be represented reliably in data?**

---

# 65. GOVERNANCE RULE

Jika Database Blueprint menemukan bahwa domain model tidak cukup:

```text
DATABASE QUESTION
       ↓
DOMAIN GAP
       ↓
DOMAIN MODEL REVIEW
       ↓
DECISION
       ↓
DATABASE DESIGN
```

Bukan:

```text
Database limitation
 ↓
Force business model
```

---

# 66. CHANGE MANAGEMENT

Jika field validation menghasilkan perubahan:

```text
Finding
 ↓
Evidence
 ↓
Domain impact
 ↓
Decision
 ↓
Update Domain Model
 ↓
Review affected documents
```

Affected documents dapat meliputi:

- Data Model;
- Domain & Entity Specification;
- Workflow Specification;
- Authorization Model;
- Product Blueprint;
- Technical Architecture;
- Database Blueprint.

---

# 67. NO FROZEN CLAIM

Dokumen ini **tidak frozen**.

Bahkan setelah Database Blueprint dibuat, domain model tetap dapat berubah jika:

- school reality menunjukkan contradiction;
- pilot menemukan missing concept;
- workflow berubah;
- educational model berkembang;
- Yapendik governance berubah;
- atau evidence baru menunjukkan model terlalu kompleks.

---

# 68. DOMAIN MODEL GOVERNANCE PRINCIPLE

> **A domain model is a living representation of how the school understands its work.**

Bukan:

> daftar tabel yang tidak boleh berubah.

---

# 69. CURRENT CANONICAL MODEL — SUMMARY

Core:

```text
School
Person
Student
Academic Year
Class
```

Contextual relationships:

```text
Teacher Responsibility
Staff Responsibility
Guardian Relationship
Enrollment
Class Placement
```

Operational records:

```text
Attendance
Learning Activity
Observation
Communication
Review
```

Supporting information:

```text
Evidence
Documents
```

Derived information:

```text
Insight
Reports
Projections
```

---

# 70. CURRENT DOMAIN PRIORITY

Untuk TK Pilot:

```text
01. SCHOOL
02. PEOPLE
03. STUDENT
04. ACADEMIC
05. ATTENDANCE
06. LEARNING
07. OBSERVATION
08. DEVELOPMENT
09. EVIDENCE
10. COMMUNICATION
11. REVIEW
12. INSIGHT
```

Namun product implementation priority tetap mengikuti Product Blueprint:

```text
Foundation
 ↓
People
 ↓
Students
 ↓
Enrollment & Class
 ↓
Daily School
 ↓
Learning
 ↓
Observation
 ↓
Development
 ↓
Communication
 ↓
Review
```



---

# 71. PILOT CORE

Untuk TK Pilot, domain yang paling penting untuk membuktikan School OS adalah:

```text
School
+
People
+
Student
+
Enrollment
+
Class
+
Attendance
+
Learning
+
Observation
+
Development
```

Kemudian:

```text
Evidence
+
Communication
+
Review
```

Dan:

```text
Insight
```

berada setelah operational information cukup trustworthy.

---

# 72. NORTH STAR DATA LOOP

```text
STUDENT
   ↓
CONTEXT
   ↓
DAILY WORK
   ↓
OBSERVATION
   ↓
EVIDENCE
   ↓
UNDERSTANDING
   ↓
FOLLOW-UP
   ↓
COMMUNICATION
   ↓
REVIEW
   ↓
IMPROVEMENT
```

Ini merupakan domain expression dari constitutional operating loop.

---

# 73. FINAL ARCHITECTURAL TEST

Domain model ini dianggap sehat jika:

```text
Can we explain every entity?
        ↓
Can we explain why it exists?
        ↓
Can we explain who owns it?
        ↓
Can we explain its context?
        ↓
Can we explain its relationship?
        ↓
Can we explain what workflow uses it?
        ↓
Can we explain what decision it supports?
```

Jika tidak:

> **Do not add another layer of technical complexity.**

Kembali ke domain discovery.

---

# 74. NEXT DOCUMENT

Dengan adanya dokumen ini, kita sekarang memiliki:

```text
CONSTITUTION
        ↓
EIA
        ↓
OPERATING MODEL
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
DOMAIN & ENTITY SPECIFICATION
        ↓
REALITY VALIDATION
        ↓
★ VALIDATED DOMAIN MODEL ★
```

**Next:**

# `YAPENDIK SCHOOL OS TK PILOT DATABASE BLUEPRINT`

Dokumen berikutnya bukan lagi membahas **"entity apa yang kita punya?"**

Itu sudah dijawab di sini.

Database Blueprint akan menjawab:

> **Bagaimana canonical domain tersebut direpresentasikan sebagai data yang reliable, secure, auditable, dan tetap sederhana?**

Dan kita akan menjaga satu aturan penting: **database tidak boleh memaksa domain menjadi lebih kompleks daripada realitas sekolah yang ingin kita layani.** 