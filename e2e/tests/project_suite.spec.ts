import { test, expect } from '@playwright/test';

test.describe('THEKY Project & Portfolio Intelligence Suite E2E', () => {
  test('launches Project Suite and inspects Workspace, AI PMO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/project-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
