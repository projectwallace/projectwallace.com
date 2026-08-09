import { test, expect } from '../../../../tests/fixtures'

// Linting itself now runs client-side (see src/lib/stylelint-browser/lint.ts),
// so only the CSS-fetching API is mocked here; warnings below reflect real
// stylelint output for the given CSS.
const GET_CSS_API = '**/api/get-css*'

const mock_origins = [
	{
		type: 'file',
		href: 'https://example.com/style.css',
		css: 'a { colour: red !important; }'
	}
]

test('does SEO well', async ({ page }) => {
	await page.goto('/lint-css', { waitUntil: 'domcontentloaded' })
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
	await expect.soft(page).not.toHaveHorizontalOverflow()
})

test.describe('URL input mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.route(GET_CSS_API, async (route) => {
			if (route.request().method() === 'GET') {
				await route.fulfill({ status: 200, json: mock_origins })
			} else {
				await route.continue()
			}
		})
		await page.goto('/lint-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
	})

	test('lints CSS from a URL and shows warnings', async ({ page }) => {
		await page.getByLabel('Website URL').fill('example.com')
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		await expect.soft(page.getByRole('table')).toBeVisible()
		expect.soft(await page.getByRole('table').getByRole('row').count()).toBeGreaterThanOrEqual(2)
		await expect.soft(page.getByRole('cell', { name: /important ratio/i })).toBeVisible()
	})

	test('shows the fetched CSS in the CSS input pane', async ({ page }) => {
		await page.getByLabel('Website URL').fill('example.com')
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		await expect.soft(page.getByTestId('pre-css')).toContainText('colour: red !important;')
	})
})

test.describe('Raw CSS input mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/lint-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		await page.getByRole('tab', { name: 'Paste CSS' }).click()
	})

	test('shows no warnings for valid CSS', async ({ page }) => {
		await page.getByLabel('CSS to analyze').fill('a { color: red; }')
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		await expect(page.getByText('No stylelint issues found!')).toBeVisible()
	})

	test('shows warnings for CSS with violations', async ({ page }) => {
		await page.getByLabel('CSS to analyze').fill('a { colour: red !important; }')
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		await expect.soft(page.getByRole('table')).toBeVisible()
		await expect.soft(page.getByRole('table')).toContainText('max-important-ratio')
	})

	test('shows a parse error for invalid CSS', async ({ page }) => {
		await page.getByLabel('CSS to analyze').fill(`a { background: url('")}`)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		await expect(page.getByText('Could not lint CSS:')).toBeVisible()
	})
})

test.describe('Preset selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/lint-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
	})

	test('recommended preset is selected by default', async ({ page }) => {
		await expect(page.getByLabel('Recommended')).toBeChecked()
	})

	test('selecting a preset updates the URL', async ({ page }) => {
		await page.getByLabel('Correctness').click()
		await expect.soft(page).toHaveURL(/preset=correctness/)
		await expect.soft(page.getByLabel('Correctness')).toBeChecked()
	})

	test('preset from URL param is pre-selected', async ({ page }) => {
		await page.goto('/lint-css?preset=performance', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		await expect(page.getByLabel('Performance')).toBeChecked()
	})
})
