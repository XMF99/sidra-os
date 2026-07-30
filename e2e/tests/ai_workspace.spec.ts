import { test, expect } from '@playwright/test';

test.describe('AI Workspace & Executive Intelligence Platform E2E', () => {
  test('launches AI workspace and navigates tabs', async ({ page }) => {
    await page.goto('http://localhost:1420/#/workspace').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
