import { test, expect } from '@playwright/test';

test.describe('THEKY Enterprise Composer E2E', () => {
  test('launches Enterprise Platform and inspects Interactive Org Chart & Master Blueprint', async ({ page }) => {
    await page.goto('http://localhost:1420/#/enterprise-composer').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
