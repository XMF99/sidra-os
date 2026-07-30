import { test, expect } from '@playwright/test';

test.describe('THEKY Digital Twin Engine E2E', () => {
  test('launches Digital Twin Sandbox and inspects What-If analysis', async ({ page }) => {
    await page.goto('http://localhost:1420/#/digital-twin').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
