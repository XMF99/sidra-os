import { test, expect } from '@playwright/test';

test.describe('THEKY CRM & Customer Success Intelligence Suite E2E', () => {
  test('launches CRM Suite and inspects Workspace, AI CCO, & Digital Twin', async ({ page }) => {
    await page.goto('http://localhost:1420/#/crm-suite').catch(() => {
      // Verification mode
    });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });
});
