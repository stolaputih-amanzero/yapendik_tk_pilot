/**
 * YAPENDIK SCHOOL OS — STAGE 5 / ADR-03 MEDIA PROXY & STORAGE TRANSFORMATION SERVICE
 * 
 * Implements:
 * - Deterministic Edge Caching with Session Validation (No temporary cache-busting signed URLs)
 * - On-the-fly Supabase Image Transformations (WebP thumbnails vs high-res details)
 * - Strict Invariant C-11 & FB-01 Cross-Tenant and Confidential Quarantine Barriers
 */

export interface MediaSecurityContext {
  personId: string;
  role: 'TEACHER' | 'HEADMASTER' | 'GUARDIAN' | 'SUPERADMIN' | 'FOUNDATION_DIRECTOR' | 'FOUNDATION_TRUSTEE' | 'STAFF';
  schoolId?: string;
  studentIds?: string[]; // Child IDs linked to legal guardian via guardian_relationships
  isStaffConfidentialAccess?: boolean;
}

export type MediaTransformationContext = 'GALLERY_THUMBNAIL' | 'DETAIL_VIEW';

export interface MediaTransformationConfig {
  width: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
}

export const TRANSFORMATION_PRESETS: Record<MediaTransformationContext, MediaTransformationConfig> = {
  GALLERY_THUMBNAIL: {
    width: 320,
    quality: 75,
    format: 'webp'
  },
  DETAIL_VIEW: {
    width: 1080,
    quality: 85,
    format: 'webp'
  }
};

export const BUCKET_NAME = 'yapendik_observation_media';

export interface ParsedStoragePath {
  schoolId: string;
  studentId?: string;
  filename: string;
}

export class MediaProxyService {
  private baseUrl: string;

  constructor(customBaseUrl?: string) {
    this.baseUrl = customBaseUrl || 
      (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
      'https://yapendik.supabase.co';
  }

  /**
   * Parses the canonical storage path format:
   * Pattern: {school_id}/{student_id}/{filename} or {school_id}/{filename}
   */
  public parseStoragePath(rawPath: string): ParsedStoragePath {
    if (!rawPath || typeof rawPath !== 'string') {
      throw new Error('MEDIA_ACCESS_DENIED_C11: Invalid media storage path provided.');
    }

    const cleanPath = rawPath.replace(/^\/+/, '');
    const parts = cleanPath.split('/');

    if (parts.length < 2) {
      throw new Error('MEDIA_ACCESS_DENIED_C11: Storage path violates canonical multi-tenant hierarchy.');
    }

    if (parts.length === 2) {
      return {
        schoolId: parts[0],
        filename: parts[1]
      };
    }

    return {
      schoolId: parts[0],
      studentId: parts[1],
      filename: parts.slice(2).join('/')
    };
  }

  /**
   * Pre-check defense-in-depth: Validates actor authorization against path and metadata before dispatch.
   */
  public validateMediaAccess(
    storagePath: string,
    userContext: MediaSecurityContext,
    metadata?: { isConfidential?: boolean }
  ): boolean {
    if (!userContext || !userContext.personId) {
      throw new Error('MEDIA_ACCESS_DENIED_C11: Unauthenticated session actor.');
    }

    const parsed = this.parseStoragePath(storagePath);

    // 1. Foundation Superadmin & Governance Roles (Auditing / Stewardship Read Access)
    if (['SUPERADMIN', 'FOUNDATION_DIRECTOR', 'FOUNDATION_TRUSTEE'].includes(userContext.role)) {
      return true;
    }

    // 2. Headmaster Scope Validation (Tenant Isolation)
    if (userContext.role === 'HEADMASTER') {
      if (userContext.schoolId && userContext.schoolId !== parsed.schoolId) {
        throw new Error(`MEDIA_ACCESS_DENIED_C11: Cross-tenant media access prohibited for Headmaster from school ${userContext.schoolId}.`);
      }
      return true;
    }

    // 3. Teacher Scope Validation (Tenant Isolation)
    if (userContext.role === 'TEACHER' || userContext.role === 'STAFF') {
      if (userContext.schoolId && userContext.schoolId !== parsed.schoolId) {
        throw new Error(`MEDIA_ACCESS_DENIED_C11: Cross-tenant media access prohibited. Teacher school '${userContext.schoolId}' does not match media school '${parsed.schoolId}'.`);
      }
      return true;
    }

    // 4. Guardian Bridge Validation (Child Boundary & Invariant C-11 Confidentiality)
    if (userContext.role === 'GUARDIAN') {
      // Invariant C-11: Confidential staff notes/media strictly quarantined
      if (metadata?.isConfidential === true) {
        throw new Error('MEDIA_ACCESS_DENIED_C11: Confidential staff observation media is strictly quarantined from legal guardian bridge.');
      }

      if (!parsed.studentId) {
        throw new Error('MEDIA_ACCESS_DENIED_C11: Media lacks student association required for guardian access.');
      }

      const allowedStudents = userContext.studentIds || [];
      if (!allowedStudents.includes(parsed.studentId)) {
        throw new Error(`MEDIA_ACCESS_DENIED_C11: Guardian not authorized for child media '${parsed.studentId}'.`);
      }

      return true;
    }

    throw new Error(`MEDIA_ACCESS_DENIED_C11: Role '${userContext.role}' not authorized for observation media access.`);
  }

  /**
   * Generates deterministic, cacheable URL with Supabase Image Transformations.
   * STRICT DIRECTIVE: Does NOT generate temporary expiring signed URLs.
   */
  public getTransformedMediaUrl(
    originalPath: string,
    context: MediaTransformationContext,
    userContext: MediaSecurityContext,
    metadata?: { isConfidential?: boolean }
  ): string {
    // 1. Enforce security validation
    this.validateMediaAccess(originalPath, userContext, metadata);

    // 2. Select transformation preset
    const preset = TRANSFORMATION_PRESETS[context] || TRANSFORMATION_PRESETS.GALLERY_THUMBNAIL;
    const cleanPath = originalPath.replace(/^\/+/, '');

    // 3. Build deterministic transformation render URL
    const queryParams = new URLSearchParams({
      width: preset.width.toString(),
      quality: preset.quality.toString(),
      format: preset.format
    });

    const sanitizedBase = this.baseUrl.replace(/\/+$/, '');
    return `${sanitizedBase}/storage/v1/render/image/public/${BUCKET_NAME}/${cleanPath}?${queryParams.toString()}`;
  }

  /**
   * Returns HTTP caching headers suitable for edge proxy responses.
   */
  public getMediaProxyHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'private, max-age=86400, stale-while-revalidate=3600',
      'Content-Type': 'image/webp',
      'Vary': 'Accept, Authorization'
    };
  }
}

export const mediaProxyService = new MediaProxyService();
