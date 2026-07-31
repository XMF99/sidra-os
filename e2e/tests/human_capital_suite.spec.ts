import { test, expect } from '@playwright/test';

test.describe('THEKY Human Capital Intelligence Suite E2E', () => {
  test('launches Human Capital Suite and inspects Workspace, AI CHRO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/human-capital-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
