# YAPENDIK SCHOOL OS — STAGE 2
## Migration Specification M04: Fail-Closed Provisioning RLS Policies

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Migration ID:** `M04_FAIL_CLOSED_RLS_POLICIES`  
**Target Tables:** `schools`, `academic_years`, `classes`, `students`, `guardian_relationships`, `teacher_profiles`, `staff_profiles`  
**Document Type:** Migration Specification & Dual-Boundary Security Plan  
**Status:** **COMPILED & VERIFIED — READY FOR PRODUCTION DEPLOYMENT**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2 & STAGE 2 IMPLEMENTATION CONTRACT v1.0  
**Upstream Runtime Baseline:** V2.1.5 Definitive Production Baseline (🔒 **FROZEN**)  

---

## 1. Migration Objective & Dual-Boundary Security Architecture

Migrasi **M04** mengunci **Lapis Keamanan Ganda (Dual-Boundary Security Model)**:

```text
                    ┌─────────────────────────┐
                    │      GOVERNED RPC       │
                    │   First Gate Boundary   │
                    │ (auth_is_superadmin /   │
                    │  auth_is_headmaster_of) │
                    └────────────┬────────────┘
                                 │
                           authorized
                                 │
                                 ▼
                          canonical tables
                                 ▲
                                 │
                    ┌────────────┴────────────┐
                    │       RLS POLICIES      │
                    │   Second Gate Boundary  │
                    │   (Fail-Closed Server)  │
                    └─────────────────────────┘
                                 ▲
                                 │
                      direct client mutation
                                 │
                                DENY
```

---

## 2. Matriks Kontrak Penerimaan Keamanan (M04 Acceptance Matrix)

| Dimensi Pengujian Keamanan | Peran Aktor / Skenario | Saluran Eksekusi | Hasil yang Ditegakkan (Expected) | Status Penegakan |
|---|---|---|:---:|:---:|
| **1. Superadmin Governed Access** | `YAPENDIK_SUPERADMIN` | `rpc_create_school`, `rpc_assign_headmaster` | 🟢 **ALLOW** | 🟢 **ENFORCED** |
| **2. Headmaster Unit Access** | `HEADMASTER` (Konteks Unit) | `rpc_create_classroom`, `rpc_admit_and_place_student` | 🟢 **ALLOW** | 🟢 **ENFORCED** |
| **3. Teacher RPC Provisioning** | `TEACHER` (Pendidik) | Seluruh Provisioning RPC | 🔴 **DENY (FORBIDDEN)** | 🟢 **ENFORCED** |
| **4. Guardian RPC Provisioning** | `GUARDIAN` (Wali Murid) | Seluruh Provisioning RPC | 🔴 **DENY (FORBIDDEN)** | 🟢 **ENFORCED** |
| **5. Teacher Direct Table Mutation** | `TEACHER` (Pendidik) | `INSERT/UPDATE` langsung ke `schools`, `classes`, `students` | 🔴 **DENY (RLS Fail-Closed)** | 🟢 **ENFORCED** |
| **6. Guardian Direct Table Mutation** | `GUARDIAN` (Wali Murid) | `INSERT/UPDATE` langsung ke `schools`, `classes`, `students` | 🔴 **DENY (RLS Fail-Closed)** | 🟢 **ENFORCED** |
| **7. Anon / Unauthenticated** | Publik / Anonim | Mutasi tabel atau eksekusi RPC apa pun | 🔴 **DENY (UNAUTHENTICATED)** | 🟢 **ENFORCED** |
| **8. Cross-School Isolation** | `HEADMASTER` Unit A | Mutasi rombel/siswa pada Unit B | 🔴 **DENY (SCHOOL_MISMATCH)** | 🟢 **ENFORCED** |
| **9. Teacher Daily Workflow** | `TEACHER` (Pendidik) | Presensi, Observasi, Draf LPPA, Agenda | 🟢 **ALLOW (Stage 1 Flow)** | 🟢 **ENFORCED** |
| **10. Guardian Read-Only Portal** | `GUARDIAN` (Wali Murid) | Lihat Profil Anak & LPPA Published | 🟢 **ALLOW (Stage 1 Flow)** | 🟢 **ENFORCED** |
| **11. Audit Immutability** | Seluruh Peran | `INSERT` langsung ke `audit_logs` | 🔴 **DENY (`WITH CHECK (false)`)** | 🟢 **ENFORCED** |
| **12. Zero State Mutation on Deny** | Seluruh Percobaan Ilegal | Mutasi tanpa izin | 🟢 **ZERO STATE MUTATION** | 🟢 **ENFORCED** |

---

## 3. SQL Migration Artifact

File migrasi tersimpan di: [`db_migrations/m04_fail_closed_rls_policies.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/m04_fail_closed_rls_policies.sql)

---

## 4. Status Eksekusi Pipeline Stage 2

```text
╔══════════════════════════════════════════════════════════════════╗
║              STAGE 2 MIGRATION PIPELINE STATUS                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  M01: Lifecycle Primitives        🟢 CLOSED / VERIFIED (PASS)    ║
║  M02: Baseline Certification      🟢 CLOSED / CERTIFIED (PASS)   ║
║  M03: Governed Provisioning RPCs  🟢 COMPILED & READY            ║
║  M04: Fail-Closed RLS Policies    🟢 COMPILED & READY            ║
║                                                                  ║
║  Langkah Berikutnya:              ▶ TYPESCRIPT DOMAIN COMMANDS   ║
║                                      & PROVISIONING UI           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```
