import { test, expect } from '../../../../../tests/fixtures'
import { USER_AGENT } from '../../../api/get-css/get-css'

test('does SEO well', async ({ page }) => {
	await page.goto('/docs/css-scraper', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('User-Agent matches what is documented', async ({ page }) => {
	await page.goto('/docs/css-scraper', { waitUntil: 'domcontentloaded' })

	// The <pre> block with our full user agent string in it
	let code = page.getByRole('code').first()
	let documented_agent = await code.innerText()

	expect(documented_agent).toBe(USER_AGENT)
})