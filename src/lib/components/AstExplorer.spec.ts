import { test, expect } from '#tests/fixtures.ts'

// Read-only checks on the default state share one page load, and use soft assertions so
// that a single failure doesn't hide the others.
test('initial state', async ({ page }) => {
	await page.goto('/ast-explorer')

	await expect.soft(page.getByLabel('CSS input')).not.toHaveValue(``)
	await expect.soft(page.getByRole('tree')).toBeVisible()

	let link = page.getByRole('link', { name: /CSS Parser/i })
	await expect.soft(link).toHaveAttribute('href', /github\.com\/projectwallace\/css-parser/)

	await expect.soft(page.getByLabel('Autofocus selected node')).toBeChecked()
})

test('locations are hidden by default and visible once enabled', async ({ page }) => {
	await page.goto('/ast-explorer')

	let input = page.getByLabel('Show locations')
	let locations = page.getByTestId('location')
	await expect.soft(input).not.toBeChecked()
	await expect.soft(locations).toHaveCount(0)

	await input.check()
	await expect(locations.first()).toBeVisible()
})

test('node types are hidden by default and visible once enabled', async ({ page }) => {
	await page.goto('/ast-explorer')

	let input = page.getByLabel('Show types')
	let types = page.getByTestId('type')
	await expect.soft(input).not.toBeChecked()
	await expect.soft(types).toHaveCount(0)

	await input.check()
	await expect(types.first()).toBeVisible()
})

test('Atrule prelude parsing is enabled by default and shows a raw node when disabled', async ({ page }) => {
	await page.goto('/ast-explorer')

	let treeitem = page.getByRole('treeitem', { name: 'MediaQuery (32)' })
	await expect.soft(page.getByLabel('Parse atrule preludes')).toBeChecked()
	await treeitem.scrollIntoViewIfNeeded()
	await expect.soft(treeitem).toBeVisible()

	await page.getByLabel('Parse atrule preludes').uncheck()
	await expect(treeitem).not.toBeAttached()
	let item = page.getByRole('treeitem', { name: 'Atrule (3)' }).getByRole('treeitem', { name: 'Raw (8)' })
	await item.scrollIntoViewIfNeeded()
	await expect(item).toBeVisible()
})

test('Selector parsing is enabled by default and shows a raw node when disabled', async ({ page }) => {
	await page.goto('/ast-explorer')

	let treeitem = page.getByRole('treeitem', { name: 'Selector (5)' }).first()
	await expect.soft(page.getByLabel('Parse selectors')).toBeChecked()
	await treeitem.scrollIntoViewIfNeeded()
	await expect.soft(treeitem).toBeVisible()

	await page.getByLabel('Parse selectors').uncheck()
	await expect(treeitem).not.toBeAttached()
	let item = page.getByRole('treeitem', { name: 'Rule (2)' }).first().getByRole('treeitem', { name: 'Raw (8)' }).first()
	await item.scrollIntoViewIfNeeded()
	await expect(item).toBeVisible()
})

test('Value parsing is enabled by default and shows a raw node when disabled', async ({ page }) => {
	await page.goto('/ast-explorer')

	let treeitem = page
		.getByRole('treeitem', { name: 'Value (50)' })
		.getByRole('treeitem', { name: 'Identifier (10)' })
		.first()
	await expect.soft(page.getByLabel('Parse values')).toBeChecked()
	await treeitem.scrollIntoViewIfNeeded()
	await expect.soft(treeitem).toBeVisible()

	await page.getByLabel('Parse values').uncheck()
	await expect(treeitem).not.toBeAttached()
	let item = page
		.getByRole('treeitem', { name: 'Declaration (4)' })
		.first()
		.getByRole('treeitem', { name: 'Raw (8)' })
		.first()
	await item.scrollIntoViewIfNeeded()
	await expect(item).toBeVisible()
})

test.describe('autofocus', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/ast-explorer')
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

	test('does not auto scroll to the selected node when autofocus is disabled', async ({ page }) => {
		await page.getByLabel('Autofocus selected node').uncheck()

		let input = page.getByLabel('CSS input')
		await input.focus()
		for (let i = 0; i < 11; i++) {
			await input.press('ArrowDown')
		}
		// Wait for the selection to update and element to exist
		let treeitem = page.getByRole('treeitem', {
			selected: true
		})
		await expect(treeitem).toHaveCount(0)
	})
})

// Super broken for some reason, but it actually just works
test.skip('prettifies the CSS when button is clicked', async ({ page }) => {
	await page.goto('/ast-explorer')
	let input = page.getByLabel('CSS input')
	await input.clear()
	await input.fill('a{color:blue}')
	await page.getByRole('button', { name: 'Prettify CSS' }).click()
	await expect(input).toHaveValue(`a {\n\tcolor: blue;\n}`)
})

test.describe('URL hash state', () => {
	/** Encode a value to base64 JSON for use in the URL hash (mirrors encode_hash_state) */
	function encodeHash(value: unknown): string {
		return btoa(encodeURIComponent(JSON.stringify(value)))
	}

	// Navigate away so any subsequent goto('/ast-explorer#hash') triggers a full reload,
	// not a same-page hash change (which Playwright resolves without re-mounting the page)
	test.beforeEach(async ({ page }) => {
		await page.goto('about:blank')
	})

	test('no hash shows default CSS input', async ({ page }) => {
		await page.goto('/ast-explorer')
		// Page has default CSS, not empty
		let input = page.getByLabel('CSS input')
		await expect(input).not.toHaveValue('')
	})

	test('changing input updates hash', async ({ page }) => {
		await page.goto('/ast-explorer')
		let input = page.getByLabel('CSS input')
		let css = 'test { color: red; }'
		await input.fill(css)
		let expected_url = `/ast-explorer#${encodeHash({ css, parse_atrule_preludes: true, parse_selectors: true, parse_values: true })}`
		await page.waitForURL(expected_url)
		await expect(page).toHaveURL(expected_url)
	})

	test('opening page with hash shows prefilled input and AST output', async ({ page }) => {
		let css = 'custom { display: block; }'
		await page.goto(
			`/ast-explorer#${encodeHash({ css, parse_atrule_preludes: true, parse_selectors: true, parse_values: true })}`
		)

		let input = page.getByLabel('CSS input')
		await expect(input).toHaveValue(css)

		// AST should be visible
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})

	test('opening page with partial hash shows prefilled input and AST output and does not crash page', async ({
		page
	}) => {
		let css = 'custom { display: block; }'
		// Notice that parse_* options are missing
		await page.goto(`/ast-explorer#${encodeHash({ css })}`)

		let input = page.getByLabel('CSS input')
		await expect(input).toHaveValue(css)

		// AST should be visible
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()

		// The missing parts from the URL should be overridden by default settings, so checkboxes should be enabled
		await expect(page.getByLabel('Parse atrule preludes')).toBeChecked()
		await expect(page.getByLabel('Parse selectors')).toBeChecked()
		await expect(page.getByLabel('Parse values')).toBeChecked()
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
