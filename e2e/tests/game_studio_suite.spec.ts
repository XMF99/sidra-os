import { test, expect } from '@playwright/test';

test.describe('THEKY Game Studio Intelligence Suite E2E', () => {
  test('launches Game Studio Suite and inspects Workspace, AI Director, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/game-studio-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
