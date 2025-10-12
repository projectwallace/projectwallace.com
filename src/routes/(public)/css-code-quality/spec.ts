import { test, expect } from '../../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/css-code-quality', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test.describe('interaction', () => {
	test.beforeEach(async ({ page }) => {
		await expect(page).toBeHydrated()
	})

	test('analyzes a URL', async ({ page }) => {
		// Fill in a URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		// Verify that Report is shown
		await expect.soft(page.getByTestId('css-quality-report')).toBeVisible()
		await expect.soft(page).toHaveURL('/css-code-quality?url=example.com&prettify=1')

		// Shows top-level numbers
		await expect.soft(page.getByTestId('maintainability-score')).toBeVisible()
		await expect.soft(page.getByTestId('maintainability-score')).toBeVisible()
		await expect.soft(page.getByTestId('maintainability-score')).toBeVisible()
	})

	test('analyzes raw input', async ({ page }) => {
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()

		// Construct some big gnarly CSS so we trip some rules
		const MOCK_CSS = `
			@import url("test.css");
			@import url("test.css");
			@import url("test.css");
			@import url("test.css");
			@import url("test.css");

			h1 {
				color: red;
				font-size: 1em;

				${Array(1000)
					.fill(0)
					.map((_, i) => `padding: 0px ${i}px;`)
					.join('')}
			}
		`

		// Fill in some CSS
		await page.getByLabel('CSS to analyze').fill(MOCK_CSS)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that Report is shown
		await expect(page.getByTestId('css-quality-report')).toBeVisible()
		await expect.soft(page).toHaveURL('/css-code-quality')

		// Shows top-level numbers
		await expect.soft(page.getByTestId('maintainability-score')).toBeVisible()
		await expect.soft(page.getByTestId('maintainability-score')).toBeVisible()
		await expect.soft(page.getByTestId('maintainability-score')).toBeVisible()
	})

	test('filters by selected category', async ({ page }) => {
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()

		// Fill in some CSS
		await page.getByLabel('CSS to analyze').fill(`h1{color:red;font-size:1em;}`)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that all rules are shown at first
		let rules = page.getByTestId('quality-rule')
		await expect.soft(rules).toHaveCount(20)

		// Filter by 'Maintainability'
		await page.getByRole('radio', { name: 'Maintainability' }).click()
		await expect.soft(rules).toHaveCount(8)

		// Filter by 'Complexity'
		await page.getByRole('radio', { name: 'Complexity' }).click()
		await expect.soft(rules).toHaveCount(5)

		// Filter by 'Performance'
		await page.getByRole('radio', { name: 'Performance' }).click()
		await expect.soft(rules).toHaveCount(7)

		// Filter by 'All'
		await page.getByRole('radio', { name: 'All' }).click()
		await expect.soft(rules).toHaveCount(20)
	})
})

test.describe('URL preloading', () => {
	test('url=example.com', async ({ page }) => {
		await page.goto('/css-code-quality?url=example.com', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
	})

	test('Raw: unsets URL param', async ({ page }) => {
		await expect(page).toBeHydrated()

		// Analyze URL first
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		await expect.soft(page).toHaveURL('/css-code-quality?url=example.com&prettify=1')

		// Fill in Raw CSS
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
		await page.getByLabel('CSS to analyze').fill(`h1{color:red;font-size:1em;}`)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		await expect.soft(page).toHaveURL('/css-code-quality')
	})
})
