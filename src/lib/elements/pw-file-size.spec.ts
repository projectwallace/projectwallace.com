import type { Locator } from '@playwright/test'
import { test, expect } from '#tests/fixtures.ts'

// The formatted size is rendered in the shadow root; the light DOM only holds the (hidden) source bytes
function formatted(locator: Locator) {
	return locator.evaluate((element) => element.shadowRoot?.textContent?.trim())
}

test('formats the slotted byte count and follows Svelte updates', async ({ page }) => {
	let hydration_warnings: string[] = []
	page.on('console', (message) => {
		if (/hydrat/i.test(message.text())) {
			hydration_warnings.push(message.text())
		}
	})

	await page.goto('/minify-css', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()

	let input = page.getByLabel('CSS input')
	let sizes = page.locator('pw-file-size')

	await input.fill('a { color: red; }')
	await expect.poll(() => formatted(sizes.first())).toBe('17 bytes') // input
	await expect.poll(() => formatted(sizes.last())).toBe('12 bytes') // minified output

	// Svelte re-creates the element for a new value ({#key}), so the new slotted text is picked up
	await input.fill('a { color: red; } b { margin: 0 }')
	await expect.poll(() => formatted(sizes.first())).toBe('33 bytes')
	await expect.poll(() => formatted(sizes.last())).toBe('23 bytes')

	// Clearing the textarea unmounts the elements, typing again mounts new ones
	await input.fill('')
	await expect(sizes).toHaveCount(0)
	await input.fill('a{}')
	await expect.poll(() => formatted(sizes.first())).toBe('3 bytes')

	// The source value stays in the light DOM, only the shadow root shows the formatted size
	await expect(sizes.first()).toHaveJSProperty('textContent', '3')

	expect(hydration_warnings).toEqual([])
})
