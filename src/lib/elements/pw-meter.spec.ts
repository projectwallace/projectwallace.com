import { test, expect } from '#tests/fixtures.ts'

test('styles a native <meter> in light DOM and follows Svelte updates', async ({ page }) => {
	await page.goto('/css-coverage', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()
	await page.getByRole('button', { name: 'load an example' }).click()

	let table = page.getByRole('table', { name: 'Coverage per origin' })
	let first_row = table.getByRole('row').nth(1)
	let wrapper = first_row.locator('pw-meter')
	let meter = wrapper.locator('meter')

	// Svelte passes the ratio, shown as text in the previous cell
	await expect(first_row.getByRole('cell').nth(3)).toHaveAccessibleName('75.37%')

	// Plain markup: a real <meter> child (accessible without any JS), no shadow root
	expect(await meter.evaluate((element: HTMLMeterElement) => element.value)).toBeCloseTo(0.7537, 3)
	await expect(meter).toHaveAttribute('max', '1')
	expect(await wrapper.evaluate((element) => element.shadowRoot)).toBeNull()

	// Styled by the global stylesheet through the wrapper
	let styles = await meter.evaluate((element) => {
		let style = getComputedStyle(element)
		return {
			inline: style.inlineSize,
			block: style.blockSize,
			wrapper: getComputedStyle(element.parentElement!).display
		}
	})
	expect(styles.wrapper).toBe('contents')
	expect(parseFloat(styles.block)).toBeGreaterThan(0)
	expect(parseFloat(styles.inline)).toBeGreaterThan(0)
})
