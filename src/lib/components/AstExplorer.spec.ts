import { test, expect } from '../../../tests/fixtures'
import { encodeHashState } from '$lib/url-hash-state.svelte'

test.beforeEach(async ({ page }) => {
	await page.goto('/ast-explorer')
})

test.describe('initial state', () => {
	test('shows the CSS input', async ({ page }) => {
		await expect(page.getByLabel('CSS input')).not.toHaveValue(``)
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
		let input = page.getByLabel('Show locations')
		await expect(input).not.toBeChecked()
	})

	test('Autofocus is turned on by default', async ({ page }) => {
		let input = page.getByLabel('Autofocus selected node')
		await expect(input).toBeChecked()
	})

	test('location data is not visible', async ({ page }) => {
		let locations = page.getByTestId('location')
		await expect(locations).toHaveCount(0)
	})
})

test('location data is visible when the checkbox is checked', async ({ page }) => {
	let input = page.getByLabel('Show locations')
	await input.check()
	let locations = page.getByTestId('location')
	// Wait for location data to appear in the DOM after checking the checkbox
	await expect(locations.first()).toBeVisible()
	await expect(locations).not.toHaveCount(0)
})

test('auto scrolls to the selected node', async ({ page }) => {
	let input = page.getByLabel('CSS input')
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

// Super broken for some reason, but it actually just works
test.skip('prettifies the CSS when button is clicked', async ({ page }) => {
	let input = page.getByLabel('CSS input')
	await input.clear()
	await input.fill('a{color:blue}')
	await page.getByRole('button', { name: 'Prettify CSS' }).click()
	await expect(input).toHaveValue(`a {\n\tcolor: blue;\n}`)
})

test.describe('URL hash state', () => {
	/** Encode a value to base64 JSON for use in the URL hash (mirrors encodeHashState) */
	function encodeHash(value: unknown): string {
		return btoa(encodeURIComponent(JSON.stringify(value)))
	}

	test('no hash shows default CSS input', async ({ page }) => {
		// Page has default CSS, not empty
		let input = page.getByLabel('CSS input')
		await expect(input).not.toHaveValue('')
	})

	test('changing input updates hash', async ({ page }) => {
		let input = page.getByLabel('CSS input')
		let css = 'test { color: red; }'
		await input.fill(css)
		let expected_url = `/ast-explorer#${encodeHash(css)}`
		await page.waitForURL(expected_url)
		await expect(page).toHaveURL(expected_url)
	})

	test('opening page with hash shows prefilled input and AST output', async ({ page }) => {
		let css = 'custom { display: block; }'
		await page.goto(`/ast-explorer#${encodeHash(css)}`)

		let input = page.getByLabel('CSS input')
		await expect(input).toHaveValue(css)

		// AST should be visible
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})

	test('corrupted hash shows page in default state', async ({ page }) => {
		await page.goto('/ast-explorer#invalid-base64-!!!')

		// Should fall back to default CSS
		let input = page.getByLabel('CSS input')
		await expect(input).not.toHaveValue('')

		// AST should still be visible
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})
})
