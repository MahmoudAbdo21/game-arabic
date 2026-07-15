# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: intro.spec.ts >> Intro Experience Tests >> Manual navigation contract is respected
- Location: e2e\intro.spec.ts:36:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="intro-transcript-toggle"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic:
      - generic: أ
      - generic: ب
      - generic: ت
      - generic: م
      - generic: س
      - generic: ن
      - generic: ر
      - generic: ل
      - generic: ي
      - generic: و
    - main [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - paragraph [ref=e8]: منارة العلم واللغة العربية
          - paragraph [ref=e9]: "المشهد 1 من 6: واجهة الأزهر الشريف"
        - button "تخطي المقدمة" [ref=e10] [cursor=pointer]
      - generic [ref=e13]:
        - img "مآذن الأزهر وكلية التربية" [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e19]: منارة العلم واللغة العربية
            - heading "جامعة الأزهر" [level=1] [ref=e20]
            - paragraph [ref=e21]: كلية التربية بنين بالقاهرة - قسم المناهج وطرق التدريس
          - generic [ref=e22]:
            - generic [ref=e24]:
              - paragraph [ref=e25]: جامعة الأزهر
              - paragraph [ref=e26]: كلية التربية بنين بالقاهرة
              - paragraph [ref=e27]: قسم المناهج وطرق التدريس
            - generic [ref=e28]:
              - heading "تحت إشراف" [level=3] [ref=e29]
              - generic [ref=e30]:
                - paragraph [ref=e31]: أ.د. خالد فاروق الهواري
                - paragraph [ref=e32]: د. باسم محمد عبده الجندي
                - paragraph [ref=e33]: د. أشرف محمد سعد
          - generic [ref=e34]:
            - button "عودة" [disabled]:
              - img
              - text: عودة
            - button "تشغيل الصوت" [ref=e35] [cursor=pointer]:
              - img [ref=e36]
              - text: تشغيل الصوت
            - button "التالي" [ref=e38] [cursor=pointer]:
              - text: التالي
              - img [ref=e39]
  - alert [ref=e41]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Intro Experience Tests', () => {
  4  |   test('Should navigate the six intro screens sequentially and hand off to profiles', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // 1. official-azhar
  8  |     await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
  9  |     await page.click('[data-testid="intro-next"]');
  10 |     
  11 |     // 2. official-researcher-book
  12 |     await expect(page.locator('[data-testid="intro-scene-official-researcher-book"]')).toBeVisible();
  13 |     await page.click('[data-testid="intro-next"]');
  14 |     
  15 |     // 3. official-supervision-board
  16 |     await expect(page.locator('[data-testid="intro-scene-official-supervision-board"]')).toBeVisible();
  17 |     await page.click('[data-testid="intro-next"]');
  18 |     
  19 |     // 4. welcome-gate
  20 |     await expect(page.locator('[data-testid="intro-scene-welcome-gate"]')).toBeVisible();
  21 |     await page.click('[data-testid="intro-next"]');
  22 |     
  23 |     // 5. welcome-skills-island
  24 |     await expect(page.locator('[data-testid="intro-scene-welcome-skills-island"]')).toBeVisible();
  25 |     await page.click('[data-testid="intro-next"]');
  26 |     
  27 |     // 6. welcome-adventure-train
  28 |     await expect(page.locator('[data-testid="intro-scene-welcome-adventure-train"]')).toBeVisible();
  29 |     
  30 |     // 7. Final action reaches /profiles
  31 |     await page.click('[data-testid="intro-next"]');
  32 |     await page.waitForURL('**/profiles');
  33 |     await expect(page).toHaveURL(/\/profiles/);
  34 |   });
  35 | 
  36 |   test('Manual navigation contract is respected', async ({ page }) => {
  37 |     await page.goto('/');
  38 |     await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
  39 |     
  40 |     // Wait at least 6 seconds
  41 |     await page.waitForTimeout(6000);
  42 |     
  43 |     // Verify scene did not change
  44 |     await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
  45 |     
  46 |     // Click transcript toggle
> 47 |     await page.click('[data-testid="intro-transcript-toggle"]');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  48 |     
  49 |     // Verify transcript appears
  50 |     await expect(page.locator('[data-testid="intro-transcript"]')).toBeVisible();
  51 |     
  52 |     // Wait again
  53 |     await page.waitForTimeout(6000);
  54 |     
  55 |     // Verify scene still did not change
  56 |     await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
  57 |   });
  58 | 
  59 |   test('Zero audio requests in SCRIPT_ONLY mode', async ({ page }) => {
  60 |     const requests: string[] = [];
  61 |     page.on('request', req => {
  62 |       requests.push(req.url());
  63 |     });
  64 | 
  65 |     await page.goto('/');
  66 |     await page.click('[data-testid="intro-transcript-toggle"]');
  67 |     await expect(page.locator('[data-testid="intro-transcript"]')).toBeVisible();
  68 | 
  69 |     const mediaRequests = requests.filter(url => 
  70 |       url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg') || url.includes('audio')
  71 |     );
  72 |     expect(mediaRequests.length).toBe(0);
  73 |   });
  74 | 
  75 |   test('Navigation controls (Previous, Skip)', async ({ page }) => {
  76 |     await page.goto('/');
  77 |     
  78 |     // First previous should be disabled
  79 |     await expect(page.locator('[data-testid="intro-previous"]')).toBeDisabled();
  80 |     
  81 |     // Move next, then previous works
  82 |     await page.click('[data-testid="intro-next"]');
  83 |     await expect(page.locator('[data-testid="intro-scene-official-researcher-book"]')).toBeVisible();
  84 |     await expect(page.locator('[data-testid="intro-previous"]')).toBeEnabled();
  85 |     await page.click('[data-testid="intro-previous"]');
  86 |     await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
  87 |     
  88 |     // Skip reaches /profiles
  89 |     await page.click('[data-testid="intro-skip"]');
  90 |     await page.waitForURL('**/profiles');
  91 |     await expect(page).toHaveURL(/\/profiles/);
  92 |   });
  93 | });
  94 | 
```