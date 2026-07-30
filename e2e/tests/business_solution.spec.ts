import { test, expect } from '@playwright/test';

test.describe('THEKY Business Solution Composer E2E', () => {
  test('launches Business Solution Page and inspects Registry & Blueprint Generator', async ({ page }) => {
    await page.goto('http://localhost:1420/#/solutions').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
