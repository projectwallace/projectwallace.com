import { expect, test } from '../../../../tests/fixtures'
import type { CSSOrigin } from '$lib/css-origins'

let fixture = [
	{
		type: 'link',
		href: 'https://example.com/test.css',
		url: 'https://example.com/test.css',
		media: undefined,
		rel: 'stylesheet',
		css: 'test-link-element {}'
	}
] satisfies CSSOrigin[]

test.describe('DevTools Panel', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('/api/get-css*', async (route) => {
			await route.fulfill({ json: fixture })
		})

		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Fill in a URL
		await page.getByLabel('URL to analyze').fill(`example.com`)

		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()
	})

	test('Always shows devtools tabs', async ({ page }) => {
		let devtools = page.getByTestId('devtools')
		let tabs = devtools.getByRole('tablist')
		await expect.soft(tabs).toBeVisible()
		await expect.soft(tabs).toBeInViewport({ ratio: 1 })
	})

	test('Tab Panels are initially hidden', async ({ page }) => {
		let devtools = page.getByTestId('devtools')
		await expect(devtools.getByRole('tabpanel')).toHaveCount(0)
	})

	test('Click a tab opens the devtools and marks the clicked tab as active', async ({ page }) => {
		let devtools = page.getByTestId('devtools')
		let tabs = devtools.getByRole('tab')
		let panels = devtools.getByRole('tabpanel')
		await tabs.nth(0).click()

		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'active')
		await expect.soft(panels.nth(0)).toBeVisible()
	})

	// TODO: bring this back at some point...
	// test.fail() doesn't seem to work, so we're skipping this test for now
	test.fixme("Clicking a tab when it's open closes the devtools", async ({ page }) => {
		let devtools = page.getByTestId('devtools')
		let tabs = devtools.getByRole('tab')
		let panels = devtools.getByRole('tabpanel', { includeHidden: true })
		// Click to open
		await tabs.nth(0).click()
		// Click to close
		await tabs.nth(0).click()

		await expect(tabs.nth(0)).toHaveAttribute('data-state', 'inactive')
		await expect(panels.nth(0)).not.toBeVisible()
	})

	test('Clicking a not-current tab switches to that tab', async ({ page }) => {
		let devtools = page.getByTestId('devtools')
		let tabs = devtools.getByRole('tab')
		let panels = devtools.getByRole('tabpanel', { includeHidden: true })

		// Open the first tab
		await tabs.nth(0).click()
		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'active')
		await expect.soft(tabs.nth(1)).toHaveAttribute('data-state', 'inactive')
		await expect.soft(panels.nth(0)).toBeVisible()
		await expect.soft(panels.nth(1)).not.toBeVisible()

		// Click the second tab
		await tabs.nth(1).click()
		await expect.soft(tabs.nth(1)).toHaveAttribute('data-state', 'active')
		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'inactive')
		await expect.soft(panels.nth(1)).toBeVisible()
		await expect.soft(panels.nth(0)).not.toBeVisible()
	})

	test('Pressing arrow keys cycles through the tabs', async ({ page }) => {
		let main = page.getByRole('main')
		let devtools = main.getByTestId('devtools')
		let tabs = devtools.getByRole('tab')
		let panels = devtools.getByRole('tabpanel', { includeHidden: true })

		// Open the first tab and press ArrowRight
		await tabs.nth(0).click()
		await main.press('ArrowRight')

		// Now the next tab is visible
		await expect.soft(tabs.nth(1)).toHaveAttribute('data-state', 'active')
		await expect.soft(panels.nth(1)).toBeVisible()

		// Press ArrowLeft
		await main.press('ArrowLeft')
		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'active')
		await expect.soft(tabs.nth(1)).toHaveAttribute('data-state', 'inactive')
		await expect.soft(panels.nth(0)).toBeVisible()
		await expect.soft(panels.nth(1)).not.toBeVisible()
	})

	test('clicking the Close button hides all panels', async ({ page }) => {
		let main = page.getByRole('main')
		let devtools = main.getByTestId('devtools')
		let tabs = devtools.getByRole('tab')
		let panels = devtools.getByRole('tabpanel')

		await tabs.nth(0).click()
		await main.getByTestId('close-devtools').click()
		await expect.soft(panels).toHaveCount(0)
		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'inactive')
	})

	test('Devtools close when analyzing a new URL', async ({ page }) => {
		let main = page.getByRole('main')
		let devtools = main.getByTestId('devtools')
		let tabs = devtools.getByRole('tab')
		let panels = devtools.getByRole('tabpanel')

		// Open devtools
		await tabs.nth(0).click()
		// And make sure they are open
		await expect.soft(panels).toHaveCount(1)
		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'active')

		// Add more fixtures to make sure the CSS changes
		await page.route('/api/get-css*', async (route) => {
			await route.fulfill({ json: [...fixture, ...fixture] })
		})

		// Analyze a new URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		await expect.soft(panels).toHaveCount(0)
		await expect.soft(tabs.nth(0)).toHaveAttribute('data-state', 'inactive')
	})

	test('Click + drag resize button resizes the devtools', async ({ page }) => {
		let devtools = page.getByTestId('devtools')
		await devtools.getByRole('tab').first().click()
		let resize_button = devtools.getByLabel('Resize devtools')
		let initial_size = await devtools.boundingBox()

		await resize_button.dragTo(resize_button, {
			force: true,
			targetPosition: {
				y: initial_size!.y + 200,
				x: 0
			}
		})

		let new_size = await devtools.boundingBox()
		expect.soft(new_size!.y).toBeGreaterThan(initial_size!.y)
	})
})
