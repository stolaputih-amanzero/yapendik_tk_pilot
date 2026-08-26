/**
 * ==============================================================================
 * YAPENDIK SCHOOL OS TK PILOT - TEST SUITE 22
 * STAGE 5 SPRINT 2: STORAGE OPTIMIZATION & EDGE CACHING CONTRACTS (ADR-03)
 * ==============================================================================
 * Covers:
 * - Module 1: ADR-03 Dynamic Image Transformation URL Generation (WebP / Presets)
 * - Module 2: ADR-03 Deterministic Caching & Edge Headers Contract
 * - Module 3: Invariant C-11 Cross-Tenant Media Isolation (Teacher / Headmaster)
 * - Module 4: Invariant C-11 Guardian Child-Boundary & Confidential Quarantine
 * - Module 5: Migration M09 DDL & Down-Script Rollback Contract
 * ==============================================================================
 */

import { strict as assert } from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import {
  mediaProxyService,
  MediaSecurityContext,
  BUCKET_NAME
} from '../src/services/mediaProxyService';

export async function runStage5StorageAndEdgeContractsTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 5 STORAGE & EDGE CACHING CONTRACT TEST SUITE (SUITE 22)');
  console.log('════════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runCheck(testName: string, fn: () => void) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  const migrationsDir = path.resolve(process.cwd(), 'db_migrations');
  const m09Path = path.join(migrationsDir, 'm09_storage_optimization_and_media_proxy.sql');
  const m09DownPath = path.join(migrationsDir, 'm09_storage_optimization_and_media_proxy_down.sql');

  const teacherTk01: MediaSecurityContext = {
    personId: 'per_teacher_01',
    role: 'TEACHER',
    schoolId: 'sch_tk_menteng_01'
  };

  const teacherTk02: MediaSecurityContext = {
    personId: 'per_teacher_02',
    role: 'TEACHER',
    schoolId: 'sch_tk_cabang_02'
  };

  const headmasterTk01: MediaSecurityContext = {
    personId: 'per_hm_01',
    role: 'HEADMASTER',
    schoolId: 'sch_tk_menteng_01'
  };

  const guardianChild123: MediaSecurityContext = {
    personId: 'per_guardian_01',
    role: 'GUARDIAN',
    studentIds: ['stu_ananda_123']
  };

  const foundationDirector: MediaSecurityContext = {
    personId: 'per_dir_01',
    role: 'FOUNDATION_DIRECTOR'
  };

  // ------------------------------------------------------------------------------
  // MODULE 1: TRANSFORMATION URL GENERATION (DIRECTIVE 1 & 3)
  // ------------------------------------------------------------------------------
  console.log('--- MODULE 1: Dynamic Image Transformation URL Generation (ADR-03) ---');

  runCheck('Suite 22 [TRANSFORM GALLERY]: GALLERY_THUMBNAIL produces width=320, quality=75, format=webp', () => {
    const url = mediaProxyService.getTransformedMediaUrl(
      'sch_tk_menteng_01/stu_ananda_123/block_play_01.jpg',
      'GALLERY_THUMBNAIL',
      teacherTk01
    );

    assert.ok(url.includes('width=320'), 'Thumbnail must specify width=320');
    assert.ok(url.includes('quality=75'), 'Thumbnail must specify quality=75');
    assert.ok(url.includes('format=webp'), 'Thumbnail must specify format=webp');
    assert.ok(url.includes(BUCKET_NAME), 'URL must point to canonical bucket');
  });

  runCheck('Suite 22 [TRANSFORM DETAIL]: DETAIL_VIEW produces width=1080, quality=85, format=webp', () => {
    const url = mediaProxyService.getTransformedMediaUrl(
      'sch_tk_menteng_01/stu_ananda_123/block_play_01.jpg',
      'DETAIL_VIEW',
      teacherTk01
    );

    assert.ok(url.includes('width=1080'), 'Detail view must specify width=1080');
    assert.ok(url.includes('quality=85'), 'Detail view must specify quality=85');
    assert.ok(url.includes('format=webp'), 'Detail view must specify format=webp');
  });

  runCheck('Suite 22 [DIRECTIVE 1]: No temporary expiring query parameters (Anti Signed URL Cache Busting)', () => {
    const url = mediaProxyService.getTransformedMediaUrl(
      'sch_tk_menteng_01/stu_ananda_123/block_play_01.jpg',
      'GALLERY_THUMBNAIL',
      teacherTk01
    );

    assert.ok(!url.includes('token='), 'URL must not contain temporary auth token');
    assert.ok(!url.includes('expires='), 'URL must not contain expiration timestamp');
    assert.ok(!url.includes('Signature='), 'URL must not contain AWS/S3 HMAC signatures');
  });

  // ------------------------------------------------------------------------------
  // MODULE 2: DETERMINISTIC CACHING & EDGE HEADERS CONTRACT
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 2: Deterministic Caching & Edge Headers Contract ---');

  runCheck('Suite 22 [EDGE HEADERS]: Proxy headers declare private high-TTL cacheability', () => {
    const headers = mediaProxyService.getMediaProxyHeaders();

    assert.equal(
      headers['Cache-Control'],
      'private, max-age=86400, stale-while-revalidate=3600',
      'Cache-Control must declare 24h max-age with stale-while-revalidate'
    );
    assert.equal(headers['Content-Type'], 'image/webp');
    assert.ok(headers['Vary'].includes('Authorization'), 'Vary header must include Authorization');
  });

  // ------------------------------------------------------------------------------
  // MODULE 3: CROSS-TENANT MEDIA ISOLATION (TEACHER & HEADMASTER)
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Invariant C-11 Cross-Tenant Media Isolation ---');

  runCheck('Suite 22 [TENANT ISOLATION]: Teacher from TK 02 accessing TK 01 photo is rejected with MEDIA_ACCESS_DENIED_C11', () => {
    assert.throws(
      () => {
        mediaProxyService.getTransformedMediaUrl(
          'sch_tk_menteng_01/stu_ananda_123/outdoor_play.png',
          'GALLERY_THUMBNAIL',
          teacherTk02
        );
      },
      /MEDIA_ACCESS_DENIED_C11.*Cross-tenant media access prohibited/
    );
  });

  runCheck('Suite 22 [TENANT ISOLATION]: Headmaster from TK 02 accessing TK 01 photo is rejected with MEDIA_ACCESS_DENIED_C11', () => {
    const headmasterTk02: MediaSecurityContext = {
      personId: 'per_hm_02',
      role: 'HEADMASTER',
      schoolId: 'sch_tk_cabang_02'
    };

    assert.throws(
      () => {
        mediaProxyService.getTransformedMediaUrl(
          'sch_tk_menteng_01/stu_ananda_123/outdoor_play.png',
          'GALLERY_THUMBNAIL',
          headmasterTk02
        );
      },
      /MEDIA_ACCESS_DENIED_C11.*Cross-tenant media access prohibited/
    );
  });

  runCheck('Suite 22 [VALID TENANT]: Headmaster and Teacher from TK 01 can access TK 01 photo legitimately', () => {
    assert.doesNotThrow(() => {
      mediaProxyService.getTransformedMediaUrl(
        'sch_tk_menteng_01/stu_ananda_123/outdoor_play.png',
        'GALLERY_THUMBNAIL',
        headmasterTk01
      );
    });

    assert.doesNotThrow(() => {
      mediaProxyService.getTransformedMediaUrl(
        'sch_tk_menteng_01/stu_ananda_123/outdoor_play.png',
        'GALLERY_THUMBNAIL',
        teacherTk01
      );
    });
  });

  // ------------------------------------------------------------------------------
  // MODULE 4: GUARDIAN BRIDGE & CONFIDENTIALITY QUARANTINE
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 4: Guardian Child-Boundary & Invariant C-11 Quarantine ---');

  runCheck('Suite 22 [GUARDIAN VALID]: Legal guardian accessing linked child photo succeeds', () => {
    const url = mediaProxyService.getTransformedMediaUrl(
      'sch_tk_menteng_01/stu_ananda_123/sensory_art.jpg',
      'GALLERY_THUMBNAIL',
      guardianChild123,
      { isConfidential: false }
    );

    assert.ok(url.includes('stu_ananda_123'));
  });

  runCheck('Suite 22 [GUARDIAN CROSS-CHILD]: Guardian accessing unlinked child photo is rejected with MEDIA_ACCESS_DENIED_C11', () => {
    assert.throws(
      () => {
        mediaProxyService.getTransformedMediaUrl(
          'sch_tk_menteng_01/stu_other_999/sensory_art.jpg',
          'GALLERY_THUMBNAIL',
          guardianChild123
        );
      },
      /MEDIA_ACCESS_DENIED_C11.*Guardian not authorized for child media/
    );
  });

  runCheck('Suite 22 [INVARIANT C-11 QUARANTINE]: Confidential staff media is 100% quarantined from legal guardian', () => {
    assert.throws(
      () => {
        mediaProxyService.getTransformedMediaUrl(
          'sch_tk_menteng_01/stu_ananda_123/sensitive_behavior_record.jpg',
          'DETAIL_VIEW',
          guardianChild123,
          { isConfidential: true } // Staff psychological confidential flag
        );
      },
      /MEDIA_ACCESS_DENIED_C11.*Confidential staff observation media is strictly quarantined/
    );
  });

  runCheck('Suite 22 [SUPERADMIN AUDIT]: Foundation leadership can access media for supervisory audits', () => {
    assert.doesNotThrow(() => {
      mediaProxyService.getTransformedMediaUrl(
        'sch_tk_menteng_01/stu_ananda_123/sensory_art.jpg',
        'DETAIL_VIEW',
        foundationDirector
      );
    });
  });

  // ------------------------------------------------------------------------------
  // MODULE 5: MIGRATION M09 DDL & DOWN-SCRIPT CONTRACT
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 5: Migration M09 DDL & Down-Script Contract ---');

  runCheck('Suite 22 [MIGRATION M09]: m09 DDL configures private bucket and RLS policies', () => {
    assert.ok(fs.existsSync(m09Path), 'm09 migration file must exist');
    const m09Sql = fs.readFileSync(m09Path, 'utf8');

    assert.ok(m09Sql.includes('INSERT INTO storage.buckets'), 'Must configure storage bucket');
    assert.ok(m09Sql.includes("'yapendik_observation_media'"), 'Must name bucket yapendik_observation_media');
    assert.ok(m09Sql.includes('public = false') || m09Sql.includes('false,'), 'Bucket must be private');
    assert.ok(m09Sql.includes('auth_can_access_observation_media'), 'Must define helper function');
    assert.ok(m09Sql.includes('CREATE POLICY "Authorized actors can view observation media"'), 'Must define SELECT policy');
    assert.ok(m09Sql.includes('CREATE POLICY "School educators can upload observation media"'), 'Must define INSERT policy');
  });

  runCheck('Suite 22 [MIGRATION M09 DOWN]: m09 rollback down-script complies with ADR-01', () => {
    assert.ok(fs.existsSync(m09DownPath), 'm09 down-script file must exist');
    const m09DownSql = fs.readFileSync(m09DownPath, 'utf8');

    const expectedWarning = 'WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).';
    assert.ok(m09DownSql.includes(expectedWarning), 'm09 down script must include ADR-01 archive warning');
    assert.ok(m09DownSql.includes('BEGIN;') && m09DownSql.includes('COMMIT;'), 'Must be transactional');
  });

  // ------------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 5 SUITE 22 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 5 Storage & Edge Test Suite Failed with ${failedTests} error(s).`);
  }
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('stage5_storage_and_edge_contracts.test.ts')) {
  runStage5StorageAndEdgeContractsTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
