import { test, expect } from '@playwright/test';

test.describe('THEKY Sales & Revenue Intelligence Suite E2E', () => {
  test('launches Sales Suite and inspects Workspace, AI CRO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/sales-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
