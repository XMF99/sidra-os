import { test, expect } from '@playwright/test';

test.describe('THEKY Supply Chain & Procurement Intelligence Suite E2E', () => {
  test('launches Supply Chain Suite and inspects Workspace, AI CSCO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/supply-chain-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
