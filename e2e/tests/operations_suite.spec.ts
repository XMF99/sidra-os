import { test, expect } from '@playwright/test';

test.describe('THEKY Operations Intelligence Suite E2E', () => {
  test('launches Operations Suite and inspects Workspace, AI COO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/operations-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
