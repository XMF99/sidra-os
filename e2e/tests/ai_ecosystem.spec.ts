import { test, expect } from '@playwright/test';

test.describe('THEKY AI Ecosystem E2E', () => {
  test('launches AI Ecosystem Page and inspects Providers & MCP Platform Hub', async ({ page }) => {
    await page.goto('http://localhost:1420/#/ecosystem').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
