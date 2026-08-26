# STAGE 4.4-D — HEADMASTER OPERATIONAL ASSURANCE HUB
## Architecture & Interaction Contract v1.0
### Yapendik School OS — TK Pilot

---

## 1. Executive Context & Paradigm Shift

Fase 4.4-D mendefinisikan antarmuka dan kontrak tata kelola untuk **Headmaster Operational Assurance Hub**.

Berbeda secara fundamental dari *Teacher Home* (yang dirancang agar OS menghilang ke dalam ritme pendampingan anak harian), Headmaster Hub dirancang sebagai:

> **Resolution Console (Konsol Resolusi & Akuntabilitas Kelembagaan)**:
> 
> $$\mathbf{SEE} \longrightarrow \mathbf{TRIAGE} \longrightarrow \mathbf{ACT} \longrightarrow \mathbf{VERIFY} \longrightarrow \mathbf{CLOSE}$$

Konsol ini berfokus pada **Assurance First, Detail Second**: membuktikan bahwa operasi harian sekolah berjalan dengan aman, tertib, dan terkendali tanpa pernah berubah menjadi instrumen pengawasan mikro (*zero child surveillance*).

```text
                    SCHOOL DAILY OPERATING FACTS
                                 │
                                 ▼
                  DETERMINISTIC EXCEPTION SIGNALS
                                 │
                                 ▼
                 HUMAN-LED TRIAGE & ACTION (Headmaster)
                                 │
                                 ▼
                 CONTAINMENT & AUDITED RESOLUTION
                                 │
                                 ▼
                 PERMANENT CLOSURE & ARTIFACT SEAL
                                 │
                                 ▼
                 DERIVED INSTITUTIONAL TELEMETRY
```

---

## 2. Matriks Kontrak Tata Kelola & Batas Otoritas (HD-01 s.d. HD-10)

| Kontrak ID | Nama Kontrak | Deskripsi & Penegakan Aturan Tata Kelola |
|---|---|---|
| **HD-01** | *School-Level Operational Context* | Kepala Sekolah membuka satu konteks sekolah dalam yurisdiksinya (`activeSchoolId`), bukan tumpukan menu administratif terfragmentasi. |
| **HD-02** | *Assurance First, Detail Second* | Landing surface menyajikan indikator jaminan operasional terderivasi (*derived assurance telemetry*), bukan daftar mentah seluruh anak. |
| **HD-03** | *Exception Queue $\neq$ Incident Queue* | Sinyal anomali (Tier 2) dan insiden keselamatan resmi (Tier 3/4) adalah dua konsep terpisah. Sinyal tidak otomatis menjadi insiden tanpa telaah manusia. |
| **HD-04** | *Audited Lifecycle State Machine* | Transisi status (`DETECTED` $\rightarrow$ `TRIAGED` $\rightarrow$ `CONTAINED` $\rightarrow$ `RESOLVED` $\rightarrow$ `AUDITED_CLOSED`) wajib mencatat `who`, `when`, `why`, dan `action_summary`. |
| **HD-05** | *Escalation, Not Diagnosis* | Bahasa antarmuka murni berupa fakta operasional & eskalasi SOP (*Perlu Tindakan*, *Sinyal Suhu*, *Belum Diaudit*), bebas dari inferensi klinis atau pseudo-diagnosis. |
| **HD-06** | *Three-Tier Privacy Boundary* | **Teacher**: Konteks keselamatan rombel.<br>**Headmaster**: Manajemen kasus & audit sekolah.<br>**Foundation**: Telemetri agregat tanpa nama anak/detail medis privat. |
| **HD-07** | *Forbidden Design: Zero Surveillance* | **DILARANG**: Menampilkan daftar rekam medis semua anak, suhu massal, atau berkas sengketa keluarga di dashboard pimpinan. |
| **HD-08** | *Handover Reconciliation as First-Class Metric* | Rekonsiliasi kepulangan peserta didik (100% anak telah dijemput wali sah sebelum gerbang tutup) menjadi metrik jaminan operasional utama. |
| **HD-09** | *Closed Semester Mutation Guard* | Semester yang telah ditutup berstatus *read-only audit projection*; seluruh mutasi insiden diblokir oleh `CANNOT_MUTATE_CLOSED_SEMESTER`. |
| **HD-10** | *UX Non-Fragmentation Guard* | Integrasi Headmaster Hub ditempatkan sebagai Sub-Tab 4 pada `AcademicLifecycleWorkspace.tsx`, menjaga kesatuan ruang kendali akademik Kepala Sekolah. |
| **HD-NEG-01** | *Negative Invariant Guard* | *Headmaster Hub MUST NOT become a child surveillance surface.* Akses rincian insiden hanya dibuka melalui aksi *drill-down* eksplisit berbasis kebutuhan operasional. |

---

## 3. Hierarki Informasi & Sketsa Antarmuka (Information Architecture)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ HEADMASTER OPERATIONAL ASSURANCE HUB — TK YAPENDIK MENTENG              │
│ Periode: 2025/2026 (Semester Ganjil) • Kepala Sekolah: Dra. Esther Nugroho  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 1. TODAY'S OPERATIONAL ASSURANCE (Derived Real-Time Telemetry)              │
│ ┌──────────────────┬──────────────────┬─────────────────┬─────────────────┐ │
│ │ 🟢 Kehadiran     │ 🟢 Rekonsiliasi  │ 🟡 Pengecualian │ 🔴 Insiden      │ │
│ │    96% (15/16)   │    100% (16/16)  │    2 Sinyal     │    1 Terbuka    │ │
│ └──────────────────┴──────────────────┴─────────────────┴─────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 2. NEEDS ATTENTION: ACTIONABLE OPERATIONAL QUEUE                            │
│                                                                             │
│ 🔴 [Insiden #inc_8492] Lutut lecet terbentur meja sentra balok (TK A)       │
│    Status: DETECTED • Dilaporkan: Siti Rahmawati, S.Pd (08.45 WIB)          │
│    Tindakan Diperlukan: [Triage & Otorisasi Penanganan Kepala Sekolah]      │
│                                                                             │
│ 🟡 [Sinyal Pengecualian] Suhu Ananda Kenzo terukur 38.2°C (TK A)             │
│    Status: ACKNOWLEDGED • Respons Guru: "Diberi minum hangat di UKS"        │
│    Tindakan Diperlukan: [Pantau Penjemputan Orang Tua]                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 3. INCIDENT LIFECYCLE MANAGEMENT & AUDITED STATE TRANSITIONS                │
│                                                                             │
│ [Filter: Semua | Perlu Triage (1) | Perlu Containment (0) | Selesai (2)]    │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Judul Insiden          │ Rombel │ Tingkat   │ Status    │ Aksi Cepat    │ │
│ ├────────────────────────┼────────┼───────────┼───────────┼───────────────┤ │
│ │ Lutut lecet terbentur  │ TK A   │ Sedang    │ DETECTED  │ [⚡ Triage]   │ │
│ │ Alergi bersin debu     │ TK B   │ Ringan    │ RESOLVED  │ [🔒 Audit]    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 4. AUDIT & HANDOVER RECONCILIATION INTEGRITY                                │
│                                                                             │
│ • Rekonsiliasi Serah Terima Kepulangan (Handover): 100% Selesai             │
│ • Kepatuhan Penutupan Insiden Semester: 94% Integritas Operasional          │
│ • Status Kesiapan Penutupan Semester (Option A Gate): SIAP                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Triage & Transition Interaction Contract (Command Handlers)

### Dialog Aksi: Triage Insiden oleh Kepala Sekolah
Ketika Kepala Sekolah mengklik `[⚡ Triage]`:
- **Input Form**:
  - `Severity Level`: *Ringan / Sedang / Kritis*.
  - `Action Summary`: Instruksi penanganan P3K dan komunikasi wali.
  - `Notify Parent Checkbox`: Menandai orang tua telah dihubungi via telepon/pesan.
  - `Parent Contacted Name`: Nama wali yang menerima informasi.
  - `Rationale Notes`: Alasan penetapan eskalasi.
- **Eksekusi Command**:
  - Memanggil `schoolSafetyAssuranceService.transitionIncidentLifecycle()` dengan `target_status = 'TRIAGED'`.
  - Menerbitkan `IncidentStateTransitionRecord` terenkripsi dalam audit log.

### Dialog Aksi: Audit Penutupan Insiden Permanen (`AUDITED_CLOSED`)
Ketika Kepala Sekolah melakukan verifikasi penutupan insiden di akhir siklus:
- **Input Form**:
  - `Audit Findings`: Verifikasi bahwa kondisi fisik anak telah pulih dan hubungan dengan keluarga harmonis.
  - `Closure Authority Confirmation`: Stempel digital Kepala Sekolah.
- **Eksekusi Command**:
  - Memanggil `schoolSafetyAssuranceService.transitionIncidentLifecycle()` dengan `target_status = 'AUDITED_CLOSED'`.

---

## 5. Rencana Eksekusi Implementasi 4.4-D (Setelah Desain Disetujui)

```text
[ 4.4-D1: View Model & Handover Assurance Aggregator in Service ]
   └── Menambahkan aggregator presensi & kepulangan pada schoolSafetyAssuranceService

[ 4.4-D2: Headmaster Operational Assurance View Component ]
   └── Membangun HeadmasterAssuranceView.tsx dengan 4 panel modular sesuai spesifikasi

[ 4.4-D3: Sub-Tab 4 Integration in AcademicLifecycleWorkspace.tsx ]
   └── Mengintegrasikan tab "🛡️ Jaminan Operasional & Keselamatan" di samping Verifikasi LPPA

[ 4.4-D4: Triage & Audit Transition Modals ]
   └── Menyediakan dialog konfirmasi triage dan penutupan audit berjejak permanen

[ 4.4-D5: Contract & Integration Tests Suite ]
   └── Menambahkan Module 7 & 8 pada tests/stage4_4_safety_assurance.test.ts
```

---

*Disahkan sebagai Dokumen Kontrak Arsitektur & Interaksi Resmi Stage 4.4-D Yapendik School OS.*
