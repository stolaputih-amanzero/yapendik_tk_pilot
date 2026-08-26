# YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE

Version: 0.1  
Organization: Yayasan Pendidikan GPIB (Yapendik)  
System: Yapendik Operating System  
Product: School OS  
Pilot Context: TK / Early Childhood Education  
Document Type: Technical Architecture  
Status: LIVING — DISCOVERY  
Derived From:
- YAPENDIK OPERATING SYSTEM CONSTITUTION
- YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
- YAPENDIK SCHOOL OS OPERATING MODEL
- YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT
- YAPENDIK SCHOOL OS UX ARCHITECTURE

Approach: Common Sense First  
Architecture Principle: Make It Simple. Keep It Future-Proof.

---

# 1. PURPOSE

YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE mendefinisikan bagaimana Product Blueprint dan UX Architecture diterjemahkan menjadi sistem teknologi yang:

- reliable;
- secure;
- maintainable;
- understandable;
- scalable secara proporsional;
- dan dapat berkembang bersama Yapendik.

Technical Architecture menjawab:

> How does the School OS actually work?

Dokumen ini bukan:

- final implementation plan;
- final database schema;
- final API specification;
- final cloud infrastructure specification;
- final technology vendor decision;
- atau deployment runbook.

Architecture ini adalah **technical direction and boundary**.

---

# 2. ARCHITECTURAL NORTH STAR

Technology harus memperkuat:

PEOPLE
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
↓
LEARNING

Bukan:

TECHNOLOGY
↓
FEATURE
↓
USER HARUS MENYESUAIKAN DIRI

Constitution secara eksplisit menempatkan technology sebagai pendukung operating loop, bukan tujuan dari loop tersebut. 

---

# 3. FUNDAMENTAL ARCHITECTURAL PRINCIPLE

School OS harus dibangun sebagai:

> A context-aware, secure, information-centered school operating platform.

Tiga karakter utamanya:

```text
CONTEXT-AWARE
       +
INFORMATION-CENTERED
       +
SECURE BY ARCHITECTURE
```

---

# 4. ARCHITECTURAL CHAIN

Technical Architecture harus dapat ditelusuri ke layer sebelumnya:

```text
CONSTITUTION
     ↓
INFORMATION ARCHITECTURE
     ↓
OPERATING MODEL
     ↓
PRODUCT CAPABILITY
     ↓
UX WORKFLOW
     ↓
TECHNICAL DOMAIN
     ↓
APPLICATION
     ↓
DATA
     ↓
INFRASTRUCTURE
```

Tidak boleh ada major technical component yang tidak memiliki alasan pada layer di atasnya.

---

# 5. ARCHITECTURAL PRINCIPLES

## 5.1 Simplicity First

Pilih architecture paling sederhana yang mampu memenuhi kebutuhan nyata.

---

## 5.2 Modular Monolith First

Untuk TK Pilot, default architecture adalah:

> **Modular Monolith**

Bukan microservices.

Alasan:

- product masih discovery;
- domain belum sepenuhnya stabil;
- team size kemungkinan kecil;
- operational complexity microservices belum justified;
- deployment lebih sederhana;
- transaction boundary lebih mudah dipahami.

Microservices dapat dipertimbangkan jika evidence benar-benar menunjukkan kebutuhan.

---

# 6. MODULARITY WITHOUT DISTRIBUTION

Modular bukan berarti distributed.

Conceptual:

```text
                    SCHOOL OS
                        │
              ┌─────────┼─────────┐
              │         │         │
           PEOPLE     STUDENT   SCHOOL
              │         │         │
              ├────┐    ├────┐    │
              │    │    │    │    │
           CLASS  ... ATTENDANCE ...
```

Semua dapat berada dalam satu deployable application.

Namun boundary domain harus jelas.

---

# 7. APPLICATION ARCHITECTURE

Initial application structure:

```text
Presentation
     ↓
Application
     ↓
Domain
     ↓
Data / Infrastructure
```

Conceptually:

```text
UI / Experience
      ↓
Use Cases
      ↓
Domain Rules
      ↓
Persistence / External Services
```

Business rules tidak boleh bergantung langsung pada UI.

---

# 8. PRESENTATION LAYER

Presentation layer bertanggung jawab atas:

- rendering;
- interaction;
- form handling;
- navigation;
- loading;
- error states;
- responsive experience.

Presentation layer tidak menjadi source of truth untuk:

- authorization;
- business rules;
- context access;
- data integrity.

---

# 9. APPLICATION LAYER

Application layer menerjemahkan user intent menjadi use case.

Contoh:

```text
Record Attendance
Record Observation
Enroll Student
Assign Student to Class
Review Student
Send Communication
```

Application layer mengatur:

- input;
- context;
- authorization intent;
- orchestration;
- transaction;
- outcome.

---

# 10. DOMAIN LAYER

Domain layer menyimpan business meaning.

Contoh domain concepts:

```text
School
Person
Student
Guardian
Teacher
Class
Academic Year
Enrollment
Attendance
Observation
Development
Communication
```

Domain logic harus tidak bergantung pada:

- React;
- browser;
- database driver;
- HTTP;
- cloud provider.

---

# 11. INFRASTRUCTURE LAYER

Infrastructure menangani:

- database;
- file storage;
- email / messaging;
- authentication provider;
- external integrations;
- telemetry;
- scheduled jobs.

Infrastructure adalah implementation detail terhadap domain.

---

# 12. DOMAIN BOUNDARIES

Initial domain organization:

```text
school
people
students
academic
attendance
learning
development
communication
records
insight
```

Namun domain boundaries masih **working architecture**.

Tidak boleh dipaksakan menjadi banyak independent services.

---

# 13. SCHOOL DOMAIN

Responsible for:

- School identity;
- school profile;
- academic context;
- basic organizational structure.

Core concepts:

School
Academic Year
Class

---

# 14. PEOPLE DOMAIN

Responsible for canonical Person identity dan relationships.

Conceptual:

```text
Person
├── Teacher
├── Staff
├── Guardian
└── Student
```

Role tidak boleh secara otomatis berarti Person adalah jenis entity yang berbeda.

---

# 15. STUDENT DOMAIN

Student adalah canonical educational entity.

Student menjadi anchor untuk:

- enrollment;
- class placement;
- attendance;
- learning;
- observation;
- development;
- evidence;
- relevant communication.

---

# 16. ACADEMIC DOMAIN

Academic domain mengatur:

- Academic Year;
- Class;
- teacher assignment;
- student placement.

Exact academic model masih membutuhkan discovery.

---

# 17. ATTENDANCE DOMAIN

Attendance merupakan operational record.

Conceptual:

```text
Student
+
Class
+
Date / Session
+
Attendance Status
+
Recorder
```

Attendance tidak boleh dipandang sebagai keseluruhan student engagement.

Constitution menegaskan bahwa data seperti attendance hanya merepresentasikan sebagian realitas manusia dan harus tetap memiliki context. 

---

# 18. LEARNING DOMAIN

Learning domain mendukung:

- learning activity;
- participation;
- educational context;
- relevant records.

Technical model tidak boleh memaksakan pedagogical model sebelum divalidasi.

---

# 19. DEVELOPMENT DOMAIN

Development merupakan domain penting dan lebih sensitive.

Conceptual flow:

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

System tidak boleh mengubah development menjadi sekadar numeric score.

---

# 20. OBSERVATION MODEL

Observation harus mempertahankan:

- subject;
- recorder;
- time;
- context;
- observation content;
- optional evidence;
- optional follow-up.

Minimum conceptual audit:

WHO
WHAT
WHEN
IN WHAT CONTEXT

---

# 21. RECORDS DOMAIN

Records menyimpan institutional information yang memiliki lifecycle.

Setiap record harus memiliki:

- owner / steward;
- context;
- purpose;
- access boundary;
- lifecycle.

---

# 22. COMMUNICATION DOMAIN

Communication menangani contextual communication.

Conceptual:

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

Communication tidak langsung berarti membangun general-purpose chat platform.

---

# 23. INSIGHT DOMAIN

Insight dibangun dari operational information.

Urutan:

```text
Information
↓
Aggregation
↓
Pattern
↓
Insight
↓
Decision
```

AI bukan prerequisite.

Advanced intelligence berada di future layer.

---

# 24. CANONICAL IDENTITY

Setiap canonical entity harus memiliki stable identity.

Contoh:

School
Person
Student
Class

Identity harus tetap stabil walaupun:

- nama berubah;
- class berubah;
- academic year berubah;
- relationship berubah.

---

# 25. PERSON IDENTITY

Person harus menjadi canonical identity apabila seseorang memiliki banyak roles atau relationships.

Contoh:

```text
Person A
├── Teacher
├── Guardian
└── Other relationship
```

Jangan membuat duplicate person hanya karena context berbeda.

---

# 26. STUDENT IDENTITY

Student memiliki identity yang berbeda dari Enrollment.

```text
Student
    ↓
Enrollment
    ↓
Academic Year
    ↓
Class
```

Student tidak dibuat ulang setiap tahun ajaran.

---

# 27. CONTEXT RESOLUTION

Context adalah architectural concern.

System harus dapat menentukan:

```text
WHO
↓
HAS WHAT ROLE
↓
IN WHICH SCHOOL
↓
IN WHICH ACADEMIC YEAR
↓
IN WHICH CLASS
↓
CAN ACCESS WHAT
```

Context tidak boleh hanya disimpan di client.

---

# 28. AUTHENTICATION

Authentication menjawab:

> Who are you?

Authentication dapat menggunakan external identity provider.

Technology provider belum difinalkan pada tahap ini.

Potential providers dapat dipilih kemudian berdasarkan:

- usability;
- security;
- cost;
- organizational fit;
- future integration.

---

# 29. AUTHORIZATION

Authorization menjawab:

> What are you allowed to do?

Authorization harus server-enforced.

Client-side hiding bukan security boundary.

Constitution menetapkan security architecture minimal:

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



---

# 30. AUTHORIZATION MODEL

Initial conceptual model:

```text
IDENTITY
    ↓
ROLE / RESPONSIBILITY
    ↓
CONTEXT
    ↓
ACTION
    ↓
RESOURCE
```

Contoh:

Teacher
↓
Assigned Class
↓
Student
↓
Record Observation

Bukan:

Teacher
↓
All Students
↓
Write Access

---

# 31. ROLE VS RESPONSIBILITY

Role dan responsibility tidak harus identik.

Seseorang dapat memiliki:

```text
Person
+
Responsibility
+
Context
```

Hal ini menjaga flexibility ketika seseorang memiliki lebih dari satu responsibility.

---

# 32. DATABASE AUTHORIZATION

Authorization harus memiliki enforcement di persistence layer apabila technology stack mendukungnya.

Database access tidak boleh bergantung hanya pada frontend filtering.

---

# 33. DATA ARCHITECTURE

Data architecture harus mengikuti EIA, bukan sebaliknya.

Conceptual:

```text
Canonical Entities
        ↓
Relationships
        ↓
Operational Records
        ↓
Evidence
        ↓
Projections
```

EIA memang secara eksplisit membedakan dirinya dari physical database schema dan menunda keputusan seperti primary keys, UUID strategy, dan RLS ke technical layer. 

---

# 34. DATABASE PRINCIPLE

Default:

> **One canonical source of truth for each important entity.**

Duplicate projections boleh ada.

Duplicate canonical identity tidak boleh dibuat tanpa alasan.

---

# 35. TRANSACTION MODEL

Significant operations harus atomic jika secara business meaning memang satu transaction.

Contoh:

Enroll Student

harus menghasilkan consistent state.

Jika transaction gagal:

System tidak boleh meninggalkan partial state yang membingungkan.

---

# 36. DATA INTEGRITY

Integrity harus dijaga di beberapa level:

Application
+
Database
+
Authorization
+
Validation

Jangan mengandalkan satu layer saja.

---

# 37. DATA LIFECYCLE

Information harus memiliki lifecycle:

Create
↓
Use
↓
Update
↓
Archive
↓
Retention / Deletion

Lifecycle detail akan ditentukan berdasarkan jenis data dan governance requirement.

---

# 38. CHILD DATA PROTECTION

Student information merupakan high-trust information.

Architecture harus memberikan perhatian khusus terhadap:

- identity;
- guardian information;
- observation;
- development;
- evidence;
- communication.

Principle:

> Collect less. Protect well. Use purposefully.

---

# 39. FILE / MEDIA STORAGE

Evidence atau document yang membutuhkan binary storage harus dipisahkan dari canonical relational information.

Conceptual:

```text
Canonical Record
      ↓
Metadata
      ↓
Secure Object Storage
```

File URL tidak boleh otomatis berarti public access.

---

# 40. API ARCHITECTURE

API harus mengikuti domain dan use case.

Jangan membuat API berdasarkan database table semata.

Prefer:

```text
POST /attendance/record
```

daripada architecture yang hanya merefleksikan raw CRUD tanpa business meaning.

Exact API style masih TBD.

---

# 41. SERVER-OWNED BUSINESS LOGIC

Business-critical operations harus diproses di trusted server boundary.

Contoh:

- enrollment;
- class placement;
- attendance;
- observation;
- sensitive communication;
- authorization-sensitive actions.

---

# 42. IDEMPOTENCY

Operations yang berpotensi dikirim ulang harus mempertimbangkan idempotency.

Contoh:

Record Attendance

Jika request dikirim dua kali karena network issue, system tidak boleh menghasilkan duplicate logical attendance record.

Exact implementation TBD.

---

# 43. AUDITABILITY

Significant actions harus dapat ditelusuri.

Minimum:

WHO
WHAT
WHEN
CONTEXT

Potential additional:

WHY
BEFORE
AFTER

Audit depth harus proportional terhadap risk.

---

# 44. AUDIT EVENTS

Candidate audit events:

- enrollment;
- class placement;
- attendance modification;
- observation creation / modification;
- sensitive data access;
- authorization-sensitive changes;
- important communication;
- administrative changes.

Tidak semua read operation harus diaudit dengan level yang sama.

---

# 45. OBSERVABILITY

System harus dapat menjawab:

Is it working?

Where is it failing?

Who is affected?

What happened?

Minimal observability:

- application errors;
- request failures;
- performance;
- authentication failures;
- important transaction failures;
- background job failures.

---

# 46. LOGGING

Logs harus:

- structured;
- searchable;
- contextual;
- privacy-aware.

Jangan memasukkan sensitive student information ke log secara sembarangan.

---

# 47. ERROR ARCHITECTURE

Error harus memiliki distinction:

USER ERROR
↓
VALIDATION ERROR
↓
AUTHORIZATION ERROR
↓
BUSINESS ERROR
↓
SYSTEM ERROR
↓
EXTERNAL SERVICE ERROR

User-facing error tidak boleh mengekspos internal implementation details.

---

# 48. NOTIFICATION ARCHITECTURE

Notification dipisahkan dari core business transaction.

Conceptual:

```text
Business Event
      ↓
Notification Decision
      ↓
Channel
      ↓
Recipient
```

Channel dapat berkembang:

- in-app;
- email;
- messaging;
- push.

Tidak semua channel dibangun pada MVP.

---

# 49. EVENT MODEL

Event dapat digunakan untuk decoupling internal capabilities apabila diperlukan.

Contoh:

Student Enrolled
↓
Notification
↓
Reporting Projection

Namun event-driven architecture tidak boleh dipaksakan di seluruh system.

---

# 50. ASYNCHRONOUS PROCESSING

Gunakan asynchronous processing jika:

- pekerjaan tidak harus selesai sebelum user mendapat response;
- pekerjaan berat;
- external integration;
- notification;
- reporting;
- media processing.

Simple CRUD tidak perlu dipaksa menjadi asynchronous.

---

# 51. CACHING

Caching digunakan jika evidence menunjukkan kebutuhan.

Jangan memperkenalkan distributed caching terlalu dini.

Primary principle:

> Correctness before cleverness.

---

# 52. SEARCH ARCHITECTURE

MVP:

Context-aware relational search.

Future:

Dedicated search engine hanya jika scale atau usability benar-benar memerlukannya.

Search tidak boleh menjadi substitute untuk bad information architecture. Prinsip ini juga ditetapkan dalam UX Architecture. 

---

# 53. REPORTING ARCHITECTURE

Reporting adalah projection dari canonical information.

```text
Canonical Data
↓
Query / Projection
↓
Report
```

Jangan membuat reporting database sebagai source of truth tanpa alasan kuat.

---

# 54. DASHBOARD ARCHITECTURE

Dashboard adalah read-oriented projection.

```text
Operational Information
↓
Relevant Projection
↓
Dashboard
```

Dashboard tidak menjadi domain source of truth.

---

# 55. INTEGRATION ARCHITECTURE

Yapendik OS harus integration-ready tetapi tidak integration-heavy.

Potential integrations:

- identity;
- communication;
- payments;
- government;
- reporting;
- public website;
- future Foundation OS.

Constitution menetapkan:

> Integration is justified by need, not by ambition.



---

# 56. PUBLIC EXPERIENCE BOUNDARY

Existing Yapendik website tetap menjadi public information layer.

School OS tidak boleh expose operational database secara langsung ke public website.

Pattern:

```text
School OS
    ↓
Governed Projection
    ↓
Public Experience
```

---

# 57. FOUNDATION OS BOUNDARY

Future Foundation OS tidak boleh langsung membaca internal operational tables tanpa governed boundary.

Potential future architecture:

```text
School OS
    ↓
Governed Institutional Data
    ↓
Foundation OS
```

---

# 58. MULTI-SCHOOL ARCHITECTURE

School OS harus sejak awal mampu membedakan School context.

Namun kita tidak perlu membangun complex multi-tenant infrastructure sebelum diperlukan.

Initial principle:

```text
Shared Product Architecture
        +
Strong School Context Boundary
        +
Future Multi-School Capability
```

---

# 59. SCHOOL AUTONOMY

Architecture harus memungkinkan:

Shared Canonical Concepts
↓
Shared Governance
↓
School Context
↓
Local Workflow

Tidak semua school harus bekerja identik.

EIA secara eksplisit menetapkan prinsip:

> Standardize what must be shared; preserve autonomy where context matters.



---

# 60. CONFIGURATION VS CUSTOMIZATION

Prefer configuration daripada code fork.

Contoh:

School-specific:

- terminology;
- class configuration;
- workflow variation;
- communication preference.

Tetapi core business semantics tetap canonical.

---

# 61. DEPLOYMENT ARCHITECTURE

Initial preference:

```text
Single Application
       ↓
Managed Database
       ↓
Managed Storage
       ↓
Managed Infrastructure
```

Exact cloud/provider belum diputuskan.

---

# 62. ENVIRONMENT MODEL

Minimum:

Development
Staging
Production

Production data tidak digunakan sembarangan dalam development.

---

# 63. CI/CD

Deployment harus eventually memiliki:

- automated checks;
- build;
- test;
- migration validation;
- deployment;
- rollback capability.

Exact CI/CD provider TBD.

---

# 64. DATABASE MIGRATION

Database changes harus versioned.

Migration harus:

- reproducible;
- reviewable;
- reversible where practical;
- tested before production.

---

# 65. BACKUP & RECOVERY

Production information harus memiliki:

- backup;
- recovery procedure;
- retention policy;
- recovery testing.

Backup tanpa recovery test bukan sufficient assurance.

---

# 66. SECURITY MODEL

Security layers:

```text
Identity
↓
Authentication
↓
Authorization
↓
Context Validation
↓
Application Enforcement
↓
Database Enforcement
↓
Auditability
↓
Monitoring
```

Security by architecture, bukan security sebagai checklist terakhir.

---

# 67. SECRETS

Secrets tidak boleh berada dalam:

- source code;
- client bundle;
- public repository;
- logs.

Gunakan managed secret/configuration mechanism sesuai infrastructure.

---

# 68. DATA ENCRYPTION

Sensitive information harus protected:

At Rest
+
In Transit

Exact encryption implementation mengikuti platform capability dan risk assessment.

---

# 69. PRIVACY BY DESIGN

Architecture harus meminimalkan:

- unnecessary collection;
- unnecessary retention;
- unnecessary access;
- unnecessary exposure.

---

# 70. ACCESS CONTROL TESTING

Authorization harus diuji bukan hanya:

"Can authorized user access?"

tetapi juga:

"Can unauthorized user NOT access?"

Negative authorization tests menjadi bagian dari architecture quality.

---

# 71. PERFORMANCE PRINCIPLE

Performance target harus mengikuti real workflow.

Prioritas:

1. Teacher daily action;
2. Student context;
3. Class context;
4. common administration tasks.

Tidak perlu premature optimization.

---

# 72. RELIABILITY PRINCIPLE

System harus lebih memilih:

correct failure

daripada:

silent corruption.

Jika system tidak yakin transaction berhasil:

> User harus mengetahui statusnya.

---

# 73. CONNECTIVITY

Connectivity resilience adalah concern yang perlu dievaluasi.

Namun:

> Offline-first bukan automatic MVP requirement.

EIA secara eksplisit menempatkan offline architecture sebagai hal yang belum diputuskan. 

Jika field evidence menunjukkan kebutuhan kuat, architecture dapat berkembang ke:

```text
Local State
↓
Pending Operations
↓
Synchronization
↓
Conflict Handling
```

---

# 74. OFFLINE DECISION PRINCIPLE

Jangan membangun offline synchronization engine hanya karena:

"Future-proof."

Bangun jika:

- connectivity reality membutuhkannya;
- workflow cocok;
- consistency model dapat dijelaskan;
- operational complexity justified.

---

# 75. API / DATA CONTRACT VERSIONING

Public atau cross-system contracts harus dapat evolve tanpa breaking consumers secara sembarangan.

Internal module contracts boleh lebih fleksibel selama application boundary masih controlled.

---

# 76. BACKWARD COMPATIBILITY

Prioritas compatibility:

1. Critical institutional data;
2. External integrations;
3. Existing public projections;
4. Internal UI.

Tidak semua internal implementation harus dipertahankan selamanya.

---

# 77. TESTING ARCHITECTURE

Testing pyramid:

```text
Unit Tests
    ↓
Domain / Application Tests
    ↓
Integration Tests
    ↓
Authorization Tests
    ↓
End-to-End Tests
    ↓
Real Pilot Validation
```

Semua layer memiliki tujuan berbeda.

---

# 78. DOMAIN TESTING

Domain tests harus membuktikan business rules.

Contoh:

Student cannot be enrolled twice in conflicting state.

Unauthorized actor cannot modify observation.

Attendance belongs to correct context.

---

# 79. INTEGRATION TESTING

Integration tests memastikan:

Application
+
Database
+
Authorization
+
External dependency

bekerja sebagaimana expected.

---

# 80. END-TO-END TESTING

E2E harus mengikuti real user journeys.

Contoh:

Teacher
↓
Class
↓
Attendance
↓
Student
↓
Observation
↓
Save
↓
Review

Bukan hanya:

"Button works."

---

# 81. ARCHITECTURE QUALITY TEST

Technical Architecture dianggap sehat jika:

- context tidak mudah bocor;
- canonical identity terjaga;
- authorization enforced;
- business rules tidak berada di UI;
- database integrity kuat;
- major workflows observable;
- errors understandable;
- deployment manageable;
- future change tidak membutuhkan rewrite besar.

---

# 82. TECHNOLOGY SELECTION PRINCIPLE

Technology dipilih berdasarkan:

Purpose
People
Workflow
Information
Context
Trust
Simplicity
Future

Ini adalah constitutional test. 

Bukan berdasarkan:

- popularity;
- hype;
- "best stack";
- jumlah stars;
- atau karena teknologi tersebut sedang trend.

---

# 83. INITIAL TECHNOLOGY DIRECTION

Untuk saat ini kita menetapkan **architecture direction**, bukan final vendor lock-in.

Potential baseline:

Frontend:
Web-based responsive application

Application:
Modular monolith

Backend:
Server-side application / API boundary

Database:
Relational database

Storage:
Object storage where required

Authentication:
Managed identity provider

Deployment:
Managed cloud platform

Observability:
Managed monitoring / error tracking

Exact technologies akan diputuskan pada implementation architecture / ADR setelah kebutuhan TK lebih tervalidasi.

---

# 84. WHY RELATIONAL DATA

School OS memiliki relationships yang kuat:

School
↓
Academic Year
↓
Class
↓
Student
↓
Enrollment
↓
Attendance
↓
Observation
↓
Development

Relational model secara natural cocok untuk menjaga:

- referential integrity;
- transactional consistency;
- relationships;
- reporting.

NoSQL tidak dilarang, tetapi tidak menjadi default tanpa reason.

---

# 85. WHY NOT MICROSERVICES NOW

Microservices menambah:

- network boundaries;
- deployment complexity;
- distributed transactions;
- observability requirements;
- operational overhead.

Belum ada evidence bahwa TK Pilot membutuhkan itu.

Prefer:

> **Modular monolith with clear domain boundaries.**

---

# 86. WHY NOT AI-FIRST

AI dapat membantu di masa depan.

Tetapi AI membutuhkan:

- trustworthy data;
- clear context;
- governance;
- meaningful workflows;
- evidence.

Urutan:

```text
Good Operational Information
↓
Reliable Context
↓
Good Records
↓
Insight
↓
AI Assistance
```

Bukan:

```text
AI
↓
Cari masalah yang bisa diselesaikan
```

---

# 87. ARCHITECTURAL DEPENDENCIES

Critical dependencies:

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

Jika canonical identity atau context salah, banyak layer di atasnya ikut bermasalah.

---

# 88. CRITICAL TECHNICAL RISKS

Initial risks:

1. Ambiguous school context.
2. Ambiguous Person / Student identity.
3. Incomplete authorization model.
4. Premature pedagogical data model.
5. Over-engineering.
6. Excessive dependency on external services.
7. Duplicate information.
8. Insufficient auditability.
9. Poor data migration strategy.
10. Building before field validation.

---

# 89. ARCHITECTURAL ASSUMPTIONS

Current assumptions:

- relational data model is appropriate;
- modular monolith is appropriate for MVP;
- managed infrastructure is preferable;
- server-enforced authorization is mandatory;
- Student is canonical educational entity;
- School is primary operational context;
- Class is important Teacher context;
- mobile experience is important;
- offline-first is not yet mandatory.

These are working assumptions, not immutable decisions.

---

# 90. OPEN TECHNICAL QUESTIONS

1. Exact authentication provider?
2. Exact frontend framework?
3. Exact backend architecture?
4. Exact database provider?
5. Exact object storage?
6. Exact hosting platform?
7. Exact authorization implementation?
8. Exact tenancy strategy?
9. Exact UUID / ID strategy?
10. Exact audit implementation?
11. Exact notification infrastructure?
12. Exact offline strategy?
13. Exact search implementation?
14. Exact observability platform?
15. Exact CI/CD platform?

Tidak perlu semuanya dijawab sekarang.

---

# 91. TECHNICAL DECISION PRIORITY

Decision harus mengikuti dependency.

Urutan:

```text
1. Identity
2. Context
3. Authorization
4. Domain boundaries
5. Data model
6. Application architecture
7. API contracts
8. Infrastructure
9. Observability
10. Optimization
```

Jangan memilih infrastructure detail sebelum domain dan security boundary cukup jelas.

---

# 92. ADR REQUIREMENT

Major technical decisions yang sulit dibalik harus dicatat melalui ADR.

Contoh:

- authentication provider;
- database platform;
- tenancy strategy;
- offline architecture;
- major integration architecture;
- deployment model.

Ini mengikuti Reversibility Principle Constitution. 

---

# 93. TECHNICAL GOVERNANCE

Hierarchy:

```text
YAPENDIK OS CONSTITUTION
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
ADR
          ↓
IMPLEMENTATION
```

Implementation tidak boleh secara diam-diam mengubah architectural decision.

Jika implementation menemukan masalah fundamental:

> Architecture harus ditinjau.

---

# 94. ARCHITECTURE EVOLUTION

Model:

```text
ASSUMPTION
    ↓
DECISION
    ↓
ARCHITECTURE
    ↓
IMPLEMENTATION
    ↓
REAL USAGE
    ↓
EVIDENCE
    ↓
LEARNING
    ↓
ARCHITECTURE EVOLUTION
```

Architecture harus:

> **Stable in fundamentals, adaptable in implementation.**

Ini merupakan prinsip eksplisit Constitution. 

---

# 95. WHAT WE DELIBERATELY DO NOT BUILD YET

Tidak ada keputusan untuk membangun sekarang:

- microservices;
- Kubernetes;
- event mesh;
- distributed cache;
- dedicated search cluster;
- AI platform;
- data warehouse;
- complex data lake;
- offline-first synchronization engine;
- advanced BI;
- multi-region infrastructure;
- elaborate service mesh.

Semua dapat dipertimbangkan jika evidence membenarkannya.

---

# 96. TK PILOT TECHNICAL BOUNDARY

Initial technical scope:

```text
School
People
Student
Academic Year
Class
Enrollment
Attendance
Learning
Observation
Development
Basic Evidence
Basic Communication
Basic Review
```

Infrastructure harus cukup untuk menjalankan capability tersebut.

Tidak perlu membangun Foundation OS infrastructure sekaligus.

---

# 97. FUTURE EXPANSION

Architecture harus dapat berkembang:

```text
                 YAPENDIK OS
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    SCHOOL OS    FOUNDATION OS   PUBLIC EXPERIENCE
        │
        ├── TK
        ├── SD
        ├── SMP
        └── Other Schools
```

School OS adalah Phase 1, bukan keseluruhan Yapendik OS.

---

# 98. ARCHITECTURAL SUCCESS

Technical Architecture berhasil jika:

> A small team can understand it.

> A new developer can navigate it.

> A school workflow can be traced through it.

> A security boundary can be explained.

> A future change does not require unnecessary rewrite.

> And the architecture does not become more complicated than the problem it solves.

---

# 99. NEXT DOCUMENT

Setelah Technical Architecture ini, kita belum langsung membuat seluruh production codebase.

Next document:

# YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT

Dokumen tersebut akan menerjemahkan:

```text
PRODUCT
+
UX
+
TECHNICAL ARCHITECTURE
        ↓
IMPLEMENTATION
```

Menjadi:

- implementation phases;
- milestones;
- domain build order;
- database implementation sequence;
- core workflows;
- testing gates;
- pilot readiness;
- deployment;
- validation;
- feedback loop.

---

# 100. COMPLETE ARCHITECTURAL CHAIN

```text
YAPENDIK OS CONSTITUTION
             ↓
YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
             ↓
YAPENDIK SCHOOL OS OPERATING MODEL
             ↓
YAPENDIK SCHOOL OS PRODUCT BLUEPRINT
             ↓
YAPENDIK SCHOOL OS UX ARCHITECTURE
             ↓
YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE
             ↓
TK PILOT IMPLEMENTATION BLUEPRINT
             ↓
BUILD
             ↓
REAL SCHOOL
             ↓
EVIDENCE
             ↓
LEARNING
             ↓
ARCHITECTURE EVOLUTION
```

---

# 101. STATUS

**YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE**

**Version:** 0.1

**Status:** LIVING — DISCOVERY

**Authority:** Derived from Yapendik OS Constitution

**Scope:** School OS / TK Pilot

**Architecture Philosophy:**

> **Make It Simple. Keep It Future-Proof.**

**Primary Architectural Decision:**

> **Start with a secure, context-aware modular monolith and preserve clear domain boundaries, rather than introducing distributed-system complexity before evidence requires it.**

**Primary Governance Principle:**

> **Technology must serve the work of the school.**

**Next Layer:**

> **YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT**

---

# CLOSING PRINCIPLE

> **We do not build technology because technology is available.**
>
> **We build the minimum reliable technical foundation required to make meaningful school work better.**
>
> **We keep the architecture simple enough to understand, strong enough to trust, and open enough to evolve.**

**The architecture serves the school.  
The school does not serve the architecture.**