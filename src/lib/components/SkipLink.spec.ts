import type { Locator } from '@playwright/test'
import { test, expect } from '../../../tests/fixtures';

let skiplink: Locator;

test.beforeEach(async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	skiplink = page.getByRole('link', { name: 'Skip to main content' });
});

test('skiplink is initially hidden', async () => {
	await expect.soft(skiplink).not.toBeInViewport();
	await expect.soft(skiplink).not.toBeFocused();
});

test('skiplink is visible after pressing the tab key', async ({ page }) => {
	await page.keyboard.press('Tab');
	await expect.soft(skiplink).toBeVisible();
	await expect.soft(skiplink).toBeInViewport();
	await expect.soft(skiplink).toBeFocused();
});

test('skiplink skips to main content after pressing enter', async ({ page }) => {
	await page.keyboard.press('Tab');
	await skiplink.press('Enter');
	await expect.soft(page.getByRole('main')).toBeInViewport();
	await expect.soft(skiplink).not.toBeFocused();
	await expect.soft(skiplink).not.toBeInViewport();
});

test('skiplink hides after pressing the tab key again', async ({ page }) => {
	// Focus the skiplink
	await page.keyboard.press('Tab');
	// Move focus away from skiplink
	await skiplink.press('Tab');

	await expect.soft(skiplink).not.toBeFocused();
	await expect.soft(skiplink).not.toBeInViewport();
});