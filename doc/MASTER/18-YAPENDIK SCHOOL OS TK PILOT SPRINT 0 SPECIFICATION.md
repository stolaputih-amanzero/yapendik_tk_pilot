# YAPENDIK SCHOOL OS TK PILOT SPRINT 0 SPECIFICATION

**Version:** 0.1  
**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System  
**Product:** School OS  
**Pilot:** TK / Early Childhood Education  
**Document Type:** Sprint Specification  
**Status:** **LIVING — ACTIVE IMPLEMENTATION**  
**Derived From:**  
- YAPENDIK OPERATING SYSTEM CONSTITUTION
- YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
- YAPENDIK SCHOOL OS OPERATING MODEL
- YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT
- YAPENDIK SCHOOL OS UX ARCHITECTURE
- YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE
- YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION SPECIFICATION

**Approach:** Common Sense First  
**Architecture Philosophy:** Make It Simple. Keep It Future-Proof.

---

# 1. PURPOSE

Sprint 0 adalah **technical foundation sprint** sebelum kita membangun business workflow pertama.

Sprint 0 tidak bertujuan menghasilkan School OS yang sudah dapat digunakan oleh sekolah.

Sprint 0 bertujuan menghasilkan:

> **sebuah application foundation yang sehat, dapat dijalankan, dapat diuji, aman secara dasar, dan siap menjadi tempat vertical slice pertama dibangun.**

Dengan kata lain:

```text
ARCHITECTURE
      ↓
SPRINT 0
      ↓
WORKING TECHNICAL FOUNDATION
      ↓
SPRINT 1+
      ↓
REAL SCHOOL WORK
```

---

# 2. WHY SPRINT 0 EXISTS

Kita tidak ingin memulai development dengan kondisi:

```text
UI
 ↓
random API
 ↓
random database
 ↓
business logic
 ↓
security belakangan
```

Kita ingin:

```text
Identity
   ↓
Context
   ↓
Authorization
   ↓
Application
   ↓
Domain
   ↓
Data
   ↓
Infrastructure
```

sudah memiliki bentuk dasar sebelum workflow sekolah pertama dibangun.

---

# 3. SPRINT 0 NORTH STAR

Sprint 0 berhasil jika seorang developer baru dapat:

1. menjalankan project;
2. memahami struktur project;
3. terhubung ke database;
4. melakukan migration;
5. melakukan authentication;
6. mengetahui identity user;
7. mengetahui school context;
8. melewati authorization boundary;
9. menjalankan test;
10. melakukan deployment ke environment non-production.

Dan yang paling penting:

> **Tidak ada business feature besar yang diperlukan untuk menyatakan Sprint 0 berhasil.**

---

# 4. SPRINT 0 BOUNDARY

Sprint 0 mencakup:

```text
Project
Environment
Application Shell
Authentication
Identity
School Context Foundation
Authorization Foundation
Database Foundation
Migration
Testing
Logging
Error Handling
Deployment Foundation
Documentation
```

Sprint 0 tidak mencakup:

```text
Student Management
Attendance
Observation
Learning
Guardian Portal
Dashboard
Reporting
Complex Communication
```

---

# 5. SPRINT 0 PRINCIPLE

### Rule 01

> **Foundation before feature.**

### Rule 02

> **Security before convenience.**

### Rule 03

> **Correctness before cleverness.**

### Rule 04

> **Simple implementation before abstraction.**

### Rule 05

> **No hypothetical infrastructure.**

### Rule 06

> **Every important architectural decision must be explainable.**

---

# 6. EXPECTED OUTPUT

Pada akhir Sprint 0 kita mengharapkan sebuah repository yang secara konseptual memiliki:

```text
YAPENDIK SCHOOL OS
│
├── Application
├── Domains
├── Database
├── Authentication
├── Authorization
├── Context
├── Tests
├── Configuration
├── Deployment
└── Documentation
```

Struktur aktual boleh berbeda.

Yang penting adalah **boundary**, bukan nama folder.

---

# 7. TECHNOLOGY DECISION

Technical Architecture menetapkan technology direction, bukan vendor lock-in. 

Untuk Sprint 0 kita hanya memilih technology yang diperlukan untuk mulai bekerja.

Baseline:

```text
Application
→ Web-based responsive application

Architecture
→ Modular Monolith

Backend
→ Server-side application / API boundary

Database
→ Relational Database

Storage
→ Object Storage, jika diperlukan

Authentication
→ Managed Identity Provider

Deployment
→ Managed Cloud Platform

Observability
→ Managed Monitoring / Error Tracking
```

Vendor dan versi final dicatat melalui ADR jika keputusan tersebut cukup signifikan.

---

# 8. TECHNOLOGY SELECTION RULE

Jangan memilih teknologi karena:

- sedang populer;
- paling baru;
- paling banyak digunakan;
- terlihat enterprise;
- memiliki banyak fitur.

Pilih berdasarkan:

```text
Purpose
People
Workflow
Information
Context
Trust
Simplicity
Future
```

Ini mengikuti constitutional test. 

---

# 9. PROJECT INITIALIZATION

Deliverables:

```text
[ ] Repository created
[ ] Application initialized
[ ] Package management configured
[ ] TypeScript configured
[ ] Environment configuration established
[ ] Development command works
[ ] Production build works
```

---

# 10. ENVIRONMENT MODEL

Minimum:

```text
development
staging
production
```

Sprint 0 hanya perlu membuat:

```text
development
staging foundation
```

Production infrastructure dapat disiapkan secara minimal tanpa memasukkan real school data.

---

# 11. ENVIRONMENT SEPARATION

Development tidak boleh bergantung pada:

- production database;
- production secrets;
- real child data;
- production storage;
- production authentication configuration.

---

# 12. ENVIRONMENT VARIABLES

Secret configuration harus:

```text
outside source code
```

Contoh kategori:

```text
DATABASE_URL
AUTH configuration
STORAGE configuration
APPLICATION URL
OBSERVABILITY configuration
```

Nama variable final mengikuti implementation stack.

---

# 13. APPLICATION SHELL

Application harus memiliki shell dasar:

```text
Application
├── Public Area
└── Authenticated Area
```

Authenticated Area harus sudah mengenali:

```text
Current User
Current School Context
```

walaupun domain School belum lengkap.

---

# 14. AUTHENTICATION FOUNDATION

Authentication menjawab:

> **Who are you?**

Minimum capability:

```text
Sign In
Session
Current User
Sign Out
```

Jika menggunakan managed identity provider, provider-specific implementation dicatat sebagai technical decision/ADR.

---

# 15. AUTHENTICATION NON-GOALS

Sprint 0 tidak perlu:

- social login matrix;
- complex MFA orchestration;
- password recovery customization;
- enterprise SSO;
- biometric authentication;
- multiple identity providers.

Kecuali ada kebutuhan nyata yang sudah diketahui.

---

# 16. IDENTITY FOUNDATION

Setelah authentication berhasil:

```text
Authenticated Identity
        ↓
Application User
        ↓
Person / Institutional Identity
```

Kita tidak boleh menganggap:

```text
email = person
```

atau:

```text
login account = student
```

Identity harus tetap dapat berkembang menuju canonical institutional identity.

---

# 17. SCHOOL CONTEXT FOUNDATION

School OS harus mengetahui:

```text
Who
+
Which School
```

Minimal conceptual context:

```text
User
 ↓
School
```

Kemudian dapat berkembang:

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Student
```

Operating Model menetapkan school sebagai primary anchor dan academic year/class/student sebagai context hierarchy. 

---

# 18. CONTEXT RESOLUTION

Sprint 0 harus menyediakan mekanisme dasar:

```text
Request
 ↓
Authenticated User
 ↓
Resolve School Context
 ↓
Context Available
```

Jika context tidak dapat ditentukan:

```text
CONTEXT_ERROR
```

Jangan meneruskan request seolah-olah user memiliki akses global.

---

# 19. MULTI-SCHOOL PRINCIPLE

Walaupun pilot hanya menggunakan satu TK, data model dan application boundary harus sudah memiliki:

```text
school_id
```

sebagai context boundary bila entity tersebut berada dalam School OS scope.

Tetapi:

> **Kita tidak membangun complex multi-tenant infrastructure.**

Technical Architecture memang memilih strong school-context boundary tanpa premature multi-tenant infrastructure. 

---

# 20. AUTHORIZATION FOUNDATION

Authorization menjawab:

> **What may this person do in this context?**

Minimal pipeline:

```text
Request
 ↓
Authentication
 ↓
Context
 ↓
Relationship
 ↓
Capability
 ↓
Allow / Deny
```

---

# 21. AUTHORIZATION PRINCIPLE

Jangan hanya:

```text
if role === "teacher"
```

Authorization harus berkembang menuju:

```text
Who
+
Role
+
Context
+
Relationship
+
Action
```

Ini merupakan constitutional non-negotiable **C-14 — Contextual Authorization**. 

---

# 22. FIRST AUTHORIZATION TEST

Minimal test:

```text
Teacher A
    ↓
School A
    ✓

Teacher A
    ↓
School B
    ✗
```

Jika Sprint 0 belum dapat membuktikan boundary ini:

> **Sprint 0 belum selesai.**

---

# 23. DATABASE FOUNDATION

Database foundation harus mendukung:

- relational integrity;
- migrations;
- transactions;
- foreign keys;
- indexes;
- timestamps;
- audit-ready design.

Technical Architecture memilih relational model karena relationship antar entity School OS kuat. 

---

# 24. DATABASE SCOPE

Sprint 0 **tidak membuat seluruh database blueprint sekaligus**.

Database awal hanya perlu menyediakan foundation untuk:

```text
Identity
School
User / Membership
Basic Context
```

Entity berikutnya dibuat ketika vertical slice membutuhkannya.

---

# 25. MIGRATION SYSTEM

Migration harus:

```text
Versioned
Reproducible
Reviewable
Testable
```

Technical Architecture secara eksplisit menetapkan database changes harus versioned dan migration harus reproducible serta reviewable. 

---

# 26. FIRST MIGRATION

Migration awal dapat mencakup conceptual foundation:

```text
users / identity reference
schools
school memberships / relationships
```

Nama tabel final mengikuti Database Blueprint yang sudah ditetapkan.

Jangan membuat generic:

```text
everything
```

table hanya demi fleksibilitas.

---

# 27. SEED DATA

Development seed minimal:

```text
1 School
2 Users
2 Memberships
```

Contoh:

```text
User A → School A
User B → School A
```

Kemudian untuk authorization test:

```text
School B
User C → School B
```

---

# 28. NO REAL CHILD DATA

Sprint 0:

> **Tidak boleh menggunakan data anak nyata.**

Semua test data harus synthetic.

Ini konsisten dengan prinsip privacy by design dan stewardship terhadap entrusted information. 

---

# 29. DOMAIN STRUCTURE

Domain boundary mulai diperkenalkan sejak Sprint 0.

Conceptual:

```text
domains/
│
├── identity/
├── school/
└── authorization/
```

Domain yang belum dibangun tidak perlu dibuat kosong hanya untuk terlihat lengkap.

---

# 30. APPLICATION STRUCTURE

Application layer menangani orchestration.

Contoh:

```text
resolveCurrentUser()
resolveSchoolContext()
checkCapability()
```

Business rules tidak diletakkan di UI.

---

# 31. UI RESPONSIBILITY

UI bertanggung jawab terhadap:

- rendering;
- input;
- feedback;
- navigation;
- presentation.

UI **tidak** menjadi sumber authorization.

Contoh yang salah:

```text
Hide button
=
authorization
```

Button hiding hanya UX.

Server enforcement tetap wajib.

---

# 32. API / APPLICATION BOUNDARY

Sprint 0 harus memiliki boundary yang jelas:

```text
UI
 ↓
Application
 ↓
Domain
 ↓
Repository
 ↓
Database
```

Tidak:

```text
UI
 ↓
Database directly
```

---

# 33. ERROR CONTRACT

Minimum error categories:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
CONTEXT_ERROR
VALIDATION_ERROR
NOT_FOUND
CONFLICT
SYSTEM_ERROR
```

Error response harus dapat digunakan oleh UI tanpa mengekspos internal database details.

---

# 34. LOGGING FOUNDATION

Logging minimum harus dapat menjawab:

```text
Who?
What?
When?
Where?
Result?
```

Tetapi:

> **Jangan log sensitive child information hanya karena tersedia.**

Logging mengikuti minimum necessary information.

---

# 35. REQUEST / CORRELATION ID

Application request sebaiknya memiliki identifier yang memungkinkan:

```text
Request
 ↓
Application operation
 ↓
Database operation
 ↓
Error / log
```

ditelusuri.

Detail implementation dapat berubah.

---

# 36. AUDIT FOUNDATION

Sprint 0 belum perlu membangun audit system lengkap.

Namun application harus sudah memiliki tempat konseptual untuk:

```text
Actor
Action
Context
Timestamp
Result
```

Audit detail akan berkembang ketika domain transaction mulai dibangun.

---

# 37. OBSERVABILITY

Sprint 0 minimum:

```text
Application error
Database error
Authentication failure
Authorization denial
Deployment failure
```

harus dapat diketahui developer.

Tidak perlu membangun analytics dashboard.

---

# 38. TESTING FOUNDATION

Testing pyramid:

```text
Unit
 ↓
Domain / Application
 ↓
Integration
 ↓
Authorization
 ↓
E2E
 ↓
Real Pilot
```

Ini merupakan testing architecture yang telah ditetapkan. 

Sprint 0 terutama memastikan layer pertama sampai authorization foundation dapat dijalankan.

---

# 39. UNIT TEST

Minimal test:

```text
Context resolution
Authorization rule
Basic domain validation
Error classification
```

---

# 40. INTEGRATION TEST

Minimal:

```text
Application
+
Database
+
Authentication / identity reference
+
Context
```

harus dapat bekerja bersama.

---

# 41. AUTHORIZATION TEST

Wajib:

```text
ALLOW
DENY
WRONG SCHOOL
MISSING CONTEXT
```

---

# 42. E2E SMOKE TEST

Sprint 0 hanya membutuhkan smoke journey:

```text
Open Application
 ↓
Sign In
 ↓
Authenticated Area
 ↓
Resolve School
 ↓
View Current Context
 ↓
Sign Out
```

Belum perlu Attendance atau Student.

---

# 43. BUILD CHECK

Setiap commit penting harus dapat melewati:

```text
Type Check
Lint
Unit Tests
Build
```

Migration validation ditambahkan jika database berubah.

---

# 44. CI FOUNDATION

CI minimal:

```text
Push
 ↓
Install
 ↓
Type Check
 ↓
Lint
 ↓
Test
 ↓
Build
```

Tidak perlu pipeline kompleks.

---

# 45. DEPLOYMENT FOUNDATION

Target:

```text
Development
     ↓
Staging
```

Staging harus dapat menjalankan application build yang sama secara substantif dengan production build.

---

# 46. DATABASE DEPLOYMENT

Migration production/staging harus:

```text
explicit
versioned
reviewed
```

Jangan mengandalkan manual schema editing.

---

# 47. BACKUP

Untuk staging, backup tidak perlu kompleks.

Untuk production foundation, sebelum real pilot data masuk:

```text
Backup
Recovery Procedure
Retention
```

harus sudah dipahami.

Technical Architecture memang menetapkan backup, recovery procedure, retention policy, dan recovery testing sebagai production concern. 

---

# 48. SECURITY BASELINE

Sprint 0 security checklist:

```text
[ ] HTTPS
[ ] Secrets outside repository
[ ] Authentication enforced
[ ] Server-side authorization
[ ] School context enforced
[ ] Database credentials protected
[ ] Production/dev separation
[ ] Sensitive logs avoided
[ ] Dependency audit available
```

---

# 49. PRIVACY BASELINE

Karena School OS menangani informasi anak, privacy tidak boleh menjadi enhancement.

Minimum:

```text
Data minimization
Access control
Context isolation
No real child data in development
Controlled logs
Controlled storage
```

---

# 50. ONLINE-FIRST

Sprint 0 **tidak membangun offline infrastructure**.

Tidak ada requirement untuk:

```text
IndexedDB
Sync Engine
Conflict Resolution
Offline Queue
Background Synchronization
```

Constitution secara eksplisit menetapkan online-first untuk Phase 1 dan offline-first bukan MVP requirement. 

---

# 51. FUTURE OFFLINE BOUNDARY

Walaupun belum dibangun, kita tidak boleh membuat architecture yang secara sengaja mengunci kemungkinan:

```text
Online
   ↓
Future validated offline capability
```

Offline hanya dibangun jika real school evidence membutuhkannya.

---

# 52. DOCUMENTATION

Sprint 0 minimal menghasilkan:

```text
README
Development Setup
Environment Guide
Architecture Overview
Database Setup
Migration Guide
Testing Guide
Deployment Notes
ADR directory
```

Dokumentasi harus membantu developer berikutnya menjalankan system.

---

# 53. README MINIMUM

README harus menjawab:

```text
What is this?
How do I run it?
How do I configure it?
How do I migrate database?
How do I seed data?
How do I test?
How do I build?
How do I deploy?
Where is the architecture documented?
```

---

# 54. ADR POLICY

Kita **tidak membuat ADR untuk setiap keputusan kecil**.

ADR digunakan untuk keputusan yang:

- architectural;
- difficult to reverse;
- affects multiple modules;
- creates long-term constraint;
- or materially changes technical direction.

Ini mengikuti Reversibility Principle Constitution. 

---

# 55. INITIAL ADR CANDIDATES

Potential ADR:

```text
ADR-001 Authentication & Identity
ADR-002 School Context / Tenancy Boundary
ADR-003 Database & Migration Strategy
ADR-004 Authorization Enforcement
ADR-005 Deployment & Environment Strategy
```

Status awal:

> **PROPOSED / TO BE CONFIRMED**

Kita tidak menganggap semua harus dibuat jika implementation ternyata sederhana dan keputusan tersebut tidak cukup consequential.

---

# 56. SPRINT 0 WORK PACKAGES

Sprint 0 dibagi menjadi:

```text
WP-01 Project Initialization
WP-02 Environment
WP-03 Application Shell
WP-04 Authentication
WP-05 Identity
WP-06 School Context
WP-07 Authorization
WP-08 Database
WP-09 Testing
WP-10 Observability
WP-11 Deployment
WP-12 Documentation
```

---

# 57. WP-01 — PROJECT INITIALIZATION

Output:

```text
[ ] Repository
[ ] Project
[ ] TypeScript
[ ] Package management
[ ] Basic source structure
[ ] README
```

Acceptance:

> Developer dapat clone dan menjalankan project.

---

# 58. WP-02 — ENVIRONMENT

Output:

```text
[ ] .env strategy
[ ] Development config
[ ] Staging config
[ ] Secret handling
```

Acceptance:

> Application dapat berjalan tanpa secret hardcoded.

---

# 59. WP-03 — APPLICATION SHELL

Output:

```text
[ ] Public route
[ ] Protected route
[ ] Layout
[ ] Error boundary
[ ] Loading state
```

Acceptance:

> Protected route tidak dapat diakses anonymous.

---

# 60. WP-04 — AUTHENTICATION

Output:

```text
[ ] Sign in
[ ] Session
[ ] Current user
[ ] Sign out
```

Acceptance:

> System dapat membedakan authenticated dan unauthenticated state.

---

# 61. WP-05 — IDENTITY

Output:

```text
[ ] User identity reference
[ ] Person relationship foundation
```

Acceptance:

> Authenticated user dapat dipetakan ke canonical application identity.

Jika detail Person belum diperlukan, jangan memaksakan seluruh Person domain.

---

# 62. WP-06 — SCHOOL CONTEXT

Output:

```text
[ ] School entity
[ ] User-school relationship
[ ] Context resolver
```

Acceptance:

> System dapat menjawab:

> **“User ini sedang berada dalam konteks sekolah mana?”**

---

# 63. WP-07 — AUTHORIZATION

Output:

```text
[ ] Capability boundary
[ ] Context check
[ ] Allow
[ ] Deny
```

Acceptance:

```text
User A → School A ✓
User A → School B ✗
```

---

# 64. WP-08 — DATABASE

Output:

```text
[ ] Relational database
[ ] Initial schema
[ ] Migration
[ ] Seed
[ ] Constraints
```

Acceptance:

> Fresh database dapat dibangun dari migration tanpa manual intervention.

---

# 65. WP-09 — TESTING

Output:

```text
[ ] Unit framework
[ ] Integration framework
[ ] Authorization tests
[ ] E2E smoke test
```

Acceptance:

> Test suite dapat dijalankan dari clean environment.

---

# 66. WP-10 — OBSERVABILITY

Output:

```text
[ ] Error logging
[ ] Application logging
[ ] Request traceability
```

Acceptance:

> Developer dapat menemukan penyebab basic application failure.

---

# 67. WP-11 — DEPLOYMENT

Output:

```text
[ ] Build
[ ] Staging deployment
[ ] Environment configuration
[ ] Database migration procedure
```

Acceptance:

> Application dapat di-deploy ke staging secara repeatable.

---

# 68. WP-12 — DOCUMENTATION

Output:

```text
[ ] README
[ ] Setup
[ ] Database
[ ] Testing
[ ] Deployment
[ ] ADR
```

Acceptance:

> Developer baru dapat menjalankan system tanpa penjelasan langsung dari pembuatnya.

---

# 69. SPRINT 0 INTEGRATED TEST

Setelah semua work package selesai:

```text
Fresh Environment
      ↓
Clone Repository
      ↓
Install
      ↓
Configure Environment
      ↓
Create Database
      ↓
Run Migration
      ↓
Seed
      ↓
Run Application
      ↓
Sign In
      ↓
Resolve School
      ↓
Authorization Test
      ↓
Run Test Suite
      ↓
Build
      ↓
Deploy Staging
```

Jika alur ini berhasil:

> Sprint 0 secara teknis hampir selesai.

---

# 70. SPRINT 0 DEFINITION OF DONE

Sprint 0 selesai jika:

```text
[ ] Repository works
[ ] Developer setup documented
[ ] Application runs
[ ] Build works
[ ] Authentication works
[ ] Identity resolves
[ ] School context resolves
[ ] Authorization works
[ ] Database migration works
[ ] Seed works
[ ] Tests work
[ ] E2E smoke test works
[ ] Basic logging works
[ ] Staging deployment works
[ ] No real child data used
[ ] Security baseline satisfied
[ ] Documentation sufficient
```

---

# 71. SPRINT 0 NON-GOALS CHECK

Pastikan kita **belum** terjebak membangun:

```text
[ ] Full Student CRUD
[ ] Attendance
[ ] Observation
[ ] Learning
[ ] Guardian Portal
[ ] Dashboard
[ ] Reporting
[ ] AI
[ ] Offline
[ ] Microservices
[ ] Complex analytics
```

Jika item tersebut mulai muncul sebagai pekerjaan Sprint 0:

> **Stop and question why.**

---

# 72. ARCHITECTURAL QUALITY GATE

Sebelum Sprint 1:

### Q1

Apakah school context dapat dijelaskan?

### Q2

Apakah authorization dapat dijelaskan?

### Q3

Apakah developer dapat menemukan business boundary?

### Q4

Apakah database migration reproducible?

### Q5

Apakah application dapat diuji?

### Q6

Apakah system masih sederhana?

### Q7

Apakah kita membangun sesuatu hanya karena asumsi future?

Jika jawabannya bermasalah:

> Fix foundation before feature.

---

# 73. SPRINT 0 EXIT REVIEW

Review dilakukan terhadap empat dimensi:

```text
TECHNICAL
    +
SECURITY
    +
DEVELOPER EXPERIENCE
    +
ARCHITECTURAL HEALTH
```

Bukan feature count.

---

# 74. WHAT SPRINT 0 SHOULD FEEL LIKE

Pada akhir Sprint 0, developer seharusnya merasa:

> “Saya tahu bagaimana aplikasi ini bekerja.”

Bukan:

> “Saya tahu 100% bagaimana School OS akan bekerja.”

Karena product dan architecture tetap living.

---

# 75. WHAT SPRINT 0 PROVES

Sprint 0 membuktikan:

```text
Architecture
   ↓
Can be implemented
```

Tetapi belum membuktikan:

```text
Product
   ↓
Is useful to a school
```

Itu baru akan dibuktikan melalui Sprint 1+ dan real pilot.

---

# 76. TRANSITION TO SPRINT 1

Setelah Sprint 0:

```text
SPRINT 0
Technical Foundation
        ↓
SPRINT 1
School + People + Student Foundation
        ↓
SPRINT 2
Teacher Workspace
        ↓
SPRINT 3
Attendance
        ↓
SPRINT 4
Observation
```

Urutan product tetap tunduk pada evidence.

Product Blueprint menempatkan Teacher Daily Work dan Student Observation sebagai discovery priority tertinggi, sementara phased evolution memulai foundation dengan School, People, Students, Enrollment, dan Class.  

---

# 77. IMPORTANT: SPRINT 0 IS NOT A BIG-BANG FOUNDATION

Kita tidak mencoba membangun:

> **“architecture untuk 10 tahun ke depan.”**

Kita membangun:

> **“foundation yang cukup untuk membangun dan memvalidasi vertical slice pertama.”**

Ini perbedaan yang sangat penting.

---

# 78. FIRST REAL VERTICAL SLICE AFTER SPRINT 0

Setelah Sprint 0, target berikutnya:

```text
Teacher
 ↓
School Context
 ↓
My Class
 ↓
Student
 ↓
Attendance
 ↓
Observation
```

Namun **Sprint 1 tidak boleh otomatis mengasumsikan workflow tersebut benar**.

Kita tetap harus membawa implementation kembali ke real TK reality.

Constitution menetapkan bahwa architecture berkembang dari assumption → implementation → real usage → evidence → learning. 

---

# 79. SPRINT 0 GOVERNANCE STATUS

Dokumen ini:

**LIVING — ACTIVE IMPLEMENTATION**

Bukan frozen.

Implementation dapat menemukan:

```text
Unknown
Assumption
Conflict
Simpler Solution
```

Jika ditemukan:

```text
Observe
 ↓
Assess
 ↓
Decide
 ↓
Document if significant
 ↓
Implement
```

---

# 80. FINAL SPRINT 0 PRINCIPLE

> **Do not build the School OS in Sprint 0.**
>
> **Build the foundation that allows us to build the School OS responsibly.**

Dan:

> **Do not optimize for the architecture we imagine. Optimize for the first real school workflow we need to validate.**

---

# 81. STATUS

**YAPENDIK SCHOOL OS TK PILOT SPRINT 0 SPECIFICATION**

**Version:** 0.1

**Status:** **LIVING — ACTIVE IMPLEMENTATION**

**Scope:** TK Pilot — Technical Foundation

**Architecture:** Online-First / Modular Monolith

**Primary Goal:**

> **Establish a secure, context-aware, testable, deployable foundation for the first School OS vertical slice.**

**Success Condition:**

> **A developer can clone, run, test, authenticate, resolve school context, enforce authorization, migrate the database, and deploy the application without architectural guesswork.**

---

# 82. NEXT STEP

Dengan dokumen ini, menurut saya **kita sudah selesai pada level planning**.

Sekarang rantainya menjadi:

```text
CONSTITUTION
       ↓
INFORMATION ARCHITECTURE
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
IMPLEMENTATION SPECIFICATION
       ↓
★ SPRINT 0 SPECIFICATION ★
       ↓
=========================
       BUILD
=========================
       ↓
REPOSITORY
       ↓
SPRINT 0
       ↓
FIRST VERTICAL SLICE
       ↓
REAL TK
       ↓
EVIDENCE
       ↓
LEARNING
```

Jadi **dokumen berikutnya bukan lagi dokumen besar**. Kita seharusnya masuk ke **project/repository foundation dan Sprint 0 execution**.

Dan ada satu hal yang saya sengaja pertahankan: **Sprint 0 tidak mengunci stack/vendor secara berlebihan.** Technical Architecture memang menyatakan technology direction masih berupa baseline dan exact technologies diputuskan pada implementation architecture/ADR setelah kebutuhan TK lebih tervalidasi. 

Dengan demikian kita tidak jatuh ke jebakan *“architecture sudah sangat lengkap, tetapi belum pernah menyentuh kenyataan sekolah.”*