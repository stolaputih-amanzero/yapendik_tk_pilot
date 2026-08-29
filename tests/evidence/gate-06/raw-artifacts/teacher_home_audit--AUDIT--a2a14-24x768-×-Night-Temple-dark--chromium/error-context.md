# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher_home_audit.spec.ts >> [AUDIT] Teacher Home: EXPANDED-MID (1024x768) × Night Temple (dark)
- Location: tests\e2e\teacher_home_audit.spec.ts:24:5

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1016
Received:    1193.015625
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary "Sidebar Navigasi" [ref=e4]:
    - button "Ciutkan Menu Sidebar" [ref=e6] [cursor=pointer]:
      - generic [ref=e12]:
        - heading "Yapendik OS" [level=2] [ref=e13]
        - paragraph [ref=e14]: TEACHER
    - navigation [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: RUANG KELAS
        - button "Beranda Guru" [ref=e19] [cursor=pointer]
        - button "Kerja Harian" [ref=e26] [cursor=pointer]
        - button "Presensi" [ref=e32] [cursor=pointer]
      - generic [ref=e38]:
        - generic [ref=e39]: AKADEMIK & OBSERVASI
        - button "Observasi" [ref=e41] [cursor=pointer]
        - button "Perkembangan" [ref=e50] [cursor=pointer]
        - button "Jejak Anak" [ref=e56] [cursor=pointer]
      - generic [ref=e61]:
        - generic [ref=e62]: KEMITRAAN
        - button "Buku Penghubung" [ref=e64] [cursor=pointer]
        - button "Data Roster" [ref=e69] [cursor=pointer]
    - generic [ref=e76]:
      - button "Living Contract ✦" [ref=e78] [cursor=pointer]:
        - generic [ref=e82]: Living Contract
        - generic [ref=e83]: ✦ ADS
      - button "Uji Otorisasi (TESTS)" [ref=e85] [cursor=pointer]:
        - generic [ref=e88]: Uji Otorisasi
        - generic [ref=e89]: TESTS
  - generic [ref=e90]:
    - banner [ref=e91]:
      - generic [ref=e98]:
        - generic [ref=e99]: Yapendik OS
        - generic [ref=e100]: ✦
      - generic [ref=e101]:
        - button "Supabase On" [ref=e102] [cursor=pointer]
        - button "Beralih ke Frangipani Day (Light Mode)" [ref=e108] [cursor=pointer]
        - button "S Siti Rahmawati, S.Pd TEACHER • TK" [ref=e116] [cursor=pointer]:
          - generic [ref=e117]: S
          - generic [ref=e118]:
            - generic [ref=e119]: Siti Rahmawati, S.Pd
            - generic [ref=e120]: TEACHER • TK
    - generic [ref=e124]:
      - generic [ref=e125]:
        - generic [ref=e126]: TK Yapendik 01 Menteng
        - generic [ref=e132]: •
        - generic [ref=e133]: "NPSN: 20104821"
        - generic [ref=e134]: •
        - generic [ref=e135]: T.A. 2026/2027 (Ganjil)
      - generic [ref=e136]:
        - generic [ref=e137]: "Persona Aktif:"
        - generic [ref=e138]: Siti Rahmawati, S.Pd
        - generic [ref=e139]: TEACHER
    - main [ref=e140]:
      - generic [ref=e141]:
        - generic [ref=e142]:
          - generic [ref=e143]:
            - generic [ref=e144]:
              - generic [ref=e145]: Ruang Guru
              - heading "Beranda Kelas" [level=1] [ref=e150]
              - paragraph [ref=e151]: "• Wali Kelas: —"
            - generic [ref=e152]:
              - generic [ref=e153]: Terhubung
              - button [ref=e161] [cursor=pointer]
          - tablist [ref=e169]:
            - tab "Hari Ini" [selected] [ref=e170] [cursor=pointer]
            - tab "Belajar & Karya" [ref=e174] [cursor=pointer]
            - tab "Siswa & Rapor" [ref=e178] [cursor=pointer]
        - generic [ref=e186]:
          - generic [ref=e187]:
            - generic [ref=e188]:
              - generic [ref=e194]:
                - heading "Kelompok A (Bintang Ceria)" [level=2] [ref=e196]
                - paragraph [ref=e197]: Rabu, 26 Agu 2026
              - generic [ref=e198]:
                - generic [ref=e199]:
                  - generic [ref=e200]:
                    - generic [ref=e201]: Kehadiran
                    - generic [ref=e202]:
                      - text: 0/3
                      - generic [ref=e203]: (0%)
                  - generic [ref=e204]: 3 Belum
                - button "1 Pesan Ortu" [ref=e208] [cursor=pointer]
                - button "Perhatian & Kesehatan" [ref=e213] [cursor=pointer]
            - generic [ref=e219]:
              - generic [ref=e220]: "Perhatian Pagi:"
              - generic [ref=e223]:
                - button "Kenzo Pratama Santoso — Alergi debu & bulu kucing ringan" [ref=e224] [cursor=pointer]:
                  - generic [ref=e225]:
                    - strong [ref=e226]: Kenzo Pratama Santoso
                    - generic [ref=e227]: —
                    - generic [ref=e228]: Alergi debu & bulu kucing ringan
                - button "Gabriel Christian Sihombing — Alergi udang/seafood" [ref=e229] [cursor=pointer]:
                  - generic [ref=e230]:
                    - strong [ref=e231]: Gabriel Christian Sihombing
                    - generic [ref=e232]: —
                    - generic [ref=e233]: Alergi udang/seafood
          - generic [ref=e235]:
            - generic [ref=e241]:
              - generic [ref=e242]:
                - generic [ref=e243]: Ritme Kelas
                - generic [ref=e244]: 07:15
                - generic "Status Aktif" [ref=e245]
              - heading "2. Sambut Ananda— Presensi cepat, suhu, dan cek mood" [level=3] [ref=e247]:
                - text: 2. Sambut Ananda
                - generic [ref=e248]: — Presensi cepat, suhu, dan cek mood
            - generic [ref=e249]:
              - button "06:45" [ref=e250] [cursor=pointer]
              - button "07:15" [ref=e258] [cursor=pointer]
              - button "07:45" [ref=e263] [cursor=pointer]
              - button "08:30" [ref=e270] [cursor=pointer]
              - button "10:00" [ref=e274] [cursor=pointer]
              - button "10:30" [ref=e279] [cursor=pointer]
              - button "11:00" [ref=e283] [cursor=pointer]
              - button "11:30" [ref=e287] [cursor=pointer]
          - generic [ref=e301]:
            - generic [ref=e303]:
              - generic [ref=e305]:
                - heading "Presensi Harian" [level=3] [ref=e306]
                - paragraph [ref=e307]: Sentuh 1-ketuk untuk mengubah status. Rekam suhu & mood pagi.
              - generic [ref=e308]:
                - generic [ref=e309]:
                  - textbox "Cari nama ananda / NIS..." [ref=e314]
                  - generic [ref=e315]:
                    - button "Semua (3)" [ref=e316] [cursor=pointer]
                    - button "Belum Diisi 3" [ref=e317] [cursor=pointer]:
                      - text: Belum Diisi
                      - generic [ref=e318]: "3"
                    - button [ref=e320] [cursor=pointer]
                  - button [ref=e325] [cursor=pointer]
                - generic [ref=e330]:
                  - generic [ref=e331]:
                    - generic [ref=e332]:
                      - generic [ref=e333]:
                        - generic [ref=e334]:
                          - generic "Kenzo Pratama Santoso" [ref=e335]: KS
                          - generic [ref=e336]: ⛵
                        - generic [ref=e337]:
                          - heading "Kenzo Pratama Santoso" [level=4] [ref=e338]
                          - generic [ref=e339]:
                            - generic [ref=e340]: NIS TK-2026-001
                            - generic "Alergi debu & bulu kucing ringan" [ref=e341]
                      - generic [ref=e345]:
                        - button "Momen Cepat" [ref=e346] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e350] [cursor=pointer]
                    - generic [ref=e353]:
                      - button "Hadir" [ref=e354] [cursor=pointer]
                      - button "Sakit" [ref=e358] [cursor=pointer]
                      - button "Izin" [ref=e362] [cursor=pointer]
                      - button "Alpa" [ref=e367] [cursor=pointer]
                    - generic [ref=e373]:
                      - generic [ref=e374]:
                        - generic [ref=e375]: "Mood:"
                        - generic [ref=e376]:
                          - button "Ceria" [ref=e377] [cursor=pointer]
                          - button "Tenang" [ref=e381] [cursor=pointer]
                          - button "Gelisah" [ref=e384] [cursor=pointer]
                          - button "Menangis" [ref=e388] [cursor=pointer]
                      - generic [ref=e391]:
                        - spinbutton "Suhu °C" [ref=e395]
                        - button "Tambah Catatan Kondisi" [ref=e396]
                  - generic [ref=e399]:
                    - generic [ref=e400]:
                      - generic [ref=e401]:
                        - generic [ref=e402]:
                          - generic "Alina Putri Wijaya" [ref=e403]: AW
                          - generic [ref=e404]: 🦁
                        - generic [ref=e405]:
                          - heading "Alina Putri Wijaya" [level=4] [ref=e406]
                          - generic [ref=e407]: NIS TK-2026-002
                      - generic [ref=e409]:
                        - button "Momen Cepat" [ref=e410] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e414] [cursor=pointer]
                    - generic [ref=e417]:
                      - button "Hadir" [ref=e418] [cursor=pointer]
                      - button "Sakit" [ref=e422] [cursor=pointer]
                      - button "Izin" [ref=e426] [cursor=pointer]
                      - button "Alpa" [ref=e431] [cursor=pointer]
                    - generic [ref=e437]:
                      - generic [ref=e438]:
                        - generic [ref=e439]: "Mood:"
                        - generic [ref=e440]:
                          - button "Ceria" [ref=e441] [cursor=pointer]
                          - button "Tenang" [ref=e445] [cursor=pointer]
                          - button "Gelisah" [ref=e448] [cursor=pointer]
                          - button "Menangis" [ref=e452] [cursor=pointer]
                      - generic [ref=e455]:
                        - spinbutton "Suhu °C" [ref=e459]
                        - button "Tambah Catatan Kondisi" [ref=e460]
                  - generic [ref=e463]:
                    - generic [ref=e464]:
                      - generic [ref=e465]:
                        - generic [ref=e466]:
                          - generic "Gabriel Christian Sihombing" [ref=e467]: GS
                          - generic [ref=e468]: 🦁
                        - generic [ref=e469]:
                          - heading "Gabriel Christian Sihombing" [level=4] [ref=e470]
                          - generic [ref=e471]:
                            - generic [ref=e472]: NIS TK-2026-003
                            - generic "Alergi udang/seafood" [ref=e473]
                      - generic [ref=e477]:
                        - button "Momen Cepat" [ref=e478] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e482] [cursor=pointer]
                    - generic [ref=e485]:
                      - button "Hadir" [ref=e486] [cursor=pointer]
                      - button "Sakit" [ref=e490] [cursor=pointer]
                      - button "Izin" [ref=e494] [cursor=pointer]
                      - button "Alpa" [ref=e499] [cursor=pointer]
                    - generic [ref=e505]:
                      - generic [ref=e506]:
                        - generic [ref=e507]: "Mood:"
                        - generic [ref=e508]:
                          - button "Ceria" [ref=e509] [cursor=pointer]
                          - button "Tenang" [ref=e513] [cursor=pointer]
                          - button "Gelisah" [ref=e516] [cursor=pointer]
                          - button "Menangis" [ref=e520] [cursor=pointer]
                      - generic [ref=e523]:
                        - spinbutton "Suhu °C" [ref=e527]
                        - button "Tambah Catatan Kondisi" [ref=e528]
            - generic [ref=e531]:
              - generic [ref=e533]:
                - heading "Status Rekonsiliasi" [level=4] [ref=e539]
                - generic [ref=e540]:
                  - generic [ref=e541]: Presensi Lengkap
                  - generic [ref=e549]:
                    - strong [ref=e550]: "0"
                    - text: Draf Momen Perlu Diperkaya
                  - generic [ref=e554]:
                    - strong [ref=e555]: "1"
                    - text: Pesan Ortu
              - generic [ref=e556]:
                - generic [ref=e557]:
                  - generic [ref=e562]:
                    - heading "Buku Penghubung" [level=3] [ref=e563]
                    - paragraph [ref=e564]: Kemitraan Guru & Orang Tua
                  - generic [ref=e565]:
                    - button "Semua Pesan" [ref=e566] [cursor=pointer]
                    - button [ref=e567] [cursor=pointer]
                - generic [ref=e570]:
                  - generic [ref=e571]:
                    - generic [ref=e572]:
                      - generic [ref=e573]:
                        - generic [ref=e574]:
                          - generic [ref=e575]: Ringkasan Harian
                          - generic [ref=e579]: "Untuk: Ananda Kenzo Pratama Santoso"
                        - heading "Catatan Harian Ananda Kenzo (24 Agustus 2026)" [level=4] [ref=e580]
                        - generic [ref=e581]:
                          - text: "Pengirim:"
                          - strong [ref=e582]: Siti Rahmawati, S.Pd
                      - generic [ref=e583]: Dikonfirmasi
                    - paragraph [ref=e588]: Selamat siang Ayah & Ibu Kenzo. Hari ini Ananda Kenzo sangat hebat dalam kegiatan eksplorasi panca indra. Kenzo mampu menjelaskan rasa manis & asin dengan kosa kata yang kaya, serta sangat berempati menolong temannya saat ada cat yang tumpah. Nafsu makan siang sangat baik (habis 1 porsi). Mohon ingatkan Kenzo minum air putih yang cukup sore ini.
                    - generic [ref=e589]:
                      - generic [ref=e590]: "Balasan:"
                      - paragraph [ref=e594]: Terima kasih banyak Bu Siti atas pendampingan penuh kasih hari ini. Di rumah Kenzo juga antusias bercerita tentang rasa jeruk dan teman-temannya di kelas.
                  - generic [ref=e595]:
                    - generic [ref=e596]:
                      - generic [ref=e597]:
                        - generic [ref=e598]: Pengumuman Kelas
                        - heading "Persiapan Kegiatan Operasi Semut & Peduli Lingkungan (Besok, 25 Agustus)" [level=4] [ref=e603]
                        - generic [ref=e604]:
                          - text: "Pengirim:"
                          - strong [ref=e605]: Siti Rahmawati, S.Pd
                      - generic [ref=e606]: Perlu Tanggapan
                    - paragraph [ref=e611]: Bapak/Ibu Orang Tua Siswa Kelompok A yang terkasih, besok anak-anak akan belajar menjaga kebersihan lingkungan dengan kegiatan memilah dedaunan kering. Mohon anak-anak mengenakan seragam kaos olahraga dan membawa botol minum bertali.
                    - button [ref=e613] [cursor=pointer]
        - button "Rekam Momen Belajar" [ref=e619] [cursor=pointer]
    - contentinfo [ref=e623]:
      - generic [ref=e624]:
        - generic [ref=e625]:
          - generic [ref=e626]: Yapendik School OS
          - generic [ref=e627]: —
          - generic [ref=e628]: "Prinsip Konstitusi: Make It Simple • Keep It Future-Proof • Child-Centered"
        - generic [ref=e629]: Yapendik GPIB
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | const VIEWPORTS = [
  6   |   { name: '390x844', width: 390, height: 844, sizeClass: 'COMPACT' },
  7   |   { name: '768x1024', width: 768, height: 1024, sizeClass: 'MEDIUM' },
  8   |   { name: '1024x768', width: 1024, height: 768, sizeClass: 'EXPANDED-MID' },
  9   |   { name: '1440x900', width: 1440, height: 900, sizeClass: 'EXPANDED' },
  10  | ];
  11  | 
  12  | const THEMES = [
  13  |   { name: 'light', label: 'Frangipani Day' },
  14  |   { name: 'dark', label: 'Night Temple' },
  15  | ];
  16  | 
  17  | const outDir = path.resolve('tests', 'vrt-baseline', 'teacher-home-audit');
  18  | if (!fs.existsSync(outDir)) {
  19  |   fs.mkdirSync(outDir, { recursive: true });
  20  | }
  21  | 
  22  | for (const vp of VIEWPORTS) {
  23  |   for (const th of THEMES) {
  24  |     test(`[AUDIT] Teacher Home: ${vp.sizeClass} (${vp.name}) × ${th.label} (${th.name})`, async ({ page }) => {
  25  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  26  | 
  27  |       await page.addInitScript(({ themeName }) => {
  28  |         localStorage.setItem('yapendik_theme', themeName);
  29  |       }, { themeName: th.name });
  30  | 
  31  |       await page.goto('http://localhost:3000/#beranda-guru');
  32  | 
  33  |       const simTabBtn = page.locator('button', { hasText: 'Simulasi Persona' }).first();
  34  |       if (await simTabBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
  35  |         await simTabBtn.click();
  36  |       }
  37  | 
  38  |       const personaItem = page.locator('text=Siti Rahmawati').first();
  39  |       if (await personaItem.isVisible({ timeout: 1500 }).catch(() => false)) {
  40  |         await personaItem.click();
  41  |         await page.waitForTimeout(500);
  42  |       }
  43  | 
  44  |       if (!page.url().includes('#beranda-guru')) {
  45  |         await page.goto('http://localhost:3000/#beranda-guru');
  46  |       }
  47  | 
  48  |       await page.evaluate(() => document.fonts.ready);
  49  |       await page.waitForTimeout(1000);
  50  | 
  51  |       // Universal Layout & Anti-Overlap Invariant Assertions (V-14)
  52  |       const pulseBannerCard = page.locator('.rounded-card').filter({ hasText: 'Kelompok A' }).first();
  53  |       const reconciliationCard = vp.width < 1200
  54  |         ? page.locator('.large\\:hidden').locator('.rounded-card').filter({ hasText: /Status Rekonsiliasi|Semua Tugas Selesai/ }).first()
  55  |         : page.locator('.large\\:block').locator('.rounded-card').filter({ hasText: /Status Rekonsiliasi|Semua Tugas Selesai/ }).first();
  56  |       const todaySurfaceTitle = page.locator('text=Presensi Harian').first();
  57  | 
  58  |       await expect(pulseBannerCard).toBeVisible();
  59  |       await expect(reconciliationCard).toBeVisible();
  60  | 
  61  |       const boxBanner = await pulseBannerCard.boundingBox();
  62  |       const boxReconciliation = await reconciliationCard.boundingBox();
  63  |       const boxToday = await todaySurfaceTitle.boundingBox();
  64  | 
  65  |       expect(boxBanner).not.toBeNull();
  66  |       expect(boxReconciliation).not.toBeNull();
  67  | 
  68  |       if (boxBanner && boxReconciliation) {
  69  |         // Assert mathematical ZERO OVERLAP between Banner and Reconciliation card
  70  |         const isHorizontalOverlap = (boxReconciliation.x < boxBanner.x + boxBanner.width) && 
  71  |                                     (boxReconciliation.x + boxReconciliation.width > boxBanner.x);
  72  |         const isVerticalOverlap = (boxReconciliation.y < boxBanner.y + boxBanner.height) && 
  73  |                                   (boxReconciliation.y + boxReconciliation.height > boxBanner.y);
  74  |         const hasOverlap = isHorizontalOverlap && isVerticalOverlap;
  75  | 
  76  |         expect(hasOverlap).toBe(false);
  77  | 
  78  |         // Responsive behavior assertions
  79  |         if (vp.width < 1200 && boxToday) {
  80  |           // Stacked mode: rail must be rendered below Today surface
  81  |           expect(boxReconciliation.y).toBeGreaterThan(boxToday.y);
  82  |         } else if (vp.width >= 1200) {
  83  |           // 2-column mode: rail must be positioned to the right of main column
  84  |           expect(boxReconciliation.x).toBeGreaterThanOrEqual(boxBanner.x + boxBanner.width);
  85  |         }
  86  |       }
  87  | 
  88  |       // CI HARDENING: Asersi Kirim Pengumuman boundingBox
  89  |       const btnKirim = page.locator('button', { hasText: 'Kirim Pengumuman' }).first();
  90  |       if (await btnKirim.isVisible()) {
  91  |         const boxBtnKirim = await btnKirim.boundingBox();
  92  |         expect(boxBtnKirim).not.toBeNull();
  93  |         if (boxBtnKirim) {
> 94  |           expect(boxBtnKirim.x + boxBtnKirim.width).toBeLessThanOrEqual(vp.width - 8);
      |                                                     ^ Error: expect(received).toBeLessThanOrEqual(expected)
  95  |         }
  96  |       }
  97  | 
  98  |       // CI HARDENING: Asersi pil-segment × chips-RITME overlap
  99  |       const pilSegment = page.locator('button', { hasText: 'Hari Ini' }).first(); // Bagian dari SegmentedControl
  100 |       const ritmeIndicator = page.locator('.flex-1.min-w-0.flex.flex-wrap.gap-2').first(); // Kontainer chips waktu
  101 |       
  102 |       if (await pilSegment.isVisible() && await ritmeIndicator.isVisible()) {
  103 |         const boxPil = await pilSegment.boundingBox();
  104 |         const boxRitme = await ritmeIndicator.boundingBox();
  105 |         
  106 |         expect(boxPil).not.toBeNull();
  107 |         expect(boxRitme).not.toBeNull();
  108 |         
  109 |         if (boxPil && boxRitme) {
  110 |           const isHorizontalOverlap = (boxRitme.x < boxPil.x + boxPil.width) && 
  111 |                                       (boxRitme.x + boxRitme.width > boxPil.x);
  112 |           const isVerticalOverlap = (boxRitme.y < boxPil.y + boxPil.height) && 
  113 |                                     (boxRitme.y + boxRitme.height > boxPil.y);
  114 |           const hasOverlap = isHorizontalOverlap && isVerticalOverlap;
  115 |           
  116 |           expect(hasOverlap).toBe(false);
  117 |         }
  118 |       }
  119 | 
  120 |       const screenshotPath = path.join(outDir, `${vp.name}-${th.name}.png`);
  121 |       await page.screenshot({ path: screenshotPath, fullPage: false });
  122 |       expect(fs.existsSync(screenshotPath)).toBe(true);
  123 |     });
  124 |   }
  125 | }
  126 | 
```