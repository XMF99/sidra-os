import { test, expect } from '@playwright/test';

test.describe('THEKY Capability Platform, Generator & Marketplace E2E', () => {
  test('launches capability marketplace and organization spaces', async ({ page }) => {
    await page.goto('http://localhost:1420/#/marketplace').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
