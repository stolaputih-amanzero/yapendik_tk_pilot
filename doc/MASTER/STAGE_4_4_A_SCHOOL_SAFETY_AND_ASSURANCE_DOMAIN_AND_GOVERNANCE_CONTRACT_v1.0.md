# STAGE 4.4-A — SCHOOL SAFETY & OPERATIONAL ASSURANCE DOMAIN & GOVERNANCE CONTRACT v1.0
## Yapendik School OS — TK Pilot

---

## 1. Executive Summary & Epistemological Stance

Fase 4.4-A mendefinisikan lapisan **Domain Ontology, Invariant Governance Contracts, State Machines, and Command Contracts** untuk *School Safety & Operational Assurance Loop*.

### Enam Pilar Kontrak Tata Kelola:

1. **ASSURANCE-INV-01 — No Silent Safety State**:
   > *Tidak ada sinyal keselamatan atau insiden yang dapat berpindah status menjadi terselesaikan (`RESOLVED` / `AUDITED_CLOSED`) secara otomatis oleh sistem tanpa ada aktor manusia yang terotorisasi dan jejak audit yang dapat ditelusuri.*
   > 
   > $$\text{System Detects} \longrightarrow \text{System Reminds} \longrightarrow \text{System Escalates} \quad \Big[\mathbf{Human\ Resolves}\Big]$$

2. **Signal $\neq$ Diagnosis (Non-Diagnostic Invariant)**:
   > Sinyal sistem murni berupa peringatan penasihat (*advisory signal*) untuk memicu protokol/SOP manusia, bukan kesimpulan medis atau diagnosis klinis.

3. **System Signals — Institution Decides**:
   > Rekomendasi penanganan (misalnya: saran *home-visit* untuk ketidakhadiran berulang) membutuhkan telaah dan persetujuan manusia; sistem tidak pernah menjadwalkan tindakan intervensi secara otonom.

4. **Four-Tier Safety Taxonomy**:
   - **Tier 1 (Operational Fact)**: Data absensi, suhu, mood, menu makan.
   - **Tier 2 (Exception Signal)**: Peringatan anomali presensi, ambang batas demam $\ge 37.8^\circ\text{C}$, paparan alergen.
   - **Tier 3 (Safety Incident)**: Cedera fisik ringan, penjemput tidak terdaftar, reaksi medis akut.
   - **Tier 4 (Child Protection Dossier)**: Kasus perlindungan anak sensitif (dilindungi isolasi C-11 mutlak).

5. **Medical Detail $\neq$ Operational Safety Signal**:
   - Guru membutuhkan sinyal operasional aktif (misal: "Alergi Kacang Aktif", "Obat Siang 12.00").
   - Yayasan hanya menerima telemetri agregat (*derived assurance*); rekam medis detail anak dan berkas rahasia 100% dilarang tampil di dashboard yayasan.

6. **Derived Telemetry (No Stale KPI Tables)**:
   - Skor integritas operasional dihitung *on-the-fly* dari kepatuhan penanganan insiden dan rekonsiliasi harian, bukan tabel KPI statis yang mudah dimanipulasi.

---

## 2. Matriks Invarian Tata Kelola Stage 4.4

| Invariant ID | Nama Invariant | Deskripsi & Penegakan Aturan |
|---|---|---|
| **ASSURANCE-INV-01** | *No Silent Safety State* | Sistem dilarang mendeklarasikan keselamatan selesai secara otonom. Setiap resolusi insiden wajib mencatat `who`, `when`, `action_taken`, dan `evidence_reference`. |
| **ASSURANCE-INV-02** | *Non-Diagnostic Advisory* | Sinyal kesehatan dilarang memuat diagnosis penyakit klinis; hanya memetakan fakta fisik terhadap ambang batas SOP. |
| **ASSURANCE-INV-03** | *Configurable Policy Thresholds* | Ambang batas risiko kehadiran kronis ($10\%$ hari belajar atau $\ge 3$ alpa beruntun) dikonfigurasi melalui `AttendanceRiskPolicy`, bukan hard-coded universal truth. |
| **ASSURANCE-INV-04** | *Human Escalation Authority* | Peningkatan eskalasi ke tingkat `TRIAGED` dan `CONTAINED` merupakan hak eksklusif Kepala Sekolah (`Role: HEADMASTER` / `YAPENDIK_SUPERADMIN`). |
| **ASSURANCE-INV-05** | *C-11 Confidential Quarantine* | Kasus Tier 4 (Child Protection) dan catatan rahasia psikologi 100% diisolasi dari pandangan umum guru dan portal orang tua umum. |
| **ASSURANCE-INV-06** | *Zero Foundation Surveillance* | Dashboard Yayasan tidak boleh memuat nama individu anak, foto luka fisik, atau rincian obat privat anak. |
| **ASSURANCE-INV-07** | *Stage 3 Closed Semester Guard* | Seluruh penutupan insiden dan rekonsiliasi keselamatan diikat pada semester berjalan dan mematuhi `CANNOT_MUTATE_CLOSED_SEMESTER`. |
| **ASSURANCE-INV-08** | *UX Non-Fragmentation Guard* | Integrasi keselamatan pada sisi Guru melekat pada `ClassroomPulse` di `TeacherHomeShell` tanpa membuat workspace administratif terpisah. |

---

## 3. Siklus Hidup Insiden (*Incident State Machine Contract*)

Setiap transisi status wajib mencatat payload metadata audit lengkap:

```typescript
export interface IncidentStateTransitionRecord {
  from_status: IncidentLifecycleStatus | 'NONE';
  to_status: IncidentLifecycleStatus;
  transitioned_by_person_id: string;
  transitioned_by_name: string;
  transitioned_by_role: string;
  transition_timestamp: string;
  action_summary: string;
  evidence_attachment_ids: string[];
  rationale_notes: string;
}
```

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INCIDENT LIFECYCLE AUDIT STATE MACHINE                      │
│                                                                             │
│   [ Event Terdeteksi ]                                                      │
│           │                                                                 │
│           ▼                                                                 │
│     ┌───────────┐  Laporan Fakta Awal (Command 1)                           │
│     │ DETECTED  │ ─────────────────────────────────┐                        │
│     └─────┬─────┘                                  │                        │
│           │                                        ▼                        │
│           │ Kepala Sekolah Menetapkan Tingkat Keparahan                     │
│           └──────────────────────────────►┌──────────────────┐              │
│                                           │     TRIAGED      │              │
│                                           └────────┬─────────┘              │
│                                                    │                        │
│                           Tindakan Pertolongan &   │ (Command 2)            │
│                           Notifikasi Orang Tua     ▼                        │
│                                           ┌──────────────────┐              │
│                                           │    CONTAINED     │              │
│                                           └────────┬─────────┘              │
│                                                    │                        │
│                           Solusi Tuntas & Refleksi │ (Command 2)            │
│                                                    ▼                        │
│                                           ┌──────────────────┐              │
│                                           │     RESOLVED     │              │
│                                           └────────┬─────────┘              │
│                                                    │                        │
│                      Audit Akhir Semester & Arsip  │                        │
│                                                    ▼                        │
│                                           ┌──────────────────┐              │
│                                           │  AUDITED_CLOSED  │              │
│                                           └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tipe Domain & Command Contracts ([`src/types/schoolSafetyAssuranceTypes.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/types/schoolSafetyAssuranceTypes.ts))

- **Entitas Utama**:
  - `AttendanceRiskPolicy`: Kebijakan ambang batas risiko kehadiran dan demam sekolah.
  - `SafetyExceptionSignal`: Sinyal anomali operasional deterministik (Tier 2).
  - `SafetyIncidentRecord`: Rekor insiden keselamatan sekolah terakreditasi (Tier 3 & 4).
  - `ClassroomSafetyPulse`: Proyeksi kondisi keselamatan kelas untuk guru.
  - `SchoolOperationalAssuranceSummary`: Telemetri kepatuhan operasional untuk Kepala Sekolah dan Yayasan.

- **Command Contracts**:
  1. `ReportSafetyIncidentCommand`: Pelaporan insiden keselamatan darurat awal.
  2. `TransitionIncidentLifecycleCommand`: Eskalasi, penahanan (*containment*), dan resolusi insiden.
  3. `AcknowledgeExceptionSignalCommand`: Pengakuan dan penutupan sinyal anomali harian oleh guru/kepala sekolah.

---

## 5. Kesiapan Menuju Fase 4.4-B

Dengan terkuncinya kontrak dan skema pada Fase 4.4-A:
- **Fase 4.4-B** akan membangun `schoolSafetyAssuranceService.ts` yang mengimplementasikan evaluator risiko presensi kronis, state machine insiden keselamatan ter-audit, kalkulator *derived operational assurance*, dan suite pengujian otomatis komprehensif (`tests/stage4_4_safety_assurance.test.ts`).
