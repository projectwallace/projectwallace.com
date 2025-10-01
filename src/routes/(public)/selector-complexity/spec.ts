import { test, expect } from '../../../../tests/fixtures'
import type { Locator } from '@playwright/test'

let input: Locator

const ERROR_MESSAGE = 'Your selector complexity cannot be calculated. Please check your selector carefully for mistakes.'

test.describe('without preloading', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/selector-complexity', { waitUntil: 'domcontentloaded' })
		input = page.getByLabel('Selector to analyze')
	})

	test('does SEO well', async ({ page }) => {
		await expect.soft(page).toHaveSeoTitle()
		await expect.soft(page).toHaveCanonical()
		await expect.soft(page).toHaveMetaDescription()
		await expect.soft(page).toHaveH1()
	})

	test('auto focuses the input', async ({ page }) => {
		await expect.soft(input).toBeFocused()
	})

	test('analyzes a single selector', async ({ page }) => {
		await expect(page).toBeHydrated()

		// Fill in a selector
		await input.fill(`#myId .myClass myElement`)
		let complexity = page.getByTestId('complexity-result')

		// Verify that Specificity is shown
		await expect.soft(complexity).toBeVisible()
		await expect.soft(complexity).toHaveText('5')
	})

	test('analyzes multiple selectors', async ({ page }) => {
		await expect(page).toBeHydrated()

		// Fill in selectors
		await input.fill(`#myId .myClass myElement, [test] [test] [test]`)
		let complexity = page.getByTestId('complexity-result')

		// Verify that Specificity is shown
		for (let result of await complexity.all()) {
			await expect.soft(result).toBeVisible()
			await expect.soft(result).toHaveText('5')
		}
	})

	test('shows an error message for invalid selector', async ({ page }) => {
		await expect(page).toBeHydrated()
		await input.fill(`1234`)

		await expect.soft(input).toHaveAccessibleErrorMessage(ERROR_MESSAGE)
		await expect.soft(page.getByText(ERROR_MESSAGE)).toBeVisible()
		await expect.soft(page).toHaveURL('/selector-complexity?selector=1234')
	})

	test('error message disappears when input is valid', async ({ page }) => {
		await test.step('start with an error', async () => {
			await expect(page).toBeHydrated()
			await input.fill(`1234`)
			await expect.soft(input).toHaveAccessibleErrorMessage(ERROR_MESSAGE)
		})
		await input.fill(`.myClass`)
		await expect.soft(input).not.toHaveAccessibleErrorMessage(ERROR_MESSAGE)
	})

	test('updates the URL with the selector', async ({ page }) => {
		await expect(page).toBeHydrated()
		await input.fill(`#my-selector .myClass, :is(second)`)
		await expect(page).toHaveURL('/selector-complexity?selector=%23my-selector+.myClass%2C+%3Ais%28second%29')
	})
})

test.describe('with preloading', () => {
	test('preloads the selector from the URL', async ({ page }) => {
		await page.goto('/selector-complexity?selector=main', { waitUntil: 'domcontentloaded' })

		await expect.soft(page.getByLabel('Selector to analyze')).toHaveValue('main')
		await expect.soft(page.getByTestId('complexity-result')).toHaveText('1')
	})

	test('preloads multiple selectors from the URL', async ({ page }) => {
		await page.goto('/selector-complexity?selector=main%2C+%23test', { waitUntil: 'domcontentloaded' })

		await expect.soft(page.getByLabel('Selector to analyze')).toHaveValue('main, #test')
		let result = page.getByTestId('complexity-result')

		for (let complexity of await result.all()) {
			expect.soft(complexity).toBeVisible()
		}
	})

	test('shows an error message for invalid selectors', async ({ page }) => {
		await page.goto('/selector-complexity?selector=1234', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('Selector to analyze')

		await expect.soft(input).toHaveValue('1234')
		await expect.soft(input).toHaveAccessibleErrorMessage(ERROR_MESSAGE)
		await expect.soft(page.getByText(ERROR_MESSAGE)).toBeVisible()
	})
})
