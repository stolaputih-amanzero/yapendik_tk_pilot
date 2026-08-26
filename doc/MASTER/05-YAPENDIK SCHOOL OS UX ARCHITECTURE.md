# YAPENDIK SCHOOL OS UX ARCHITECTURE

Version: 0.1  
Organization: Yayasan Pendidikan GPIB (Yapendik)  
System: Yapendik Operating System  
Product: School OS  
Pilot Context: TK / Early Childhood Education  
Document Type: UX Architecture  
Status: LIVING — DISCOVERY  
Derived From:
- YAPENDIK OPERATING SYSTEM CONSTITUTION
- YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
- YAPENDIK SCHOOL OS OPERATING MODEL
- YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT

Approach: Common Sense First  
Design Principle: Make It Simple. Keep It Future-Proof.

---

1. PURPOSE

YAPENDIK SCHOOL OS UX ARCHITECTURE mendefinisikan bagaimana manusia berinteraksi dengan School OS berdasarkan:

- siapa mereka;
- dalam context apa mereka bekerja;
- pekerjaan apa yang sedang dilakukan;
- informasi apa yang mereka butuhkan;
- keputusan apa yang perlu dibuat;
- dan action apa yang perlu dilakukan.

Dokumen ini menjadi jembatan:

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

UX Architecture bukan visual design.

UX Architecture bukan design system.

UX Architecture bukan kumpulan wireframe.

UX Architecture menentukan struktur pengalaman sebelum tampilan visual dibuat.

---

2. UX NORTH STAR

School OS harus membuat pekerjaan sekolah:

- lebih jelas;
- lebih cepat;
- lebih kontekstual;
- lebih mudah ditemukan;
- lebih sedikit repetitive;
- dan lebih sedikit mengganggu pekerjaan pendidikan.

North Star:

"People should be able to understand where they are, what they are looking at, what they can do, and why the action matters."

---

3. FUNDAMENTAL UX MODEL

Canonical interaction model:

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

Contoh:

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
Development
↓
Record Observation
↓
Student information is updated

Model ini menjadi dasar seluruh UX School OS.

---

4. UX PRINCIPLES

4.1 Context Before Interface

User harus mengetahui context sebelum berinteraksi dengan information.

System tidak boleh membuat user bertanya:

"Ini data sekolah yang mana?"

"Ini tahun ajaran yang mana?"

"Ini kelas yang mana?"

---

4.2 Work Before Navigation

Navigation harus membantu pekerjaan.

Bukan memaksa user memahami struktur internal aplikasi.

---

4.3 Context Before Feature

Feature harus muncul dalam context yang relevan.

---

4.4 Entity Before Transaction

Jika user sedang bekerja mengenai Student, Student harus menjadi anchor.

Transaction seperti attendance atau observation harus memiliki hubungan yang jelas dengan Student.

---

4.5 Action Near Information

Action yang relevan sebaiknya tersedia dekat dengan information yang sedang dilihat.

---

4.6 Minimum Interruption

Terutama untuk Teacher:

> The system should interrupt teaching as little as possible.

---

4.7 Progressive Disclosure

Tampilkan complexity hanya ketika dibutuhkan.

---

4.8 One Canonical Truth

Information canonical tidak boleh memiliki banyak versi yang tidak jelas.

---

4.9 Human Judgment First

System membantu judgment manusia.

System tidak mengambil alih professional judgment tanpa alasan dan governance yang jelas.

---

4.10 Simple Default

Cara paling umum menyelesaikan pekerjaan harus menjadi cara paling sederhana.

---

4.11 Mobile First

Mobile bukan versi kecil dari desktop.

Mobile adalah pengalaman utama untuk pekerjaan yang memang terjadi secara mobile.

---

4.12 Future-Proof Without Future Complexity

UX harus dapat berkembang tanpa membuat MVP menjadi kompleks.

---

5. ACTOR EXPERIENCE MODEL

School OS memiliki beberapa actor utama:

School Leadership
Teacher
Administration / Staff
Guardian
Student

Namun UX tidak boleh menggunakan satu experience untuk semuanya.

---

6. TEACHER EXPERIENCE

Teacher adalah primary operational user untuk TK Pilot.

Teacher biasanya bekerja berdasarkan:

Class
↓
Student
↓
Daily Work
↓
Observation
↓
Development

Teacher tidak seharusnya dipaksa berpindah melalui banyak module untuk menyelesaikan satu pekerjaan.

Primary UX objective:

> Make important educational work executable with minimum interruption.

---

7. ADMINISTRATION EXPERIENCE

Administration bekerja lebih banyak pada:

School
Academic Year
People
Enrollment
Class
Records
Communication
Operational workflows

Administration membutuhkan struktur dan completeness lebih tinggi dibanding Teacher.

Tetapi complexity harus tetap progressive.

---

8. SCHOOL LEADERSHIP EXPERIENCE

Leadership membutuhkan:

School context
↓
Overview
↓
Current situation
↓
Review
↓
Decision
↓
Follow-up

Leadership UX bukan sekadar dashboard.

Dashboard hanya projection dari information yang relevan terhadap decision.

---

9. GUARDIAN EXPERIENCE

Guardian adalah connected participant.

Guardian tidak boleh melihat internal School OS secara langsung.

Experience Guardian harus dimulai dari:

Student
↓
Relevant school information
↓
Action / response

Guardian tidak perlu memahami:

- internal school structure;
- administrative workflow;
- permission model;
- internal terminology.

---

10. STUDENT EXPERIENCE

Untuk TK Pilot, Student adalah:

Primary beneficiary

bukan:

Primary application operator.

UX harus memastikan student tetap menjadi pusat educational context tanpa memaksakan direct digital interaction.

---

11. CANONICAL CONTEXT MODEL

Primary context hierarchy:

YAPENDIK
↓
SCHOOL
↓
ACADEMIC YEAR
↓
CLASS
↓
STUDENT

Context dapat berubah berdasarkan workflow.

Tidak semua workflow harus menggunakan seluruh hierarchy.

---

12. CONTEXT RULE

User harus selalu memiliki answer terhadap:

WHERE AM I?

WHAT AM I LOOKING AT?

WHO / WHAT DOES THIS BELONG TO?

WHAT CAN I DO HERE?

Contoh:

Teacher
School A
Academic Year 2026/2027
Class TK A
Student B

lebih baik daripada:

Teacher
Student B

tanpa context.

---

13. CONTEXT TRANSITION

User dapat berpindah:

School → Academic Year

Academic Year → Class

Class → Student

Student → related information

Namun system harus menjaga context sebelumnya ketika relevan.

---

14. WORKSPACE MODEL

Workspace adalah ruang kerja berdasarkan context dan purpose.

Workspace bukan sekadar halaman.

Workspace harus menjawab:

> "What am I here to accomplish?"

Initial workspace candidates:

School Workspace
Class Workspace
Student Workspace

---

15. SCHOOL WORKSPACE

School Workspace adalah operational overview untuk:

School Leadership
Administration
authorized staff

Fokus:

- school identity;
- current academic context;
- people;
- classes;
- important operational information;
- relevant review.

---

16. CLASS WORKSPACE

Class Workspace menjadi operational workspace utama Teacher.

Conceptual structure:

CLASS
↓
Students
↓
Today's Work
↓
Learning
↓
Observation
↓
Development

Class Workspace kemungkinan menjadi salah satu pengalaman paling penting untuk TK Pilot.

---

17. STUDENT WORKSPACE

Student Workspace adalah canonical space untuk memahami seorang Student.

Conceptual structure:

STUDENT
├── Overview
├── Profile
├── Attendance
├── Learning
├── Development
├── Evidence
└── Communication

Tidak semua section harus tampil untuk setiap actor.

---

18. ENTITY MODEL

UX berpusat pada canonical entities.

Initial entities:

School
Person
Student
Guardian
Teacher
Staff
Academic Year
Class
Enrollment
Attendance
Learning Activity
Observation
Development
Evidence
Communication

Entity harus memiliki identity yang stabil.

---

19. ENTITY DETAIL PRINCIPLE

Ketika user membuka sebuah entity, user harus dapat memahami:

WHO / WHAT
↓
CURRENT CONTEXT
↓
IMPORTANT INFORMATION
↓
RELATED INFORMATION
↓
AVAILABLE ACTIONS

Detail view tidak boleh menjadi dumping ground seluruh data.

---

20. SECTION MODEL

Section digunakan untuk mengelompokkan information berdasarkan purpose.

Contoh Student:

Overview
Profile
Attendance
Learning
Development
Evidence
Communication

Section bukan otomatis menjadi navigation item.

---

21. OVERVIEW PRINCIPLE

Overview harus menjawab:

"What matters now?"

Bukan:

"Show me everything."

Overview adalah curated information.

---

22. ACTION MODEL

Action dikategorikan menjadi:

VIEW
CREATE
EDIT
RECORD
REVIEW
COMMUNICATE
FOLLOW-UP
APPROVE
ARCHIVE

Tidak semua actor memiliki semua action.

---

23. ACTION PRIORITY

Action yang paling sering dilakukan harus paling mudah ditemukan.

Contoh:

Teacher dalam Class Workspace:

Attendance
Observe
Record
Review

bukan:

Settings
Reports
Configuration

---

24. ACTION CONTEXT

Action harus memiliki context.

Contoh:

Record Observation

lebih baik daripada:

Add Data

Karena action menjelaskan pekerjaan sebenarnya.

---

25. ACTION CONFIRMATION

Tidak semua action membutuhkan confirmation.

Confirmation digunakan jika:

- destructive;
- irreversible;
- high-risk;
- materially affects other people.

Simple actions harus tetap simple.

---

26. WORKFLOW EXPERIENCE

UX mengikuti workflow:

Trigger
↓
Context
↓
Information
↓
Action
↓
Outcome
↓
Follow-up

Bukan:

Page
↓
Form
↓
Submit
↓
Success

---

27. FORM PRINCIPLE

Form hanya digunakan jika memang diperlukan.

Form harus:

- contextual;
- minimal;
- understandable;
- progressive;
- forgiving.

User tidak boleh diminta mengisi information yang sudah diketahui system.

---

28. QUICK ACTIONS

Quick actions digunakan untuk high-frequency work.

Contoh kemungkinan:

Attendance
Observation
Communication
Follow-up

Namun quick action hanya boleh dibuat jika benar-benar mempercepat workflow.

---

29. DAILY WORK EXPERIENCE

Untuk Teacher, UX utama kemungkinan bukan:

Dashboard.

Melainkan:

TODAY
↓
CLASS
↓
STUDENTS
↓
WORK

Conceptual experience:

Today's Class
↓
Attendance
↓
Activity
↓
Observe
↓
Record
↓
Review

Ini akan divalidasi dalam TK Pilot.

---

30. MOBILE-FIRST PRINCIPLE

Mobile experience harus mengoptimalkan:

- one-handed use;
- quick recognition;
- minimal typing;
- large enough touch targets;
- short workflows;
- immediate feedback;
- low cognitive load.

Mobile tidak boleh sekadar:

"desktop layout yang diperkecil."

---

31. MOBILE TEACHER EXPERIENCE

Teacher mungkin menggunakan device:

- sambil berdiri;
- berpindah;
- di dalam classroom;
- dengan perhatian terbagi;
- dalam waktu singkat.

Karena itu:

> Every unnecessary tap is a cost.

---

32. DESKTOP EXPERIENCE

Desktop lebih cocok untuk:

- setup;
- administration;
- bulk operations;
- review;
- reporting;
- configuration;
- school management.

Mobile dan desktop harus berbagi information model tetapi dapat memiliki interaction model berbeda.

---

33. RESPONSIVE PRINCIPLE

Responsive bukan berarti semua screen harus identik.

Principle:

Same truth
+
Same context
+
Different interaction optimization

---

34. NAVIGATION MODEL

Navigation belum ditetapkan sebagai final menu.

UX Architecture menggunakan:

GLOBAL
↓
CONTEXTUAL
↓
WORKSPACE
↓
ENTITY
↓
ACTION

Navigation harus mengikuti frequency dan responsibility.

---

35. GLOBAL NAVIGATION

Global navigation hanya berisi destinations yang:

- sering digunakan;
- lintas context;
- penting;
- stabil.

Jangan memasukkan semua capability.

---

36. CONTEXTUAL NAVIGATION

Setelah user memilih context, navigation dapat berubah.

Contoh:

School
↓
Academic Year
↓
Class

Setelah masuk Class, information dan actions yang relevan terhadap Class menjadi lebih prominent.

---

37. ENTITY NAVIGATION

Entity-related information harus tersedia dari entity itu sendiri.

Contoh:

Student
↓
Attendance
↓
Development
↓
Communication

Tidak perlu memaksa user mencari Student kembali melalui global menu.

---

38. NAVIGATION RULE

> Navigation should answer "Where can I go?"

Workspace should answer "What can I accomplish?"

Entity should answer "What am I working on?"

Action should answer "What can I do now?"

---

39. SEARCH

Search adalah secondary discovery mechanism.

Search tidak boleh menjadi pengganti information architecture yang buruk.

Search harus memahami context.

Contoh:

Teacher sedang di Class A.

Pencarian "Budi" seharusnya memprioritaskan Student Budi dalam Class A.

---

40. GLOBAL SEARCH

Global search dapat berkembang di masa depan.

Untuk MVP, search harus sederhana dan context-aware.

Tidak perlu membangun enterprise search engine pada tahap awal.

---

41. FILTER

Filter digunakan ketika collection menjadi terlalu besar.

Filter harus berdasarkan meaningful attributes.

Bukan sekadar menambah filter sebanyak mungkin.

---

42. SORTING

Default sorting harus mengikuti user intent.

Contoh:

Class:

Student order yang familiar bagi Teacher.

Attendance:

Today first.

Communication:

Most relevant / recent.

---

43. INFORMATION HIERARCHY

Setiap screen / workspace harus memiliki hierarchy:

PRIMARY
↓
SECONDARY
↓
SUPPORTING
↓
OPTIONAL

Primary information harus terlihat tanpa user melakukan extra interaction.

---

44. INFORMATION DENSITY

Teacher:

Low-to-medium density.

Administration:

Medium-to-high density.

Leadership:

High information density tetapi curated.

Guardian:

Low complexity.

Tidak semua actor membutuhkan informasi yang sama banyak.

---

45. NOTIFICATION PRINCIPLE

Notification harus menjawab:

Why am I being notified?

What happened?

What do I need to do?

By when?

Tidak semua event harus menjadi notification.

---

46. NOTIFICATION PRIORITY

Notification categories:

Informational
Action Required
Important
Urgent

System tidak boleh membanjiri user.

---

47. COMMUNICATION UX

Communication harus memiliki context.

Contoh:

Student
↓
Communication
↓
Guardian

lebih baik daripada:

Chat
↓
Random conversation

Communication yang berhubungan dengan Student harus dapat ditemukan dari Student context.

---

48. GUARDIAN COMMUNICATION BOUNDARY

Guardian hanya menerima:

- information yang memang ditujukan kepadanya;
- information yang berkaitan dengan Student;
- action yang perlu dilakukan;
- communication yang authorized.

Guardian tidak melihat internal notes atau internal workflow.

---

49. VISIBILITY MODEL

Conceptual visibility:

PUBLIC
↓
GUARDIAN
↓
SCHOOL
↓
ROLE / WORK CONTEXT
↓
RESTRICTED

Actual authorization rules akan ditentukan kemudian.

UX harus merefleksikan boundary tersebut.

---

50. PRIVACY UX

Privacy bukan hanya permission backend.

UX juga harus mencegah accidental disclosure.

Contoh:

Teacher tidak seharusnya melihat sensitive information Student lain jika tidak relevan terhadap pekerjaan.

Guardian tidak boleh melihat Student lain.

---

51. EMPTY STATES

Empty state harus menjawab:

What is missing?

Why is it missing?

What can I do?

Contoh:

"No observation recorded yet."

Kemudian:

"Record observation"

bukan hanya:

"No data."

---

52. LOADING STATES

Loading harus memberikan sense of progress.

Jangan membuat user tidak tahu apakah system:

- sedang bekerja;
- gagal;
- atau tidak melakukan apa-apa.

---

53. ERROR STATES

Error harus menjawab:

What happened?

What can I do now?

Will my information be lost?

Apakah action dapat dicoba kembali?

Error message tidak boleh menggunakan technical jargon jika user tidak membutuhkannya.

---

54. SUCCESS STATES

Success harus cukup jelas tetapi tidak mengganggu.

Contoh:

Observation recorded.

Tidak perlu modal besar untuk setiap successful action.

---

55. OFFLINE / CONNECTIVITY

Offline behavior belum menjadi architectural commitment pada dokumen ini.

Namun UX harus mempertimbangkan bahwa connectivity dapat tidak stabil.

Jika suatu workflow kelak mendukung offline:

User harus mengetahui:

- data tersimpan atau belum;
- sedang menunggu sync atau tidak;
- apakah action berhasil.

Jangan memberikan false confidence.

---

56. ACCESSIBILITY

School OS harus berorientasi pada broad usability.

Initial principles:

- readable;
- sufficient contrast;
- keyboard accessible where applicable;
- clear focus;
- meaningful labels;
- predictable interaction;
- touch-friendly controls;
- screen-reader-aware semantics.

Accessibility bukan tahap akhir.

---

57. LANGUAGE

Terminology harus mengikuti bahasa yang digunakan manusia di sekolah.

Jangan memaksakan technical terminology.

Contoh:

"Catat Observasi"

lebih baik daripada:

"Create Assessment Record"

jika itu memang istilah yang dipahami Teacher.

---

58. TERMINOLOGY GOVERNANCE

Setiap important term harus memiliki canonical meaning.

Contoh:

Student
Teacher
Guardian
Class
Observation
Development

Tidak boleh satu konsep memiliki banyak nama tanpa alasan.

---

59. UX FORMS OF COMPLEXITY

Complexity dibagi:

Level 1
Simple action

Level 2
Contextual workflow

Level 3
Advanced configuration

Level 4
Administrative / governance

User hanya melihat level yang relevan.

---

60. BULK OPERATIONS

Bulk operation terutama relevan untuk Administration.

Contoh:

- enrollment;
- class placement;
- records.

Teacher workflow harus tetap optimized untuk individual / class-level action.

---

61. CROSS-CONTEXT PROJECTIONS

Satu information dapat muncul dalam berbagai context.

Contoh Student:

Teacher view
↓
Class context

Guardian view
↓
Family context

Leadership view
↓
School context

Yapendik view
↓
Organization context

Projection bukan duplicate canonical data.

---

62. DASHBOARD PRINCIPLE

Dashboard adalah projection.

Bukan primary information architecture.

Model:

WORK
↓
INFORMATION
↓
CONTEXT
↓
DECISION
↓
DASHBOARD

Dashboard harus menjawab:

"What needs my attention?"

---

63. REVIEW EXPERIENCE

Review berbeda dengan monitoring.

Monitoring:

"What is happening?"

Review:

"What does it mean?"

Decision:

"What should we do?"

UX harus membedakan ketiganya.

---

64. STUDENT DEVELOPMENT UX

Development experience harus menjaga:

Observation
↓
Context
↓
Evidence
↓
Interpretation
↓
Follow-up

Jangan langsung:

Student
↓
Score

Development adalah contextual understanding.

---

65. OBSERVATION UX

Observation harus mudah dicatat.

Minimal conceptual information:

Who
When
Context
Observation
Optional evidence
Possible follow-up

Tidak semua observation membutuhkan lengthy form.

---

66. EVIDENCE UX

Evidence harus attached to purpose.

User harus mengetahui:

Evidence of what?

For whom?

In what context?

Evidence tidak boleh menjadi uncontrolled media dump.

---

67. TEACHER COGNITIVE LOAD

Teacher UX harus meminimalkan:

- repeated data entry;
- unnecessary navigation;
- excessive notifications;
- complex configuration;
- irrelevant information;
- long forms.

Prioritas:

> **Attention is a scarce resource.**

---

68. GUARDIAN COGNITIVE LOAD

Guardian UX harus meminimalkan:

- school jargon;
- internal terminology;
- complex menus;
- irrelevant information;
- repeated authentication friction where safely avoidable.

Guardian should understand the message immediately.

---

69. ADMINISTRATION COGNITIVE LOAD

Administration dapat menerima lebih banyak information density.

Tetapi system tetap harus:

- group related tasks;
- provide clear status;
- provide bulk operations where justified;
- avoid unnecessary duplication.

---

70. LEADERSHIP COGNITIVE LOAD

Leadership membutuhkan:

Signal
↓
Context
↓
Meaning
↓
Action

Bukan:

Thousands of rows
↓
"Good luck."

---

71. UX FOR TRUST

Trust dibangun melalui:

- predictable behavior;
- clear status;
- clear ownership;
- visible context;
- reliable information;
- understandable actions;
- transparent errors.

---

72. UX FOR INSTITUTIONAL MEMORY

Relevant information harus mudah ditemukan kembali.

User harus dapat menjawab:

What happened?

When?

Who recorded it?

For whom?

In what context?

What happened afterward?

---

73. PRODUCT EXPERIENCE BOUNDARY

UX tidak boleh mencoba menyelesaikan semua school problem.

Jika workflow tidak termasuk product boundary:

UX harus mengarahkan user dengan jelas atau menyatakan bahwa proses berada di luar School OS.

---

74. TK PILOT UX PRIORITY

Priority order:

1. Teacher daily work
2. Class context
3. Student context
4. Attendance
5. Observation
6. Development
7. Guardian communication
8. Administration
9. Leadership review

Ini adalah working priority dan harus divalidasi.

---

75. TK PILOT — PRIMARY EXPERIENCE

Potential canonical experience:

Teacher
↓
Today's Class
↓
Students
↓
Today's Work
↓
Attendance
↓
Learning
↓
Observe
↓
Development

Jika field discovery menemukan pola berbeda, model ini harus berubah.

---

76. TK PILOT VALIDATION

UX harus diuji terhadap real tasks.

Bukan hanya:

"Apakah UI terlihat bagus?"

Tetapi:

Can teacher find the class?

Can teacher find the student?

Can teacher record attendance quickly?

Can teacher record an observation without breaking teaching flow?

Can teacher understand previous observations?

Can teacher communicate relevant information?

Can leadership understand school condition?

---

77. UX VALIDATION METHOD

Observe:

1. Task completion
2. Time
3. Errors
4. Confusion
5. Navigation path
6. Repeated actions
7. Questions asked by user
8. Workarounds

User behavior lebih penting daripada user preference semata.

---

78. UX DISCOVERY RULE

Jika user mengatakan:

"I want a button here."

Kita tidak langsung menganggap itu requirement.

Kita bertanya:

What work are you trying to accomplish?

Mengapa?

Apa yang dilakukan sekarang?

Apa yang membuatnya sulit?

Baru kemudian kita menentukan UX solution.

---

79. UX ANTI-PATTERNS

Jangan membuat:

- menu berdasarkan database tables;
- dashboard sebagai starting point untuk semua actor;
- one-size-fits-all interface;
- excessive modal usage;
- giant forms;
- duplicate student records;
- generic "Add Data" actions;
- notification overload;
- hidden context;
- unnecessary configuration.

---

80. UX GOVERNANCE

Setiap major UX decision harus dapat ditelusuri:

Constitution principle
↓
Operating Model
↓
Product capability
↓
UX decision

Jika tidak ada alasan yang jelas:

> Decision harus dipertanyakan.

---

81. UX DECISION TEST

Sebelum UX decision dianggap valid:

Purpose
People
Context
Workflow
Information
Action
Trust
Simplicity
Future

Harus dapat dijelaskan.

---

82. UX ASSUMPTION REGISTER

Current assumptions:

Teacher is primary operational user.

Class is an important Teacher workspace.

Student is the primary educational entity.

Student Development is a core differentiating area.

Mobile is important for daily teacher work.

Guardian should have a simplified experience.

Dashboard should not be the center of the product.

Semua assumption di atas masih dapat berubah berdasarkan field validation.

---

83. OPEN UX QUESTIONS

1. Apakah Class benar-benar menjadi primary Teacher workspace?
2. Apakah Teacher bekerja lebih sering dari Class atau Student context?
3. Bagaimana Teacher melakukan observation dalam praktik?
4. Seberapa sering Teacher menggunakan mobile?
5. Apakah Guardian membutuhkan dedicated application experience?
6. Apa interaction yang paling sering dilakukan Administration?
7. Bagaimana Leadership sebenarnya melakukan review?
8. Apakah School membutuhkan unified inbox?
9. Apakah search diperlukan sejak MVP?
10. Bagaimana terminology yang benar menurut sekolah?

---

84. WHAT IS NOT DECIDED

Dokumen ini belum menetapkan:

- final navigation;
- exact screen list;
- wireframe;
- visual design;
- color;
- typography;
- component library;
- exact interaction animation;
- final permission matrix;
- database;
- API;
- infrastructure.

---

85. RELATIONSHIP TO TECHNICAL ARCHITECTURE

UX Architecture menghasilkan kebutuhan yang harus didukung Technical Architecture.

Contoh:

UX membutuhkan:

Context
→ technical system membutuhkan context resolution.

UX membutuhkan:

Canonical Student
→ technical system membutuhkan canonical identity.

UX membutuhkan:

Role-aware visibility
→ technical system membutuhkan authorization.

UX membutuhkan:

Reliable status
→ technical system membutuhkan transaction state.

UX membutuhkan:

Potential connectivity resilience
→ technical system harus mengevaluasi connectivity architecture.

Technical Architecture tidak boleh mendesain UX secara terpisah.

---

86. NEXT ARCHITECTURE LAYER

Setelah UX Architecture cukup tervalidasi:

YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE

Technical Architecture akan menjawab:

How does this system actually work?

Mencakup:

- application architecture;
- domain architecture;
- authentication;
- authorization;
- data architecture;
- API;
- storage;
- integration;
- infrastructure;
- observability;
- security;
- deployment.

---

87. COMPLETE ARCHITECTURAL CHAIN

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

---

88. GOVERNANCE STATUS

Status:

LIVING — DISCOVERY

Dokumen ini tidak frozen.

UX decisions dapat berubah apabila:

- real school behavior berbeda;
- workflow berubah;
- information model berubah;
- product boundary berubah;
- usability evidence menunjukkan masalah;
- atau constitutional principles berkembang.

---

89. UX NORTH STAR

School OS harus membuat user merasa:

> "Saya tahu di mana saya berada."

> "Saya tahu apa yang sedang saya kerjakan."

> "Saya tahu informasi apa yang penting."

> "Saya tahu apa yang bisa saya lakukan."

> "Saya tidak perlu melakukan pekerjaan yang tidak perlu."

---

90. CLOSING PRINCIPLE

> We do not design screens first.
>
> We design the experience of doing meaningful school work.

Dan:

> **The best School OS UX is not the one with the most elegant interface. It is the one that makes important school work feel natural.**

**YAPENDIK SCHOOL OS UX ARCHITECTURE**

**Status: LIVING — DISCOVERY**

**Next Layer: YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE**