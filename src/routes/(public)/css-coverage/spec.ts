import { test, expect } from '../../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/css-coverage', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveTitle('CSS Coverage inspector - Project Wallace')
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})
