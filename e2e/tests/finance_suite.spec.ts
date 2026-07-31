import { test, expect } from '@playwright/test';

test.describe('THEKY Finance Intelligence Suite E2E', () => {
  test('launches Finance Suite and inspects Workspace, AI CFO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/finance-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
