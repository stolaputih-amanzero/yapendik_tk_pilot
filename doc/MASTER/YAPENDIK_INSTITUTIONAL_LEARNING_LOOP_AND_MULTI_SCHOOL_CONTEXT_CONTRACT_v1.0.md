# YAPENDIK INSTITUTIONAL LEARNING LOOP & MULTI-SCHOOL CONTEXT CONTRACT
## Architecture & Interaction Contract v1.0
### Yapendik School OS — Multi-Unit Foundation Architecture

---

## 1. Executive Purpose & Paradigm Definition

Dokumen ini mendefinisikan kontrak arsitektur tata kelola dan model konteks multi-sekolah untuk **Yapendik Institutional Learning & Governance Loop**.

Berbeda dengan sistem manajemen informasi tradisional yang memperlakukan kantor pusat/yayasan sebagai *command center* atau *surveillance hub*, Yapendik School OS mendefinisikan lapisan ini sebagai:

> **Institutional Learning Operating Loop (Siklus Pembelajaran & Kepengawasan Institusi)**:
> 
> $$\mathbf{REALITY} \longrightarrow \mathbf{PATTERN} \longrightarrow \mathbf{INSIGHT} \longrightarrow \mathbf{DECISION} \longrightarrow \mathbf{SUPPORT/DIRECTIVE} \longrightarrow \mathbf{SCHOOL\ ADOPTION} \longrightarrow \mathbf{OUTCOME} \longrightarrow \mathbf{NEW\ KNOWLEDGE}$$

Sistem ini memastikan Yayasan dapat **melihat kebutuhan sistemik, mengambil keputusan dukungan berbasis empati, dan menyalurkan sumber daya secara berkeadilan**, tanpa pernah melanggar privasi anak atau mengurangi wewenang pedagogis sekolah.

```text
               YAPENDIK MULTI-SCHOOL INSTITUTIONAL OPERATING LOOP
               
                     ┌────────────────────────────────────┐
                     ▼                                    │
               SCHOOL REALITY                             │
          (Fakta Empiris Harian)                          │
                     │                                    │
                     ▼                                    │
           DERIVED PROJECTION LAYER                       │
          (Agregasi Privasi Mutlak)                       │
                     │                                    │
                     ▼                                    │
           INSTITUTIONAL INSIGHT                          │
         (Temuan Kebutuhan Sistemik)                      │
                     │                                    │
                     ▼                                    │
           HUMAN-LED GOVERNANCE                           │
          (Keputusan Dewan Yayasan)                       │
                     │                                    │
           ┌─────────┴─────────┐                          │
           ▼                   ▼                          │
   SUPPORT INITIATIVE   GOVERNANCE DIRECTIVE              │
  (Alokasi Pelatihan)   (Panduan Kebijakan)               │
           │                   │                          │
           └─────────┬─────────┘                          │
                     ▼                                    │
          HEADMASTER CONTEXTUAL                           │
                ADOPTION                                  │
          (Adopsi Sekolah Lokal)                          │
                     │                                    │
                     ▼                                    │
          OBSERVED OUTCOME EFFECT                         │
         (Dampak Nyata pada Siklus Baru)                  │
                     │                                    │
                     └────────────────────────────────────┘
```

---

## 2. Institutional Learning Object Model (First-Class Objects)

Untuk mencegah sistem jatuh menjadi dashboard angka statis, entitas pembelajaran institusional dimodelkan sebagai **objek kelas satu (*first-class domain objects*)**:

```typescript
// 1. INSTITUTIONAL INSIGHT (Temuan Sistemik)
export interface InstitutionalInsight {
  insight_id: string;
  scope: 'SYSTEM_WIDE' | 'SCHOOL_SPECIFIC' | 'DOMAIN_SPECIFIC';
  target_school_id?: string;
  category: 'PEDAGOGICAL_EQUITY' | 'SAFETY_INTEGRITY' | 'CURRICULUM_BALANCE' | 'RESOURCE_NEED';
  title: string;
  empirical_observation: string;
  derived_metrics_summary: {
    domain_name?: string;
    aggregate_rate_pct?: number;
    benchmark_context?: string;
  };
  urgency_level: 'ROUTINE' | 'PRIORITY_SUPPORT' | 'STRATEGIC_REVIEW';
  status: 'IDENTIFIED' | 'REVIEWED' | 'ACTION_DECIDED' | 'DISMISSED';
  identified_at: string;
}

// 2. SUPPORT INITIATIVE (Pemberian Dukungan / Sumber Daya)
export interface SupportInitiative {
  initiative_id: string;
  originating_insight_id: string;
  target_school_id: string;
  initiative_type: 'TEACHER_COACHING' | 'LEARNING_MATERIALS' | 'SAFETY_EQUIPMENT' | 'SPECIALIST_CONSULTATION';
  title: string;
  resource_description: string;
  allocated_by_person_id: string;
  allocated_by_name: string;
  allocated_at: string;
  execution_status: 'PROPOSED' | 'APPROVED' | 'DEPLOYED' | 'COMPLETED';
}

// 3. GOVERNANCE DIRECTIVE (Direktif Kebijakan Yayasan)
export interface GovernanceDirective {
  directive_id: string;
  directive_code: string; // e.g. "DIR-2026-STEAM-01"
  title: string;
  policy_intent: string;
  advisory_guidance: string;
  target_audience: 'ALL_TK_UNITS' | 'SPECIFIC_SCHOOL';
  target_school_id?: string;
  issued_by_person_id: string;
  issued_by_name: string;
  effective_date: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';
}

// 4. SCHOOL ADOPTION RESPONSE (Adopsi Kontekstual oleh Kepala Sekolah)
export interface SchoolAdoptionResponse {
  response_id: string;
  directive_id: string;
  school_id: string;
  headmaster_person_id: string;
  headmaster_name: string;
  adoption_status: 'ACKNOWLEDGED' | 'ADOPTED_IN_PRACTICE' | 'ADAPTED_LOCALLY' | 'DEFERRED';
  local_context_adaptation_notes: string;
  action_timeline: string;
  acknowledged_at: string;
}

// 5. OBSERVED OUTCOME EFFECT (Dampak Teramati pada Siklus Berikutnya)
export interface ObservedOutcomeEffect {
  outcome_id: string;
  initiative_or_directive_id: string;
  school_id: string;
  baseline_metric_snapshot: string;
  evaluated_metric_snapshot: string;
  qualitative_reflection: string;
  closed_loop_verified: boolean;
  evaluated_at: string;
}
```

---

## 3. Foundation Context Model & Aggregation Boundary

### 3.1 Foundation Context Hierarchy
```text
YAPENDIK FOUNDATION CONTEXT (Multi-Unit Jurisdiction)
   │
   ├── School Units Registry (TK Menteng, TK Cabang B, ...)
   │
   ├── Institutional Insights Feed
   │
   ├── Strategic Support Initiatives
   │
   ├── Governance Directives Ledger
   │
   └── Multi-Semester Longitudinal Health Matrix
```

### 3.2 Batas Penegakan Privasi (Projection Layer Boundary - FB-01 & FB-02)
Batas data ditegakkan di layer database/service **sebelum** payload dikirim ke antarmuka Yayasan:

```text
[ DATABASE / CANONICAL SCHOOL TABLES ]
  ├── students (Nama, NIK, Wali) ───► [ PROJECTION ENGINE ] ───► ❌ STRIPPED & REDACTED
  ├── lppa_records (Narasi Anak)  ───► [ AGGREGATION FILTER ] ──► ✅ HANYA DISTRIBUSI PERSENTASE
  ├── safety_incidents (Dossier) ───► [ PRIVACY GATEKEEPER ] ──► ✅ HANYA SKOR INTEGRITAS AGREGAT
                                                                        │
                                                                        ▼
                                                       [ FOUNDATION VIEWMODEL ]
                                                       (Derived, Anonymized, Safe)
```

---

## 4. Matriks Hirarki Otoritas (Authority Matrix)

```text
AKTOR / TINGKAT      OTORITAS EKSPLISIT                  BATASAN KETAT (FORBIDDEN)
─────────────────────────────────────────────────────────────────────────────────────────────
YAYASAN              • Membaca pola sistemik multi-unit  ❌ Dilarang melihat data individual anak
(Pusat)              • Menetapkan alokasi dukungan       ❌ Dilarang memutasi nilai/catatan rapor
                     • Menerbitkan direktif panduan      ❌ Dilarang memotong otoritas Kepala Sekolah

KEPALA SEKOLAH       • Menerima/mengadaptasi direktif    ❌ Dilarang memanipulasi telemetri keselamatan
(Satuan)             • Mengajukan kebutuhan dukungan     ❌ Dilarang mengubah bukti karya empiris guru
                     • Mengesahkan LPPA & status term

GURU                 • Otoritas asesmen formatif         ❌ Dilarang menerbitkan rapor tanpa pengesahan
(Kelas)              • Merancang stimulasi harian        ❌ Dilarang mengabaikan sinyal darurat keselamatan
                     • Mendokumentasikan portofolio
```

---

## 5. Model Non-Pemeringkatan Lintas Sekolah (FB-04: Support, Not Ranking)

### Dilarang Keras (Forbidden UX Pattern):
```text
❌ LEADERBOARD MUTU SEKOLAH
#1. TK Menteng (Skor: 98) 🏆
#2. TK Kebayoran (Skor: 74) ⚠️
#3. TK Rawamangun (Skor: 61) 🚨 [PERINGATAN]
```

### Pola Resmi Yapendik OS (Equity & Priority Support Pattern):
```text
✅ MATRIKS KEBUTUHAN DUKUNGAN PEMERATAAN MUTU (EQUITY MATRIX)
┌──────────────────────┬────────────────────────┬──────────────────────────────────┐
│ Satuan Sekolah       │ Fokus Penguatan        │ Rekomendasi Inisiatif Yayasan    │
├──────────────────────┼────────────────────────┼──────────────────────────────────┤
│ TK Yapendik Menteng  │ Ragam Stimulasi STEAM  │ [Kirim Fasilitator Sentra Balok] │
│ TK Yapendik Rawamangun│ SOP Mitigasi Suhu/UKS  │ [Bantuan Termoscan & P3K Standar]│
│ TK Yapendik Kebayoran│ Penguatan Refleksi P5  │ [Lokakarya Perancangan Modul P5] │
└──────────────────────┴────────────────────────┴──────────────────────────────────┘
```

---

## 6. Aturan Penutupan Siklus Institusional (FB-05: Closed-Loop Rules)

Sebuah inisiatif atau direktif hanya dapat berstatus `CLOSED_LOOP` apabila:

$$\mathbf{INSIGHT\ DETECTED} \longrightarrow \mathbf{DECISION\ RECORDED} \longrightarrow \mathbf{SUPPORT\ DEPLOYED} \longrightarrow \mathbf{LOCAL\ ADOPTION\ CONFIRMED} \longrightarrow \mathbf{EFFECT\ MEASURED}$$

Jika Yayasan menerbitkan direktif tetapi sekolah tidak memberikan respon adopsi, sistem menandai siklus sebagai **"MENUNGGU ADOPSI SATUAN"** (*Pending School Adoption*), bukan selesai.

---

## 7. Skenario Uji Stres Arsitektur (Stress-Test Scenarios)

### Kasus A: Deteksi Kelemahan Literasi di Suatu Cabang
- **Skenario**: TK Cabang B menunjukkan 45% anak belum mencapai tahap keaksaraan awal.
- **Verifikasi Batas**: Yayasan menerima sinyal: *"Distribusi Domain Literasi TK Cabang B berada pada 55% Muncul; Perlu Dukungan Buku Cerita Bergambar"*. Sistem **100% menolak** membuka daftar nama anak yang nilainya rendah.
- **Hasil**: **Lolos (FB-01 & FB-02 Teruji)**.

### Kasus B: Penyaluran Inisiatif Dukungan Fasilitator
- **Skenario**: Yayasan mengalokasikan Guru Inti untuk mendampingi TK Cabang B.
- **Verifikasi Batas**: Kepala Sekolah Cabang B menerima notifikasi penawaran pendampingan, dapat menentukan jadwal sentra bersama, dan wewenang pengelolaan kelas tetap di tangan guru lokal.
- **Hasil**: **Lolos (FB-03 Teruji)**.

### Kasus C: Perbandingan Telemetri Antar Sekolah
- **Skenario**: Operator Yayasan membuka halaman komparasi.
- **Verifikasi Batas**: Tidak ada elemen UI yang menyajikan urutan medali/ranking. Tampilan murni menyajikan matriks kebutuhan dukungan dan status serah terima kepulangan 100%.
- **Hasil**: **Lolos (FB-04 Teruji)**.

### Kasus D: Penerbitan Direktif Mitigasi Cuaca Ekstrem
- **Skenario**: Yayasan menerbitkan direktif `DIR-2026-CUACA-01`.
- **Verifikasi Batas**: Direktif masuk ke tab kepemimpinan Kepala Sekolah $\rightarrow$ Kepala Sekolah mencatat adaptasi *"Kegiatan luar ruangan dialihkan ke aula ber-AC"* $\rightarrow$ Sinyal demam harian menurun pada evaluasi 2 minggu kemudian $\rightarrow$ Loop tertutup.
- **Hasil**: **Lolos (FB-05 Teruji)**.

---

## 8. Gerbang Kesiapan Desain (Design Readiness Gate)

| Dimensi Arsitektur | Kriteria Evaluasi | Status |
|---|---|---|
| **Domain Object Model** | 5 entitas kelas satu terdefinisi lengkap. | 🟢 TERKUNCI |
| **Privacy Boundary** | Zero Individual Exposure ditegakkan di layer proyeksi. | 🟢 TERKUNCI |
| **Authority Balance** | Wewenang terdistribusi secara harmonis (Pusat $\rightarrow$ Sekolah $\rightarrow$ Guru). | 🟢 TERKUNCI |
| **Non-Ranking UX** | Matriks berorientasi pemerataan dan dukungan (*Equity & Support*). | 🟢 TERKUNCI |
| **Closed-Loop Engine** | Jalur umpan balik dari tindakan kembali ke data terdefinisi. | 🟢 TERKUNCI |

*Dokumen ini menjadi Kontrak Arsitektur Resmi bagi perancangan Fase Tata Kelola & Pembelajaran Multi-Sekolah Yayasan Yapendik.*
