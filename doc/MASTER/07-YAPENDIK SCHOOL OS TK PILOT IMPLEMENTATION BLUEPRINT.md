# YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT

Version: 0.1  
Organization: Yayasan Pendidikan GPIB (Yapendik)  
System: Yapendik Operating System  
Product: School OS  
Pilot: TK  
Document Type: Implementation Blueprint  
Status: LIVING — DISCOVERY  
Approach: Common Sense First  
Principle: Make It Simple. Keep It Future-Proof.

Derived From:

YAPENDIK OPERATING SYSTEM CONSTITUTION

YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE

YAPENDIK SCHOOL OS OPERATING MODEL

YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT

YAPENDIK SCHOOL OS UX ARCHITECTURE

YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE

---

1. PURPOSE

Dokumen ini menerjemahkan seluruh architectural direction Yapendik School OS menjadi rencana implementasi yang dapat dikerjakan.

Architecture menjawab:

"What should exist?"

Implementation Blueprint menjawab:

"What do we build first, in what order, and how do we know it is ready?"

Dokumen ini menjadi jembatan antara:

ARCHITECTURE

dan

BUILD.

---

2. IMPLEMENTATION NORTH STAR

Kita tidak membangun seluruh School OS.

Kita membangun:

> minimum reliable School OS yang cukup untuk digunakan oleh satu TK nyata, menyelesaikan pekerjaan nyata, menghasilkan evidence nyata, dan menjadi dasar pembelajaran untuk pengembangan berikutnya.

---

3. IMPLEMENTATION PRINCIPLES

3.1 Build the Foundation Before the Features

Identity, context, authorization, dan canonical data harus benar sebelum workflow dibangun di atasnya.

3.2 Build the Most Valuable Workflow First

Prioritas bukan jumlah screen.

Prioritas adalah pekerjaan sekolah yang paling bernilai.

3.3 Real Workflow Before Full Feature

Workflow nyata lebih penting daripada completeness fitur.

3.4 Vertical Slice Over Horizontal Construction

Lebih baik satu workflow benar-benar selesai dari UI sampai database daripada banyak module yang hanya setengah jadi.

3.5 Small Steps, Working Software

Setiap milestone harus menghasilkan sesuatu yang dapat diuji.

3.6 Security From the Beginning

Security bukan hardening phase terakhir.

3.7 No Premature Infrastructure

Jangan membangun infrastructure complexity sebelum diperlukan.

3.8 Architecture Can Evolve

Implementation harus memberi feedback kepada architecture.

---

4. PILOT OBJECTIVE

TK Pilot bertujuan untuk membuktikan:

1. Apakah School OS benar-benar membantu pekerjaan sekolah.
2. Apakah Teacher dapat bekerja lebih sederhana.
3. Apakah Student menjadi canonical educational context.
4. Apakah information dapat dicatat dan ditemukan kembali.
5. Apakah leadership mendapatkan visibility yang lebih baik.
6. Apakah Guardian dapat menerima information yang relevan.
7. Apakah architecture mampu mendukung workflow nyata.
8. Apakah product direction layak diperluas ke sekolah lain.

---

5. PILOT SUCCESS IS NOT FEATURE COUNT

Pilot tidak dianggap berhasil karena:

"semua menu sudah tersedia."

Pilot berhasil jika:

Teacher dapat menyelesaikan pekerjaan penting.

Student information dapat dipercaya.

School dapat menggunakan system secara nyata.

User memahami system tanpa training yang berlebihan.

Data dan access boundary dapat dipercaya.

Dan sekolah mengatakan:

"Ini benar-benar membantu pekerjaan kami."

---

6. PILOT SCOPE

Initial pilot scope:

School

People

Student

Guardian

Teacher

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

---

7. OUT OF SCOPE — INITIAL PILOT

Tidak menjadi prioritas awal:

Advanced finance

Payroll

Procurement

Inventory management

Complex HR

Advanced BI

AI-driven assessment

Dedicated data warehouse

Complex workflow engine

Microservices

Enterprise integration platform

Multi-region infrastructure

Full offline-first architecture

Advanced public portal

Complex parent social network

Semua dapat menjadi future capability apabila evidence membenarkannya.

---

8. IMPLEMENTATION STRATEGY

Implementation dilakukan dalam beberapa layer:

FOUNDATION

↓

CORE INFORMATION

↓

CORE SCHOOL CONTEXT

↓

TEACHER WORKFLOW

↓

STUDENT DEVELOPMENT

↓

COMMUNICATION

↓

LEADERSHIP REVIEW

↓

PILOT

↓

LEARNING

---

9. PHASE 0 — DISCOVERY BASELINE

Tujuan:

Memastikan architecture dan assumptions cukup jelas untuk mulai membangun.

Aktivitas:

Review Constitution.

Review Enterprise IA.

Review Operating Model.

Review Product Blueprint.

Review UX Architecture.

Review Technical Architecture.

Identifikasi unresolved assumptions.

Identifikasi pilot school workflow.

Output:

Implementation baseline.

Open question register.

Initial ADR register.

Pilot workflow shortlist.

---

10. PHASE 0 GATE

Tidak perlu semua pertanyaan terjawab.

Tetapi harus jelas:

Apa yang kita bangun?

Untuk siapa?

Workflow apa?

Data apa?

Context apa?

Security boundary apa?

Apa yang belum kita ketahui?

Jika jawabannya cukup jelas, lanjut ke Foundation.

---

11. PHASE 1 — PLATFORM FOUNDATION

Tujuan:

Membangun technical foundation minimum.

Mencakup:

Application skeleton

Environment configuration

Database connection

Migration system

Authentication foundation

Authorization foundation

Error handling

Logging foundation

Basic observability

Testing foundation

CI/CD foundation

---

12. PHASE 1 — ARCHITECTURE

Struktur aplikasi mengikuti:

Presentation

↓

Application

↓

Domain

↓

Infrastructure

Domain boundaries harus sudah terlihat sejak awal.

Namun tidak perlu membuat distributed services.

---

13. PHASE 1 — ENVIRONMENTS

Minimum:

Development

Staging

Production

Setiap environment harus memiliki configuration yang jelas.

Production credentials tidak boleh digunakan sembarangan pada development.

---

14. PHASE 1 — QUALITY GATE

Foundation dianggap siap jika:

Application dapat dijalankan.

Database dapat diakses.

Migration dapat dijalankan.

Authentication bekerja.

Basic authorization bekerja.

Error dapat diamati.

Test dapat dijalankan.

Deployment ke staging berhasil.

---

15. PHASE 2 — IDENTITY AND CONTEXT

Ini adalah salah satu milestone paling penting.

Implement:

Person identity

User identity

School identity

Academic Year

Role / responsibility

Context resolution

School membership

Class relationship

---

16. CANONICAL IDENTITY

Minimal relationship:

Person

↓

User Identity

↓

School Relationship

↓

Role / Responsibility

↓

Context

Jangan membuat duplicate Person hanya karena seseorang memiliki role berbeda.

---

17. CONTEXT ENGINE

Context resolution harus dapat menjawab:

Who is this?

Which school?

Which academic year?

Which class?

What responsibility?

What can this person access?

---

18. AUTHORIZATION

Authorization harus diuji dengan:

Authorized access

Unauthorized access

Cross-school access

Cross-class access

Cross-student access

Sensitive information access

Client manipulation attempt

Server enforcement harus menjadi authority.

---

19. PHASE 2 GATE

Tidak boleh lanjut ke operational workflow jika:

Identity belum stabil.

Context belum dapat dipercaya.

Authorization masih hanya dilakukan di frontend.

---

20. PHASE 3 — SCHOOL AND ACADEMIC STRUCTURE

Implement:

School

Academic Year

Class

Teacher assignment

Student enrollment

Guardian relationship

---

21. SCHOOL SETUP FLOW

Initial setup:

School

↓

Academic Year

↓

Classes

↓

Teachers

↓

Students

↓

Guardian relationships

---

22. ENROLLMENT MODEL

Enrollment harus dipisahkan dari Student identity.

Conceptual:

Student

↓

Enrollment

↓

Academic Year

↓

Class

Ini memungkinkan Student tetap memiliki identity sepanjang perjalanan pendidikan.

---

23. PHASE 3 GATE

School harus dapat direpresentasikan secara utuh dalam system.

Minimal:

School exists.

Academic Year exists.

Class exists.

Teacher assigned.

Student enrolled.

Guardian relationship available.

---

24. PHASE 4 — CLASS WORKSPACE

Class Workspace menjadi vertical slice utama Teacher.

Teacher masuk:

School

↓

Academic Year

↓

Class

↓

Students

---

25. CLASS WORKSPACE MVP

Class Workspace minimal menyediakan:

Class identity

Student list

Today's work

Attendance

Relevant observations

Relevant development information

Quick actions

---

26. WHY CLASS FIRST

Class adalah natural working context bagi Teacher.

Daripada:

Dashboard

↓

Find feature

↓

Find class

↓

Find student

lebih baik:

Teacher

↓

Class

↓

Work

---

27. PHASE 4 GATE

Teacher dapat:

Open class.

See students.

Understand current context.

Start attendance.

Open student.

Record relevant work.

---

28. PHASE 5 — ATTENDANCE

Attendance adalah salah satu workflow paling sederhana untuk menguji:

Context

Entity

Action

Transaction

Authorization

Data integrity

---

29. ATTENDANCE FLOW

Teacher

↓

Class

↓

Today

↓

Students

↓

Attendance

↓

Save

↓

Confirmation

---

30. ATTENDANCE REQUIREMENTS

System harus menjaga:

Correct school.

Correct academic year.

Correct class.

Correct student.

Correct date / session.

Correct recorder.

No unintended duplicate logical record.

---

31. ATTENDANCE GATE

Teacher dapat menyelesaikan attendance dengan:

Minimal interaction.

Clear feedback.

No confusing navigation.

Correct persisted data.

---

32. PHASE 6 — STUDENT WORKSPACE

Student Workspace menjadi canonical view untuk Student.

Minimal:

Overview

Profile

Attendance

Learning

Development

Evidence

Communication

Section dapat bertambah kemudian.

---

33. STUDENT OVERVIEW

Overview harus menjawab:

Who is this student?

Which class?

Current context?

What matters now?

Recent relevant information?

---

34. PHASE 7 — OBSERVATION

Observation menjadi salah satu workflow utama School OS.

Flow:

Class

↓

Student

↓

Observe

↓

Record Observation

↓

Save

↓

Review

---

35. OBSERVATION MVP

Minimal:

Student

Date / time

Context

Observer

Observation

Optional evidence

Optional follow-up

Jangan membangun scoring engine terlebih dahulu.

---

36. OBSERVATION DESIGN PRINCIPLE

Observation harus dapat dilakukan tanpa mengganggu Teacher secara berlebihan.

Jika observation membutuhkan form panjang setiap kali:

Architecture harus dipertanyakan.

Bukan Teacher yang dipaksa mengikuti system.

---

37. PHASE 8 — DEVELOPMENT

Development dibangun setelah observation memiliki foundation yang cukup.

Conceptual:

Observation

↓

Evidence

↓

Pattern

↓

Development Understanding

↓

Follow-up

---

38. DEVELOPMENT MVP

Development MVP tidak harus memiliki:

Complex scoring

AI assessment

Automated diagnosis

Advanced analytics

Initial focus:

structured observation + meaningful context + review.

---

39. PHASE 9 — EVIDENCE

Evidence harus memiliki:

Owner

Student

Context

Purpose

Record relationship

Metadata

Access boundary

Storage reference

---

40. EVIDENCE STORAGE

Binary file/media disimpan pada secure object storage.

Database menyimpan metadata dan relationship.

Tidak menjadikan file URL sebagai public identity.

---

41. PHASE 10 — GUARDIAN COMMUNICATION

Guardian experience dibangun setelah canonical Student dan communication context stabil.

Flow:

Student

↓

Relevant Information

↓

Guardian

↓

Action / Response

---

42. GUARDIAN MVP

Potential scope:

School communication

Student-related information

Relevant announcements

Basic response

Relevant follow-up

Guardian tidak melihat internal operational information.

---

43. PHASE 11 — LEADERSHIP REVIEW

Leadership review dibangun dari canonical operational information.

Flow:

School

↓

Current Context

↓

Important Signals

↓

Review

↓

Decision

↓

Follow-up

---

44. LEADERSHIP MVP

Minimal:

School overview

Class overview

Attendance signal

Development signal

Important items

Review / follow-up

Tidak perlu membangun BI platform.

---

45. PHASE 12 — OPERATIONAL HARDENING

Setelah core workflow berjalan:

Security review

Authorization review

Performance review

Error review

Audit review

Backup review

Recovery review

Accessibility review

Usability review

---

46. PHASE 13 — PILOT READINESS

Sebelum digunakan sekolah:

Production deployment

Pilot data preparation

User accounts

Role assignment

School configuration

Class configuration

Student data

Guardian data

Training material

Support channel

Incident procedure

---

47. PILOT ONBOARDING

Onboarding harus sederhana.

School harus memahami:

What is School OS?

Who uses it?

What should Teacher do?

What should Administration do?

What should Leadership do?

What should Guardian do?

What is not yet supported?

---

48. PILOT TRAINING

Training tidak boleh menjadi substitute untuk bad UX.

Jika user membutuhkan training panjang untuk workflow sederhana:

UX harus dievaluasi.

Training fokus pada:

context

basic workflow

rules

privacy

support

---

49. PILOT DATA

Data dapat berasal dari:

Validated existing school records

Controlled import

Manual pilot entry

Synthetic test data

Data migration harus memperhatikan canonical identity.

---

50. DATA MIGRATION PRINCIPLE

Jangan langsung memindahkan seluruh historical data.

Prioritaskan:

Current students

Current teachers

Current classes

Current academic year

Relevant guardian relationships

Pilot-required historical information

---

51. PILOT ENVIRONMENT

Sebelum production:

Development

↓

Staging

↓

Pilot Production

Staging harus sedekat mungkin dengan production configuration tanpa menggunakan data sensitif sembarangan.

---

52. TESTING STRATEGY

Testing mengikuti:

Unit

↓

Domain / Application

↓

Integration

↓

Authorization

↓

End-to-End

↓

Real User Validation

---

53. UNIT TESTS

Test:

Domain rules

Validation

Pure functions

Data transformations

Critical calculations

---

54. INTEGRATION TESTS

Test:

Database

Authentication integration

Authorization enforcement

Storage

Important external integrations

---

55. AUTHORIZATION TESTS

Minimal negative cases:

Teacher A cannot modify Student outside permitted context.

Teacher cannot access another school's information.

Guardian cannot access another Student.

Unauthorized actor cannot modify development records.

---

56. E2E TESTS

Priority E2E:

Teacher login

Open class

View students

Record attendance

Open student

Record observation

Review student

Guardian receives relevant communication

Leadership reviews school information

---

57. PILOT ACCEPTANCE TEST

Acceptance test harus menggunakan real-world task.

Contoh:

"Record attendance for today's class."

Bukan:

"Open Attendance page."

---

58. DEFINITION OF DONE

Feature dianggap Done jika:

Business purpose clear.

UX workflow complete.

Authorization implemented.

Database integrity enforced.

Validation implemented.

Error handling implemented.

Tests passing.

Observability available where appropriate.

Documentation sufficient.

Real user task works.

---

59. VERTICAL SLICE DEFINITION

Contoh:

ATTENDANCE

harus meliputi:

UX

↓

Application

↓

Domain

↓

Database

↓

Authorization

↓

Testing

↓

Deployment

↓

Real user validation

bukan hanya membuat Attendance screen.

---

60. IMPLEMENTATION ORDER

Recommended sequence:

1. Foundation
2. Identity
3. Context
4. Authorization
5. School
6. Academic Year
7. Class
8. Person / Student
9. Enrollment
10. Class Workspace
11. Attendance
12. Student Workspace
13. Observation
14. Development
15. Evidence
16. Communication
17. Leadership Review
18. Hardening
19. Pilot

---

61. WHY THIS ORDER

Karena dependency:

Identity

↓

Context

↓

Authorization

↓

Canonical Entities

↓

Operational Workflows

↓

Projection

Jika dibalik, technical debt akan meningkat.

---

62. IMPLEMENTATION BACKLOG STRUCTURE

Setiap work item sebaiknya memiliki:

Purpose

Actor

Context

Entity

Action

Expected outcome

Acceptance criteria

Technical dependency

Security consideration

Test requirement

---

63. EXAMPLE WORK ITEM

Record Attendance

Purpose:

Teacher records today's attendance.

Actor:

Teacher

Context:

School + Academic Year + Class

Entity:

Student

Action:

Record Attendance

Outcome:

Attendance persisted.

Security:

Teacher can only record attendance in authorized class.

Test:

Authorized and unauthorized cases.

---

64. TECHNICAL ADR CHECKPOINTS

ADR diperlukan jika implementation akan memutuskan:

Authentication provider

Database provider

Hosting model

Tenancy strategy

Offline architecture

Storage provider

Notification infrastructure

Major integration pattern

Search architecture

---

65. NO ADR FOR TRIVIAL DECISIONS

Tidak semua keputusan membutuhkan ADR.

ADR digunakan untuk keputusan yang:

- significant;
- cross-cutting;
- costly to reverse;
- architectural;
- atau berpotensi memengaruhi future direction.

---

66. SECURITY IMPLEMENTATION GATE

Sebelum pilot:

Authentication verified.

Authorization verified.

Cross-context access tested.

Sensitive data access tested.

Secrets protected.

Storage protected.

Auditability reviewed.

Error leakage reviewed.

---

67. PRIVACY IMPLEMENTATION GATE

Verify:

Student information access.

Guardian visibility.

Teacher visibility.

Leadership visibility.

Evidence access.

Communication visibility.

Data export behavior.

---

68. OBSERVABILITY IMPLEMENTATION GATE

System harus dapat menjawab:

Apakah login gagal?

Apakah attendance gagal?

Apakah observation gagal?

Apakah database error?

Apakah external service error?

Apakah deployment sehat?

---

69. DEPLOYMENT GATE

Production deployment harus memiliki:

Repeatable build

Migration procedure

Environment configuration

Secret management

Rollback / recovery plan

Backup

Monitoring

---

70. PILOT SUPPORT

Pilot membutuhkan support mechanism.

Minimal:

Issue reporting

Severity classification

Response ownership

Known issues

Workaround

Resolution tracking

---

71. INCIDENT LEVEL

Simple initial model:

P0 — Critical / school cannot operate

P1 — Major workflow broken

P2 — Important issue with workaround

P3 — Minor issue / improvement

---

72. PILOT FEEDBACK

Feedback dikumpulkan dari:

Teacher

Administration

Leadership

Guardian

Technical support

Bukan hanya dari product owner.

---

73. FEEDBACK CATEGORIES

Pisahkan:

Bug

Usability problem

Missing capability

Workflow mismatch

Training problem

Data problem

Policy problem

Technical limitation

Feature request

---

74. IMPORTANT RULE

Feature request tidak otomatis masuk backlog.

Pertanyaan:

Does this solve a recurring problem?

Does it align with operating model?

Does it improve the core loop?

Is it needed by multiple users?

Does it create unnecessary complexity?

---

75. PILOT METRICS

Initial metrics:

Task completion

Task time

Error rate

Support requests

Repeated manual work

User adoption

Workflow frequency

Data completeness

User trust

---

76. SUCCESS SIGNALS

Positive signals:

Teacher voluntarily uses system.

Teacher stops maintaining duplicate records.

Student information becomes easier to find.

Leadership gains useful visibility.

Guardian communication becomes clearer.

School requests expansion based on actual use.

---

77. FAILURE SIGNALS

Warning signs:

Users bypass system.

Users keep parallel spreadsheets because system cannot be trusted.

Teacher needs excessive clicks.

Information cannot be found.

Users cannot understand context.

Authorization causes uncertainty.

System creates more work than it removes.

---

78. ARCHITECTURAL FEEDBACK LOOP

Pilot:

USE

↓

OBSERVE

↓

MEASURE

↓

INTERVIEW

↓

IDENTIFY PROBLEM

↓

DECIDE

↓

ADR / Architecture Update

↓

Product / UX Update

↓

Implementation

---

79. DO NOT PATCH EVERYTHING

Not every pilot problem should be solved with code.

Root cause may be:

UX

Operating model

Policy

Training

Data quality

Technical architecture

Organizational behavior

---

80. ARCHITECTURE REVIEW AFTER PILOT

Review:

What assumptions were correct?

What assumptions were wrong?

What workflows were unexpected?

Which domains became clearer?

Which data structures changed?

Which authorization boundaries changed?

Which technical decisions proved unnecessary?

Which infrastructure decisions proved insufficient?

---

81. PILOT EXIT CRITERIA

Pilot can move to next phase if:

Core workflows are used in real operations.

Critical authorization issues are resolved.

Data integrity is acceptable.

System reliability is acceptable.

User feedback demonstrates real value.

Architecture has been reviewed.

Major unresolved risks are understood.

---

82. POST-PILOT OPTIONS

After pilot:

Option A:

Iterate TK.

Option B:

Expand to additional TK schools.

Option C:

Extend School OS to SD.

Option D:

Strengthen platform foundation.

Option E:

Revisit architecture.

Tidak ada kewajiban langsung menuju scale.

---

83. SCALE PRINCIPLE

Scale only what has been validated.

Do not scale:

Assumptions.

Do not scale:

Unused features.

Do not scale:

Architectural complexity without evidence.

---

84. FUTURE SCHOOL EXPANSION

Once TK model is validated:

TK

↓

Compare with SD

↓

Identify common core

↓

Identify school-level variation

↓

Generalize only where justified

---

85. REUSABILITY PRINCIPLE

Reusable architecture should emerge from real repetition.

Jangan membuat abstraction hanya karena:

"It might be useful someday."

---

86. WHAT NOT TO BUILD DURING PILOT

Do not build merely because they are technically interesting:

Microservices

Complex event buses

AI platform

Advanced analytics platform

Enterprise data warehouse

Complex workflow engine

Offline synchronization framework

Advanced search infrastructure

Multi-region deployment

Full enterprise integration layer

---

87. PILOT BUILD PRIORITY

If resources are limited:

FIRST:

Identity

Context

Authorization

Student

Class

Attendance

Observation

Development

SECOND:

Guardian communication

Leadership review

Evidence

THIRD:

Advanced reporting

Automation

Intelligence

Integration

---

88. IMPLEMENTATION GOVERNANCE

Implementation follows:

Constitution

↓

Architecture

↓

ADR

↓

Implementation

↓

Testing

↓

Pilot Evidence

Implementation cannot silently override architectural principles.

---

89. CHANGE MANAGEMENT

Jika implementation menemukan kebutuhan baru:

1. Record the issue.
2. Determine impact.
3. Determine whether it is product, UX, or technical.
4. Update relevant document.
5. Create ADR if necessary.
6. Implement.
7. Validate.

---

90. DOCUMENT CHAIN

Current architecture chain:

YAPENDIK OS CONSTITUTION

↓

YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE

↓

YAPENDIK SCHOOL OS OPERATING MODEL

↓

YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT

↓

YAPENDIK SCHOOL OS UX ARCHITECTURE

↓

YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE

↓

YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT

↓

BUILD

---

91. IMMEDIATE NEXT STEPS

Setelah dokumen ini, jangan langsung membuat seluruh backlog.

Langkah praktis berikutnya:

1. Tentukan pilot TK yang akan digunakan sebagai reference school.
2. Validasi actual daily workflows.
3. Validasi actors dan responsibilities.
4. Validasi canonical entities.
5. Validasi Teacher → Class → Student workflow.
6. Validasi Attendance workflow.
7. Validasi Observation workflow.
8. Identifikasi data yang benar-benar tersedia.
9. Identifikasi privacy / authorization requirements.
10. Baru susun implementation backlog.

---

92. FIRST VERTICAL SLICE

Recommended first real build:

Teacher

↓

Login

↓

School Context

↓

Academic Year

↓

Class

↓

Student List

↓

Attendance

↓

Save

↓

Review

Ini adalah vertical slice pertama.

Jika vertical slice ini belum terasa natural, jangan buru-buru membangun feature berikutnya.

---

93. SECOND VERTICAL SLICE

Teacher

↓

Class

↓

Student

↓

Observation

↓

Save

↓

Student Development Context

↓

Review

---

94. THIRD VERTICAL SLICE

Student

↓

Guardian

↓

Relevant Communication

↓

Response / Follow-up

---

95. FOURTH VERTICAL SLICE

School Leadership

↓

School

↓

Current Situation

↓

Review

↓

Follow-up

---

96. PILOT READINESS PRINCIPLE

Pilot-ready bukan berarti:

"semua sudah selesai."

Pilot-ready berarti:

> "Core workflow cukup reliable untuk digunakan di dunia nyata, sementara keterbatasan yang tersisa diketahui dan dapat dikelola."

---

97. IMPLEMENTATION SUCCESS

Implementation berhasil apabila:

Architecture dapat diwujudkan.

UX dapat digunakan.

Core workflow berjalan.

Data dapat dipercaya.

Access boundary aman.

System dapat dioperasikan.

School dapat menggunakannya.

Dan feedback dapat mengarahkan iteration berikutnya.

---

98. FINAL IMPLEMENTATION PRINCIPLE

> Build the smallest complete system that can teach us something real.

Bukan:

> Build the smallest system that can demonstrate a feature.

Perbedaannya penting.

Kita tidak sedang membuat prototype untuk dipresentasikan.

Kita sedang membangun **pilot operating system yang benar-benar digunakan**, lalu belajar darinya.

---

99. STATUS

YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION BLUEPRINT

Version: 0.1

Status:

LIVING — DISCOVERY

Scope:

TK Pilot

Authority:

Derived from YAPENDIK OS Constitution and architecture chain.

Implementation Philosophy:

Common Sense First

Future-Proof Without Premature Complexity

Primary Strategy:

Vertical Slice + Real School Validation

Primary First Slice:

Teacher → Class → Student → Attendance

Primary Second Slice:

Teacher → Student → Observation → Development

---

100. CLOSING PRINCIPLE

> We do not build the entire School OS before meeting a real school.

> We build enough of the School OS to serve a real school.

> We observe.

> We learn.

> We improve.

> Then we expand.

Dan prinsip akhirnya:

**Architecture gives us direction.  
Implementation gives us evidence.  
The school gives us truth.**