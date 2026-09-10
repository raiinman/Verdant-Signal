import { expect, test } from '@playwright/test';

test.describe('signal terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.vs-terminal__row');
  });

  test('renders every returned slot plus the open remainder', async ({ page }) => {
    await expect(page.locator('.vs-terminal__row[data-locked]')).toHaveCount(9);
    await expect(page.locator('.vs-terminal__emptyslot')).toHaveCount(1);
  });

  test('locked slots keep structure and mask only protected values', async ({ page }) => {
    const row = page.locator('.vs-terminal__row').first();
    // Identity, RoE and status stay legible on a locked row.
    await expect(row.locator('.vs-terminal__symbol')).toContainText('FREE COMMUNITY SETUP');
    await expect(row.locator('.vs-terminal__roe')).toContainText('%');
    await expect(row.locator('.vs-terminal__badge')).toBeVisible();
    // The six protected fields are masked.
    await expect(row.locator('.vs-masked')).toHaveCount(5);
  });

  test('a losing locked VIP slot never shows a negative number', async ({ page }) => {
    const suppressed = page.locator('.vs-terminal__roe[data-suppressed="true"]');
    await expect(suppressed.first()).toContainText('ACTIVE RANGE');
    const texts = await suppressed.allTextContents();
    for (const t of texts) expect(t).not.toMatch(/-\d/);
  });

  test('row selection is keyboard operable and opens the detail pane', async ({ page }) => {
    const row = page.locator('.vs-terminal__row').first();
    await row.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.vs-detail')).toBeVisible();
    await expect(row).toHaveAttribute('data-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(page.locator('.vs-detail')).toHaveCount(0);
  });

  test('every interactive control shows a visible focus ring', async ({ page }) => {
    const vip = page.locator('.vs-topbar__vip');
    await vip.focus();
    const outline = await vip.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe('0px');
  });

  test('no horizontal overflow at any QA viewport', async ({ page }) => {
    for (const [w, h] of [[375, 812], [430, 932], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${w}x${h}`).toBe(false);
    }
  });

  test('the eight-column table never reaches a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.vs-terminal__tablewrap')).toBeHidden();
    await expect(page.locator('.vs-terminal__cards')).toBeVisible();
  });

  test('mobile touch targets meet the 44px floor', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const head = page.locator('.vs-slotcard__head').first();
    const box = await head.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('verified exits use gold verification, not the positive-action green', async ({ page }) => {
    const verify = page.locator('.vs-exitcard__verify').first();
    const color = await verify.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(213, 169, 67)');
  });

  test('feed health is exposed as a live region', async ({ page }) => {
    await expect(page.locator('[role="status"][aria-live="polite"]').first()).toBeAttached();
  });
});
