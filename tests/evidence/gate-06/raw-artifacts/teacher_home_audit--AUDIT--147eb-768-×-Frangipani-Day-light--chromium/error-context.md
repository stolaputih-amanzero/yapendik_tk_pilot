# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher_home_audit.spec.ts >> [AUDIT] Teacher Home: EXPANDED-MID (1024x768) × Frangipani Day (light)
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
        - button "Beralih ke Night Temple (Dark Mode)" [ref=e108] [cursor=pointer]
        - button "S Siti Rahmawati, S.Pd TEACHER • TK" [ref=e112] [cursor=pointer]:
          - generic [ref=e113]: S
          - generic [ref=e114]:
            - generic [ref=e115]: Siti Rahmawati, S.Pd
            - generic [ref=e116]: TEACHER • TK
    - generic [ref=e120]:
      - generic [ref=e121]:
        - generic [ref=e122]: TK Yapendik 01 Menteng
        - generic [ref=e128]: •
        - generic [ref=e129]: "NPSN: 20104821"
        - generic [ref=e130]: •
        - generic [ref=e131]: T.A. 2026/2027 (Ganjil)
      - generic [ref=e132]:
        - generic [ref=e133]: "Persona Aktif:"
        - generic [ref=e134]: Siti Rahmawati, S.Pd
        - generic [ref=e135]: TEACHER
    - main [ref=e136]:
      - generic [ref=e137]:
        - generic [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e140]:
              - generic [ref=e141]: Ruang Guru
              - heading "Beranda Kelas" [level=1] [ref=e146]
              - paragraph [ref=e147]: "• Wali Kelas: —"
            - generic [ref=e148]:
              - generic [ref=e149]: Terhubung
              - button [ref=e157] [cursor=pointer]
          - tablist [ref=e165]:
            - tab "Hari Ini" [selected] [ref=e166] [cursor=pointer]
            - tab "Belajar & Karya" [ref=e170] [cursor=pointer]
            - tab "Siswa & Rapor" [ref=e174] [cursor=pointer]
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]:
              - generic [ref=e190]:
                - heading "Kelompok A (Bintang Ceria)" [level=2] [ref=e192]
                - paragraph [ref=e193]: Rabu, 26 Agu 2026
              - generic [ref=e194]:
                - generic [ref=e195]:
                  - generic [ref=e196]:
                    - generic [ref=e197]: Kehadiran
                    - generic [ref=e198]:
                      - text: 0/3
                      - generic [ref=e199]: (0%)
                  - generic [ref=e200]: 3 Belum
                - button "1 Pesan Ortu" [ref=e204] [cursor=pointer]
                - button "Perhatian & Kesehatan" [ref=e209] [cursor=pointer]
            - generic [ref=e215]:
              - generic [ref=e216]: "Perhatian Pagi:"
              - generic [ref=e219]:
                - button "Kenzo Pratama Santoso — Alergi debu & bulu kucing ringan" [ref=e220] [cursor=pointer]:
                  - generic [ref=e221]:
                    - strong [ref=e222]: Kenzo Pratama Santoso
                    - generic [ref=e223]: —
                    - generic [ref=e224]: Alergi debu & bulu kucing ringan
                - button "Gabriel Christian Sihombing — Alergi udang/seafood" [ref=e225] [cursor=pointer]:
                  - generic [ref=e226]:
                    - strong [ref=e227]: Gabriel Christian Sihombing
                    - generic [ref=e228]: —
                    - generic [ref=e229]: Alergi udang/seafood
          - generic [ref=e231]:
            - generic [ref=e237]:
              - generic [ref=e238]:
                - generic [ref=e239]: Ritme Kelas
                - generic [ref=e240]: 07:15
                - generic "Status Aktif" [ref=e241]
              - heading "2. Sambut Ananda— Presensi cepat, suhu, dan cek mood" [level=3] [ref=e243]:
                - text: 2. Sambut Ananda
                - generic [ref=e244]: — Presensi cepat, suhu, dan cek mood
            - generic [ref=e245]:
              - button "06:45" [ref=e246] [cursor=pointer]
              - button "07:15" [ref=e254] [cursor=pointer]
              - button "07:45" [ref=e259] [cursor=pointer]
              - button "08:30" [ref=e266] [cursor=pointer]
              - button "10:00" [ref=e270] [cursor=pointer]
              - button "10:30" [ref=e275] [cursor=pointer]
              - button "11:00" [ref=e279] [cursor=pointer]
              - button "11:30" [ref=e283] [cursor=pointer]
          - generic [ref=e297]:
            - generic [ref=e299]:
              - generic [ref=e301]:
                - heading "Presensi Harian" [level=3] [ref=e302]
                - paragraph [ref=e303]: Sentuh 1-ketuk untuk mengubah status. Rekam suhu & mood pagi.
              - generic [ref=e304]:
                - generic [ref=e305]:
                  - textbox "Cari nama ananda / NIS..." [ref=e310]
                  - generic [ref=e311]:
                    - button "Semua (3)" [ref=e312] [cursor=pointer]
                    - button "Belum Diisi 3" [ref=e313] [cursor=pointer]:
                      - text: Belum Diisi
                      - generic [ref=e314]: "3"
                    - button [ref=e316] [cursor=pointer]
                  - button [ref=e321] [cursor=pointer]
                - generic [ref=e326]:
                  - generic [ref=e327]:
                    - generic [ref=e328]:
                      - generic [ref=e329]:
                        - generic [ref=e330]:
                          - generic "Kenzo Pratama Santoso" [ref=e331]: KS
                          - generic [ref=e332]: ⛵
                        - generic [ref=e333]:
                          - heading "Kenzo Pratama Santoso" [level=4] [ref=e334]
                          - generic [ref=e335]:
                            - generic [ref=e336]: NIS TK-2026-001
                            - generic "Alergi debu & bulu kucing ringan" [ref=e337]
                      - generic [ref=e341]:
                        - button "Momen Cepat" [ref=e342] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e346] [cursor=pointer]
                    - generic [ref=e349]:
                      - button "Hadir" [ref=e350] [cursor=pointer]
                      - button "Sakit" [ref=e354] [cursor=pointer]
                      - button "Izin" [ref=e358] [cursor=pointer]
                      - button "Alpa" [ref=e363] [cursor=pointer]
                    - generic [ref=e369]:
                      - generic [ref=e370]:
                        - generic [ref=e371]: "Mood:"
                        - generic [ref=e372]:
                          - button "Ceria" [ref=e373] [cursor=pointer]
                          - button "Tenang" [ref=e377] [cursor=pointer]
                          - button "Gelisah" [ref=e380] [cursor=pointer]
                          - button "Menangis" [ref=e384] [cursor=pointer]
                      - generic [ref=e387]:
                        - spinbutton "Suhu °C" [ref=e391]
                        - button "Tambah Catatan Kondisi" [ref=e392]
                  - generic [ref=e395]:
                    - generic [ref=e396]:
                      - generic [ref=e397]:
                        - generic [ref=e398]:
                          - generic "Alina Putri Wijaya" [ref=e399]: AW
                          - generic [ref=e400]: 🦁
                        - generic [ref=e401]:
                          - heading "Alina Putri Wijaya" [level=4] [ref=e402]
                          - generic [ref=e403]: NIS TK-2026-002
                      - generic [ref=e405]:
                        - button "Momen Cepat" [ref=e406] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e410] [cursor=pointer]
                    - generic [ref=e413]:
                      - button "Hadir" [ref=e414] [cursor=pointer]
                      - button "Sakit" [ref=e418] [cursor=pointer]
                      - button "Izin" [ref=e422] [cursor=pointer]
                      - button "Alpa" [ref=e427] [cursor=pointer]
                    - generic [ref=e433]:
                      - generic [ref=e434]:
                        - generic [ref=e435]: "Mood:"
                        - generic [ref=e436]:
                          - button "Ceria" [ref=e437] [cursor=pointer]
                          - button "Tenang" [ref=e441] [cursor=pointer]
                          - button "Gelisah" [ref=e444] [cursor=pointer]
                          - button "Menangis" [ref=e448] [cursor=pointer]
                      - generic [ref=e451]:
                        - spinbutton "Suhu °C" [ref=e455]
                        - button "Tambah Catatan Kondisi" [ref=e456]
                  - generic [ref=e459]:
                    - generic [ref=e460]:
                      - generic [ref=e461]:
                        - generic [ref=e462]:
                          - generic "Gabriel Christian Sihombing" [ref=e463]: GS
                          - generic [ref=e464]: 🦁
                        - generic [ref=e465]:
                          - heading "Gabriel Christian Sihombing" [level=4] [ref=e466]
                          - generic [ref=e467]:
                            - generic [ref=e468]: NIS TK-2026-003
                            - generic "Alergi udang/seafood" [ref=e469]
                      - generic [ref=e473]:
                        - button "Momen Cepat" [ref=e474] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e478] [cursor=pointer]
                    - generic [ref=e481]:
                      - button "Hadir" [ref=e482] [cursor=pointer]
                      - button "Sakit" [ref=e486] [cursor=pointer]
                      - button "Izin" [ref=e490] [cursor=pointer]
                      - button "Alpa" [ref=e495] [cursor=pointer]
                    - generic [ref=e501]:
                      - generic [ref=e502]:
                        - generic [ref=e503]: "Mood:"
                        - generic [ref=e504]:
                          - button "Ceria" [ref=e505] [cursor=pointer]
                          - button "Tenang" [ref=e509] [cursor=pointer]
                          - button "Gelisah" [ref=e512] [cursor=pointer]
                          - button "Menangis" [ref=e516] [cursor=pointer]
                      - generic [ref=e519]:
                        - spinbutton "Suhu °C" [ref=e523]
                        - button "Tambah Catatan Kondisi" [ref=e524]
            - generic [ref=e527]:
              - generic [ref=e529]:
                - heading "Status Rekonsiliasi" [level=4] [ref=e535]
                - generic [ref=e536]:
                  - generic [ref=e537]: Presensi Lengkap
                  - generic [ref=e545]:
                    - strong [ref=e546]: "0"
                    - text: Draf Momen Perlu Diperkaya
                  - generic [ref=e550]:
                    - strong [ref=e551]: "1"
                    - text: Pesan Ortu
              - generic [ref=e552]:
                - generic [ref=e553]:
                  - generic [ref=e558]:
                    - heading "Buku Penghubung" [level=3] [ref=e559]
                    - paragraph [ref=e560]: Kemitraan Guru & Orang Tua
                  - generic [ref=e561]:
                    - button "Semua Pesan" [ref=e562] [cursor=pointer]
                    - button [ref=e563] [cursor=pointer]
                - generic [ref=e566]:
                  - generic [ref=e567]:
                    - generic [ref=e568]:
                      - generic [ref=e569]:
                        - generic [ref=e570]:
                          - generic [ref=e571]: Ringkasan Harian
                          - generic [ref=e575]: "Untuk: Ananda Kenzo Pratama Santoso"
                        - heading "Catatan Harian Ananda Kenzo (24 Agustus 2026)" [level=4] [ref=e576]
                        - generic [ref=e577]:
                          - text: "Pengirim:"
                          - strong [ref=e578]: Siti Rahmawati, S.Pd
                      - generic [ref=e579]: Dikonfirmasi
                    - paragraph [ref=e584]: Selamat siang Ayah & Ibu Kenzo. Hari ini Ananda Kenzo sangat hebat dalam kegiatan eksplorasi panca indra. Kenzo mampu menjelaskan rasa manis & asin dengan kosa kata yang kaya, serta sangat berempati menolong temannya saat ada cat yang tumpah. Nafsu makan siang sangat baik (habis 1 porsi). Mohon ingatkan Kenzo minum air putih yang cukup sore ini.
                    - generic [ref=e585]:
                      - generic [ref=e586]: "Balasan:"
                      - paragraph [ref=e590]: Terima kasih banyak Bu Siti atas pendampingan penuh kasih hari ini. Di rumah Kenzo juga antusias bercerita tentang rasa jeruk dan teman-temannya di kelas.
                  - generic [ref=e591]:
                    - generic [ref=e592]:
                      - generic [ref=e593]:
                        - generic [ref=e594]: Pengumuman Kelas
                        - heading "Persiapan Kegiatan Operasi Semut & Peduli Lingkungan (Besok, 25 Agustus)" [level=4] [ref=e599]
                        - generic [ref=e600]:
                          - text: "Pengirim:"
                          - strong [ref=e601]: Siti Rahmawati, S.Pd
                      - generic [ref=e602]: Perlu Tanggapan
                    - paragraph [ref=e607]: Bapak/Ibu Orang Tua Siswa Kelompok A yang terkasih, besok anak-anak akan belajar menjaga kebersihan lingkungan dengan kegiatan memilah dedaunan kering. Mohon anak-anak mengenakan seragam kaos olahraga dan membawa botol minum bertali.
                    - button [ref=e609] [cursor=pointer]
        - button "Rekam Momen Belajar" [ref=e615] [cursor=pointer]
    - contentinfo [ref=e619]:
      - generic [ref=e620]:
        - generic [ref=e621]:
          - generic [ref=e622]: Yapendik School OS
          - generic [ref=e623]: —
          - generic [ref=e624]: "Prinsip Konstitusi: Make It Simple • Keep It Future-Proof • Child-Centered"
        - generic [ref=e625]: Yapendik GPIB
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