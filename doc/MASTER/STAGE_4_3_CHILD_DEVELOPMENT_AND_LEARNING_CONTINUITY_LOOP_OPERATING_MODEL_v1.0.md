# STAGE 4.3 — CHILD DEVELOPMENT & LEARNING CONTINUITY LOOP
## Operating Model & Architecture Discovery v1.0
### Yapendik School OS — TK Pilot

---

## 1. Posisi Arsitektural & Pergeseran Paradigma

Tahap 4.1 dan 4.2 telah berhasil menyelesaikan fondasi operasional harian dan tata kelola pelaporan resmi:
- **Stage 4.1 (Teacher Daily Operating Loop)**: *"Can the teacher easily capture and operate daily classroom life without friction?"* $\rightarrow$ **CERTIFIED**.
- **Stage 4.2 (LPPA Synthesis & Reporting)**: *"Can the school produce a trustworthy official Kurikulum Merdeka learning report grounded in empirical evidence?"* $\rightarrow$ **CERTIFIED**.

Namun, sistem pelaporan konvensional umumnya berhenti pada penerbitan rapor (bersifat episodik semesteran). 

Stage 4.3 mengangkat Yapendik School OS menuju **Continuous Pedagogical Operating System**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    YAPENDIK CONTINUOUS LEARNING CONTINUUM                   │
│                                                                             │
│   Observe ──► Evidence ──► Reflect ──► Report (LPPA) ──┐                    │
│      ▲                                                 │ (Published)        │
│      │                                                 ▼                    │
│   Act ◄────── Plan Next ◄────── Interpret ◄──── Understand Past             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **Pertanyaan Inti Stage 4.3:**
> *"Can the school use that trusted developmental history to continuously understand and plan the child's next learning journey?"*

---

## 2. Sepuluh Pertanyaan Kunci Operasional & Desain Tata Kelola

### 1. Apa yang Terjadi Setelah LPPA Berstatus `PUBLISHED`?
Setelah dokumen LPPA diterbitkan secara resmi:
1. Dokumen menjadi **Canonical Historical Baseline** yang terkunci secara permanen (*Read-Only Archive*).
2. Status perkembangan anak (Capaian 4 Elemen, Pertumbuhan Fisik, Rekomendasi Stimulasi) bertransformasi menjadi **Initial Diagnostic Context** untuk fase/semester berikutnya.
3. Rapor tidak menjadi dokumen mati di lemari arsip, melainkan *living context* yang menyambut guru di awal semester baru.

### 2. Bagaimana Hasil LPPA Menjadi Input Semester Berikutnya?
- Ketika semester baru dibuka (`ACTIVE`), sistem tidak memulai dari *blank slate*.
- Sistem mengekstrak **Pedagogical Growth Recommendations** dan **Strengths Summary** dari LPPA semester lalu.
- Rekomendasi ini disajikan kepada guru kelas sebagai *Starting Stimulation Sparks* (Catatan Orientasi Pembelajaran Awal), membantu guru merancang sentra main yang relevan dengan kebutuhan transisi anak.

### 3. Bagaimana Guru Melihat *Continuity* Perkembangan Setiap Anak?
- **Individual Developmental Arc (Busur Perkembangan Longitudinal)**:
  - Visualisasi perkembangan anak lintas semester dalam 4 Elemen Kurikulum Merdeka PAUD (NABP, Jati Diri, Dasar Literasi & STEAM, Projek P5).
  - Menampilkan tren pertumbuhan: dari *Mulai Berkembang (MB)* $\rightarrow$ *Berkembang Sesuai Harapan (BSH)* $\rightarrow$ *Berkembang Sangat Baik (BSB)*.
  - **Prinsip: Progress Over Labeling** — Sistem tidak melabeli anak, melainkan memetakan dinamika pertumbuhan dan keunikan eksplorasi anak.

### 4. Bagaimana Sekolah & Kepala Sekolah Melihat Perkembangan Rombel/Satuan?
- **Classroom Developmental Heatmap & Needs Aggregator**:
  - Kepala Sekolah dan Pengawas Yayasan dapat melihat agregat capaian rombel: misalnya, 80% anak telah mencapai BSB pada literasi & STEAM, namun 30% anak masih memerlukan stimulasi lanjutan pada regulasi emosi & resolusi konflik (Jati Diri).
  - Menjadi dasar supervisi akademik dan perencanaan alokasi Alat Permainan Edukatif (APE) atau tema sentra main sekolah.

### 5. Apa yang Boleh Menjadi Rekomendasi Sistem vs Keputusan Profesional Guru?
- **Invarian Mutlak: System Proposes — Educator Decides**:
  - *Sistem*: Menganalisis kontinuitas data historis dan menyarankan ide diferensiasi sentra main / fokus stimulasi kelompok (*Pedagogical Prompts*).
  - *Pendidik*: Menentukan aktivitas konkret di kelas, memilih pendekatan pendampingan, dan menilai kesiapan anak secara manusiawi dan berempati.

### 6. Bagaimana Evidence Semester Sebelumnya Dibawa ke Semester Berikutnya?
- Portofolio foto karya dan catatan anekdot semester lampau tetap berada pada *immutable past collection*.
- Semester baru mereferensikan artefak masa lalu melalui *Longitudinal Citation Backlink*, tanpa menyalin, memodifikasi, atau mencemari ruang kerja harian semester berjalan.

### 7. Bagaimana Menjaga Agar Historical Canonical Records Tetap Immutable?
- Rekor LPPA `PUBLISHED` dilindungi oleh *Checksum SHA-256* dan RLS read-only.
- Perencanaan semester baru disimpan dalam entitas baru: `ChildLearningContinuityPlan` yang mereferensikan `published_record_id` lama sebagai *anchor*.

### 8. Bagaimana Rantai *Child $\rightarrow$ Evidence $\rightarrow$ LPPA $\rightarrow$ Next Plan $\rightarrow$ New Evidence* Bekerja?
```text
[LPPA Published] ──► [Continuity Profile] ──► [Weekly Stimulation Plan] 
                                                        │
                                                        ▼
                                             [Teacher Home: Hari Ini]
                                                        │
                                                        ▼
                                             [Quick Capture / Observasi Baru]
```
Rencana stimulasi semester baru secara alami mengalir ke dalam **Teacher Home (Tab 1: Hari Ini & Tab 2: Jejak Anak)** pada Stage 4.1 tanpa membebani guru dengan navigasi yang rumit.

### 9. Apakah Wali Murid (Guardian) Memiliki Peran dalam Continuity Loop?
- **Home-School Growth Bridge (Jembatan Tumbuh Kembang Rumah-Sekolah)**:
  - Wali murid dapat melihat rekomendasi stimulasi lanjutan yang telah disahkan di rapor.
  - Tersedia saluran refleksi keluarga sederhana: orang tua dapat mengonfirmasi aktivitas stimulasi sederhana di rumah (misal: "Membaca buku cerita sebelum tidur", "Bermain balok bersama di rumah") sebagai kemitraan pendidikan sejati.

### 10. Apa yang BUKAN Bagian dari Stage 4.3 (Explicit Non-Goals)?
1. **BUKAN Learning Management System (LMS) atau Ujian Online**: Anak usia dini belajar melalui bermain (*play-based learning*), bukan mengerjakan tugas online.
2. **BUKAN Sistem Perangkingan atau Skoring Kuantitatif**: Tidak ada IPK, nilai rata-rata angka, atau peringkat kelas.
3. **BUKAN Sistem Otomatisasi Kurikulum Tanpa Guru**: Sistem tidak pernah menggantikan kehadiran dan intuisi pendidik.
4. **BUKAN Surveillance / Pelanggaran Privasi**: Pemantauan murni bersifat perkembangan (*developmental*), mematuhi Invarian C-11 secara ketat.

---

## 3. Entitas Domain & Skema Konseptual Stage 4.3

```typescript
/**
 * Snapshot Profil Kontinuitas Perkembangan Anak
 */
export interface ChildContinuityProfile {
  student_id: string;
  student_name: string;
  current_class_id: string;
  historical_lppa_records: {
    academic_year_id: string;
    semester: 'GANJIL' | 'GENAP';
    published_record_id: string;
    elements_summary: Record<string, { rating: string; narrative_snippet: string }>;
    growth_focus: string;
  }[];
  active_developmental_trajectory: {
    element_key: string;
    trajectory_curve: ('MB' | 'BSH' | 'BSB')[];
    current_strengths: string[];
    recommended_stimulation_focus: string[];
  }[];
}

/**
 * Rencana Stimulasi Pembelajaran Terarah Guru
 */
export interface LearningStimulationPlan {
  plan_id: string;
  school_id: string;
  class_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  target_student_ids: string[]; // Bisa individual atau kelompok kecil
  target_element_key: string;
  stimulation_goal: string;
  suggested_center_activities: string[]; // Sentra Main Balok, Bahan Alam, Peran, dll.
  teacher_notes: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}
```

---

## 4. Rencana Tahapan Stage 4.3

```text
[ 4.3-A: Domain Model & Continuity Contract ]
   └── Definisikan skema profil kontinuitas & rencana stimulasi belajar

[ 4.3-B: Application Services & Longitudinal Analytics Engine ]
   └── Service untuk agregasi multi-semester & rekomendasi diferensiasi sentra

[ 4.3-C: Classroom Heatmap & Teacher Continuity Surface ]
   └── Visualisasi profil kontinuitas anak & rencana stimulasi di Teacher Home

[ 4.3-D: Home-School Growth Bridge (Guardian Partnership) ]
   └── Refleksi kolaboratif stimulasi rumah di Portal Wali Murid

[ 4.3-E: Verification, Full Regression & Final Certification ]
   └── 100% automated tests across all suites (Stage 3 + 4.1 + 4.2 + 4.3)
```

---

## 5. Ringkasan Invarian yang Diwarisi

- **Evidence Before Interpretation**: Tidak ada wawasan tanpa data bukti otentik.
- **Human-in-the-Loop**: Guru merancang dan memutuskan stimulasi.
- **Invariant C-11 Absolute**: Data rahasia internal tetap terisolasi.
- **Living Baseline**: Dibangun secara kokoh dan modular untuk evolusi masa depan.
