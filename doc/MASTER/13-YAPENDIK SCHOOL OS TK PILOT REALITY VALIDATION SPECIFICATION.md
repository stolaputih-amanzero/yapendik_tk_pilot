# YAPENDIK SCHOOL OS TK PILOT REALITY VALIDATION SPECIFICATION

Versi: 0.1  
Organisasi: Yayasan Pendidikan GPIB (Yapendik)  
Sistem: Yapendik Operating System  
Produk: School OS  
Pilot Context: TK / Early Childhood Education  
Jenis Dokumen: Reality Validation Specification  
Status: LIVING — DISCOVERY  
Pendekatan: Common Sense First  
Prinsip: Make It Simple. Keep It Future-Proof.

Derived From:

- YAPENDIK OPERATING SYSTEM CONSTITUTION
- YAPENDIK ENTERPRISE INFORMATION ARCHITECTURE
- YAPENDIK SCHOOL OS OPERATING MODEL
- YAPENDIK SCHOOL OS PRODUCT BLUEPRINT — TK PILOT
- YAPENDIK SCHOOL OS TECHNICAL ARCHITECTURE
- YAPENDIK SCHOOL OS TK PILOT WORKFLOW SPECIFICATION
- YAPENDIK SCHOOL OS TK PILOT AUTHORIZATION MODEL
- YAPENDIK SCHOOL OS TK PILOT DATA MODEL
- YAPENDIK SCHOOL OS TK PILOT DOMAIN & ENTITY SPECIFICATION


# 1. PURPOSE

Dokumen ini mendefinisikan bagaimana Yapendik akan memvalidasi model School OS terhadap **realitas sekolah TK yang sebenarnya** sebelum masuk ke tahap physical database design dan implementation.

Dokumen ini menjawab:

> **Apakah model yang telah kita desain benar-benar mencerminkan bagaimana sebuah TK bekerja?**

Bukan:

> Bagaimana seharusnya TK bekerja menurut software?

Prinsip utamanya:

```text
REAL SCHOOL
    ↓
OBSERVE
    ↓
UNDERSTAND
    ↓
VALIDATE
    ↓
SIMPLIFY
    ↓
UPDATE MODEL
    ↓
BUILD
```

Constitution memang menetapkan bahwa Yapendik OS harus berkembang melalui discovery, implementation, real usage, evidence, dan learning. 


# 2. POSITION DALAM ARSITEKTUR

Reality Validation berada di antara Domain & Entity Specification dan Database Blueprint.

```text
CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
SCHOOL OS OPERATING MODEL
        ↓
PRODUCT BLUEPRINT
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
★ REALITY VALIDATION ★
        ↓
VALIDATED DOMAIN MODEL
        ↓
DATABASE BLUEPRINT
        ↓
APPLICATION CONTRACT
        ↓
IMPLEMENTATION
```

Dengan demikian, database bukan dibangun dari asumsi.

Database dibangun dari:

```text
MODEL
+
REALITY
+
EVIDENCE
+
VALIDATED DECISIONS
```


# 3. WHY THIS DOCUMENT EXISTS

Current architecture masih memiliki beberapa area yang secara sadar berstatus discovery.

Operating Model sendiri menyatakan bahwa:

- daily operations;
- learning model;
- development model;
- communication;
- dan terutama TK reality

belum memiliki tingkat kepastian yang cukup. 

Product Blueprint juga menempatkan TK Reality pada tingkat yang masih membutuhkan field validation. 

Karena itu:

> **Kita tidak boleh memperlakukan model saat ini sebagai fakta.**

Model adalah **working hypothesis**.


# 4. FUNDAMENTAL PRINCIPLE

Reality Validation mengikuti prinsip:

> **Understand the work before designing the system.**

Operating Model secara eksplisit menggunakan:

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

bukan:

```text
Assume
   ↓
Build
   ↓
Hope
```




# 5. WHAT WE ARE VALIDATING

Validation mencakup lima lapisan:

```text
1. PEOPLE
2. CONTEXT
3. WORK
4. INFORMATION
5. DECISION
```

Kemudian kita melihat apakah entity model yang telah dibuat benar-benar merepresentasikan kelima lapisan tersebut.


# 6. WHAT WE ARE NOT VALIDATING YET

Reality Validation **tidak** bertujuan untuk menentukan:

- framework frontend;
- framework backend;
- database engine;
- SQL schema;
- API;
- cloud infrastructure;
- visual design;
- component library;
- exact navigation;
- technical implementation detail.

Hal-hal tersebut mengikuti hasil discovery.


# 7. VALIDATION PHILOSOPHY

Gunakan urutan:

```text
REALITY
   ↓
MEANING
   ↓
MODEL
```

bukan:

```text
MODEL
   ↓
FORCE REALITY TO FIT
```


# 8. VALIDATION RULE

Jika realitas sekolah berbeda dari model:

> **Model harus dipertanyakan terlebih dahulu.**

Bukan sekolah yang dianggap salah.

Jika perbedaan tersebut ternyata merupakan variasi legitimate antar-school, maka:

```text
COMMON CORE
+
CONTEXTUAL VARIATION
```

harus dipertimbangkan.

Ini sejalan dengan prinsip School Autonomy:

> Standardize what must be shared; preserve autonomy where context matters. 


# 9. VALIDATION TARGET

Reality Validation terutama memvalidasi:

```text
School
Person
Student
Academic Year
Class
Teacher Responsibility
Staff Responsibility
Guardian Relationship
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

Total:

**17 conceptual entities**


# 10. VALIDATION MATURITY

Setiap entity akan memiliki status:

```text
ASSUMPTION
    ↓
OBSERVED
    ↓
UNDERSTOOD
    ↓
VALIDATED
    ↓
MODEL-READY
    ↓
DATABASE-READY
```

Tidak semua entity harus langsung mencapai tahap terakhir.


# 11. EVIDENCE CLASSIFICATION

Setiap discovery finding harus dikategorikan sebagai salah satu:

```text
FACT
ASSUMPTION
OBSERVATION
STAKEHOLDER STATEMENT
DECISION
UNKNOWN
CONSTRAINT
VARIATION
```

Jangan mencampurkan semuanya menjadi "requirement".

Constitution secara eksplisit mengharuskan fact, assumption, decision, dan unknown dibedakan. 


# 12. VALIDATION METHOD

Metode utama:

## 12.1 Observe

Melihat pekerjaan sebagaimana terjadi.

## 12.2 Ask

Memahami mengapa pekerjaan dilakukan.

## 12.3 Document

Mencatat workflow aktual.

## 12.4 Compare

Membandingkan realitas dengan model.

## 12.5 Simplify

Menghilangkan asumsi dan kompleksitas yang tidak diperlukan.

## 12.6 Update

Memperbarui model.

## 12.7 Validate Again

Memastikan perubahan benar.


# 13. OBSERVATION BEFORE INTERVIEW

Jika memungkinkan:

> **Observe first, ask second.**

Alasannya sederhana.

Orang sering menjelaskan:

> "Biasanya kami melakukan A → B → C."

Tetapi praktik sebenarnya mungkin:

```text
A
 ↓
C
 ↓
B
 ↓
manual correction
```

Kita ingin memahami **actual work**, bukan hanya documented procedure.


# 14. VALIDATION PARTICIPANTS

Discovery idealnya melibatkan representative actors.

### School Leadership

Untuk memahami:

- decisions;
- oversight;
- reporting;
- governance.

### Teacher

Untuk memahami:

- daily work;
- students;
- attendance;
- learning;
- observation.

### Administration

Untuk memahami:

- repetitive work;
- records;
- enrollment;
- documents;
- reporting.

### Guardian

Untuk memahami:

- communication;
- information needs;
- expectations.

### Yapendik

Untuk memahami:

- institutional governance;
- shared information;
- reporting;
- cross-school needs.


# 15. SCHOOL STRUCTURE VALIDATION

Pertanyaan utama:

1. Bagaimana School sebenarnya terorganisasi?
2. Apa unit organisasi yang benar-benar digunakan?
3. Apakah ada struktur selain School → Class?
4. Bagaimana academic year digunakan?
5. Apakah terdapat level/kelompok pendidikan?
6. Apakah struktur formal sama dengan struktur operational?

Tujuan:

Memvalidasi:

```text
School
Academic Year
Class
```


# 16. PEOPLE VALIDATION

Pertanyaan:

1. Siapa saja yang bekerja di School?
2. Siapa yang berinteraksi dengan Student?
3. Siapa yang mengelola administrasi?
4. Siapa yang menjadi Teacher?
5. Siapa yang menjadi Guardian?
6. Apakah satu Person dapat memiliki beberapa responsibility?
7. Bagaimana perubahan responsibility dikelola?

Tujuan:

Memvalidasi:

```text
Person
Teacher Responsibility
Staff Responsibility
Guardian Relationship
```


# 17. TEACHER DAILY WORK VALIDATION

Ini adalah **Priority 1**.

Product discovery memang menempatkan Teacher Daily Work sebagai titik awal. 

Pertanyaan:

1. Bagaimana Teacher memulai hari?
2. Apa yang dilakukan sebelum Student datang?
3. Apa yang dilakukan ketika Student datang?
4. Bagaimana Teacher mengetahui siapa yang hadir?
5. Apa yang dilakukan selama kegiatan?
6. Apa yang dicatat?
7. Kapan Teacher mencatat?
8. Apa yang biasanya ditunda?
9. Apa yang dilakukan setelah kelas?
10. Apa pekerjaan administratif yang paling mengganggu?

Output:

```text
Teacher Daily Work Map
```


# 18. CLASS VALIDATION

Pertanyaan:

1. Apa sebenarnya definisi Class?
2. Bagaimana Class dibuat?
3. Siapa yang menentukan Class?
4. Apakah Class berubah selama academic year?
5. Apakah Student dapat berpindah?
6. Bagaimana Teacher ditugaskan?
7. Apakah satu Class dapat memiliki beberapa Teacher?

Output:

```text
Validated Class Model
```


# 19. STUDENT LIFECYCLE VALIDATION

Pertanyaan:

```text
Bagaimana seorang anak menjadi Student?
```

Kemudian:

```text
Prospective?
Admission?
Enrollment?
Active?
Transfer?
Completion?
Withdrawal?
Alumni?
```

Jangan mengasumsikan lifecycle sebelum discovery.


# 20. STUDENT IDENTITY VALIDATION

Pertanyaan penting:

> Apakah Student adalah Person?

atau:

> Student adalah educational identity yang memiliki relationship dengan Person?

Atau terdapat model lain?

Ini merupakan keputusan fundamental dan harus divalidasi sebelum database schema dibekukan.


# 21. ENROLLMENT VALIDATION

Pertanyaan:

1. Bagaimana enrollment dilakukan?
2. Siapa yang memulai?
3. Apa dokumen yang diperlukan?
4. Kapan Student dianggap enrolled?
5. Siapa yang menyetujui?
6. Apakah ada waiting list?
7. Apakah enrollment terkait academic year?
8. Apa yang terjadi ketika Student keluar?

Output:

```text
Actual Enrollment Workflow
```


# 22. CLASS PLACEMENT VALIDATION

Pertanyaan:

1. Siapa yang menentukan placement?
2. Kapan dilakukan?
3. Apa dasar keputusan?
4. Apakah dapat berubah?
5. Bagaimana transfer dilakukan?
6. Apakah history diperlukan?

Output:

```text
Placement Lifecycle
```


# 23. ATTENDANCE VALIDATION

Pertanyaan:

1. Bagaimana attendance dicatat hari ini?
2. Siapa yang mencatat?
3. Kapan dicatat?
4. Apa status yang digunakan?
5. Bagaimana koreksi dilakukan?
6. Apakah ada alasan ketidakhadiran?
7. Apakah attendance bersifat daily atau session-based?
8. Siapa yang dapat melihatnya?

Output:

```text
Actual Attendance Workflow
```


# 24. LEARNING ACTIVITY VALIDATION

Pertanyaan:

1. Apa yang dianggap sebagai learning activity?
2. Apakah Teacher merencanakannya?
3. Apakah activity selalu terkait Class?
4. Apakah activity perlu dicatat?
5. Apa yang sebenarnya berguna untuk dicatat?
6. Apakah ada existing planning/documentation?

Jangan langsung membuat curriculum engine.

Tujuan tahap ini hanya:

> memahami apa yang benar-benar terjadi.


# 25. OBSERVATION VALIDATION

Ini merupakan **Priority 2**.

Pertanyaan:

1. Apa yang dimaksud Teacher dengan observation?
2. Kapan observation dilakukan?
3. Apa yang diamati?
4. Apakah observation spontan atau terjadwal?
5. Bagaimana Teacher mencatatnya?
6. Apakah observation selalu terkait activity?
7. Apakah observation dibagikan kepada Teacher lain?
8. Apakah observation digunakan dalam review?
9. Apakah observation memiliki confidentiality level?

Output:

```text
Actual Observation Practice
```


# 26. DEVELOPMENT VALIDATION

Ini merupakan **Priority 3**.

Pertanyaan:

1. Apa arti "perkembangan anak" bagi TK?
2. Bagaimana Teacher mengetahuinya?
3. Bagaimana perkembangan dicatat?
4. Apakah ada framework resmi?
5. Apakah ada indikator?
6. Apakah ada narrative?
7. Apakah ada assessment?
8. Siapa yang melakukan interpretation?
9. Bagaimana hasilnya digunakan?
10. Bagaimana hasilnya dikomunikasikan?

**Jangan mengarang framework.**

Jika TK menggunakan framework tertentu, itu menjadi evidence.

Jika tidak ada framework yang konsisten, hal tersebut juga merupakan finding.


# 27. EVIDENCE VALIDATION

Pertanyaan:

1. Apa yang dianggap evidence?
2. Foto?
3. Video?
4. Dokumen?
5. Work product anak?
6. Teacher notes?
7. Apakah evidence benar-benar diperlukan?
8. Siapa yang boleh melihat?
9. Berapa lama disimpan?
10. Bagaimana consent/privacy ditangani?

Tujuan:

Menentukan apakah Evidence benar-benar perlu menjadi domain entity atau cukup sebagai supporting information.


# 28. GUARDIAN RELATIONSHIP VALIDATION

Pertanyaan:

1. Siapa yang dianggap Guardian?
2. Apakah satu Student dapat memiliki beberapa Guardian?
3. Bagaimana relationship diverifikasi?
4. Apakah ada primary Guardian?
5. Apakah semua Guardian memiliki access yang sama?
6. Apa yang terjadi ketika relationship berubah?

Output:

```text
Guardian Relationship Model
```


# 29. GUARDIAN COMMUNICATION VALIDATION

Ini merupakan **Priority 5**.

Pertanyaan:

1. Apa yang dikomunikasikan?
2. Kapan?
3. Oleh siapa?
4. Kepada siapa?
5. Menggunakan channel apa?
6. Informasi apa yang paling berguna?
7. Apa communication pain terbesar?
8. Apa yang tidak boleh dikomunikasikan melalui system?

Tujuan:

Bukan membangun messaging app.

Tujuan:

> memahami kebutuhan communication sebenarnya.


# 30. LEADERSHIP REVIEW VALIDATION

Ini merupakan **Priority 7**.

Pertanyaan:

1. Keputusan apa yang sering dibuat leadership?
2. Informasi apa yang diperlukan?
3. Dari mana informasi tersebut berasal?
4. Apa yang sulit diperoleh?
5. Apa yang saat ini masih dikumpulkan manual?
6. Apa yang sering terlambat?
7. Apa yang sebenarnya tidak perlu dilaporkan?

Output:

```text
Decision → Information → Review Map
```


# 31. ADMINISTRATIVE WORK VALIDATION

Pertanyaan:

1. Apa pekerjaan repetitive?
2. Apa yang masih menggunakan paper?
3. Apa yang masih menggunakan spreadsheet?
4. Data apa yang diinput berulang kali?
5. Apa yang sering salah?
6. Apa yang membutuhkan approval?
7. Apa yang hanya dilakukan karena "memang dari dulu begitu"?

Pertanyaan terakhir penting.

Tidak semua existing process harus didigitalisasi.


# 32. CURRENT MANUAL PROCESS MAPPING

Untuk setiap workflow, dokumentasikan:

```text
START
 ↓
ACTOR
 ↓
ACTION
 ↓
INFORMATION
 ↓
DECISION
 ↓
ACTION
 ↓
OUTPUT
 ↓
NEXT STEP
```

Contoh:

```text
Student datang
 ↓
Teacher
 ↓
Check attendance
 ↓
Student status
 ↓
Mark present/absent
 ↓
Correction if needed
 ↓
Attendance record
```


# 33. PAPER / SPREADSHEET DISCOVERY

Jangan hanya bertanya:

> "Apakah masih pakai Excel?"

Tanyakan:

> "Tunjukkan bagaimana pekerjaan ini dilakukan sekarang."

Cari:

- paper form;
- spreadsheet;
- WhatsApp;
- document;
- notebook;
- manual recap;
- duplicate entry;
- verbal process.


# 34. EXISTING TOOLS

Catat tools yang digunakan School:

```text
Tool
Purpose
Actor
Workflow
Input
Output
Pain
Dependency
```

Jangan otomatis menganggap tool existing harus digantikan.

Mungkin:

```text
KEEP
INTEGRATE
SIMPLIFY
REPLACE
```

masing-masing valid.


# 35. PAIN POINT DISCOVERY

Tidak semua pain point memiliki nilai sama.

Klasifikasikan:

```text
TIME
ERROR
DUPLICATION
VISIBILITY
COMMUNICATION
COMPLIANCE
KNOWLEDGE LOSS
DECISION DELAY
USER FRICTION
```

Kemudian tanyakan:

> Seberapa sering?

> Seberapa besar dampaknya?

> Siapa yang terdampak?


# 36. VALUE TEST

Setiap pain point diuji:

```text
Frequency
×
Impact
×
People affected
×
Potential improvement
```

Ini bukan formula numerik wajib.

Tujuannya hanya membantu prioritas.


# 37. INFORMATION DISCOVERY

Untuk setiap workflow:

> Informasi apa yang benar-benar dibutuhkan?

Kemudian:

> Dari mana informasi tersebut berasal?

Kemudian:

> Siapa yang menggunakan?

Kemudian:

> Untuk keputusan apa?

Flow:

```text
WORK
 ↓
INFORMATION
 ↓
DECISION
```


# 38. INFORMATION MINIMIZATION

Untuk setiap candidate data:

```text
Why?
Who?
When?
For what workflow?
For what decision?
```

Jika tidak ada jawaban yang jelas:

> Jangan kumpulkan.


# 39. AUTHORIZATION REALITY CHECK

Authorization model tidak boleh hanya berasal dari role names.

Validasi:

```text
Who
 ↓
Responsible for what?
 ↓
In which context?
 ↓
Needs access to what?
 ↓
For what action?
```

Contoh:

```text
Teacher
 ↓
Class A
 ↓
Student A
 ↓
Observation
 ↓
Create
```

Pertanyaan:

> Apakah ini benar-benar sesuai dengan pekerjaan Teacher?


# 40. PRIVACY REALITY CHECK

Khusus child information:

Tanyakan:

1. Siapa yang benar-benar perlu melihat?
2. Siapa yang tidak boleh melihat?
3. Apakah informasi ini sensitif?
4. Apakah informasi dikirim keluar School?
5. Apakah Guardian dapat melihatnya?
6. Apakah Teacher lain dapat melihatnya?
7. Berapa lama perlu disimpan?

Constitution menetapkan Privacy by Design dan Service Before Surveillance sebagai prinsip non-negotiable. 


# 41. ENTITY VALIDATION MATRIX

| Entity | Primary Validation Question | Status |
|---|---|---|
| School | Apa batas institutional School? | Initial |
| Person | Bagaimana identity manusia dikelola? | Initial |
| Teacher Responsibility | Bagaimana Teacher ditugaskan? | Initial |
| Staff Responsibility | Apa saja responsibility Staff? | Discovery |
| Guardian Relationship | Bagaimana Guardian relationship ditentukan? | Discovery |
| Academic Year | Bagaimana period pendidikan bekerja? | Initial |
| Class | Apa definisi operational Class? | Discovery |
| Student | Apa definisi canonical Student? | Critical |
| Enrollment | Bagaimana anak menjadi Student resmi? | Critical |
| Class Placement | Bagaimana Student ditempatkan? | Discovery |
| Attendance | Bagaimana kehadiran dicatat? | Initial |
| Learning Activity | Apa yang dianggap learning activity? | Discovery |
| Observation | Bagaimana Teacher melakukan observation? | Critical |
| Development | Bagaimana perkembangan dipahami? | Critical |
| Evidence | Apa evidence yang benar-benar diperlukan? | Discovery |
| Communication | Bagaimana School berkomunikasi? | Critical |
| Review | Bagaimana leadership melakukan review? | Discovery |


# 42. CRITICAL ENTITIES

Prioritas tertinggi:

```text
Student
Enrollment
Class
Observation
Development
Communication
```

Mengapa?

Karena keputusan terhadap entity tersebut dapat mempengaruhi:

- product;
- authorization;
- database;
- privacy;
- UX;
- future architecture.


# 43. VALIDATION OF STUDENT

Student harus divalidasi dari tiga perspektif:

```text
ADMINISTRATIVE
+
EDUCATIONAL
+
IDENTITY
```

Jika ketiganya tidak sejalan, kita perlu memisahkan konsepnya.


# 44. VALIDATION OF OBSERVATION

Observation harus divalidasi dari:

```text
ACTIVITY
+
TEACHER PRACTICE
+
STUDENT
+
TIME
+
INTERPRETATION
```

Jangan memaksakan observation menjadi assessment.


# 45. VALIDATION OF DEVELOPMENT

Development harus diuji:

```text
RAW OBSERVATION
        ↓
PATTERN?
        ↓
INTERPRETATION?
        ↓
DEVELOPMENT?
        ↓
ACTION?
```

Jika sekolah ternyata tidak memiliki konsep tersebut secara eksplisit, kita tidak boleh menciptakannya hanya demi software.


# 46. VALIDATION OF COMMUNICATION

Communication harus diuji:

```text
Need
 ↓
Message
 ↓
Recipient
 ↓
Channel
 ↓
Action
```

Jika kebutuhan sebenarnya hanya:

> daily summary

maka kita tidak perlu membangun full messaging platform.


# 47. ASSUMPTION → EVIDENCE → DECISION REGISTER

Gunakan format:

```text
ID:
Topic:
Current Assumption:
Evidence:
Source:
Confidence:
Decision:
Impact:
Affected Documents:
Status:
```

Contoh:

```text
ID: RV-001

Topic:
Student Identity

Current Assumption:
Student merupakan educational identity yang terkait dengan Person.

Evidence:
Belum tersedia.

Source:
TK Pilot Discovery.

Confidence:
Low.

Decision:
Belum diputuskan.

Impact:
Data Model
Entity Specification
Database Blueprint

Status:
OPEN
```


# 48. CONFIDENCE LEVEL

Gunakan:

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

Bukan angka presisi palsu.


# 49. EVIDENCE SOURCES

Evidence dapat berasal dari:

```text
DIRECT OBSERVATION
INTERVIEW
EXISTING DOCUMENT
EXISTING FORM
EXISTING SPREADSHEET
EXISTING SYSTEM
WORK SAMPLE
POLICY
SCHOOL DECISION
YAPENDIK GOVERNANCE
```

Evidence paling kuat untuk workflow:

> actual observation + actual artifact.


# 50. VALIDATION INTERVIEW RULE

Jangan mulai dengan:

> "Kami ingin membuat aplikasi. Fitur apa yang Anda mau?"

Lebih baik:

> "Ceritakan bagaimana pekerjaan ini dilakukan sekarang."

Kemudian:

> "Bisa tunjukkan?"

Kemudian:

> "Mengapa dilakukan seperti itu?"


# 51. TEACHER INTERVIEW QUESTIONS

1. Ceritakan satu hari kerja Anda.
2. Bagian mana yang paling penting?
3. Bagian mana yang paling menyita waktu?
4. Apa yang harus Anda catat?
5. Kapan Anda mencatatnya?
6. Apa yang sering lupa dicatat?
7. Informasi apa yang paling membantu Anda memahami Student?
8. Bagaimana Anda mencatat perkembangan anak?
9. Apa yang Anda lakukan setelah menemukan sesuatu yang penting?
10. Informasi apa yang Anda berharap lebih mudah ditemukan?


# 52. SCHOOL LEADERSHIP QUESTIONS

1. Apa yang paling perlu Anda ketahui setiap hari?
2. Apa yang paling sulit diketahui?
3. Keputusan apa yang paling sering dibuat?
4. Informasi apa yang Anda minta dari Teacher?
5. Berapa banyak waktu digunakan untuk mengumpulkan data?
6. Informasi apa yang sering tidak konsisten?
7. Apa laporan yang benar-benar digunakan?
8. Apa laporan yang hanya dibuat karena requirement?


# 53. ADMINISTRATION QUESTIONS

1. Data apa yang paling sering dimasukkan?
2. Data apa yang dimasukkan berulang?
3. Apa yang masih menggunakan spreadsheet?
4. Apa yang masih menggunakan paper?
5. Apa yang paling sering salah?
6. Apa yang paling sering harus dicari kembali?
7. Apa yang membutuhkan approval?
8. Apa yang paling merepotkan saat tahun ajaran berganti?


# 54. GUARDIAN QUESTIONS

1. Informasi apa yang paling ingin diketahui?
2. Kapan ingin menerimanya?
3. Informasi apa yang terlalu banyak?
4. Apa yang sering tidak jelas?
5. Bagaimana komunikasi dengan School saat ini?
6. Apa yang membuat komunikasi terasa merepotkan?


# 55. OBSERVATION TEMPLATE

Untuk setiap observed workflow:

```text
WORKFLOW:
DATE:
SCHOOL:
ACTOR:

START CONDITION:

STEP 1:
STEP 2:
STEP 3:
STEP 4:
STEP 5:

INFORMATION USED:

INFORMATION CREATED:

DECISION:

EXCEPTIONS:

TOOLS USED:

MANUAL WORK:

DUPLICATION:

PAIN POINT:

CURRENT OUTPUT:

NEXT WORKFLOW:

NOTES:
```


# 56. ARTIFACT COLLECTION

Jika diizinkan School, kumpulkan contoh:

```text
Form
Spreadsheet
Report
Attendance Sheet
Class List
Student Record
Teacher Notes
Observation Record
Communication Sample
Existing Policy
```

Data pribadi/child data harus disamarkan atau tidak dikumpulkan jika tidak diperlukan.


# 57. ARTIFACT ANALYSIS

Setiap artifact dianalisis:

```text
Purpose
Actor
Workflow
Information
Frequency
Source
Output
Pain
Sensitivity
```

Bukan sekadar:

> "Ini adalah form."


# 58. WORKFLOW VALIDATION MATRIX

| Workflow | Actor | Current Method | Pain | Information | Candidate Entity | Confidence |
|---|---|---|---|---|---|---|
| Daily Class | Teacher | Discovery | TBD | TBD | Class / Student | Low |
| Attendance | Teacher | Discovery | TBD | TBD | Attendance | Low |
| Observation | Teacher | Discovery | TBD | TBD | Observation | Low |
| Development | Teacher | Discovery | TBD | TBD | Development | Low |
| Guardian Communication | School/Teacher | Discovery | TBD | TBD | Communication | Low |
| Enrollment | Admin | Discovery | TBD | TBD | Enrollment | Low |
| School Review | Leadership | Discovery | TBD | TBD | Review | Low |


# 59. MODEL COMPARISON

Setelah discovery:

```text
CURRENT MODEL
      │
      ├── CONFIRMED
      │
      ├── MODIFIED
      │
      ├── REMOVED
      │
      ├── NEW
      │
      └── STILL UNKNOWN
```

Ini jauh lebih sehat daripada mempertahankan semua entity hanya karena sudah pernah dirancang.


# 60. ENTITY DISPOSITION

Setiap entity akhirnya mendapat disposition:

```text
KEEP
MODIFY
MERGE
SPLIT
DEFER
REMOVE
NEW
```

Contoh:

```text
Observation
→ KEEP / MODIFY

Development
→ VALIDATION REQUIRED

Evidence
→ MAYBE MERGE INTO SUPPORTING RECORD
```

Keputusan aktual menunggu evidence.


# 61. SIMPLICITY TEST

Setiap hasil discovery harus melewati:

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

Jika jawabannya tidak jelas:

> **Do not build yet.**

Ini mengikuti constitutional test. 


# 62. FUTURE-PROOF TEST

Setelah model divalidasi di TK, tanyakan:

> Apakah konsep ini tetap masuk akal untuk SD?

Jika ya:

> Keep as common model.

Jika tidak:

> Apakah perbedaannya memang karena educational context?

Jika ya:

> Preserve contextual variation.

Jika hanya karena implementation assumption:

> Simplify.


# 63. NO FORCED STANDARDIZATION

Jika dua TK melakukan sesuatu secara berbeda:

Jangan langsung memilih:

> TK A benar.

atau:

> TK B benar.

Pertama tentukan:

```text
COMMON PURPOSE?
COMMON INFORMATION?
COMMON OUTCOME?
COMMON GOVERNANCE?
```

Jika ya, mungkin ada shared model.

Jika tidak:

> autonomy mungkin lebih tepat.


# 64. VALIDATION OF EXISTING MODEL

Current domain model dianggap:

```text
WORKING HYPOTHESIS
```

bukan:

```text
TRUTH
```

Tujuan validation bukan membuktikan bahwa desain kita benar.

Tujuannya menemukan:

> **di mana desain kita salah atau terlalu rumit.**


# 65. DATABASE GATE

Database Blueprint **belum boleh dimulai sebagai frozen physical design** sampai critical questions memiliki jawaban yang cukup.

Minimal:

```text
[ ] School boundary understood
[ ] Person identity understood
[ ] Student identity understood
[ ] Academic Year understood
[ ] Class understood
[ ] Enrollment understood
[ ] Placement understood
[ ] Teacher responsibility understood
[ ] Attendance understood
[ ] Observation understood
[ ] Development sufficiently understood
[ ] Guardian relationship understood
[ ] Communication sufficiently understood
[ ] Privacy boundary understood
```

Tidak harus perfect.

Harus:

> **sufficiently understood to make a responsible next decision.**


# 66. VALIDATION EXIT CRITERIA

Reality Validation dapat keluar menuju Database Blueprint jika:

### 1

Critical workflow telah diamati atau dijelaskan dengan evidence yang cukup.

### 2

Critical entity meanings telah tervalidasi.

### 3

Major contradictions telah dicatat.

### 4

Assumptions telah dipisahkan dari facts.

### 5

Critical unknowns telah diputuskan atau secara sadar ditunda.

### 6

Authorization implications telah dipahami.

### 7

Privacy implications telah dipahami.

### 8

Entity inventory telah direvisi.

### 9

Database complexity dapat dijustifikasi oleh real business need.


# 67. VALIDATION DOES NOT REQUIRE CERTAINTY

Exit bukan berarti:

```text
100% CERTAIN
```

Exit berarti:

```text
ENOUGH EVIDENCE
+
KNOWN UNCERTAINTIES
+
RESPONSIBLE DECISIONS
```

Ini penting karena Constitution memang menetapkan bahwa Yapendik tidak perlu menunggu certainty untuk mulai bergerak. 


# 68. WHEN TO STOP DISCOVERY

Discovery tidak boleh menjadi alasan untuk tidak pernah membangun.

Stop discovery ketika:

```text
Critical uncertainty
        ↓
Low enough risk
        ↓
Decision reversible
        ↓
Enough evidence
        ↓
Build
```

Untuk keputusan yang mahal atau sulit dibalik:

> Think longer. Decide slower. Document clearly.

Prinsip ini berasal langsung dari Reversibility Principle Constitution. 


# 69. WHAT HAPPENS AFTER VALIDATION

Hasil validation akan menghasilkan:

```text
REALITY FINDINGS
        ↓
DOMAIN MODEL UPDATE
        ↓
ENTITY MODEL UPDATE
        ↓
WORKFLOW UPDATE
        ↓
AUTHORIZATION UPDATE
        ↓
PRODUCT UPDATE
        ↓
DATABASE BLUEPRINT
```

Jika discovery menemukan masalah fundamental:

```text
DISCOVERY
    ↓
CONSTITUTIONAL IMPACT?
    ↓
YES
    ↓
GOVERNANCE REVIEW
```

Tidak semua perubahan perlu mengubah Constitution.


# 70. GOVERNANCE

Perubahan mengikuti:

```text
Finding
 ↓
Evidence
 ↓
Impact Analysis
 ↓
Decision
 ↓
Document Update
 ↓
Affected Documents Review
```

Constitution menetapkan pola governance tersebut untuk perubahan penting. 


# 71. DOCUMENT TRACEABILITY

Jika hasil validation mengubah:

```text
Entity
```

review:

```text
Data Model
Domain & Entity Specification
Database Blueprint
```

Jika mengubah:

```text
Workflow
```

review:

```text
Operating Model
Workflow Specification
Product Blueprint
UX Architecture
```

Jika mengubah:

```text
Authorization
```

review:

```text
Authorization Model
Technical Architecture
```

Jika mengubah fundamental principle:

```text
Constitution
```

harus direview.


# 72. VALIDATION OUTPUT PACKAGE

Reality Validation idealnya menghasilkan:

```text
01. Reality Findings
02. Workflow Maps
03. Actor Findings
04. Entity Validation Matrix
05. Assumption Register
06. Decision Register
07. Pain Point Register
08. Information Findings
09. Authorization Findings
10. Privacy Findings
11. Updated Domain Model
12. Updated Entity Model
13. Open Questions
14. Database Readiness Assessment
```

Tidak semuanya harus berupa dokumen terpisah.


# 73. MINIMUM VIABLE DISCOVERY

Kita tidak perlu melakukan riset besar.

Untuk pilot, minimum discovery yang berguna adalah:

```text
Observe real work
+
Talk to real people
+
Inspect real artifacts
+
Validate critical workflows
+
Update model
```

Tujuannya bukan menghasilkan laporan konsultasi.

Tujuannya:

> **membuat keputusan desain yang lebih benar.**


# 74. SUCCESS SIGNALS

Reality Validation berhasil apabila setelah discovery kita dapat mengatakan:

> "Sekarang kami mengerti bagaimana TK ini bekerja."

bukan:

> "Sekarang kami memiliki banyak requirements."


# 75. MOST IMPORTANT QUESTION

Dalam seluruh discovery, pertanyaan utama adalah:

> **"Tunjukkan bagaimana pekerjaan ini dilakukan sekarang."**

Bukan:

> "Fitur apa yang Anda inginkan?"


# 76. TK PILOT REALITY LOOP

```text
              ┌──────────────────┐
              │   CURRENT MODEL  │
              └────────┬─────────┘
                       ↓
                ┌─────────────┐
                │ REAL SCHOOL │
                └──────┬──────┘
                       ↓
                  OBSERVE
                       ↓
                   INTERVIEW
                       ↓
                  DOCUMENT
                       ↓
                  COMPARE
                       ↓
                  SIMPLIFY
                       ↓
               UPDATE MODEL
                       ↓
                 VALIDATE
                       ↓
                ┌─────────────┐
                │ BUILD NEXT  │
                └──────┬──────┘
                       ↓
                  REAL USAGE
                       ↓
                   LEARNING
                       │
                       └──────────────→ MODEL EVOLUTION
```

Ini selaras dengan filosofi Yapendik:

> **Build → Use → Learn → Evolve.** 


# 77. CURRENT STATUS

Document:

**YAPENDIK SCHOOL OS TK PILOT REALITY VALIDATION SPECIFICATION**

Version:

**0.1**

Status:

**LIVING — DISCOVERY**

Scope:

**TK Pilot**

Purpose:

**Reality validation gate sebelum Database Blueprint**

Authority:

**Derived from YAPENDIK OS Constitution**

This document is:

**A validation framework**

This document is not:

**A database specification**

This document is not:

**A final requirements specification**


# 78. NEXT ARCHITECTURAL GATE

Setelah Reality Validation dilakukan, rantainya menjadi:

```text
YAPENDIK OS CONSTITUTION
        ↓
ENTERPRISE INFORMATION ARCHITECTURE
        ↓
SCHOOL OS OPERATING MODEL
        ↓
PRODUCT BLUEPRINT
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
★ REALITY VALIDATION ★
        ↓
VALIDATED DOMAIN MODEL
        ↓
★ DATABASE BLUEPRINT ★
        ↓
API / APPLICATION CONTRACT
        ↓
IMPLEMENTATION
```

Dan ada satu hal penting: **kita tidak perlu menunggu seluruh TK Reality Validation selesai untuk mulai bergerak.** Kita bisa memvalidasi secara bertahap, lalu mengunci bagian yang sudah cukup matang dan membiarkan bagian lain tetap `DISCOVERY`.

Itu justru paling konsisten dengan Constitution kita: **living, evidence-driven, simple, dan future-proof tanpa over-engineering.** 