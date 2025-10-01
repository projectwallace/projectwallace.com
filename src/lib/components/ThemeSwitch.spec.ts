import { test, expect } from '../../../tests/fixtures'
import type { Theme } from '$lib/theme'

type StoredTheme = Theme
type PreferedColorScheme = 'light' | 'dark'
type ExpectedScheme = Capitalize<Theme>
type Item = [ExpectedScheme, PreferedColorScheme?, StoredTheme?]

let matrix: Item[] = [
	['System', 'dark', undefined],
	['System', 'light', undefined],
	['Dark', 'dark', 'dark',],
	['Dark', 'light', 'dark',],
	['Light', 'dark', 'light',],
	['Light', 'light', 'light',],
	['System', 'dark', 'system',],
	['System', 'light', 'system',],
]

test.describe('stored theme and OS color scheme', () => {
	for (let [expected_scheme, prefered_color_scheme, stored_theme] of matrix) {
		test(`stored theme: ${stored_theme || 'none'}, OS: ${prefered_color_scheme || 'no-preference'}`, async ({ page, context }) => {
			await page.emulateMedia({ colorScheme: prefered_color_scheme })
			await page.goto('/', { waitUntil: 'domcontentloaded' })
			if (stored_theme) {
				await context.addCookies([
					{
						name: 'theme',
						value: stored_theme,
						url: page.url(),
					}
				])
				await page.reload({ waitUntil: 'domcontentloaded' })
			}

			// The switcher should be set to the expected scheme
			await page.getByRole('button', { name: 'Choose website theme' }).click()
			let group = page.getByRole('group', { name: 'Pick a theme' })
			let radio = group.getByRole('radio', { name: expected_scheme })
			await expect.soft(radio).toBeChecked()
			await expect.soft(radio).toBeFocused()

			// The HTML element should have the expected theme
			await expect.soft(page.locator('html')).toHaveAttribute('data-theme', expected_scheme.toLowerCase())
		})
	}
})

test.describe('switching to a specific theme', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		await page.getByRole('button', { name: 'Choose website theme' }).click()
		await page.getByRole('radio', { name: 'Dark' }).click()
	})

	test('sets the theme to dark', async ({ page }) => {
		await expect.soft(page.locator('html')).toHaveAttribute('data-theme', 'dark')
	})

	test('stores the theme in a cookie', async ({ page, context }) => {
		await page.reload({ waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Check that the cookie is set
		let cookies = await context.cookies()
		let theme_cookie = cookies.find((cookie) => cookie.name === 'theme')
		expect.soft(theme_cookie?.value).toBe('dark')
	})
})
