import { test, expect } from '#tests/fixtures.ts'

// A page that uses <pw-container> instead of Container.svelte
const URL = '/about'

function measure(page: import('@playwright/test').Page) {
	return page
		.locator('pw-container')
		.first()
		.evaluate((element) => {
			let style = getComputedStyle(element)
			let box = element.getBoundingClientRect()
			return {
				display: style.display,
				maxInlineSize: style.maxInlineSize,
				paddingInline: style.paddingInlineStart,
				x: box.x,
				width: box.width
			}
		})
}

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false })

	test('is styled and keeps all content in the prerendered HTML', async ({ page }) => {
		await page.goto(URL, { waitUntil: 'domcontentloaded' })

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
		await expect(page.getByRole('heading', { level: 2, name: 'Frequently asked questions' })).toBeVisible()
		await expect(page.getByRole('navigation').first()).toBeVisible()

		let layout = await measure(page)
		expect(layout.display).toBe('block')
		expect(layout.maxInlineSize).toBe('1920px') // 120rem
	})
})

test('JavaScript does not change the layout (no shift on hydration)', async ({ page, browser }) => {
	let without_js = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize() })
	let static_page = await without_js.newPage()
	await static_page.goto(URL, { waitUntil: 'domcontentloaded' })
	let before = await measure(static_page)
	await without_js.close()

	await page.goto(URL, { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()
	let after = await measure(page)

	expect(after).toEqual(before)
})

test('SEO basics are intact', async ({ page }) => {
	await page.goto(URL, { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
	await expect.soft(page).not.toHaveHorizontalOverflow()
})
