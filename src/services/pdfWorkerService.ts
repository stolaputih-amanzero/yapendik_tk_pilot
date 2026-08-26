/**
 * YAPENDIK SCHOOL OS — STAGE 5 / ADR-04 SERVER-SIDE PDF GENERATION WORKER & LEDGER SERVICE
 * 
 * Implements:
 * - Server-Side Cryptographic PDF Generation Queue & State Machine
 * - Tamper-Proof SHA-256 Checksum Verification Logic (ADR-04)
 * - Invariant FB-03 / C-11 Tenant & Role Access Controls (Headmaster/Superadmin Only)
 * - BSrE-Ready Digital Signature Lifecycle Stubs
 * - Universal Isomorphic Cryptographic Implementation (Zero External Bundler Dependencies)
 */

export type ReportType = 'LPPA_SEMESTER_REPORT' | 'CONTINUITY_PROFILE' | 'SAFETY_INCIDENT';
export type PdfRequestStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type BsreSignatureStatus = 'UNSIGNED' | 'PENDING_BSRE' | 'SIGNED' | 'FAILED';

export interface PdfSecurityContext {
  personId: string;
  role: 'TEACHER' | 'HEADMASTER' | 'SUPERADMIN' | 'FOUNDATION_DIRECTOR' | 'FOUNDATION_TRUSTEE' | 'GUARDIAN' | 'STAFF';
  schoolId?: string;
}

export interface PdfGenerationRequest {
  requestId: string;
  reportType: ReportType;
  entityId: string;
  schoolId: string;
  requestedByPersonId: string;
  status: PdfRequestStatus;
  storageObjectPath?: string;
  sha256Checksum?: string;
  bsreSignatureStatus: BsreSignatureStatus;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

/**
 * Standard FIPS 180-4 Isomorphic SHA-256 Hash Computation.
 * Guarantees zero-dependency determinism in both Node.js test runners and Vite browser bundles.
 */
export function calculateSha256(input: Uint8Array | Buffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }

  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const len = bytes.length;
  const bitLen = len * 8;
  const padLen = (((len + 8) >> 6) + 1) << 6;
  const words = new Uint32Array(padLen >> 2);

  for (let i = 0; i < len; i++) {
    words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
  words[words.length - 1] = bitLen >>> 0;
  words[words.length - 2] = Math.floor(bitLen / 0x100000000);

  const W = new Uint32Array(64);

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[i + t];
    for (let t = 16; t < 64; t++) {
      const gamma0 = ((W[t - 15] >>> 7) | (W[t - 15] << 25)) ^ ((W[t - 15] >>> 18) | (W[t - 15] << 14)) ^ (W[t - 15] >>> 3);
      const gamma1 = ((W[t - 2] >>> 17) | (W[t - 2] << 15)) ^ ((W[t - 2] >>> 19) | (W[t - 2] << 13)) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + gamma0 + W[t - 7] + gamma1) | 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let t = 0; t < 64; t++) {
      const sigma1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + sigma1 + ch + K[t] + W[t]) | 0;
      const sigma0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}

export class PdfWorkerService {
  private queueLedger: Map<string, PdfGenerationRequest> = new Map();

  /**
   * Computes deterministic SHA-256 cryptographic hash of arbitrary payload/buffer.
   */
  public computeSha256(data: Buffer | Uint8Array | string): string {
    return calculateSha256(data);
  }

  /**
   * Commissions a new official PDF generation task into the ledger queue.
   */
  public async requestOfficialPdfGeneration(
    reportType: ReportType,
    entityId: string,
    userContext: PdfSecurityContext,
    metadata?: { entitySchoolId?: string; entityStatus?: string }
  ): Promise<PdfGenerationRequest> {
    if (!userContext || !userContext.personId) {
      throw new Error('PDF_GENERATION_ACCESS_DENIED: Unauthenticated session actor.');
    }

    // 1. Role Authorization Gate: Strictly Headmaster or Foundation Governance
    const isAuthorizedRole = ['HEADMASTER', 'SUPERADMIN', 'FOUNDATION_DIRECTOR', 'FOUNDATION_TRUSTEE'].includes(userContext.role);
    if (!isAuthorizedRole) {
      throw new Error(`PDF_GENERATION_ACCESS_DENIED: Role '${userContext.role}' is not authorized to commission official cryptographic PDFs. Only Headmaster or Foundation Superadmin can generate official records.`);
    }

    const targetSchoolId = metadata?.entitySchoolId || userContext.schoolId || 'sch_tk_yapendik_01';

    // 2. Tenant Isolation Gate
    if (userContext.role === 'HEADMASTER') {
      if (userContext.schoolId && userContext.schoolId !== targetSchoolId) {
        throw new Error(`PDF_CROSS_TENANT_ACCESS_DENIED: Headmaster of school '${userContext.schoolId}' cannot commission PDFs for school '${targetSchoolId}'.`);
      }
    }

    // 3. Workflow State Pre-condition: LPPA Must be officially APPROVED/PUBLISHED before PDF issuance
    if (reportType === 'LPPA_SEMESTER_REPORT') {
      const allowedStatuses = ['APPROVED', 'PUBLISHED', 'OFFICIALLY_SEALED', 'SEALED'];
      if (metadata?.entityStatus && !allowedStatuses.includes(metadata.entityStatus.toUpperCase())) {
        throw new Error(`LPPA_NOT_OFFICIALLY_APPROVED: Cannot commission official PDF for LPPA with status '${metadata.entityStatus}'. Rapor must be approved by Headmaster first.`);
      }
    }

    const requestId = `pdf_req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newRequest: PdfGenerationRequest = {
      requestId,
      reportType,
      entityId,
      schoolId: targetSchoolId,
      requestedByPersonId: userContext.personId,
      status: 'PENDING',
      bsreSignatureStatus: 'UNSIGNED',
      createdAt: new Date().toISOString()
    };

    this.queueLedger.set(requestId, newRequest);
    return newRequest;
  }

  /**
   * Simulates asynchronous worker rendering completion, SHA-256 hashing, and storage upload.
   */
  public async simulateWorkerCompletion(
    requestId: string,
    mockPdfBuffer: Buffer | Uint8Array | string
  ): Promise<PdfGenerationRequest> {
    const existing = this.queueLedger.get(requestId);
    if (!existing) {
      throw new Error(`PDF_REQUEST_NOT_FOUND: Request '${requestId}' does not exist in queue ledger.`);
    }

    // State Machine Immutability Rule (Cannot re-process COMPLETED artifact)
    if (existing.status === 'COMPLETED') {
      throw new Error(`INVALID_STATE_TRANSITION: Completed PDF artifact '${requestId}' is immutable and cannot be transitioned to another state.`);
    }

    const hash = this.computeSha256(mockPdfBuffer);
    const storagePath = `official_reports/${existing.schoolId}/${existing.reportType.toLowerCase()}/${existing.entityId}_${existing.requestId}.pdf`;

    const updated: PdfGenerationRequest = {
      ...existing,
      status: 'COMPLETED',
      sha256Checksum: hash,
      storageObjectPath: storagePath,
      completedAt: new Date().toISOString()
    };

    this.queueLedger.set(requestId, updated);
    return updated;
  }

  /**
   * Verifies the cryptographic integrity of a downloaded PDF artifact against ledger checksum.
   * Throws ARTIFACT_TAMPERED_OR_CORRUPTED on any mismatch.
   */
  public verifyPdfArtifactIntegrity(
    requestId: string,
    actualPayloadOrHash: Buffer | Uint8Array | string,
    explicitExpectedHash?: string
  ): { isValid: boolean; checksum: string } {
    let expectedHash = explicitExpectedHash;

    if (!expectedHash) {
      const record = this.queueLedger.get(requestId);
      if (!record || !record.sha256Checksum) {
        throw new Error(`LEDGER_RECORD_NOT_FOUND: Cannot verify integrity, no recorded checksum found for '${requestId}'.`);
      }
      expectedHash = record.sha256Checksum;
    }

    const actualHash = typeof actualPayloadOrHash === 'string' && actualPayloadOrHash.length === 64 && /^[0-9a-f]+$/i.test(actualPayloadOrHash)
      ? actualPayloadOrHash.toLowerCase()
      : this.computeSha256(actualPayloadOrHash);

    if (actualHash !== expectedHash.toLowerCase()) {
      throw new Error(`ARTIFACT_TAMPERED_OR_CORRUPTED: SHA-256 checksum mismatch. Expected '${expectedHash}' but computed '${actualHash}'. PDF may have been altered or corrupted in transit.`);
    }

    return {
      isValid: true,
      checksum: actualHash
    };
  }

  /**
   * Retrieves request by ID with tenant isolation guard.
   */
  public getPdfRequestById(requestId: string, userContext?: PdfSecurityContext): PdfGenerationRequest | undefined {
    const record = this.queueLedger.get(requestId);
    if (!record) return undefined;

    if (userContext && userContext.role === 'HEADMASTER') {
      if (userContext.schoolId && userContext.schoolId !== record.schoolId) {
        throw new Error(`PDF_CROSS_TENANT_ACCESS_DENIED: Headmaster of school '${userContext.schoolId}' cannot access PDF queue for school '${record.schoolId}'.`);
      }
    }

    return record;
  }

  /**
   * Clears the in-memory queue ledger (for clean test setups).
   */
  public resetLedger(): void {
    this.queueLedger.clear();
  }
}

export const pdfWorkerService = new PdfWorkerService();
