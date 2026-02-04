import { test, expect } from '../../../../tests/fixtures'
import type { Locator } from '@playwright/test'

let input: Locator

const ERROR_MESSAGE =
	'Your selector specificity cannot be calculated. Please check your selector carefully for mistakes.'

test.describe('without preloading', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/specificity-calculator', { waitUntil: 'domcontentloaded' })
		input = page.getByLabel('Selectors to analyze')
	})

	test('does SEO well', async ({ page }) => {
		await expect.soft(page).toHaveSeoTitle()
		await expect.soft(page).toHaveCanonical()
		await expect.soft(page).toHaveMetaDescription()
		await expect.soft(page).toHaveH1()
	})

	test('auto focuses the input', async () => {
		await expect.soft(input).toBeFocused()
	})

	test('analyzes a single selector', async ({ page }) => {
		await expect(page).toBeHydrated()

		// Fill in a selector
		await input.fill(`#myId .myClass myElement`)
		let specificity = page.locator('main dl')

		// Verify that Specificity is shown
		await expect.soft(specificity).toBeVisible()
		let parts = specificity.locator('dd')

		// Verify that Specificity is correct
		await expect.soft(parts.nth(0)).toHaveText('1')
		await expect.soft(parts.nth(1)).toHaveText('1')
		await expect.soft(parts.nth(2)).toHaveText('1')
	})

	test('analyzes multiple selectors', async ({ page }) => {
		await expect(page).toBeHydrated()

		// Fill in a selector
		await input.fill(`#myId .myClass myElement, .another`)

		// Verify that Specificity is correct
		let specificities = page.locator('dl')
		let expected_specificities = [
			[1, 1, 1],
			[0, 1, 0]
		]
		let index = 0
		for (let specificity of await specificities.all()) {
			await expect.soft(specificity).toBeVisible()

			let parts = specificity.locator('dd')

			for (let i = 0; i < 3; i++) {
				await expect.soft(parts.nth(i)).toHaveText(expected_specificities[index][i].toString())
			}
			index++
		}
	})
	test('shows an error message for invalid selectors', async ({ page }) => {
		await expect(page).toBeHydrated()
		await input.fill(`1234`)

		await expect.soft(input).toHaveAccessibleErrorMessage(ERROR_MESSAGE)
		await expect.soft(page.getByText(ERROR_MESSAGE)).toBeVisible()
		await expect.soft(page).toHaveURL('/specificity-calculator?selectors=1234')
	})

	test('error message disappears when input is valid', async ({ page }) => {
		await test.step('start with an error', async () => {
			await expect(page).toBeHydrated()
			await input.fill(`1234`)
			await expect(input).toHaveAccessibleErrorMessage(ERROR_MESSAGE)
		})
		await input.fill(`.myClass`)
		await expect(input).not.toHaveAccessibleErrorMessage(ERROR_MESSAGE)
	})

	test('updates the URL with the selector', async ({ page }) => {
		await expect(page).toBeHydrated()
		await input.fill(`#my-selector .myClass, :is(second)`)
		await expect(page).toHaveURL('/specificity-calculator?selectors=%23my-selector+.myClass%2C+%3Ais%28second%29')
	})
})

test.describe('with preloading', () => {
	test('preloads the selector from the URL', async ({ page }) => {
		await page.goto('/specificity-calculator?selectors=main', { waitUntil: 'domcontentloaded' })

		await expect(page.getByLabel('Selectors to analyze')).toHaveValue('main')
		await expect(page.getByTestId('specificity-item')).toHaveCount(1)
	})

	test('preloads the selector from the URL with multiple selectors', async ({ page }) => {
		await page.goto('/specificity-calculator?selectors=main%2C+.test', { waitUntil: 'domcontentloaded' })

		await expect(page.getByLabel('Selectors to analyze')).toHaveValue('main, .test')
		await expect(page.getByTestId('specificity-item')).toHaveCount(2)
	})

	test('shows an error message for invalid selectors', async ({ page }) => {
		await page.goto('/specificity-calculator?selectors=1234', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('Selectors to analyze')

		await expect(input).toHaveValue('1234')
		await expect(input).toHaveAccessibleErrorMessage(ERROR_MESSAGE)
		await expect(page.getByText(ERROR_MESSAGE)).toBeVisible()
	})
})
