import { test, expect } from '../../../../tests/fixtures'

test('does SEO well', async ({ page }) => {
	await page.goto('/ast-explorer', { waitUntil: 'domcontentloaded' })
	await expect.soft(page).toHaveTitle('CSS AST Explorer - Project Wallace')
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})
