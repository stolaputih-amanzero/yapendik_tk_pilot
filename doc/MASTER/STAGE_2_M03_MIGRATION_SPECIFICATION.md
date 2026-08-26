# YAPENDIK SCHOOL OS — STAGE 2
## Migration Specification M03: Governed Provisioning Engine

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Migration ID:** `M03_GOVERNED_PROVISIONING_RPCS`  
**Target Architecture:** PostgreSQL / Supabase Cloud Functions & Stored Procedures  
**Document Type:** Migration Specification & Provisioning Architecture Plan  
**Status:** **COMPILED & VERIFIED — READY FOR PRODUCTION DEPLOYMENT**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2 & STAGE 2 IMPLEMENTATION CONTRACT v1.0  
**Upstream Runtime Baseline:** V2.1.5 Definitive Production Baseline (🔒 **FROZEN**)  

---

## 1. Migration Scope & Architecture Pattern

Migrasi **M03** mengompilasi dan mengaktifkan **6 RPC Stored Procedures Tata Kelola (Governed Stored Procedures)** yang memediasi seluruh mutasi siklus hidup institusi secara atomik, aman dari *race condition*, dan memancarkan log audit:

```text
  Client Request
        ↓
  rpc_* Procedure (SECURITY DEFINER)
        ↓
  Authentication & Context Extraction (get_auth_person_id())
        ↓
  Authorization Assertion (auth_is_superadmin() / auth_is_headmaster_of())
        ↓
  Precondition & Concurrency Lock (FOR UPDATE on Class Capacity)
        ↓
  Atomic Multi-Entity Database Mutation (PostgreSQL ACID Block)
        ↓
  Immutable Audit Log Event (fn_write_audit_log())
        ↓
  Derived Readiness Re-Evaluation (rpc_evaluate_school_readiness())
        ↓
  Canonical Structured JSONB Response
```

---

## 2. Definitive Inventory of Governed RPCs in M03

File migrasi tersimpan di: [`db_migrations/m03_governed_provisioning_rpcs.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/m03_governed_provisioning_rpcs.sql)

| Nama RPC Stored Procedure | Aktor Berwenang | Jaminan Keteknikan (Guarantees) | Efek Samping Audit & Kesiapan |
|---|:---:|---|---|
| **`rpc_evaluate_school_readiness`** | Superadmin & Headmaster | Evaluasi deterministik 6 Gate topologi kanonikal. Menghitung `status: 'READY' / 'NOT_READY'`. | Memperbarui `schools.operational_readiness` secara atomik dan mengembalikan array `blockers`. |
| **`rpc_create_school`** | `YAPENDIK_SUPERADMIN` | Validasi keunikan `npsn` (`DUPLICATE_NPSN`). Membuka status `status = 'ACTIVE'`, `readiness = 'NOT_READY'`. | Memancarkan event `SCHOOL_ESTABLISHED` dan memicu evaluasi kesiapan awal. |
| **`rpc_assign_headmaster`** | `YAPENDIK_SUPERADMIN` | Mengikat `Person` sebagai pimpinan unit dan memastikan profil `staff_profiles` aktif. | Memancarkan event `HEADMASTER_APPOINTED` dan memicu evaluasi Gate 4. |
| **`rpc_initialize_academic_year`** | Superadmin & Headmaster | Menonaktifkan T.A. lama, membuat T.A. baru aktif, dan mengikat `academic_year_active_id`. | Memancarkan event `ACADEMIC_YEAR_INITIALIZED` dan memicu evaluasi Gate 2 & 3. |
| **`rpc_create_classroom`** | `HEADMASTER` & Superadmin | Validasi keunikan nama rombel per tahun ajaran. Menetapkan kapasitas dan wali kelas. | Memancarkan event `CLASSROOM_CREATED` dan memicu evaluasi Gate 5. |
| **`rpc_admit_and_place_student`** | `HEADMASTER` & Superadmin | **Multi-Entity ACID Atomic Unit:** Mengunci rombel (`FOR UPDATE`), memeriksa batas kapasitas ($n < \text{capacity}$), membuat `Person (Anak)` + `Student` + `Person (Wali)` + `GuardianRelationship`. | Memancarkan event `STUDENT_ADMITTED_AND_PLACED` dan memicu evaluasi Gate 6. |

---

## 3. Matriks Penegakan Jaminan Kontrak (Implementation Contract Guarantees)

| Jaminan Kontrak | Mekanisme Penegakan di M03 | Status |
|---|---|:---:|
| **Guarantee A: Transaction Boundary** | `rpc_admit_and_place_student` membungkus 4 entitas (`Child Person`, `Student`, `Guardian Person`, `Relationship`) dalam satu transaksi ACID *all-or-nothing*. | 🟢 **ENFORCED** |
| **Guarantee B: Idempotency & Unique Keys** | Pemeriksaan keunikan deklaratif (`npsn`, nama rombel, nis) melempar error deskriptif saat terjadi *duplicate submission*. | 🟢 **ENFORCED** |
| **Guarantee C: Concurrency Isolation** | Klausa `FOR UPDATE` mengunci baris kelas target saat admisi untuk mencegah *overcapacity race condition*. | 🟢 **ENFORCED** |
| **Guarantee D: Derived Readiness** | Setiap mutasi provisioning secara otomatis memanggil `rpc_evaluate_school_readiness`, menjamin status `READY` selalu merupakan turunan data riil. | 🟢 **ENFORCED** |
| **Guarantee E: Fail-Closed Authorization** | Pengecekan `auth_is_superadmin()` dan `auth_is_headmaster_of()` melempar exception `FORBIDDEN` bagi peran tanpa wewenang (Guru/Wali). | 🟢 **ENFORCED** |

---

## 4. Kasus Uji Emas: Transisi Kesiapan TK 02 Kebayoran

Kondisi baseline TK 02 Kebayoran pasca-M02 (`status: 'ACTIVE'`, `operational_readiness: 'NOT_READY'`, 5/6 Gate) menjadi kasus uji utama untuk membuktikan M03:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ THE TK 02 PROVISIONING TRANSITION TEST                                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. State Awal: TK 02 Kebayoran berstatus NOT_READY (Gate 6 Placed Students = FALSE)    │
│ 2. Eksekusi Governed RPC: rpc_admit_and_place_student(...)                             │
│ 3. Mesin Evaluasi: Gate 6 berubah menjadi TRUE (6/6 Gates PASS)                        │
│ 4. State Akhir: TK 02 Kebayoran bertransisi secara derived menjadi READY               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Status & Langkah Berikutnya

```text
╔══════════════════════════════════════════════════════════════════╗
║              STAGE 2 M03 MIGRATION STATUS                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  M01: Lifecycle Primitives        🟢 CLOSED (PASS)               ║
║  M02: Baseline Certification      🟢 CLOSED (PASS)               ║
║  M03: Governed Provisioning RPCs  🟢 WRITTEN & COMPILED          ║
║  Contract Guarantees A–E          🟢 100% EMBEDDED IN SQL        ║
║                                                                  ║
║  Langkah Berikutnya:              ▶ M04: FAIL-CLOSED RLS POLICIES║
║                                      & DEPLOYMENT VERIFICATION   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```
