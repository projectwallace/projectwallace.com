import { test, expect } from '../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/ast-explorer', { waitUntil: 'domcontentloaded' })
})

test.describe('initial state', () => {
	test('shows the CSS input', ({ page }) => {
		let input = page.getByLabel('CSS to analyze').inputValue
		expect(input).not.toBe('')
	})

	test('shows the AST output', async ({ page }) => {
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})

	test('shows a link a to documentation', async ({ page }) => {
		let link = page.getByRole('link', { name: /CSS Parser/i })
		expect(link).not.toBeNull()
		await expect(link).toHaveAttribute('href', /github\.com\/projectwallace\/css-parser/)
	})

	test('show location data is turned off by default', async ({ page }) => {
		let input = page.getByLabel('Show location data')
		await expect(input).not.toBeChecked()
	})

	test('Autofocus is turned on by default', async ({ page }) => {
		let input = page.getByLabel('Autofocus')
		await expect(input).toBeChecked()
	})

	test('location data is not visible', async ({ page }) => {
		let locations = page.getByTestId('location')
		await expect(locations).toHaveCount(0)
	})
})

test('location data is visible when the checkbox is checked', async ({ page }) => {
	let input = page.getByLabel('Show location data')
	await input.check()
	let locations = page.getByTestId('location')
	// Wait for location data to appear in the DOM after checking the checkbox
	await expect(locations.first()).toBeVisible()
	await expect(locations).not.toHaveCount(0)
})

test('auto scrolls to the selected node', async ({ page }) => {
	let input = page.getByLabel('CSS to analyze')
	await input.focus()
	for (let i = 0; i < 11; i++) {
		await input.press('ArrowDown')
	}
	// Wait for the selection to update and element to exist
	let treeitem = page.getByRole('treeitem', {
		selected: true
	})
	await expect(treeitem).toHaveCount(1)
	await expect(treeitem).toBeVisible()
	// Wait for scroll animation to complete before checking viewport
	await expect(treeitem).toBeInViewport()
})

test.describe('URL hash state', () => {
	/** Encode a value to base64 JSON for use in the URL hash (mirrors encodeHashState) */
	function encodeHash(value: unknown): string {
		return btoa(encodeURIComponent(JSON.stringify(value)))
	}

	test('no hash shows default CSS input', async ({ page }) => {
		await page.goto('/ast-explorer', { waitUntil: 'domcontentloaded' })
		// Page has default CSS, not empty
		let input = page.getByLabel('CSS to analyze')
		await expect(input).not.toHaveValue('')
	})

	test('changing input updates hash', async ({ page }) => {
		await page.goto('/ast-explorer', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('CSS to analyze')
		let css = 'test { color: red; }'
		await input.fill(css)
		let expected_url = `/ast-explorer#${encodeHash(css)}`
		await page.waitForURL(expected_url)
		await expect(page).toHaveURL(expected_url)
	})

	test('opening page with hash shows prefilled input and AST output', async ({ page }) => {
		let css = 'custom { display: block; }'
		let hash = encodeHash(css)
		await page.goto(`/ast-explorer#${hash}`, { waitUntil: 'domcontentloaded' })

		let input = page.getByLabel('CSS to analyze')
		await expect(input).toHaveValue(css)

		// AST should be visible
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})

	test('corrupted hash shows page in default state', async ({ page }) => {
		await page.goto('/ast-explorer#invalid-base64-!!!', { waitUntil: 'domcontentloaded' })

		// Should fall back to default CSS
		let input = page.getByLabel('CSS to analyze')
		await expect(input).not.toHaveValue('')

		// AST should still be visible
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})
})
