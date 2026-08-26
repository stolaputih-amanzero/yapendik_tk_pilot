# YAPENDIK SCHOOL OS TK PILOT — SPESIFIKASI DOMAIN & ENTITAS

Versi: 0.1  
Organisasi: Yayasan Pendidikan GPIB (Yapendik)  
Sistem: Yapendik Operating System  
Produk: School OS  
Pilot: TK  
Jenis Dokumen: Spesifikasi Domain & Entitas  
Status: LIVING — DISCOVERY  
Pendekatan: Common Sense First  
Prinsip: Make It Simple. Keep It Future-Proof.

---

# 1. TUJUAN DOKUMEN

Dokumen ini mendefinisikan **makna dan batas setiap domain serta entitas utama** dalam Yapendik School OS untuk TK Pilot.

Dokumen ini menjadi jembatan antara:

Enterprise Information Architecture

↓

Product Blueprint

↓

UX Architecture

↓

Technical Architecture

↓

Physical Data Model

Dokumen ini **belum merupakan ERD database atau SQL schema**.

Fokusnya adalah:

> Apa yang dimaksud oleh setiap entitas, mengapa entitas tersebut ada, bagaimana hubungannya dengan entitas lain, siapa yang menggunakannya, dan aturan bisnis apa yang harus dijaga.

---

# 2. PRINSIP UTAMA

## 2.1 Entitas harus memiliki makna nyata

Kita tidak membuat entitas hanya karena database membutuhkan tabel.

Setiap entitas harus merepresentasikan sesuatu yang benar-benar bermakna dalam kehidupan dan pekerjaan sekolah.

---

## 2.2 Jangan membuat entitas terlalu dini

Jika suatu informasi belum membutuhkan identity, lifecycle, relationship, atau access boundary sendiri, tidak perlu langsung dijadikan entitas.

---

## 2.3 Satu identitas canonical

Entitas penting harus memiliki satu identitas canonical.

Contoh:

Student tidak dibuat ulang setiap tahun ajaran.

Yang berubah adalah:

Enrollment

Class

Academic Context

bukan identity Student.

---

# 3. CARA MEMBACA SPESIFIKASI

Setiap entitas akan dijelaskan melalui:

Nama

Tujuan

Makna

Identitas

Konteks

Hubungan

Pemilik / steward

Pengguna

Akses

Lifecycle

Aturan bisnis

Catatan implementasi

---

# 4. PETA DOMAIN TK PILOT

Domain awal:

```text
SCHOOL
│
├── PEOPLE
│
├── STUDENT
│
├── ACADEMIC
│
├── ATTENDANCE
│
├── LEARNING
│
├── DEVELOPMENT
│
├── EVIDENCE
│
├── COMMUNICATION
│
└── REVIEW / INSIGHT
```

Domain-domain tersebut tidak harus menjadi microservices.

Mereka adalah **logical domain boundaries**.

---

# 5. DOMAIN SCHOOL

Domain School mengelola identitas dan konteks institusi pendidikan.

Entitas utama:

School

Academic Year

---

# 6. ENTITAS: SCHOOL

## Tujuan

Merepresentasikan satu satuan pendidikan yang beroperasi di dalam Yapendik.

## Makna

School adalah konteks utama operasional School OS.

School bukan sekadar nama sekolah.

School merupakan batas:

- operational context;
- data context;
- responsibility;
- authorization;
- reporting.

## Identitas

School memiliki identitas yang stabil.

Nama sekolah dapat berubah tanpa mengubah identity.

## Hubungan

School memiliki:

- People;
- Academic Years;
- Classes;
- Students;
- Teachers;
- operational records.

## Aturan bisnis

Data operasional sekolah harus memiliki hubungan yang jelas dengan School.

## Catatan

School menjadi salah satu boundary authorization utama.

---

# 7. ENTITAS: ACADEMIC YEAR

## Tujuan

Merepresentasikan periode akademik tempat kegiatan pendidikan berlangsung.

## Makna

Academic Year adalah konteks waktu untuk:

- enrollment;
- class placement;
- learning;
- attendance;
- development;
- reporting.

## Identitas

Academic Year memiliki identity sendiri.

## Hubungan

Academic Year belongs to:

School

dan memiliki hubungan dengan:

Class

Enrollment

Attendance

Learning

Development

## Aturan bisnis

Pergantian academic year tidak membuat Student baru.

---

# 8. DOMAIN PEOPLE

Domain People mengelola identity manusia yang berinteraksi dengan School OS.

Entitas utama:

Person

User Identity

Role / Responsibility

---

# 9. ENTITAS: PERSON

## Tujuan

Merepresentasikan satu individu manusia.

## Makna

Person adalah **canonical human identity**.

Satu individu tidak boleh dibuat sebagai beberapa Person hanya karena memiliki hubungan atau tanggung jawab berbeda.

## Contoh

Satu Person dapat memiliki:

Teacher

dan pada context lain:

Guardian

## Identitas

Identity Person bersifat persistent.

## Hubungan

Person dapat memiliki hubungan dengan:

School

Student

Guardian

Teacher

Staff

User Identity

Role / Responsibility

## Aturan bisnis

Perubahan role tidak membuat Person baru.

---

# 10. ENTITAS: USER IDENTITY

## Tujuan

Merepresentasikan identitas yang digunakan seseorang untuk masuk ke system.

## Makna

User Identity berbeda dari Person.

Person menjawab:

> Siapa orang ini?

User Identity menjawab:

> Bagaimana orang ini dikenali oleh system?

## Hubungan

User Identity → Person

Satu Person dapat memiliki satu atau lebih mekanisme identity apabila diperlukan oleh architecture.

## Aturan

Authentication identity tidak boleh menjadi pengganti canonical Person identity.

---

# 11. ENTITAS: ROLE / RESPONSIBILITY

## Tujuan

Merepresentasikan tanggung jawab seseorang dalam context tertentu.

## Makna

Role bukan sekadar label UI.

Role menentukan responsibility dan menjadi salah satu input authorization.

Contoh:

Teacher

School Administrator

Leadership

Guardian

## Aturan penting

Role tidak berdiri sendiri.

Authorization harus mempertimbangkan:

Person

+

Role / Responsibility

+

Context

---

# 12. DOMAIN STUDENT

Student adalah salah satu domain paling penting dalam School OS.

Entitas utama:

Student

Guardian Relationship

Enrollment

---

# 13. ENTITAS: STUDENT

## Tujuan

Merepresentasikan anak yang menerima layanan pendidikan dari School.

## Makna

Student adalah **canonical educational identity**.

Student menjadi anchor bagi:

- enrollment;
- class;
- attendance;
- learning;
- observation;
- development;
- evidence;
- communication.

## Identitas

Identity Student harus tetap stabil sepanjang perjalanan pendidikan anak di School.

## Aturan utama

Jangan membuat Student baru hanya karena:

- tahun ajaran berubah;
- kelas berubah;
- wali kelas berubah;
- data tertentu diperbarui.

---

# 14. HUBUNGAN STUDENT

Student dapat berhubungan dengan:

School

Guardian

Enrollment

Class melalui Enrollment

Attendance

Learning

Observation

Development Record

Evidence

Communication

---

# 15. ENTITAS: GUARDIAN RELATIONSHIP

## Tujuan

Merepresentasikan hubungan antara Person dengan Student dalam kapasitas guardian.

## Mengapa bukan sekadar field?

Karena relationship dapat memiliki makna:

- parent;
- guardian;
- authorized caregiver;
- atau hubungan lain yang relevan.

## Struktur konseptual

Person

↓

Guardian Relationship

↓

Student

## Aturan

Guardian adalah Person.

Guardian bukan identity manusia yang terpisah.

---

# 16. ENTITAS: ENROLLMENT

## Tujuan

Merepresentasikan keikutsertaan seorang Student dalam School pada periode akademik tertentu.

## Makna

Enrollment menjembatani:

Student

dan

Academic Year

serta dapat menentukan:

Class

## Struktur konseptual

Student

↓

Enrollment

↓

Academic Year

↓

Class

## Mengapa Enrollment penting?

Karena Student identity bersifat persistent, sementara enrollment berubah.

---

# 17. DOMAIN ACADEMIC

Domain Academic mengatur struktur kegiatan pendidikan.

Entitas utama:

Class

Teacher Assignment

Enrollment

---

# 18. ENTITAS: CLASS

## Tujuan

Merepresentasikan kelompok belajar yang menjadi working context Teacher.

## Makna

Class bukan hanya daftar Student.

Class adalah:

> operational workspace untuk kegiatan pendidikan.

## Hubungan

Class belongs to:

School

Academic Year

Class memiliki:

Students melalui Enrollment

Teachers melalui assignment

Attendance

Learning activities

Observations

---

# 19. CLASS SEBAGAI WORKING CONTEXT

Untuk Teacher:

```text
School
↓
Academic Year
↓
Class
↓
Students
↓
Work
```

Ini merupakan salah satu context hierarchy terpenting dalam School OS.

---

# 20. ENTITAS: TEACHER ASSIGNMENT

## Tujuan

Merepresentasikan tanggung jawab Teacher terhadap Class dalam context tertentu.

## Struktur

Person

↓

Teacher Responsibility

↓

Class

↓

Academic Year

## Aturan

Teacher tidak otomatis memiliki akses terhadap seluruh Student hanya karena Person tersebut memiliki role Teacher.

Access harus berasal dari responsibility dan context.

---

# 21. DOMAIN ATTENDANCE

Domain Attendance merepresentasikan kehadiran Student.

Entitas:

Attendance Record

---

# 22. ENTITAS: ATTENDANCE RECORD

## Tujuan

Mencatat status kehadiran Student dalam context tertentu.

## Minimum conceptual information

Student

Class

Academic Year

Date / Session

Attendance Status

Recorder

## Makna

Attendance adalah operational record.

Ia bukan representasi lengkap tentang Student.

---

# 23. ATURAN ATTENDANCE

Attendance harus memiliki:

- Student yang valid;
- Class yang valid;
- Academic Year yang valid;
- waktu yang valid;
- recorder yang memiliki authorization.

Duplicate logical attendance harus dicegah.

---

# 24. DOMAIN LEARNING

Domain Learning mengelola informasi yang berkaitan dengan proses belajar.

Pada TK Pilot domain ini sengaja dibuat sederhana.

Candidate entity:

Learning Activity / Learning Record

---

# 25. ENTITAS: LEARNING RECORD

## Tujuan

Merepresentasikan informasi penting mengenai kegiatan belajar Student.

## Makna

Learning Record bukan nilai akademik semata.

Untuk TK, learning lebih banyak berkaitan dengan:

- aktivitas;
- partisipasi;
- pengalaman belajar;
- konteks kegiatan;
- catatan relevan.

## Catatan

Pedagogical model detail masih perlu divalidasi dengan sekolah.

---

# 26. DOMAIN DEVELOPMENT

Domain Development merupakan domain yang sensitif dan harus dirancang hati-hati.

Entitas utama:

Observation

Development Record

Follow-up

---

# 27. ENTITAS: OBSERVATION

## Tujuan

Mencatat pengamatan terhadap Student dalam konteks nyata.

## Minimum conceptual information

Student

Observer

Date / Time

Context

Observation

Optional Evidence

Optional Follow-up

---

# 28. MAKNA OBSERVATION

Observation adalah:

> catatan tentang apa yang diamati.

Observation bukan otomatis:

diagnosis.

bukan otomatis:

penilaian final.

bukan otomatis:

score.

System tidak boleh mengubah observation menjadi kesimpulan yang tidak didukung evidence.

---

# 29. OBSERVATION CONTEXT

Observation harus mempertahankan konteks.

Contoh:

Aktivitas bermain

Kegiatan kelas

Interaksi sosial

Kegiatan motorik

Aktivitas lain yang relevan

Context tidak boleh hilang hanya karena data disimpan sebagai satu field sederhana.

---

# 30. ENTITAS: DEVELOPMENT RECORD

## Tujuan

Merepresentasikan pemahaman atau catatan perkembangan Student berdasarkan informasi yang relevan.

## Hubungan

Development Record dapat berasal dari:

Observation

Learning

Evidence

Review

## Prinsip

Development Record tidak boleh menjadi sekadar angka.

---

# 31. ENTITAS: FOLLOW-UP

## Tujuan

Merepresentasikan tindakan atau perhatian lanjutan yang muncul dari suatu observation, review, atau development information.

Contoh:

Perlu observasi tambahan.

Perlu komunikasi dengan guardian.

Perlu perhatian Teacher.

Perlu review leadership.

## Aturan

Follow-up harus memiliki owner dan status.

---

# 32. DOMAIN EVIDENCE

Domain Evidence menyimpan bukti atau artefak pendukung.

Contoh:

Foto

Dokumen

Catatan pendukung

Media lain yang relevan

---

# 33. ENTITAS: EVIDENCE

## Tujuan

Menghubungkan evidence dengan informasi yang relevan.

## Makna

Evidence bukan sekadar file.

Evidence memiliki:

- owner;
- subject;
- context;
- purpose;
- access boundary.

## Penyimpanan

Metadata berada pada data store.

Binary content berada pada secure object storage.

---

# 34. DOMAIN COMMUNICATION

Domain Communication mengelola pertukaran informasi yang memiliki konteks sekolah.

Entitas:

Communication

Recipient

Response / Follow-up

---

# 35. ENTITAS: COMMUNICATION

## Tujuan

Merepresentasikan komunikasi resmi atau relevan antara School dan stakeholder.

## Konteks

Communication dapat terkait dengan:

School

Class

Student

Guardian

Activity

Follow-up

## Prinsip

Communication harus memiliki context.

Jangan membangun "chat" generik sebelum kebutuhan benar-benar terbukti.

---

# 36. ENTITAS: COMMUNICATION RECIPIENT

Recipient menghubungkan Communication dengan Person yang berhak menerima informasi.

Recipient bukan sekadar email address.

System harus mengetahui:

Siapa?

Dalam capacity apa?

Dalam context apa?

---

# 37. ENTITAS: COMMUNICATION RESPONSE

Jika communication membutuhkan response:

Communication

↓

Response

↓

Follow-up

Response dapat berupa:

Acknowledgement

Answer

Request

Confirmation

---

# 38. DOMAIN REVIEW / INSIGHT

Domain ini berada di atas operational information.

Flow:

```text
Operational Data
↓
Aggregation
↓
Pattern
↓
Review
↓
Decision
↓
Follow-up
```

---

# 39. ENTITAS: REVIEW

## Tujuan

Merepresentasikan kegiatan meninjau informasi untuk menghasilkan tindakan.

Review dapat dilakukan oleh:

Teacher

Leadership

atau actor lain yang berwenang.

---

# 40. ENTITAS: INSIGHT

Untuk TK Pilot, Insight tidak perlu menjadi entity kompleks.

Pada tahap awal lebih baik dianggap sebagai:

> derived information / projection

daripada canonical entity.

Ini mencegah premature data modeling.

---

# 41. CANONICAL ENTITIES

Initial canonical entities:

```text
School
Person
Student
Academic Year
Class
Enrollment
Teacher Assignment
Attendance Record
Learning Record
Observation
Development Record
Evidence
Communication
```

---

# 42. DERIVED / PROJECTION INFORMATION

Informasi berikut sebaiknya tidak langsung dianggap canonical:

Dashboard

Statistics

Summary

Trend

Insight

Reports

Class metrics

Student overview projections

Semua dapat dihitung atau diproyeksikan dari canonical information.

---

# 43. IDENTITY HIERARCHY

Struktur identity:

```text
School
  │
  ├── Person
  │     ├── Teacher
  │     ├── Staff
  │     └── Guardian
  │
  └── Student
```

Kemudian context:

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Enrollment
 ↓
Student
```

---

# 44. OPERATIONAL RECORD HIERARCHY

```text
Student
│
├── Attendance
│
├── Learning
│
├── Observation
│
├── Development
│
├── Evidence
│
└── Communication
```

Ini merupakan salah satu struktur paling penting dalam School OS.

---

# 45. CONTEXT MODEL

Context minimum:

School

Academic Year

Class

Student

Role / Responsibility

Tidak semua entity membutuhkan semua context secara langsung.

Namun setiap record harus memiliki context yang dapat ditelusuri.

---

# 46. CONTEXT INTEGRITY

Contoh:

Attendance Student A

harus dapat ditelusuri ke:

School

Academic Year

Class

Teacher / Recorder

Jika relationship tersebut tidak dapat dijelaskan, model datanya belum cukup kuat.

---

# 47. OWNERSHIP MODEL

Secara konseptual:

School owns institutional context.

Person owns personal identity.

School governs Student educational record.

Teacher creates certain operational records according to responsibility.

Guardian receives permitted information.

Leadership reviews permitted institutional information.

Technical system enforces boundaries.

---

# 48. ACCESS MODEL

Akses tidak boleh ditentukan hanya berdasarkan entity.

Contoh:

"Teacher dapat melihat Student."

Tidak cukup.

Yang benar:

"Teacher dapat melihat Student yang berada dalam Class dan School context yang menjadi tanggung jawabnya."

---

# 49. LIFECYCLE MODEL

Entitas harus memiliki lifecycle yang sesuai.

Contoh Student:

Active

↓

Graduated / Completed

atau

Transferred

↓

Archived

---

# 50. ENROLLMENT LIFECYCLE

Conceptual:

Draft

↓

Active

↓

Completed

atau

Transferred

↓

Closed

---

# 51. OBSERVATION LIFECYCLE

Untuk MVP dapat sederhana:

Draft

↓

Recorded

↓

Reviewed

↓

Archived

Tidak semua observation harus memiliki workflow panjang.

---

# 52. COMMUNICATION LIFECYCLE

Conceptual:

Draft

↓

Sent

↓

Delivered

↓

Acknowledged / Responded

↓

Closed

Status detail akan ditentukan berdasarkan kebutuhan nyata.

---

# 53. EVIDENCE LIFECYCLE

Conceptual:

Uploaded

↓

Attached to Context

↓

Used

↓

Archived / Deleted according to policy

---

# 54. DATA OWNERSHIP VS ACCESS

Penting untuk membedakan:

Ownership

dengan

Access.

Seseorang dapat memiliki permission untuk melihat atau mengubah data tanpa menjadi owner dari keseluruhan data tersebut.

---

# 55. DATA MINIMIZATION

Untuk setiap attribute kita harus bertanya:

Apakah informasi ini benar-benar dibutuhkan?

Apakah digunakan?

Siapa yang membutuhkannya?

Berapa lama disimpan?

Apakah ada risiko jika bocor?

Jika tidak ada jawaban yang jelas:

> Jangan kumpulkan dulu.

---

# 56. SENSITIVE INFORMATION

Informasi yang kemungkinan memiliki sensitivity lebih tinggi:

Student identity

Guardian information

Development information

Observation

Evidence

Communication

Access terhadap informasi tersebut harus lebih ketat daripada informasi sekolah umum.

---

# 57. CROSS-DOMAIN RELATIONSHIPS

Relasi utama:

```text
School
 ↓
Academic Year
 ↓
Class
 ↓
Enrollment
 ↓
Student
```

dan:

```text
Person
 ↓
Responsibility
 ↓
Class
```

dan:

```text
Student
 ↓
Attendance
Observation
Learning
Development
Evidence
Communication
```

---

# 58. DOMAIN DEPENDENCY

Dependency utama:

```text
School
 ↓
People
 ↓
Identity / Responsibility
 ↓
Academic
 ↓
Student
 ↓
Operational Records
 ↓
Review / Insight
```

Domain yang lebih tinggi tidak boleh mengaburkan canonical identity.

---

# 59. IMPLEMENTATION PRIORITY

Entity priority:

### Tier 1 — Foundation

School

Person

User Identity

Academic Year

Role / Responsibility

### Tier 2 — Core School Operation

Student

Class

Enrollment

Teacher Assignment

### Tier 3 — Daily Work

Attendance

Learning

### Tier 4 — Educational Understanding

Observation

Development Record

Evidence

### Tier 5 — Engagement

Communication

### Tier 6 — Intelligence

Review

Insight

---

# 60. ENTITY CREATION RULE

Sebelum membuat entity baru, jawab:

1. Apakah ia memiliki identity?
2. Apakah ia memiliki lifecycle?
3. Apakah ia memiliki relationship?
4. Apakah ia memiliki access boundary?
5. Apakah ia memiliki business meaning?
6. Apakah ia akan digunakan berulang?
7. Apakah menjadikannya entity benar-benar menyederhanakan system?

Jika sebagian besar jawabannya tidak:

> kemungkinan besar belum perlu menjadi entity.

---

# 61. ENTITY VS ATTRIBUTE

Contoh:

Student memiliki:

Nama

Tanggal lahir

Jenis kelamin

Informasi dasar

Ini kemungkinan attribute.

Tetapi:

Guardian

Enrollment

Observation

memiliki identity dan lifecycle sendiri.

Maka mereka entity.

---

# 62. ENTITY VS PROJECTION

Contoh:

"Jumlah siswa hadir hari ini"

bukan canonical entity.

Itu projection dari:

Student

+

Attendance.

---

# 63. ENTITY VS EVENT

"Student enrolled"

dapat dipahami sebagai event bisnis.

Tetapi Enrollment adalah canonical operational entity.

Event architecture dapat ditambahkan kemudian apabila dibutuhkan.

---

# 64. PHYSICAL DATABASE WARNING

Dokumen ini belum menetapkan:

- table names;
- column names;
- UUID strategy;
- foreign key implementation;
- indexes;
- partitioning;
- RLS syntax;
- database provider.

Semua itu berada pada layer physical implementation.

---

# 65. OPEN DOMAIN QUESTIONS

Masih perlu divalidasi dengan TK Pilot:

1. Apa definisi Class yang digunakan sekolah?
2. Apakah ada level / kelompok usia?
3. Bagaimana perpindahan kelas dilakukan?
4. Bagaimana Teacher assignment bekerja?
5. Bagaimana attendance sebenarnya dicatat?
6. Apa bentuk observation yang digunakan Teacher?
7. Bagaimana development dipahami sekolah?
8. Evidence apa yang benar-benar diperlukan?
9. Apa yang boleh dilihat Guardian?
10. Apa yang perlu dilihat Leadership?

---

# 66. VALIDATION PRINCIPLE

Pertanyaan-pertanyaan tersebut tidak boleh dijawab hanya berdasarkan asumsi kita.

Kita perlu:

> observe the school.

Karena School OS harus merepresentasikan pekerjaan nyata, bukan gambaran ideal tentang sekolah.

---

# 67. DOMAIN MODEL SUCCESS CRITERIA

Domain & Entity Specification dianggap cukup matang apabila:

- setiap canonical entity memiliki makna jelas;
- identity jelas;
- context jelas;
- relationship jelas;
- ownership jelas;
- access boundary dapat dijelaskan;
- lifecycle dapat dijelaskan;
- tidak ada duplicate canonical concept;
- belum terjadi premature database design.

---

# 68. NEXT DOCUMENT

Setelah dokumen ini, langkah berikutnya adalah:

# YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION

Dokumen tersebut akan menjawab:

> Bagaimana manusia benar-benar menggunakan entity-entity ini untuk menyelesaikan pekerjaan?

Contoh:

```text
Teacher
 ↓
Class
 ↓
Student
 ↓
Attendance
 ↓
Save
 ↓
Review
```

dan:

```text
Teacher
 ↓
Student
 ↓
Observation
 ↓
Evidence
 ↓
Development
```

---

# 69. COMPLETE DESIGN CHAIN

Kita sekarang memiliki:

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
BUILD
```

---

# 70. STATUS

YAPENDIK SCHOOL OS TK PILOT — SPESIFIKASI DOMAIN & ENTITAS

Versi: 0.1

Status:

LIVING — DISCOVERY

Scope:

TK Pilot

Pendekatan:

Common Sense First

Prinsip:

> Make It Simple. Keep It Future-Proof.

---

# PENUTUP

Kita sekarang **tidak perlu menambah architecture lagi**.

Kita sudah memiliki cukup banyak layer strategis.

Mulai titik ini, pekerjaan kita berubah dari:

> "Apa yang seharusnya kita bangun?"

menjadi:

> **"Bagaimana pekerjaan nyata di TK terjadi, dan bagaimana School OS mendukungnya?"**

Karena itu, **dokumen berikutnya sebaiknya adalah `YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION`**.

Ini akan menjadi langkah penting sebelum kita masuk ke **Authorization Model → Data Model → actual build**.