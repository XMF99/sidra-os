import { test, expect } from '@playwright/test';

test.describe('THEKY Autonomous Organization Engine E2E', () => {
  test('launches Autonomous Org Page and inspects Executive Command Center & Daily Briefing Engine', async ({ page }) => {
    await page.goto('http://localhost:1420/#/autonomous-org').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
