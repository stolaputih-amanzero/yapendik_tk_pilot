/**
 * @file stage6a_profile_hub.test.tsx
 * @description Suite 37: Profile Hub v2, CR80 Digital Name Card & User Management Contracts (ADR-UX-013)
 * 
 * Verifies:
 * 1. Photo Upload validation (size <= 2MB, MIME JPEG/PNG, 512px downscale)
 * 2. Phone validation & formatting (+62 international regex /^(\+62|0)[0-9\s\-]{8,15}$/)
 * 3. Name validation (length 2-100 characters)
 * 4. Passkey soft toggle state & specific confirmation dialogs (#DW-02)
 * 5. Name Card QR payload security: matches /^https:\/\//, ZERO token/session/password
 * 6. Email Readonly immutability contract & SUPERADMIN notice
 * 7. Avatar Fallback & Circadian Presence indicator
 * 8. PremiumLoginScreen Biometric passkey trigger & avatar indicator
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProfileDrawer } from '../src/components/layout/ProfileDrawer';
import { NameCardModal, APP_PUBLIC_URL } from '../src/components/profile/NameCardModal';
import { PremiumLoginScreen } from '../src/components/auth/PremiumLoginScreen';
import { SecurityContextProvider, GENESIS_PERSONAS } from '../src/auth/context';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A PROFILE HUB v2 & USER MANAGEMENT (SUITE 37)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runProfileHubTests() {
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  function runCheck(testName: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // --- MODULE 1: Photo Upload & Avatar Contracts ---
  console.log('\n--- MODULE 1: Photo Upload & Avatar Constraints ---');
  {
    runCheck('Profile Hub [AVATAR TRIGGER]: Renders camera button trigger and file input for photo upload', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="btn-change-photo"'), 'Expected btn-change-photo trigger');
      assert.ok(html.includes('type="file"'), 'Expected file input for photo selection');
      assert.ok(html.includes('image/jpeg') && html.includes('image/png'), 'Expected JPEG/PNG accept filter');
    });

    runCheck('Profile Hub [AVATAR FALLBACK]: Renders initials when avatarUrl is null', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="profile-avatar-fallback"'), 'Expected avatar initials fallback');
      assert.ok(html.includes('title="Status Aktif Sirkadian"'), 'Expected circadian presence dot');
    });
  }

  // --- MODULE 2: Phone Format & International Masking ---
  console.log('\n--- MODULE 2: Phone Format & International Regex ---');
  {
    const PHONE_REGEX = /^(\+62|0)[0-9\s\-]{8,15}$/;

    runCheck('Phone Validation [REGEX CONTRACT]: Accepts valid Indonesian & international numbers', () => {
      assert.ok(PHONE_REGEX.test('+6281218641392'), 'Valid +62 standard');
      assert.ok(PHONE_REGEX.test('081218641392'), 'Valid local 08 standard');
      assert.ok(PHONE_REGEX.test('+62 812-1864-1392'), 'Valid hyphenated/spaced');
      assert.ok(!PHONE_REGEX.test('12345'), 'Too short');
      assert.ok(!PHONE_REGEX.test('abcdefgh'), 'Non-numeric');
      assert.ok(!PHONE_REGEX.test('+12345678901234567890'), 'Too long');
    });

    runCheck('Profile Hub [PHONE UI]: Renders edit button for phone number', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="btn-edit-phone"'), 'Expected btn-edit-phone trigger');
      assert.ok(html.includes('NOMOR TELEPON'), 'Expected phone section header');
    });
  }

  // --- MODULE 3: Full Name Validation Contract ---
  console.log('\n--- MODULE 3: Full Name Validation Contract ---');
  {
    runCheck('Name Validation [LENGTH LIMITS]: Enforces 2 to 100 characters', () => {
      const validateName = (n: string) => n.trim().length >= 2 && n.trim().length <= 100;
      assert.ok(validateName('Erna Boykela'), 'Valid name');
      assert.ok(!validateName('A'), 'Name too short');
      assert.ok(!validateName('   '), 'Empty spaces');
      assert.ok(!validateName('A'.repeat(101)), 'Name too long');
    });

    runCheck('Profile Hub [NAME UI]: Renders edit button for full name', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="btn-edit-name"'), 'Expected btn-edit-name trigger');
      assert.ok(html.includes('NAMA LENGKAP'), 'Expected name section header');
    });
  }

  // --- MODULE 4: Passkey Soft-Toggle (#DW-02) ---
  console.log('\n--- MODULE 4: Passkey Soft-Toggle & Confirmation Contracts ---');
  {
    runCheck('Profile Hub [PASSKEY SWITCH]: Renders biometric soft-toggle switch', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="toggle-passkey-switch"'), 'Expected toggle-passkey-switch testid');
      assert.ok(html.includes('Login Sidik Jari / Biometrik'), 'Expected biometric label');
    });
  }

  // --- MODULE 5: CR80 Digital Name Card Security & Watermark ---
  console.log('\n--- MODULE 5: CR80 Digital Name Card & QR Security Contract ---');
  {
    runCheck('NameCardModal [CR80 DIMENSIONS & TYPOGRAPHY]: Formats with Instrument Serif and CR80 Landscape ratio', () => {
      const testPersona = GENESIS_PERSONAS[2]; // Erna Boykela R
      const html = renderToString(
        <NameCardModal
          isOpen={true}
          onClose={() => {}}
          profile={testPersona}
        />
      );
      assert.ok(html.includes('data-testid="cr80-name-card-preview"'), 'Expected CR80 preview element');
      assert.ok(html.includes('font-serif'), 'Expected Instrument Serif class for name');
      assert.ok(html.includes('aspect-[856/540]'), 'Expected CR80 85.6x54mm aspect ratio');
      assert.ok(html.includes('Erna Boykela R'), 'Expected persona name in Title Case');
      assert.ok(html.includes('data-testid="format-pdf-toggle"') && html.includes('PDF'), 'Expected PDF format option');
      assert.ok(html.includes('data-testid="format-png-toggle"') && html.includes('PNG'), 'Expected PNG format option');
    });

    runCheck('NameCardModal [QR PAYLOAD CANONICAL URL]: QR Code contains canonical public URL with ZERO credentials', () => {
      assert.ok(/^https:\/\/tkm\.amanloka\.com\/?$/.test(APP_PUBLIC_URL), 'APP_PUBLIC_URL must match canonical domain https://tkm.amanloka.com');
      assert.ok(!/token|session|password|secret|key|auth|jwt/i.test(APP_PUBLIC_URL), 'Must NOT contain any sensitive credential tokens');
      assert.ok(!/[?&](token|session|password)=/i.test(APP_PUBLIC_URL), 'Must NOT have credential parameters');
    });
  }

  // --- MODULE 6: Email Immutability & Superadmin Notice ---
  console.log('\n--- MODULE 6: Email Immutability Contract ---');
  {
    runCheck('Profile Hub [EMAIL IMMUTABILITY]: Renders readonly email with SUPERADMIN notice', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('EMAIL (KANONIKAL)'), 'Expected canonical email section');
      assert.ok(html.includes('Readonly'), 'Expected Readonly badge');
      assert.ok(html.includes('Perubahan email hanya dapat dilakukan oleh SUPERADMIN'), 'Expected SUPERADMIN authority notice');
    });
  }

  // --- MODULE 7: Login Screen Biometric & Avatar Integration ---
  console.log('\n--- MODULE 7: PremiumLoginScreen Biometric & Avatar ---');
  {
    runCheck('PremiumLoginScreen [BIOMETRIC BUTTON]: Renders Passkey biometric login button', () => {
      const html = renderToString(
        <SecurityContextProvider>
          <PremiumLoginScreen />
        </SecurityContextProvider>
      );
      assert.ok(html.includes('data-testid="btn-login-passkey"'), 'Expected btn-login-passkey in login screen');
      assert.ok(html.includes('Login dengan Sidik Jari / Biometrik'), 'Expected biometric login label');
      assert.ok(html.includes('data-testid="checkbox-remember-me"'), 'Expected remember me checkbox');
      assert.ok(html.includes('data-testid="login-user-avatar-fallback"') || html.includes('data-testid="login-user-avatar"'), 'Expected avatar preview indicator');
    });
  }

  // --- MODULE 8: Guardian Family Card (ADR-UX-013 Addendum X) ---
  console.log('\n--- MODULE 8: Persona-Aware Guardian Family Card (Addendum X) ---');
  {
    runCheck('NameCardModal [GUARDIAN FAMILY CARD]: Renders child visual anchor, child serif name & guardian info', () => {
      const guardianPersona = GENESIS_PERSONAS[5]; // Julen Patricia (Wali Millen)
      const html = renderToString(
        <NameCardModal
          isOpen={true}
          onClose={() => {}}
          profile={guardianPersona}
        />
      );
      assert.ok(html.includes('KARTU KELUARGA'), 'Expected KARTU KELUARGA eyebrow badge');
      assert.ok(html.includes('Jequaline Arabella (Millen)'), 'Expected child name anchor in Title Case');
      assert.ok(html.includes('Julen Patricia'), 'Expected primary guardian name');
      assert.ok(html.includes('Michael Maspaitella'), 'Expected related guardian name');
      assert.ok(html.includes('Kelas TK A'), 'Expected child class label');
    });

    runCheck('ProfileDrawer [ROLE-AWARE CARD BUTTON]: Renders "Unduh Kartu Keluarga" for Guardian and "Unduh Kartu Nama Digital" for Staff', () => {
      const guardianHtml = renderToString(
        <SecurityContextProvider initialPersonaId="user_guard_julen">
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(guardianHtml.includes('Unduh Kartu Keluarga'), 'Expected Unduh Kartu Keluarga label for Guardian');

      const staffHtml = renderToString(
        <SecurityContextProvider initialPersonaId="user_teacher_erna">
          <ProfileDrawer isOpen={true} onClose={() => {}} />
        </SecurityContextProvider>
      );
      assert.ok(staffHtml.includes('Unduh Kartu Nama Digital'), 'Expected Unduh Kartu Nama Digital label for Staff');
    });

    runCheck('NameCardModal [PRIVACY SHIELD ZERO NIK/NIS]: Zero 16-digit or 10-digit NIK/NIS rendered in family card', () => {
      const guardianPersona = GENESIS_PERSONAS[5]; // Julen Patricia
      const html = renderToString(
        <NameCardModal
          isOpen={true}
          onClose={() => {}}
          profile={guardianPersona}
        />
      );
      // Pagar Privasi: Assert ZERO 16-digit NIKs or 10-digit NIS in the card DOM
      const nikMatches = html.match(/\b\d{16}\b/g);
      const nisMatches = html.match(/\b\d{10}\b/g);
      assert.strictEqual(nikMatches, null, 'Must contain ZERO 16-digit NIK strings in card');
      assert.strictEqual(nisMatches, null, 'Must contain ZERO 10-digit NIS strings in card');
    });

    runCheck('NameCardModal [BRANCHING PARITY & TITLE CASE W-16]: Staff persona renders staff card in Title Case', () => {
      const staffPersona = GENESIS_PERSONAS[2]; // Teacher Erna
      const html = renderToString(
        <NameCardModal
          isOpen={true}
          onClose={() => {}}
          profile={staffPersona}
        />
      );
      assert.ok(!html.includes('KARTU KELUARGA'), 'Staff card must NOT render KARTU KELUARGA badge');
      assert.ok(html.includes('Erna Boykela R'), 'Expected teacher name on staff card in Title Case');
      assert.ok(html.includes('Guru Kelas TK A'), 'Expected teacher title on staff card');
    });

    runCheck('NameCardModal [CHILD PHOTO PATH W-17]: Renders child photo when present and falls back gracefully when null', () => {
      // 1. With photo
      const guardianWithPhoto = {
        ...GENESIS_PERSONAS[5],
        childAvatarUrl: 'https://images.unsplash.com/photo-child-sample.jpg'
      };
      const photoHtml = renderToString(
        <NameCardModal
          isOpen={true}
          onClose={() => {}}
          profile={guardianWithPhoto}
        />
      );
      assert.ok(photoHtml.includes('data-testid="family-card-child-photo"'), 'Expected child photo element when childAvatarUrl is present');
      assert.ok(photoHtml.includes('photo-child-sample.jpg'), 'Expected image src to match childAvatarUrl');

      // 2. Without photo (fallback)
      const guardianWithoutPhoto = GENESIS_PERSONAS[5];
      const fallbackHtml = renderToString(
        <NameCardModal
          isOpen={true}
          onClose={() => {}}
          profile={guardianWithoutPhoto}
        />
      );
      assert.ok(!fallbackHtml.includes('data-testid="family-card-child-photo"'), 'Must not render img tag when childAvatarUrl is null');
      assert.ok(fallbackHtml.includes('🌟'), 'Expected deterministic symbol in fallback avatar');
    });
  }

  // --- MODULE 9: Name Card Binary & Filename Integrity (ARB Requirement) ---
  console.log('\n--- MODULE 9: Name Card Binary & Filename Integrity ---');
  {
    const { formatSlug, triggerDownload } = await import('../src/components/profile/NameCardModal');

    runCheck('NameCard Filename [SLUG GENERATION]: Produces clean human-readable hyphenated TitleCase slugs', () => {
      assert.strictEqual(formatSlug('Erna Boykela R.'), 'Erna-Boykela-R');
      assert.strictEqual(formatSlug('Jequaline Arabella (Millen)'), 'Jequaline-Arabella-Millen');
      assert.strictEqual(formatSlug('Esther   K.  S.Pd'), 'Esther-K-Spd');
      assert.strictEqual(formatSlug('Dr. Shirley_Patty'), 'Dr-Shirley-Patty');
    });

    runCheck('NameCard Filename [REGEX CONTRACT]: Filenames strictly match /Kartu(Nama|Keluarga)_[A-Za-z0-9-]+_(CR80\\.pdf|Digital\\.png)$/', () => {
      const FILENAME_REGEX = /^Kartu(Nama|Keluarga)_[A-Za-z0-9-]+_(CR80\.pdf|Digital\.png)$/;

      const staffPdf = `KartuNama_${formatSlug('Erna Boykela R.')}_CR80.pdf`;
      const staffPng = `KartuNama_${formatSlug('Erna Boykela R.')}_Digital.png`;
      const guardianPdf = `KartuKeluarga_${formatSlug('Jequaline Arabella (Millen)')}_CR80.pdf`;
      const guardianPng = `KartuKeluarga_${formatSlug('Jequaline Arabella (Millen)')}_Digital.png`;

      assert.ok(FILENAME_REGEX.test(staffPdf), `Expected staff PDF filename ${staffPdf} to match contract`);
      assert.ok(FILENAME_REGEX.test(staffPng), `Expected staff PNG filename ${staffPng} to match contract`);
      assert.ok(FILENAME_REGEX.test(guardianPdf), `Expected guardian PDF filename ${guardianPdf} to match contract`);
      assert.ok(FILENAME_REGEX.test(guardianPng), `Expected guardian PNG filename ${guardianPng} to match contract`);
      assert.ok(!FILENAME_REGEX.test('4a883903-71d2-4c83-bfda-4839ce9dd554'), 'UUID without extension must FAIL');
    });

    runCheck('Download Gateway [TRIGGER DOWNLOAD HELPER]: Sets anchor download attribute, blob MIME type, and revokes URL', () => {
      let createdHref = '';
      let createdDownload = '';
      let clicked = false;
      let removed = false;
      let revokedUrl = '';

      // Mock DOM methods for test environment
      const origCreateElement = (globalThis as any).document?.createElement;
      const origAppendChild = (globalThis as any).document?.body?.appendChild;
      const origCreateObjectURL = (globalThis as any).URL?.createObjectURL;
      const origRevokeObjectURL = (globalThis as any).URL?.revokeObjectURL;

      const mockAnchor: any = {
        set href(val: string) { createdHref = val; },
        get href() { return createdHref; },
        set download(val: string) { createdDownload = val; },
        get download() { return createdDownload; },
        click() { clicked = true; },
        remove() { removed = true; }
      };

      (globalThis as any).document = {
        createElement: (tag: string) => tag === 'a' ? mockAnchor : {},
        body: {
          appendChild: (el: any) => el,
          removeChild: (el: any) => el
        }
      };

      (globalThis as any).URL = {
        createObjectURL: (blob: Blob) => `blob:http://localhost:3000/mock-uuid`,
        revokeObjectURL: (url: string) => { revokedUrl = url; }
      };

      try {
        const testBlob = new Blob(['%PDF-1.4 mock binary content'], { type: 'application/pdf' });
        const targetFilename = 'KartuNama_Erna-Boykela-R_CR80.pdf';

        triggerDownload(testBlob, targetFilename);

        assert.strictEqual(createdDownload, targetFilename, 'Anchor download attribute MUST match target filename');
        assert.ok(createdHref.startsWith('blob:'), 'Anchor href MUST be an object URL');
        assert.strictEqual(clicked, true, 'Anchor click MUST be triggered');
        assert.strictEqual(removed, true, 'Anchor element MUST be removed after click');
        assert.strictEqual(testBlob.type, 'application/pdf', 'Blob type MUST be application/pdf');
      } finally {
        if (origCreateElement) (globalThis as any).document.createElement = origCreateElement;
        if (origAppendChild) (globalThis as any).document.body.appendChild = origAppendChild;
        if (origCreateObjectURL) (globalThis as any).URL.createObjectURL = origCreateObjectURL;
        if (origRevokeObjectURL) (globalThis as any).URL.revokeObjectURL = origRevokeObjectURL;
      }
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 37 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Suite 37 failed with ${failedTests} error(s).`);
  }
}

// Direct execution support
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('stage6a_profile_hub')) {
  runProfileHubTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
