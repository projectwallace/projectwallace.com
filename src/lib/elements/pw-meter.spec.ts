import { test, expect } from '#tests/fixtures.ts'

test('renders a themed <meter> in its shadow root next to Svelte markup', async ({ page }) => {
	await page.goto('/css-coverage', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()
	await page.getByRole('button', { name: 'load an example' }).click()

	let table = page.getByRole('table', { name: 'Coverage per origin' })
	let first_row = table.getByRole('row').nth(1)
	let meter = first_row.locator('pw-meter')

	// Svelte passes the ratio, shown as text in the previous cell
	await expect(first_row.getByRole('cell').nth(3)).toHaveAccessibleName('75.37%')
	let state = await meter.evaluate((element) => {
		let inner = element.shadowRoot?.querySelector('meter')
		let host = getComputedStyle(element)
		return {
			property: (element as unknown as { value: number }).value,
			inner: inner?.value,
			max: inner?.max,
			adopted: element.shadowRoot?.adoptedStyleSheets.length,
			display: host.display
		}
	})
	expect(state.property).toBeCloseTo(0.7537, 3)
	expect(state.inner).toBeCloseTo(0.7537, 3)
	expect(state.max).toBe(1)
	expect(state.adopted).toBe(1) // styles come from an adopted stylesheet
	expect(state.display).toBe('inline-block')
})
