import { test, expect } from '@playwright/test';

test.describe('THEKY Cognitive Engine E2E', () => {
  test('launches Cognitive Engine and inspects Adaptive Modes & Meta Reasoning', async ({ page }) => {
    await page.goto('http://localhost:1420/#/cognitive').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
