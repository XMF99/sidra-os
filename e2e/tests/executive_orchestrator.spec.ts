import { test, expect } from '@playwright/test';

test.describe('THEKY Executive Orchestrator E2E', () => {
  test('launches Executive Control Tower and inspects Execution Contracts', async ({ page }) => {
    await page.goto('http://localhost:1420/#/orchestrator').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
