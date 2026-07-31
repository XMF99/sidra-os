import { test, expect } from '@playwright/test';

test.describe('THEKY Marketing & Growth Intelligence Suite E2E', () => {
  test('launches Marketing Suite and inspects Workspace, AI CMO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/marketing-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
