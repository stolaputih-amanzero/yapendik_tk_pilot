# YAPENDIK SCHOOL OS TK PILOT API & APPLICATION CONTRACT

**Versi:** 0.1  
**Organisasi:** Yayasan Pendidikan GPIB (Yapendik)  
**Sistem:** Yapendik Operating System  
**Produk:** School OS  
**Pilot:** TK  
**Jenis Dokumen:** API & Application Contract  
**Status:** **LIVING — DESIGN BASELINE**  
**Pendekatan:** Common Sense First  
**Prinsip:** **Make It Simple. Keep It Future-Proof.**

---

# 1. TUJUAN

Dokumen ini mendefinisikan kontrak antara:

```text
USER
  ↓
APPLICATION
  ↓
APPLICATION DOMAIN
  ↓
API / SERVER CONTRACT
  ↓
DATABASE
```

API & Application Contract menjawab:

> **Bagaimana School OS menjalankan pekerjaan pengguna terhadap informasi canonical tanpa mengekspos database secara langsung?**

Dokumen ini menjadi jembatan antara:

```text
DATABASE BLUEPRINT
```

dan:

```text
APPLICATION IMPLEMENTATION
```

---

# 2. POSISI DOKUMEN

Architecture chain sekarang:

```text
YAPENDIK OS CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
SCHOOL OS OPERATING MODEL
        ↓
PRODUCT BLUEPRINT — TK PILOT
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
VALIDATED DOMAIN MODEL
        ↓
DATABASE BLUEPRINT
        ↓
★ API & APPLICATION CONTRACT ★
        ↓
IMPLEMENTATION
```

Dokumen ini **belum** merupakan daftar endpoint final atau OpenAPI specification.

---

# 3. CORE PRINCIPLE

> **API follows work and domain, not database tables.**

Karena itu:

```text
GET /students
POST /observations
```

bukan otomatis menjadi desain utama hanya karena terdapat tabel:

```text
students
observations
```

API harus merepresentasikan:

```text
Intent
+
Context
+
Authorization
+
Business Rule
+
Result
```

---

# 4. APPLICATION NORTH STAR

School OS harus terasa seperti:

> **workspace untuk menyelesaikan pekerjaan sekolah**

bukan:

> **database management interface**

User tidak seharusnya berpikir:

```text
Saya harus update table class_placements.
```

User berpikir:

```text
Saya mau menempatkan siswa ke kelas.
```

Application menerjemahkan intent tersebut ke domain operation.

---

# 5. APPLICATION ARCHITECTURE

Working architecture:

```text
┌──────────────────────────────┐
│          EXPERIENCE          │
│                              │
│ Teacher / Guardian / Admin   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        APPLICATION UI        │
│                              │
│ Pages / Workspace / Forms    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       APPLICATION LAYER      │
│                              │
│ Use Cases / Actions          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          DOMAIN LAYER        │
│                              │
│ Rules / Entities / Policies  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       DATA ACCESS LAYER      │
│                              │
│ Repository / Queries         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           DATABASE           │
└──────────────────────────────┘
```

---

# 6. MODULAR MONOLITH

TK Pilot menggunakan:

> **Modular Monolith**

bukan microservices.

Conceptual structure:

```text
school-os/
│
├── auth/
├── school/
├── people/
├── students/
├── academic/
├── attendance/
├── learning/
├── observation/
├── development/
├── evidence/
├── communication/
├── review/
└── governance/
```

Module boundary harus mengikuti domain.

---

# 7. API BOUNDARY

API menjadi controlled boundary antara application dan backend.

```text
Client
  ↓
API / Server Action
  ↓
Authentication
  ↓
Authorization
  ↓
Context Resolution
  ↓
Use Case
  ↓
Domain Rules
  ↓
Repository
  ↓
Database
```

Client tidak boleh:

```text
Client
 ↓
Direct unrestricted database
```

---

# 8. API PRINCIPLE

Setiap operation harus dapat menjawab:

```text
WHO?
WHAT?
WHERE?
WHY?
WHEN?
```

Contoh:

```text
Teacher
creates
Observation
for
Student X
within
Class TK A
```

bukan hanya:

```text
INSERT INTO observations
```

---

# 9. API CONTEXT

Context adalah bagian dari contract.

Contoh:

```text
school_id
academic_year_id
class_id
student_id
```

tidak boleh dianggap sekadar metadata.

Context menentukan:

- scope;
- authorization;
- data visibility;
- business validity.

---

# 10. CONTEXT RESOLUTION

Application harus mampu menentukan:

```text
Current User
       ↓
Role
       ↓
School
       ↓
Academic Context
       ↓
Class / Student
```

Context tidak boleh hanya dipercaya dari client payload.

Contoh:

```text
school_id = school-B
```

dari browser tidak berarti user boleh mengakses School B.

Server harus resolve dan validate context.

---

# 11. AUTHORIZATION PIPELINE

Setiap protected operation:

```text
Request
  ↓
Authenticate
  ↓
Identify Actor
  ↓
Resolve Context
  ↓
Check Role
  ↓
Check Relationship
  ↓
Check Action
  ↓
Execute Use Case
```

Authorization Model sebelumnya menjadi source of truth untuk layer ini.

---

# 12. APPLICATION ACTOR MODEL

Initial actors:

```text
Yapendik
School Leadership
Teacher
Guardian
Staff
System
```

Tidak semua actor mendapatkan API surface yang sama.

---

# 13. API CONTRACT LAYERS

API dibagi secara konseptual:

### Layer 1 — Identity

```text
authentication
session
profile
```

### Layer 2 — Context

```text
school
academic year
class
```

### Layer 3 — People

```text
people
teachers
guardians
staff
```

### Layer 4 — Student

```text
student
enrollment
placement
```

### Layer 5 — Daily Work

```text
attendance
learning
observation
```

### Layer 6 — Communication

```text
messages
notifications
```

### Layer 7 — Review

```text
development
review
reports
```

---

# 14. API STYLE

Untuk TK Pilot:

> **Use-case oriented application contracts**

bukan pure CRUD.

Contoh:

```text
createStudent()
enrollStudent()
placeStudent()
recordAttendance()
createObservation()
recordDevelopment()
sendCommunication()
```

lebih bermakna daripada:

```text
insertStudent()
insertEnrollment()
updatePlacement()
insertObservation()
```

---

# 15. READ CONTRACT

Read operation boleh menggunakan query/projection yang sesuai dengan workspace.

Contoh:

```text
getMyClass()
getClassStudents()
getStudentProfile()
getStudentTimeline()
getTodayAttendance()
getStudentObservations()
```

Read API boleh mengembalikan projection yang telah disusun untuk kebutuhan UI.

---

# 16. WRITE CONTRACT

Write operation harus menggunakan intent yang eksplisit.

Contoh:

```text
createStudent
recordAttendance
createObservation
updateClassPlacement
```

bukan:

```text
updateStudentRow
updateObservationRow
```

---

# 17. COMMAND PRINCIPLE

Write operation dianggap sebagai **command**.

Format konseptual:

```text
Command
{
    actor
    context
    intent
    input
}
```

Kemudian:

```text
validate
→ authorize
→ execute
→ persist
→ audit
→ return result
```

---

# 18. RESPONSE PRINCIPLE

Application tidak mengembalikan raw database record jika tidak diperlukan.

Contoh:

```text
Student Profile
```

boleh berupa:

```text
{
  identity,
  currentClass,
  guardians,
  attendanceSummary,
  recentObservations
}
```

daripada mengembalikan seluruh relational structure.

---

# 19. APPLICATION DTO

DTO digunakan untuk menentukan boundary.

Contoh conceptual:

```text
StudentSummary
StudentProfile
ClassSummary
ObservationSummary
AttendanceSummary
```

DTO tidak harus identik dengan database entity.

---

# 20. DATABASE ENTITY ≠ API MODEL

Contoh:

```text
Database:
student
person
enrollment
class_placement
```

Application:

```text
StudentProfile
```

Satu application model dapat berasal dari beberapa database entities.

---

# 21. API CONTRACT — AUTHENTICATION

Initial operations:

```text
signIn()
signOut()
getCurrentSession()
getCurrentUser()
```

Authentication mechanism belum dikunci oleh dokumen ini.

Namun:

> Authentication dan Authorization adalah dua concern berbeda.

---

# 22. SESSION CONTRACT

Session harus memberikan minimal:

```text
actor identity
authentication status
authorized context
roles / capabilities
```

Client tidak boleh menentukan sendiri authorization state.

---

# 23. API CONTRACT — SCHOOL

### Read

```text
getSchool()
getSchoolSummary()
```

### Admin operations

```text
updateSchoolProfile()
```

Hanya actor yang memiliki capability sesuai Authorization Model.

---

# 24. API CONTRACT — ACADEMIC YEAR

### Read

```text
listAcademicYears()
getCurrentAcademicYear()
getAcademicYear()
```

### Write

```text
createAcademicYear()
updateAcademicYear()
activateAcademicYear()
archiveAcademicYear()
```

Lifecycle transition harus divalidasi.

---

# 25. API CONTRACT — CLASS

### Read

```text
listClasses()
getClass()
getClassStudents()
getClassTeachers()
getClassSummary()
```

### Write

```text
createClass()
updateClass()
assignTeacher()
removeTeacherAssignment()
```

---

# 26. API CONTRACT — PEOPLE

### Read

```text
getPerson()
searchPeople()
```

### Write

```text
createPerson()
updatePerson()
```

Tidak semua actor boleh melakukan search global.

Search harus dibatasi oleh authorization context.

---

# 27. API CONTRACT — STUDENT

### Read

```text
getStudent()
getStudentProfile()
searchStudents()
```

### Write

```text
createStudent()
updateStudent()
```

Student creation tidak otomatis berarti enrollment.

---

# 28. STUDENT CREATION

Conceptual workflow:

```text
Create Student
     ↓
Create / Resolve Person
     ↓
Create Student Identity
     ↓
Validate
     ↓
Persist
     ↓
Return Student Profile
```

Jika workflow sekolah mengharuskan enrollment sekaligus, application dapat menyediakan:

```text
registerStudent()
```

yang merupakan higher-level use case.

---

# 29. REGISTER STUDENT

Potential application contract:

```text
registerStudent({
    person,
    enrollment,
    initialPlacement?
})
```

Server:

```text
validate identity
validate school
validate academic year
validate placement
authorize actor
create records
audit
return result
```

Ini lebih aman daripada tiga independent client mutations yang harus dirangkai manual.

---

# 30. API CONTRACT — ENROLLMENT

### Read

```text
getStudentEnrollment()
listEnrollments()
```

### Write

```text
enrollStudent()
updateEnrollment()
withdrawStudent()
```

Status transition harus governed.

---

# 31. API CONTRACT — CLASS PLACEMENT

### Read

```text
getStudentPlacement()
getClassStudents()
getPlacementHistory()
```

### Write

```text
placeStudent()
changeStudentPlacement()
endStudentPlacement()
```

Historical placement tidak boleh hilang tanpa alasan governance.

---

# 32. API CONTRACT — TEACHER ASSIGNMENT

### Read

```text
getTeacherAssignments()
getClassTeachers()
getMyClasses()
```

### Write

```text
assignTeacherToClass()
endTeacherAssignment()
```

---

# 33. API CONTRACT — GUARDIAN

### Read

```text
getMyChildren()
getChildProfile()
```

### Write

Hanya action yang memang diperbolehkan Guardian.

Contoh:

```text
respondToCommunication()
acknowledgeNotice()
```

Guardian tidak boleh mengubah internal student records hanya karena memiliki relationship.

---

# 34. API CONTRACT — ATTENDANCE

### Read

```text
getTodayAttendance()
getClassAttendance()
getStudentAttendance()
getAttendanceSummary()
```

### Write

```text
recordAttendance()
updateAttendance()
```

---

# 35. RECORD ATTENDANCE

Contract:

```text
recordAttendance({
    student_id,
    attendance_date,
    status,
    note?
})
```

Server menentukan:

```text
school
class
academic_year
actor
```

berdasarkan context.

Jangan mempercayai seluruh context dari client.

---

# 36. BULK ATTENDANCE

Teacher workflow kemungkinan membutuhkan:

```text
recordClassAttendance({
    class_id,
    date,
    entries[]
})
```

Contoh:

```text
entries:
[
  { student_id, status },
  { student_id, status },
  ...
]
```

Bulk command harus:

```text
validate all
authorize
execute atomically where appropriate
return per-entry result
```

---

# 37. API CONTRACT — LEARNING

### Read

```text
getClassActivities()
getLearningActivity()
```

### Write

```text
createLearningActivity()
updateLearningActivity()
recordParticipation()
```

---

# 38. CREATE LEARNING ACTIVITY

Conceptual:

```text
createLearningActivity({
    class_id,
    title,
    description?,
    activity_date
})
```

Server resolves:

```text
school
academic_year
actor
```

dan memvalidasi teacher assignment.

---

# 39. API CONTRACT — OBSERVATION

### Read

```text
getStudentObservations()
getObservation()
getRecentObservations()
```

### Write

```text
createObservation()
updateObservation()
archiveObservation()
```

Observation access harus lebih restrictive daripada generic Student profile.

---

# 40. CREATE OBSERVATION

Contract:

```text
createObservation({
    student_id,
    observation_date,
    context,
    content,
    follow_up?
})
```

Server menentukan:

```text
actor
school
academic_year
class
```

dan melakukan authorization.

---

# 41. OBSERVATION PRIVACY

Observation tidak boleh otomatis muncul kepada:

```text
Guardian
Other Teacher
Public
```

Visibility harus ditentukan oleh information policy.

---

# 42. API CONTRACT — DEVELOPMENT

### Read

```text
getStudentDevelopment()
getDevelopmentHistory()
```

### Write

```text
createDevelopmentRecord()
updateDevelopmentRecord()
```

Development record adalah controlled educational information.

---

# 43. DEVELOPMENT PRINCIPLE

Jangan mengunci API menjadi:

```text
submitScore()
```

sebelum model development TK benar-benar tervalidasi.

Gunakan:

```text
recordDevelopment()
```

yang lebih future-proof.

---

# 44. API CONTRACT — EVIDENCE

### Read

```text
getEvidence()
```

### Write

```text
createEvidence()
uploadEvidence()
deleteEvidence()
```

Namun binary upload sebaiknya menggunakan dedicated storage flow.

Application hanya mengatur:

```text
authorization
metadata
relationship
storage reference
```

---

# 45. FILE UPLOAD FLOW

```text
User
 ↓
Request Upload Permission
 ↓
Authorize
 ↓
Generate Controlled Upload
 ↓
Object Storage
 ↓
Confirm Upload
 ↓
Create Evidence Metadata
 ↓
Audit
```

Tidak:

```text
Browser
 ↓
Database binary
```

---

# 46. API CONTRACT — COMMUNICATION

### Read

```text
getCommunications()
getCommunication()
```

### Write

```text
createCommunication()
sendCommunication()
acknowledgeCommunication()
respondToCommunication()
```

---

# 47. COMMUNICATION CONTEXT

Communication harus mempunyai context.

Contoh:

```text
School
Class
Student
Activity
Announcement
```

Jangan membuat communication global secara default.

---

# 48. API CONTRACT — REVIEW

### Read

```text
getReviews()
getReview()
```

### Write

```text
createReview()
updateReview()
```

Review adalah human governance layer.

---

# 49. API CONTRACT — DASHBOARD

Dashboard bukan database entity.

Contoh:

```text
getTeacherDashboard()
getSchoolDashboard()
getGuardianDashboard()
```

Response adalah projection.

---

# 50. TEACHER DASHBOARD

Conceptual response:

```text
TeacherDashboard
{
    today,
    myClasses,
    attendance,
    pendingWork,
    recentObservations,
    communications
}
```

Bukan:

```text
all tables
```

---

# 51. GUARDIAN DASHBOARD

Conceptual:

```text
GuardianDashboard
{
    children,
    attendance,
    schoolUpdates,
    relevantActivities,
    communications
}
```

Internal school information tidak ikut terproyeksi.

---

# 52. SCHOOL DASHBOARD

Conceptual:

```text
SchoolDashboard
{
    students,
    classes,
    attendance,
    teacherActivity,
    pendingReviews,
    operationalAlerts
}
```

Exact metrics belum frozen.

---

# 53. API ERROR CONTRACT

Semua application errors harus konsisten.

Conceptual:

```text
{
    code,
    message,
    details?,
    request_id?
}
```

---

# 54. ERROR CATEGORIES

Minimum:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
NOT_FOUND
CONFLICT
CONTEXT_ERROR
BUSINESS_RULE_ERROR
SYSTEM_ERROR
```

---

# 55. AUTHORIZATION ERROR

Jangan membocorkan informasi sensitif.

Contoh jangan:

```text
"You cannot access Student #123 because Teacher B owns that class."
```

Gunakan:

```text
ACCESS_DENIED
```

atau equivalent yang tidak membocorkan internal structure.

---

# 56. VALIDATION ERROR

Contoh:

```text
{
    code: "VALIDATION_ERROR",
    fields: {
        attendance_date: "Tanggal wajib diisi"
    }
}
```

Validation harus konsisten antara:

```text
UI
Application
Domain
Database
```

---

# 57. CONFLICT ERROR

Contoh:

```text
Two actors
attempt
conflicting class placement
```

Response:

```text
CONFLICT
```

Application harus memberikan recovery path.

---

# 58. REQUEST ID

Setiap mutation sebaiknya memiliki:

```text
request_id
```

untuk:

- tracing;
- debugging;
- audit;
- idempotency bila diperlukan.

---

# 59. IDEMPOTENCY

Operations yang dapat diulang tanpa membuat duplicate harus memiliki strategy.

Contoh:

```text
recordAttendance
registerStudent
sendCommunication
```

Exact idempotency mechanism mengikuti Technical Architecture implementation.

---

# 60. TRANSACTION PRINCIPLE

Use case menentukan transaction boundary.

Contoh:

```text
registerStudent()
```

dapat:

```text
Person
+
Student
+
Enrollment
```

dalam satu transaction jika business rule mengharuskan.

---

# 61. SERVICE LAYER

Application service:

```text
StudentService
AttendanceService
ObservationService
CommunicationService
```

bertugas mengorkestrasi use case.

Bukan tempat untuk:

```text
massive generic helper functions
```

---

# 62. DOMAIN SERVICE

Domain service digunakan hanya jika rule memang lintas entity.

Contoh:

```text
PlacementPolicy
EnrollmentPolicy
ObservationAccessPolicy
```

Jangan membuat service untuk setiap table.

---

# 63. REPOSITORY

Repository menjadi abstraction untuk data access.

Contoh:

```text
StudentRepository
ClassRepository
ObservationRepository
AttendanceRepository
```

Repository tidak boleh menjadi tempat business workflow utama.

---

# 64. QUERY VS COMMAND

### Query

Tidak mengubah state.

```text
getStudentProfile()
getClassStudents()
```

### Command

Mengubah state.

```text
createObservation()
recordAttendance()
placeStudent()
```

Pemisahan ini membuat behavior application lebih mudah dipahami.

---

# 65. UI → APPLICATION CONTRACT

UI tidak boleh mengetahui detail database.

Contoh:

```text
ObservationForm
      ↓
createObservation()
```

bukan:

```text
ObservationForm
      ↓
INSERT observations
```

---

# 66. FORM CONTRACT

Form harus menangani:

```text
input
validation feedback
submission state
success
error
retry
```

Tidak menangani:

```text
authorization
database transaction
```

---

# 67. SERVER ACTION / API ROUTE

Implementation dapat menggunakan:

```text
Server Actions
```

dan/atau:

```text
API Routes
```

sesuai kebutuhan.

Yang penting:

> Contract tetap domain-oriented.

Teknologi dapat berubah tanpa mengubah domain contract.

---

# 68. EXTERNAL API

TK Pilot tidak membutuhkan public API.

Default:

> Internal application API.

Public API hanya dibangun jika ada real consumer.

---

# 69. INTEGRATION CONTRACT

Future integrations dapat menggunakan controlled adapter:

```text
School OS
   ↓
Integration Adapter
   ↓
External System
```

Jangan membuat domain bergantung langsung pada external provider.

---

# 70. NOTIFICATION

Notification bukan core domain record.

Model:

```text
Domain Event / Action
       ↓
Notification Service
       ↓
Channel
```

Channel dapat berupa:

```text
In-App
Email
WhatsApp
```

namun provider belum dikunci.

---

# 71. DOMAIN EVENT

Gunakan event secara sederhana.

Contoh conceptual:

```text
StudentRegistered
AttendanceRecorded
ObservationCreated
CommunicationSent
```

Event digunakan bila ada downstream behavior.

Jangan membangun event-driven architecture penuh untuk TK Pilot.

---

# 72. APPLICATION LOGGING

Application harus mencatat:

```text
request_id
actor
operation
context
result
duration
error
```

Tanpa mencatat sensitive payload secara sembarangan.

---

# 73. SECURITY LOGGING

Security events:

```text
login failure
authorization failure
suspicious access
privilege changes
sensitive operation
```

harus dapat ditelusuri.

---

# 74. DATA MINIMIZATION

API response hanya mengembalikan data yang diperlukan.

Contoh:

Teacher melihat class list:

```text
name
student number
attendance state
```

tidak otomatis:

```text
guardian phone
internal observation
full personal profile
```

---

# 75. API FIELD EXPOSURE

Setiap field perlu menjawab:

```text
Who needs it?
Why?
For what action?
```

Jika tidak ada jawaban:

> Jangan expose.

---

# 76. PAGINATION

Collection API harus mendukung pagination jika potentially large.

Contoh:

```text
listStudents({
    page,
    limit,
    search?
})
```

Exact mechanism dapat berkembang.

---

# 77. FILTERING

Filter harus berasal dari workflow.

Contoh:

```text
getClassStudents()
```

lebih bermakna daripada:

```text
listStudents({
   arbitraryFilter: ...
})
```

---

# 78. SORTING

Default sorting harus mengikuti user need.

Contoh:

```text
Class students
→ alphabetical
```

atau:

```text
Attendance
→ roster order
```

bukan arbitrary database order.

---

# 79. SEARCH

Search application:

```text
searchStudents()
searchPeople()
```

harus tetap context-aware.

Teacher tidak mendapatkan global search seluruh Yapendik secara otomatis.

---

# 80. CACHE PRINCIPLE

Caching bukan default architecture requirement.

Prioritas:

```text
Correctness
>
Security
>
Simplicity
>
Performance
```

Cache hanya ketika workload membuktikan kebutuhan.

---

# 81. OFFLINE

TK Pilot saat ini:

> **Online-First**

Offline-first bukan bagian dari core application contract saat ini.

Jika kebutuhan berubah, offline capability harus ditambahkan melalui explicit architecture decision.

---

# 82. RETRY

Read:

```text
safe retry
```

Write:

```text
retry only with idempotency consideration
```

Terutama:

```text
sendCommunication()
recordAttendance()
registerStudent()
```

---

# 83. CONCURRENCY

Application harus menangani kemungkinan:

```text
User A updates
User B updates
```

Exact optimistic locking/versioning dapat ditambahkan jika pilot menemukan kebutuhan.

---

# 84. DOMAIN VALIDATION

Contoh:

```text
Teacher can record attendance
```

tidak cukup hanya:

```text
role == teacher
```

Harus:

```text
role == teacher
AND
assigned to relevant class
AND
class belongs to school
AND
date is valid
```

---

# 85. STUDENT ACCESS RULE

Student profile access:

```text
Teacher
   ↓
Assigned Class
   ↓
Student
```

Guardian:

```text
Guardian Relationship
   ↓
Student
```

School leadership:

```text
School Scope
   ↓
Student
```

Yapendik:

```text
Governed Projection
```

---

# 86. OBSERVATION ACCESS RULE

Observation access lebih ketat:

```text
Teacher
   ↓
Relevant Student
   ↓
Authorized Observation Context
```

Guardian tidak otomatis mendapatkan raw observation.

---

# 87. APPLICATION POLICY OBJECTS

Potential policies:

```text
StudentAccessPolicy
ObservationAccessPolicy
AttendancePolicy
PlacementPolicy
CommunicationPolicy
```

Policy menjadi reusable authorization/business rule.

---

# 88. API VERSIONING

MVP dapat menggunakan:

```text
/v1
```

jika public-facing API diperlukan.

Namun internal Server Actions tidak harus memaksakan URL versioning.

Principle:

> Version contract when compatibility requires it.

---

# 89. BACKWARD COMPATIBILITY

API breaking change harus:

```text
identified
→ reviewed
→ migrated
→ tested
```

Tidak boleh mengubah contract secara diam-diam.

---

# 90. API DOCUMENTATION

Setiap public/internal significant contract harus mendokumentasikan:

```text
Purpose
Actor
Authorization
Input
Output
Errors
Side Effects
Audit
```

---

# 91. CONTRACT EXAMPLE — CREATE OBSERVATION

### Intent

Teacher mencatat observation.

### Actor

Teacher.

### Context

Assigned Class / Student.

### Input

```text
student_id
observation_date
context
content
follow_up?
```

### Server derives

```text
actor
school
academic_year
class
```

### Authorization

Teacher must have authorized relationship with Student.

### Result

```text
ObservationSummary
```

### Side effects

```text
audit event
```

---

# 92. CONTRACT EXAMPLE — RECORD ATTENDANCE

### Intent

Teacher mencatat kehadiran.

### Actor

Teacher.

### Input

```text
student_id
date
status
note?
```

### Server validates

```text
Student exists
Student belongs to relevant class
Teacher assigned
Date valid
Status valid
```

### Result

```text
AttendanceRecord
```

### Side effect

```text
audit
```

---

# 93. CONTRACT EXAMPLE — REGISTER STUDENT

### Intent

School mendaftarkan Student.

### Input

```text
person
student
enrollment
placement?
```

### Server:

```text
resolve identity
validate
authorize
create
audit
```

### Result:

```text
StudentProfile
```

---

# 94. CONTRACT EXAMPLE — PLACE STUDENT

### Intent

Menempatkan Student ke Class.

### Input

```text
student_id
class_id
start_date
```

### Server:

```text
resolve school
resolve academic year
validate enrollment
validate class
validate authorization
close previous placement if required
create new placement
audit
```

---

# 95. CONTRACT EXAMPLE — SEND COMMUNICATION

### Intent

Mengirim informasi kepada recipient.

### Input

```text
context
recipient
subject
content
```

### Server:

```text
validate recipient
validate communication permission
create communication
dispatch channel
record status
audit
```

---

# 96. APPLICATION STATE MODEL

Application state dibagi:

```text
Server State
UI State
Session State
Form State
```

Jangan mencampur semuanya ke satu global state store.

---

# 97. SERVER STATE

Contoh:

```text
Student
Class
Attendance
Observation
```

Source of truth:

> Backend.

---

# 98. UI STATE

Contoh:

```text
modal open
selected tab
filter open
form expanded
```

Tidak perlu disimpan di database.

---

# 99. FORM STATE

Contoh:

```text
draft observation
unsaved attendance
validation errors
```

Temporary.

---

# 100. SESSION STATE

Contoh:

```text
current user
current context
authorized capabilities
```

Harus tetap server-trustworthy.

---

# 101. APPLICATION NAVIGATION

Navigation mengikuti workspace:

```text
School Workspace
Class Workspace
Student Workspace
```

bukan database modules.

UX Architecture menetapkan Workspace sebagai unit utama navigasi dan melarang table-driven navigation. 

---

# 102. TEACHER WORKSPACE

Teacher utama:

```text
My Classes
   ↓
Class
   ↓
Students
   ↓
Student
```

Actions:

```text
Attendance
Observation
Learning Activity
Communication
```

---

# 103. GUARDIAN WORKSPACE

Guardian:

```text
My Children
   ↓
Child
   ↓
School Information
   ↓
Relevant Action
```

Bukan:

```text
School
 ↓
All students
```

---

# 104. SCHOOL LEADERSHIP WORKSPACE

School leadership:

```text
School
 ↓
Operational overview
 ↓
People
 ↓
Students
 ↓
Classes
 ↓
Attendance
 ↓
Review
```

---

# 105. APPLICATION INFORMATION FLOW

```text
Canonical Data
      ↓
Domain Service
      ↓
Workspace Projection
      ↓
UI
```

Bukan:

```text
Database
 ↓
Generic CRUD UI
```

---

# 106. API & UX CONTRACT

API harus menyediakan informasi yang dibutuhkan workspace.

Contoh:

Teacher Class Workspace membutuhkan:

```text
class identity
teacher identity
students
today attendance
pending observations
recent activities
```

Maka API:

```text
getTeacherClassWorkspace()
```

dapat menjadi projection yang valid.

Tidak perlu memaksa UI melakukan 12 database queries terpisah jika satu coherent use case memang lebih tepat.

---

# 107. BUT AVOID "GOD API"

Jangan membuat:

```text
getEverythingForDashboard()
```

yang mengembalikan seluruh database.

Projection harus:

```text
specific
bounded
purposeful
authorized
```

---

# 108. APPLICATION BOUNDARY

Business rules harus berada di server/domain layer.

Client:

```text
UX
validation assistance
presentation
```

Server:

```text
authorization
business rules
context
transactions
persistence
audit
```

---

# 109. DATABASE BOUNDARY

Repository/database layer:

```text
query
insert
update
transaction
```

Tidak menentukan:

```text
who is allowed
why action happens
workflow meaning
```

Business meaning berada di application/domain layer.

---

# 110. ERROR PROPAGATION

```text
Database Error
       ↓
Repository
       ↓
Domain/Application Error
       ↓
API Contract Error
       ↓
UI Message
```

Jangan expose raw SQL/database errors ke user.

---

# 111. OBSERVABILITY CONTRACT

Setiap request penting:

```text
request_id
actor_id
operation
context
duration
result
```

dapat ditelusuri.

Sensitive content tidak boleh masuk log secara default.

---

# 112. AUDIT CONTRACT

Mutation:

```text
Command
 ↓
Business Operation
 ↓
Audit Event
```

Audit tidak dilakukan hanya dari frontend.

---

# 113. TEST CONTRACT

Setiap significant use case harus memiliki:

### Unit test

Domain rules.

### Integration test

Application + database.

### Authorization test

Allowed / denied contexts.

### E2E test

Real user workflow.

---

# 114. CONTRACT TEST MATRIX

| Use Case | Auth | Context | Domain | DB | E2E |
|---|---:|---:|---:|---:|---:|
| Register Student | ✓ | ✓ | ✓ | ✓ | ✓ |
| Place Student | ✓ | ✓ | ✓ | ✓ | ✓ |
| Record Attendance | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Observation | ✓ | ✓ | ✓ | ✓ | ✓ |
| Send Communication | ✓ | ✓ | ✓ | ✓ | ✓ |
| Guardian View Child | ✓ | ✓ | ✓ | ✓ | ✓ |

---

# 115. IMPLEMENTATION STRUCTURE

Suggested:

```text
src/
│
├── app/
│
├── domains/
│   ├── school/
│   ├── people/
│   ├── student/
│   ├── academic/
│   ├── attendance/
│   ├── learning/
│   ├── observation/
│   ├── development/
│   ├── communication/
│   └── review/
│
├── application/
│   ├── commands/
│   ├── queries/
│   └── services/
│
├── infrastructure/
│   ├── database/
│   ├── storage/
│   └── integrations/
│
└── auth/
```

Exact folder structure remains implementation-level decision.

---

# 116. API CONTRACT DIRECTORY

Conceptual:

```text
contracts/
│
├── auth
├── school
├── people
├── student
├── academic
├── attendance
├── learning
├── observation
├── development
├── evidence
├── communication
└── review
```

---

# 117. API CONTRACT RULE

Contract names harus memakai **business language**.

Prefer:

```text
placeStudent
recordAttendance
createObservation
```

daripada:

```text
updateStudentClass
insertAttendanceRow
insertObservationRecord
```

---

# 118. COMMON LANGUAGE

Canonical terms:

```text
School
Person
Student
Teacher
Guardian
Academic Year
Class
Enrollment
Class Placement
Attendance
Learning Activity
Observation
Development
Evidence
Communication
Review
```

Istilah baru harus diperiksa terhadap Domain Model.

---

# 119. NO SYNONYM DRIFT

Jangan memakai:

```text
student
pupil
child
learner
```

secara bergantian jika semuanya menunjuk entity yang sama.

Canonical term:

> **Student**

Sedangkan:

> **Child**

dapat digunakan dalam Guardian UX jika secara natural, tetapi domain contract tetap harus konsisten.

---

# 120. APPLICATION CONTRACT GOVERNANCE

Jika business workflow berubah:

```text
Workflow
 ↓
Application Contract
 ↓
Domain Model
 ↓
Database
```

impact harus dianalisis.

Jika database berubah tanpa perubahan business meaning:

```text
Database
 ↓
Repository
```

tidak selalu membutuhkan perubahan API.

---

# 121. BREAKING CHANGE RULE

Breaking change dapat terjadi jika:

```text
input meaning changes
output meaning changes
authorization changes
workflow changes
```

Bukan hanya karena:

```text
table renamed
column renamed
```

---

# 122. API SECURITY PRINCIPLE

Security tidak boleh bergantung pada:

```text
hidden UI
disabled button
frontend route
```

Security boundary:

```text
Server
+
Application
+
Database
```

---

# 123. API PRIVACY PRINCIPLE

Response harus mengikuti:

```text
minimum necessary disclosure
```

Contoh Guardian:

```text
Child Attendance
```

boleh.

Tetapi:

```text
Other Student Attendance
```

tidak.

---

# 124. API PERFORMANCE PRINCIPLE

Jangan mengoptimalkan sebelum ada evidence.

Default:

```text
Simple query
+
proper index
+
bounded response
```

baru kemudian:

```text
cache
materialized view
queue
specialized search
```

jika diperlukan.

---

# 125. API FUTURE-PROOFING

Future-proof bukan berarti:

```text
build everything now
```

Future-proof berarti:

```text
clear boundaries
stable identities
domain contracts
replaceable infrastructure
explicit context
```

---

# 126. WHAT THE API MUST NOT KNOW

API application layer tidak boleh hard-code:

```text
specific school's current class names
specific teacher names
temporary operational assumptions
UI labels as business rules
```

---

# 127. WHAT THE API MUST KNOW

Application harus mengetahui:

```text
domain rules
authorization
context
valid state transitions
data relationships
```

---

# 128. MVP API SURFACE

Initial minimum:

```text
AUTH
 ├── getCurrentUser

SCHOOL
 └── getSchool

ACADEMIC
 ├── getCurrentAcademicYear
 ├── listClasses
 └── getClass

STUDENT
 ├── searchStudents
 ├── getStudentProfile
 ├── registerStudent
 └── placeStudent

ATTENDANCE
 ├── getClassAttendance
 └── recordAttendance

LEARNING
 ├── getClassActivities
 └── createLearningActivity

OBSERVATION
 ├── getStudentObservations
 └── createObservation
```

Ini cukup untuk membangun core TK workflow.

---

# 129. POST-MVP API SURFACE

Kemudian:

```text
DEVELOPMENT
EVIDENCE
COMMUNICATION
REVIEW
REPORTING
```

dengan prioritas berdasarkan hasil pilot.

---

# 130. API READINESS GATE

Sebelum implementasi:

```text
[ ] Actor defined
[ ] Intent defined
[ ] Context defined
[ ] Authorization defined
[ ] Input defined
[ ] Output defined
[ ] Error defined
[ ] Transaction defined
[ ] Audit defined
[ ] Privacy reviewed
```

---

# 131. APPLICATION READINESS GATE

```text
[ ] Workspace defined
[ ] User journey defined
[ ] API contract defined
[ ] Domain rule defined
[ ] Database dependency defined
[ ] Authorization defined
[ ] Error state defined
[ ] Empty state defined
[ ] Loading state defined
[ ] Success state defined
```

---

# 132. END-TO-END CONTRACT

Untuk setiap feature:

```text
USER INTENT
    ↓
WORKFLOW
    ↓
USE CASE
    ↓
AUTHORIZATION
    ↓
APPLICATION CONTRACT
    ↓
DOMAIN RULE
    ↓
DATABASE OPERATION
    ↓
AUDIT
    ↓
RESULT
    ↓
USER
```

Inilah contract utama School OS.

---

# 133. TRACEABILITY EXAMPLE

## Feature

Teacher records attendance.

```text
User Need
 ↓
Teacher Daily Workflow
 ↓
Attendance Domain
 ↓
recordAttendance()
 ↓
Teacher + Class authorization
 ↓
attendance_records
 ↓
Audit
 ↓
Attendance projection
```

Semua layer memiliki hubungan yang jelas.

---

# 134. ARCHITECTURAL INVARIANTS

Hal yang tidak boleh dilanggar:

### 1.

API tidak menjadi thin CRUD wrapper.

### 2.

Client tidak menjadi security boundary.

### 3.

Database tidak menjadi application logic.

### 4.

UI tidak menentukan authorization.

### 5.

Context tidak boleh dipercaya hanya dari client.

### 6.

Sensitive Student data tidak boleh exposed by default.

### 7.

Dashboard bukan source of truth.

### 8.

External integrations tidak boleh menguasai domain model.

---

# 135. DESIGN DECISIONS

Keputusan yang ditetapkan:

| Decision | Status |
|---|---|
| Modular Monolith | Baseline |
| Domain-oriented application | Baseline |
| Server-enforced authorization | Mandatory |
| Context-aware operations | Mandatory |
| API follows use case | Baseline |
| Database direct access from client | Prohibited |
| Public API | Not required |
| Microservices | Deferred |
| Event-driven architecture | Deferred |
| Dedicated API Gateway | Deferred |
| Dedicated Search Engine | Deferred |
| Data Warehouse | Deferred |

---

# 136. OPEN QUESTIONS

Masih perlu validasi:

```text
1. Authentication provider
2. Exact session model
3. Server Actions vs API Routes boundary
4. Exact API transport conventions
5. Error code vocabulary
6. Idempotency implementation
7. Audit implementation
8. Notification provider
9. File storage provider
10. Exact Guardian permissions
11. Exact School Leadership capabilities
12. Exact Yapendik projection APIs
```

Tidak semuanya perlu dijawab sebelum pilot mulai.

---

# 137. IMPLEMENTATION PRINCIPLE

Kita tidak perlu menyelesaikan:

```text
API untuk seluruh Yapendik
```

sebelum membangun TK Pilot.

Kita hanya perlu membangun:

```text
smallest complete vertical slice
```

---

# 138. RECOMMENDED FIRST VERTICAL SLICE

```text
Teacher Login
     ↓
My Class
     ↓
Student List
     ↓
Student Profile
     ↓
Record Attendance
     ↓
Create Observation
     ↓
Save
     ↓
Audit
     ↓
Return to Class
```

Jika vertical slice ini berhasil, kita telah menguji hampir seluruh architecture chain:

```text
Auth
Context
Authorization
Domain
API
Database
UX
Audit
```

---

# 139. SECOND VERTICAL SLICE

```text
School Admin
     ↓
Student Registration
     ↓
Enrollment
     ↓
Class Placement
     ↓
Teacher sees Student
```

Ini menguji:

```text
Identity
Enrollment
Placement
Context
Authorization
```

---

# 140. THIRD VERTICAL SLICE

```text
Guardian
     ↓
My Child
     ↓
Attendance
     ↓
School Communication
     ↓
Response
```

Ini menguji:

```text
Relationship Authorization
Privacy
Projection
Communication
```

---

# 141. PILOT SUCCESS CRITERIA

API/Application layer dianggap berhasil bukan karena:

```text
100 endpoints
```

tetapi karena:

```text
Teacher can work
Admin can operate
Guardian can access relevant information
School retains trustworthy records
Authorization works
Audit works
```

---

# 142. FINAL APPLICATION PRINCIPLE

> **The application should make the right thing easy and the wrong thing difficult.**

Contoh:

Teacher:

```text
Open Class
 ↓
See Students
 ↓
Record Attendance
```

harus mudah.

Sedangkan:

```text
Teacher
 ↓
Access unrelated Student
```

harus sulit atau ditolak secara sistem.

---

# 143. FINAL API PRINCIPLE

> **An API operation represents an authorized action within a meaningful context.**

Bukan sekadar:

> "an HTTP request against a table."

---

# 144. FINAL ARCHITECTURAL PRINCIPLE

School OS harus mempertahankan rantai:

```text
REALITY
   ↓
WORK
   ↓
DOMAIN
   ↓
APPLICATION
   ↓
API
   ↓
DATABASE
```

dan bukan:

```text
DATABASE
   ↓
API
   ↓
SCREENS
```

---

# 145. STATUS

**YAPENDIK SCHOOL OS TK PILOT API & APPLICATION CONTRACT**

Status:

> **LIVING — DESIGN BASELINE**

Dokumen ini siap menjadi dasar untuk:

```text
API implementation
Application services
Server Actions / API Routes
Repository layer
Authorization enforcement
Integration testing
```

tetapi belum mengunci vendor atau implementasi teknis tertentu.

---

# 146. NEXT STEP

Sekarang kita sudah memiliki hampir seluruh **design stack**:

```text
                    YAPENDIK OS
                         │
                 CONSTITUTION
                         │
           ENTERPRISE INFORMATION
                  ARCHITECTURE
                         │
              SCHOOL OS OPERATING
                     MODEL
                         │
              PRODUCT BLUEPRINT
                    TK PILOT
                         │
             TECHNICAL ARCHITECTURE
                         │
            WORKFLOW SPECIFICATION
                         │
            AUTHORIZATION MODEL
                         │
                 DATA MODEL
                         │
          DOMAIN & ENTITY SPECIFICATION
                         │
             VALIDATED DOMAIN MODEL
                         │
             DATABASE BLUEPRINT
                         │
        ★ API & APPLICATION CONTRACT ★
                         │
                         ▼
              IMPLEMENTATION BLUEPRINT
                         │
                         ▼
                 VERTICAL SLICE
                         │
                         ▼
                    TK PILOT
```

**Menurut saya, kita belum perlu membuat dokumen arsitektur lain yang makin abstrak.** Kita sudah berada di titik yang tepat untuk berpindah dari **“designing the system”** ke **“designing how we actually build it.”**

Dokumen berikutnya yang paling tepat adalah:

> **`YAPENDIK SCHOOL OS TK PILOT IMPLEMENTATION SPECIFICATION`**

Dokumen itu akan menjawab secara konkret:

- repository structure;
- module structure;
- domain boundaries;
- application services;
- database migration sequence;
- authentication implementation;
- authorization implementation;
- API/server-action implementation;
- UI/workspace implementation;
- testing strategy;
- development sequence;
- Definition of Done;
- dan **vertical slice pertama yang benar-benar akan kita bangun**.

Dengan kata lain, setelah dokumen itu kita seharusnya **berhenti membuat dokumen baru dan mulai membangun TK Pilot**, sambil membiarkan seluruh dokumen tetap **LIVING** dan berevolusi berdasarkan hasil pilot.