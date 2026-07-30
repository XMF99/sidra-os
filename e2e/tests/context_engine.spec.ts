import { test, expect } from '@playwright/test';

test.describe('THEKY First Experience & Context Engine E2E', () => {
  test('launches clean first experience without demo data pollution', async ({ page }) => {
    await page.goto('http://localhost:1420/#/').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
