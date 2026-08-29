# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher_home_audit.spec.ts >> [AUDIT] Teacher Home: MEDIUM (768x1024) × Frangipani Day (light)
- Location: tests\e2e\teacher_home_audit.spec.ts:24:5

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 760
Received:    921.015625
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e12]:
        - generic [ref=e13]: Yapendik OS
        - generic [ref=e14]: ✦
      - generic [ref=e15]:
        - button "Supabase On" [ref=e16] [cursor=pointer]
        - button "Beralih ke Night Temple (Dark Mode)" [ref=e22] [cursor=pointer]
        - button "S" [ref=e26] [cursor=pointer]
    - main [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]: Ruang Guru
              - heading "Beranda Kelas" [level=1] [ref=e40]
              - paragraph [ref=e41]: "• Wali Kelas: —"
            - generic [ref=e42]:
              - generic [ref=e43]: Terhubung
              - button "Segarkan Data" [ref=e51] [cursor=pointer]
          - tablist [ref=e59]:
            - tab "Hari Ini" [selected] [ref=e60] [cursor=pointer]
            - tab "Belajar & Karya" [ref=e64] [cursor=pointer]
            - tab "Siswa & Rapor" [ref=e68] [cursor=pointer]
        - generic [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]:
              - generic [ref=e79]:
                - generic [ref=e85]:
                  - heading "Kelompok A (Bintang Ceria)" [level=2] [ref=e87]
                  - paragraph [ref=e88]: Rabu, 26 Agu 2026
                - generic [ref=e89]:
                  - generic [ref=e90]:
                    - generic [ref=e91]: Kehadiran
                    - generic [ref=e92]:
                      - text: 0/3
                      - generic [ref=e93]: (0%)
                  - generic [ref=e94]: 3 Belum
              - generic [ref=e98]:
                - button "1 Pesan Ortu" [ref=e99] [cursor=pointer]
                - button "Perhatian & Kesehatan" [ref=e104] [cursor=pointer]
            - generic [ref=e110]:
              - generic [ref=e111]: "Perhatian Pagi:"
              - generic [ref=e114]:
                - button "Kenzo Pratama Santoso — Alergi debu & bulu kucing ringan" [ref=e115] [cursor=pointer]:
                  - generic [ref=e116]:
                    - strong [ref=e117]: Kenzo Pratama Santoso
                    - generic [ref=e118]: —
                    - generic [ref=e119]: Alergi debu & bulu kucing ringan
                - button "Gabriel Christian Sihombing — Alergi udang/seafood" [ref=e120] [cursor=pointer]:
                  - generic [ref=e121]:
                    - strong [ref=e122]: Gabriel Christian Sihombing
                    - generic [ref=e123]: —
                    - generic [ref=e124]: Alergi udang/seafood
          - generic [ref=e126]:
            - generic [ref=e132]:
              - generic [ref=e133]:
                - generic [ref=e134]: Ritme Kelas
                - generic [ref=e135]: 07:15
                - generic "Status Aktif" [ref=e136]
              - heading "2. Sambut Ananda— Presensi cepat, suhu, dan cek mood" [level=3] [ref=e138]:
                - text: 2. Sambut Ananda
                - generic [ref=e139]: — Presensi cepat, suhu, dan cek mood
            - generic [ref=e140]:
              - button "06:45" [ref=e141] [cursor=pointer]
              - button "07:15" [ref=e149] [cursor=pointer]
              - button "07:45" [ref=e154] [cursor=pointer]
              - button "08:30" [ref=e161] [cursor=pointer]
              - button "10:00" [ref=e165] [cursor=pointer]
              - button "10:30" [ref=e170] [cursor=pointer]
              - button "11:00" [ref=e174] [cursor=pointer]
              - button "11:30" [ref=e178] [cursor=pointer]
          - generic [ref=e192]:
            - generic [ref=e194]:
              - generic [ref=e196]:
                - heading "Presensi Harian" [level=3] [ref=e197]
                - paragraph [ref=e198]: Sentuh 1-ketuk untuk mengubah status. Rekam suhu & mood pagi.
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - textbox "Cari nama ananda / NIS..." [ref=e205]
                  - generic [ref=e206]:
                    - button "Semua (3)" [ref=e207] [cursor=pointer]
                    - button "Belum Diisi 3" [ref=e208] [cursor=pointer]:
                      - text: Belum Diisi
                      - generic [ref=e209]: "3"
                    - button [ref=e211] [cursor=pointer]
                  - button [ref=e216] [cursor=pointer]
                - generic [ref=e221]:
                  - generic [ref=e222]:
                    - generic [ref=e223]:
                      - generic [ref=e224]:
                        - generic [ref=e225]:
                          - generic "Kenzo Pratama Santoso" [ref=e226]: KS
                          - generic [ref=e227]: ⛵
                        - generic [ref=e228]:
                          - heading "Kenzo Pratama Santoso" [level=4] [ref=e229]
                          - generic [ref=e230]:
                            - generic [ref=e231]: NIS TK-2026-001
                            - generic "Alergi debu & bulu kucing ringan" [ref=e232]
                      - generic [ref=e236]:
                        - button "Momen Cepat" [ref=e237] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e241] [cursor=pointer]
                    - generic [ref=e244]:
                      - button "Hadir" [ref=e245] [cursor=pointer]
                      - button "Sakit" [ref=e249] [cursor=pointer]
                      - button "Izin" [ref=e253] [cursor=pointer]
                      - button "Alpa" [ref=e258] [cursor=pointer]
                    - generic [ref=e264]:
                      - generic [ref=e265]:
                        - generic [ref=e266]: "Mood:"
                        - generic [ref=e267]:
                          - button "Ceria" [ref=e268] [cursor=pointer]
                          - button "Tenang" [ref=e272] [cursor=pointer]
                          - button "Gelisah" [ref=e275] [cursor=pointer]
                          - button "Menangis" [ref=e279] [cursor=pointer]
                      - generic [ref=e282]:
                        - spinbutton "Suhu °C" [ref=e286]
                        - button "Tambah Catatan Kondisi" [ref=e287]
                  - generic [ref=e290]:
                    - generic [ref=e291]:
                      - generic [ref=e292]:
                        - generic [ref=e293]:
                          - generic "Alina Putri Wijaya" [ref=e294]: AW
                          - generic [ref=e295]: 🦁
                        - generic [ref=e296]:
                          - heading "Alina Putri Wijaya" [level=4] [ref=e297]
                          - generic [ref=e298]: NIS TK-2026-002
                      - generic [ref=e300]:
                        - button "Momen Cepat" [ref=e301] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e305] [cursor=pointer]
                    - generic [ref=e308]:
                      - button "Hadir" [ref=e309] [cursor=pointer]
                      - button "Sakit" [ref=e313] [cursor=pointer]
                      - button "Izin" [ref=e317] [cursor=pointer]
                      - button "Alpa" [ref=e322] [cursor=pointer]
                    - generic [ref=e328]:
                      - generic [ref=e329]:
                        - generic [ref=e330]: "Mood:"
                        - generic [ref=e331]:
                          - button "Ceria" [ref=e332] [cursor=pointer]
                          - button "Tenang" [ref=e336] [cursor=pointer]
                          - button "Gelisah" [ref=e339] [cursor=pointer]
                          - button "Menangis" [ref=e343] [cursor=pointer]
                      - generic [ref=e346]:
                        - spinbutton "Suhu °C" [ref=e350]
                        - button "Tambah Catatan Kondisi" [ref=e351]
                  - generic [ref=e354]:
                    - generic [ref=e355]:
                      - generic [ref=e356]:
                        - generic [ref=e357]:
                          - generic "Gabriel Christian Sihombing" [ref=e358]: GS
                          - generic [ref=e359]: 🦁
                        - generic [ref=e360]:
                          - heading "Gabriel Christian Sihombing" [level=4] [ref=e361]
                          - generic [ref=e362]:
                            - generic [ref=e363]: NIS TK-2026-003
                            - generic "Alergi udang/seafood" [ref=e364]
                      - generic [ref=e368]:
                        - button "Momen Cepat" [ref=e369] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e373] [cursor=pointer]
                    - generic [ref=e376]:
                      - button "Hadir" [ref=e377] [cursor=pointer]
                      - button "Sakit" [ref=e381] [cursor=pointer]
                      - button "Izin" [ref=e385] [cursor=pointer]
                      - button "Alpa" [ref=e390] [cursor=pointer]
                    - generic [ref=e396]:
                      - generic [ref=e397]:
                        - generic [ref=e398]: "Mood:"
                        - generic [ref=e399]:
                          - button "Ceria" [ref=e400] [cursor=pointer]
                          - button "Tenang" [ref=e404] [cursor=pointer]
                          - button "Gelisah" [ref=e407] [cursor=pointer]
                          - button "Menangis" [ref=e411] [cursor=pointer]
                      - generic [ref=e414]:
                        - spinbutton "Suhu °C" [ref=e418]
                        - button "Tambah Catatan Kondisi" [ref=e419]
            - generic [ref=e422]:
              - generic [ref=e424]:
                - heading "Status Rekonsiliasi" [level=4] [ref=e430]
                - generic [ref=e431]:
                  - generic [ref=e432]: Presensi Lengkap
                  - generic [ref=e440]:
                    - strong [ref=e441]: "0"
                    - text: Draf Momen Perlu Diperkaya
                  - generic [ref=e445]:
                    - strong [ref=e446]: "1"
                    - text: Pesan Ortu
              - generic [ref=e447]:
                - generic [ref=e448]:
                  - generic [ref=e453]:
                    - heading "Buku Penghubung" [level=3] [ref=e454]
                    - paragraph [ref=e455]: Kemitraan Guru & Orang Tua
                  - generic [ref=e456]:
                    - button "Semua Pesan" [ref=e457] [cursor=pointer]
                    - button [ref=e458] [cursor=pointer]
                - generic [ref=e461]:
                  - generic [ref=e462]:
                    - generic [ref=e463]:
                      - generic [ref=e464]:
                        - generic [ref=e465]:
                          - generic [ref=e466]: Ringkasan Harian
                          - generic [ref=e470]: "Untuk: Ananda Kenzo Pratama Santoso"
                        - heading "Catatan Harian Ananda Kenzo (24 Agustus 2026)" [level=4] [ref=e471]
                        - generic [ref=e472]:
                          - text: "Pengirim:"
                          - strong [ref=e473]: Siti Rahmawati, S.Pd
                      - generic [ref=e474]: Dikonfirmasi
                    - paragraph [ref=e479]: Selamat siang Ayah & Ibu Kenzo. Hari ini Ananda Kenzo sangat hebat dalam kegiatan eksplorasi panca indra. Kenzo mampu menjelaskan rasa manis & asin dengan kosa kata yang kaya, serta sangat berempati menolong temannya saat ada cat yang tumpah. Nafsu makan siang sangat baik (habis 1 porsi). Mohon ingatkan Kenzo minum air putih yang cukup sore ini.
                    - generic [ref=e480]:
                      - generic [ref=e481]: "Balasan:"
                      - paragraph [ref=e485]: Terima kasih banyak Bu Siti atas pendampingan penuh kasih hari ini. Di rumah Kenzo juga antusias bercerita tentang rasa jeruk dan teman-temannya di kelas.
                  - generic [ref=e486]:
                    - generic [ref=e487]:
                      - generic [ref=e488]:
                        - generic [ref=e489]: Pengumuman Kelas
                        - heading "Persiapan Kegiatan Operasi Semut & Peduli Lingkungan (Besok, 25 Agustus)" [level=4] [ref=e494]
                        - generic [ref=e495]:
                          - text: "Pengirim:"
                          - strong [ref=e496]: Siti Rahmawati, S.Pd
                      - generic [ref=e497]: Perlu Tanggapan
                    - paragraph [ref=e502]: Bapak/Ibu Orang Tua Siswa Kelompok A yang terkasih, besok anak-anak akan belajar menjaga kebersihan lingkungan dengan kegiatan memilah dedaunan kering. Mohon anak-anak mengenakan seragam kaos olahraga dan membawa botol minum bertali.
                    - button [ref=e504] [cursor=pointer]
        - button "Rekam Momen Belajar" [ref=e510] [cursor=pointer]
  - generic [ref=e514]:
    - generic [ref=e515]:
      - button "Presensi" [ref=e516] [cursor=pointer]
      - button "Observasi" [ref=e518] [cursor=pointer]
      - button "Kerja Harian" [ref=e520] [cursor=pointer]
    - button "Apa fokus Anda hari ini? Menu" [ref=e522] [cursor=pointer]:
      - generic [ref=e523]: Apa fokus Anda hari ini?
      - generic [ref=e528]: Menu
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