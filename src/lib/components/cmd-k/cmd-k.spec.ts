import type { Locator } from '@playwright/test'
import { expect, test } from '../../../../tests/fixtures'
import { shortcuts } from './shortcuts'

const LINK_COUNT = shortcuts.reduce((acc, curr) => {
	acc += curr.items.length
	return acc
}, 0)

test.describe('CMD+K', () => {
	let dialog: Locator
	let links: Locator
	let search_field: Locator

	test.beforeEach(async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// Open the command dialog
		await page.getByRole('main').press('Meta+KeyK')
		dialog = page.getByRole('menu', { name: 'Command menu' })
		links = dialog.getByRole('link')
		search_field = dialog.getByRole('combobox')

		// Wait for the dialog to be visible, otherwise the tests might be flaky
		await expect.soft(dialog).toBeInViewport()
	})

	test('shows command bar', async () => {
		await expect.soft(dialog).toBeInViewport()
		await expect.soft(links).toHaveCount(LINK_COUNT)

		for (let shortcut of await links.all()) {
			await expect.soft(shortcut).toBeVisible()
		}
	})

	test('closes the dialog on pressing ESC', async ({ page }) => {
		await page.keyboard.press('Escape')
		await expect(dialog).not.toBeVisible()
	})

	test('does not close the dialog on pressing CMD+K again', async ({ page }) => {
		await expect.soft(dialog).toBeInViewport({ ratio: 1 })
		await page.keyboard.press('Meta+KeyK')
		await expect(dialog).toBeVisible()
	})

	test("navigates to the shortcut's page when clicking it", async ({ page }) => {
		await links.nth(0).press('Enter')
		await expect.soft(page.getByRole('dialog')).not.toBeVisible()
		await page.waitForURL('**/analyze-css')
	})

	test.describe('keyboard navigation', () => {
		test('pressing ArrowUp on the first link moves focus to the combobox', async ({ page }) => {
			await links.first().focus()
			await page.keyboard.press('ArrowUp')

			await expect.soft(search_field).toBeFocused()
			await expect.soft(links.first()).not.toBeFocused()
		})

		test('pressing ArrowDown on the last link moves focus to the combobox', async ({ page }) => {
			await links.last().focus()
			await page.keyboard.press('ArrowDown')

			await expect.soft(search_field).toBeFocused()
			await expect.soft(links.last()).not.toBeFocused()
		})

		test('pressing ArrowDown in the combobox moves focus to the first link', async ({ page }) => {
			await search_field.focus()
			await page.keyboard.press('ArrowDown')

			await expect.soft(links.first()).toBeFocused()
			await expect.soft(search_field).not.toBeFocused()
		})

		test('pressing ArrowUp in the combobox moves focus to the last link', async ({ page }) => {
			await search_field.focus()
			await page.keyboard.press('ArrowUp')

			await expect.soft(links.last()).toBeFocused()
			await expect.soft(search_field).not.toBeFocused()
		})

		// TODO: add test for Windows Home/End keys
		test('pressing CMD+ArrowUp moves focus to the first link', async ({ page }) => {
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Meta+ArrowUp')
			await expect.soft(links.nth(0)).toBeFocused()
		})

		test('pressing CMD+ArrowDown moves focus to the last link', async ({ page }) => {
			await page.keyboard.press('Meta+ArrowDown')
			await expect.soft(links.last()).toBeFocused()
		})
	})

	test.describe('filtering', () => {
		test('searching for a term filters the links', async () => {
			await search_field.fill('analyze')
			await expect.soft(links).toHaveCount(1)
			await expect.soft(links.first()).toHaveText('CSS Analyzer')
			await expect.soft(dialog.getByTestId('empty')).not.toBeVisible()
		})

		test('searching for a term that does not match any link shows the no results state', async () => {
			await search_field.fill('foobar')
			await expect.soft(links).toHaveCount(0)
			await expect.soft(dialog.getByTestId('empty')).toBeVisible()
		})

		test('searching for a keyword alternative shows results', async () => {
			await search_field.fill('compress')
			await expect.soft(links).toHaveCount(1)
			await expect.soft(dialog.getByTestId('empty')).not.toBeVisible()
		})
	})

	test.describe('opening dialog multiple times', () => {
		test('the search field is cleared when opening the dialog again after navigating', async ({ page }) => {
			// enter search query and go to result
			await search_field.fill('minify')
			await links.nth(0).click()
			await page.waitForURL('**/minify-css')

			// dialog is now hidden, so trigger again
			await page.getByRole('main').press('Meta+KeyK')

			await expect(search_field).toHaveValue('')
		})

		test('the search field is not cleared when opening the dialog twice', async ({ page }) => {
			// enter search query and go to result
			await search_field.fill('minify')
			await page.getByRole('main').press('Escape')

			await page.getByRole('main').press('Meta+KeyK')
			await expect(dialog).toBeVisible()
			await expect(search_field).toHaveValue('minify')
		})
	})
})
