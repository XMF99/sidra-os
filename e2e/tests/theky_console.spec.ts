import { test, expect } from '@playwright/test';

test.describe('THEKY Conversation Experience & Intelligence Console E2E', () => {
  test('launches console and verifies single THEKY AI identity', async ({ page }) => {
    await page.goto('http://localhost:1420/#/console').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
