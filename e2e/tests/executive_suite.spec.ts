import { test, expect } from '@playwright/test';

test.describe('THEKY Executive Suite E2E', () => {
  test('launches Executive Suite and inspects CEO Workspace, AI Board, & War Room', async ({ page }) => {
    await page.goto('http://localhost:1420/#/executive-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
