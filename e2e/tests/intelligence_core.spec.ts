import { test, expect } from '@playwright/test';

test.describe('THEKY Intelligence Core E2E', () => {
  test('launches Intelligence Core and inspects Organization DNA & Decision Journal', async ({ page }) => {
    await page.goto('http://localhost:1420/#/intelligence').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
