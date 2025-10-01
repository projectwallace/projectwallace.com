import { test, expect } from '../../../../../tests/fixtures'

test('does SEO well', async ({ page }) => {
	await page.goto('/docs/metrics', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})