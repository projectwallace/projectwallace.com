import { test, expect } from '#tests/fixtures.ts'

test.beforeEach(async ({ page }) => {
	await page.goto('/css-coverage', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveTitle('CSS Coverage inspector - Project Wallace')
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
	await expect.soft(page).not.toHaveHorizontalOverflow()
})

test.describe('pane resizer', () => {
	test.beforeEach(async ({ page }) => {
		await expect(page).toBeHydrated()
		await page.getByRole('button', { name: 'load an example file' }).click()
	})

	test('shows the resizer handle on hover', async ({ page }) => {
		let resizer = page.locator('[data-pane-resizer]')
		let handle = resizer.locator('.pane-resizer')
		await expect(resizer).toBeVisible()
		await expect(handle).toHaveCSS('opacity', '0')

		await resizer.hover()
		await expect(handle).toHaveCSS('opacity', '1')
	})

	test('shows the resizer handle on focus', async ({ page }) => {
		let resizer = page.locator('[data-pane-resizer]')
		let handle = resizer.locator('.pane-resizer')
		await expect(handle).toHaveCSS('opacity', '0')

		await resizer.focus()
		await expect(handle).toHaveCSS('opacity', '1')
	})

	test('resizes panes when dragging the resizer', async ({ page }) => {
		let resizer = page.locator('[data-pane-resizer]')
		let first_pane = page.locator('[data-pane]').first()
		let initial_width = (await first_pane.boundingBox())!.width
		await resizer.scrollIntoViewIfNeeded()
		let box = (await resizer.boundingBox())!
		let x = box.x + box.width / 2
		let y = box.y + box.height / 2

		await page.mouse.move(x, y)
		await page.mouse.down()
		await page.mouse.move(x - 150, y, { steps: 5 })
		await page.mouse.up()

		await expect.poll(async () => (await first_pane.boundingBox())!.width).toBeLessThan(initial_width)
	})

	test('resizes panes with the keyboard', async ({ page }) => {
		let resizer = page.locator('[data-pane-resizer]')
		let first_pane = page.locator('[data-pane]').first()
		let initial_width = (await first_pane.boundingBox())!.width

		await resizer.focus()
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('ArrowRight')

		await expect.poll(async () => (await first_pane.boundingBox())!.width).toBeGreaterThan(initial_width)
	})
})
