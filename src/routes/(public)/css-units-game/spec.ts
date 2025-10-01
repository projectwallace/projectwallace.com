import { test, expect } from '../../../../tests/fixtures'
import { all } from '../../../lib/css-units.js'

test.beforeEach(async ({ page }) => {
	await page.goto('/css-units-game', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test.describe('game play', () => {
	test.beforeEach(async ({ page }) => {
		await expect(page).toBeHydrated()
	})

	test('accepts valid units', async ({ page }) => {
		let input = page.getByLabel('Unit')

		// Verify that we're starting off empty
		await expect.soft(page.getByTestId('success-message')).not.toBeVisible()
		await expect.soft(page.getByTestId('game-reset')).not.toBeVisible()
		await expect.soft(page.getByTestId('progress-count')).not.toBeVisible()
		await expect.soft(page.getByTestId('guesses')).not.toBeVisible()
		await expect.soft(input).toHaveValue('')

		// Fill in a valid unit
		await input.fill(`px`)
		await page.getByRole('button', { name: 'Guess' }).click()

		// Verify that unit is added to list
		await expect.soft(page.getByTestId('guess')).toBeVisible()

		// Verify that progress bar is updated
		await expect.soft(page.getByTestId('progress-count')).toContainText('1 / 64')

		// Verify that the input is emptied afterwards
		await expect.soft(input).toHaveValue('')
	})

	test('rejects invalid units', async ({ page }) => {
		let input = page.getByLabel('Unit')

		// Fill in an invalid unit
		await input.fill(`sup`)
		await page.getByRole('button', { name: 'Guess' }).click()

		// Verify that unit is not added to list
		await expect.soft(page.getByTestId('guess')).not.toBeVisible()

		// Verify that progress bar is not displayed/updated
		await expect.soft(page.getByTestId('progress-count')).not.toBeVisible()

		// Verify that the input is not emptied afterwards
		await expect.soft(input).toHaveValue('sup')
	})

	test.fixme('shows congrats when you guessed all units', async ({ page }) => {
		let input = page.getByLabel('Unit')
		let submit = page.getByRole('button', { name: 'Guess' })

		// Fill in all possible values
		let index = 0
		for (let unit of all) {
			await input.fill(unit)
			await submit.click()
			await expect.soft(page.getByTestId('guess').first()).toHaveText(unit)
			await expect.soft(page.getByTestId('progress-count')).toContainText(`${index + 1} / ${all.length}`)
			index++
		}

		// Verify that progress is updated
		await expect.soft(page.getByTestId('guess')).toHaveCount(64)

		// Verify that a congrats message is shown
		await expect.soft(page.getByTestId('success-message')).toBeVisible()

		// Reset the game
		await page.getByRole('button', { name: 'Start over' }).click()

		await expect.soft(page.getByTestId('success-message')).not.toBeVisible()
		await expect.soft(page.getByRole('button', { name: 'Start over' })).not.toBeVisible()
		await expect.soft(page.getByTestId('progress-count')).not.toBeVisible()
		await expect.soft(page.getByTestId('guesses')).not.toBeVisible()
		await expect.soft(input).toHaveValue('')
	})

	test('has an easter egg!', async ({ page }) => {
		await page.getByLabel('Unit').fill('!important')
		await page.getByRole('button', { name: 'Guess' }).click()

		// Verify that progress is updated
		await expect.soft(page.getByTestId('progress-count')).toContainText('64 / 64')
		await expect.soft(page.getByTestId('guess')).toHaveCount(64)

		// Verify that a congrats message is shown
		await expect.soft(page.getByTestId('success-message')).toBeVisible()
		await expect.soft(page.getByRole('button', { name: 'Start over' })).toBeVisible()
	})
})
