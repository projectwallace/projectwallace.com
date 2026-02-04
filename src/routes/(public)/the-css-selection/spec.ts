import { test, expect } from '../../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/the-css-selection', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
	await expect.soft(page).toHaveOpenGraphImage()
})

test('should show link to 2026 edition', async ({ page }) => {
	await expect(page.getByRole('main').getByRole('link', { name: 'The CSS Selection' })).toBeVisible()
})
