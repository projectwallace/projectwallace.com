import type { CSSOrigin } from '$lib/css-origins'
import { test, expect } from '../../../../tests/fixtures'
import { nav } from '../../../lib/components/stats/nav'

const file_fixture_1 = {
	name: 'style_1.css',
	mimeType: 'text/css',
	buffer: Buffer.from('a { color: red; }')
}
const file_fixture_2 = {
	name: 'style_2.css',
	mimeType: 'text/css',
	buffer: Buffer.from('a { color: blue; }')
}

test('does SEO well', async ({ page }) => {
	await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test.describe('navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('**/api/get-css*', async (route) => {
			await route.fulfill({
				status: 200,
				json: [
					{
						href: 'https://example.com/style.css',
						url: 'https://example.com/style.css',
						media: undefined,
						rel: 'stylesheet',
						type: 'link',
						css: 'body { color: red; &:hover { color: blue; } }'
					}
				] satisfies CSSOrigin[]
			})
		})
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// Fill in a valid URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()
	})

	test('each navigation link works', async ({ page }) => {
		// Verify that the whole report is shown
		for (let section of nav) {
			let element = page.locator('#' + section.id)
			await expect.soft(element, `Expect "#${section.id}" to be on the page`).toHaveCount(1)

			for (let sub_section of section.items) {
				let element = page.locator('#' + sub_section.id)
				await expect.soft(element, `Expect "#${sub_section.id}" to be on the page`).toHaveCount(1)
			}
		}
	})

	test('shows/hides the navigation using keyboard shortcut', async ({ page }) => {
		// Verify nav is shown
		let navigation = page.getByRole('navigation', { name: 'Navigate this page' })
		await expect.soft(navigation).toBeVisible()

		// Toggle the nav
		await page.keyboard.press('Meta+\\')
		await expect.soft(navigation).not.toBeVisible()

		// Toggle the nav back again
		await page.keyboard.press('Meta+\\')
		await expect.soft(navigation).toBeVisible()
	})
})

test.describe('URL input mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
	})

	test('analyzes a valid URL', async ({ page }) => {
		// Fill in a valid URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		// Verify that the URL is updated
		await expect.soft(page).toHaveURL('/analyze-css?url=example.com&prettify=1')
	})

	test('Shows a helpful error if the URL is blocked', async ({ page }) => {
		await page.route('**/api/get-css*', async (route) => {
			await route.fulfill({
				status: 200,
				json: {
					error: {
						url: 'chatgpt.com',
						statusCode: 403,
						original_status_code: 'ERR_NON_2XX_3XX_RESPONSE',
						message:
							'The origin server responded with a 403 Forbidden status code which means that scraping CSS is blocked. Is the URL publicly accessible?',
						originalMessage: 'Response code 403 (Forbidden)'
					}
				}
			})
		})
		// Fill in an invalid URL
		await page.getByLabel('URL to analyze').fill(`chatgpt.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		// Verify that the error message is shown
		await expect.soft(page.getByTestId('form-url-error')).toBeVisible()
		await expect
			.soft(page.getByTestId('form-url-error'))
			.toContainText(
				'The origin server responded with a 403 Forbidden status code which means that scraping CSS is blocked. Is the URL publicly accessible?'
			)
	})

	test('Shows a helpful error if the remote server refuses connection', async ({ page }) => {
		await page.route('**/api/get-css*', async (route) => {
			await route.fulfill({
				status: 200,
				json: {
					error: {
						url: 'refused.com',
						statusCode: 400,
						original_status_code: 'ECONNREFUSED',
						message: 'The origin server is refusing connections.',
						originalMessage: 'The origin server errored with statusCode 403'
					}
				}
			})
		})
		// Fill in an invalid URL
		await page.getByLabel('URL to analyze').fill(`refused.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		// Verify that the error message is shown
		await expect.soft(page.getByTestId('form-url-error')).toBeVisible()
		await expect.soft(page.getByTestId('form-url-error')).toContainText('The origin server is refusing connections.')
	})
	;['localhost:3000', '192.168.2.1', '127.0.0.1'].forEach((url) => {
		test(`Shows a helpful error if trying to scrape localhost (${url})`, async ({ page }) => {
			await page.route('**/api/get-css*', async (route) => {
				await route.fulfill({
					status: 200,
					json: {
						error: {
							url: url,
							statusCode: 400,
							original_status_code: 'ECONNREFUSED',
							message:
								'The origin server is refusing connections. You are trying to scrape a local server. Make sure to use a public URL.',
							originalMessage: 'The origin server errored with statusCode 403'
						}
					}
				})
			})
			// Fill in an invalid URL
			await page.getByLabel('URL to analyze').fill(url)
			// click 'Analyze URL'
			await page.getByRole('button', { name: 'Analyze URL' }).click()

			// Verify that the error message is shown
			await expect.soft(page.getByTestId('form-url-error')).toBeVisible()
			await expect
				.soft(page.getByTestId('form-url-error'))
				.toContainText(
					'The origin server is refusing connections. You are trying to scrape a local server. Make sure to use a public URL.'
				)
		})
	})

	test('does not crash when requesting an invalid URL', async ({ page }) => {
		await page.getByLabel('URL to analyze').fill('test { color: red; }')
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		await expect.soft(page.getByTestId('form-url-error')).toBeVisible()
		await expect
			.soft(page.getByTestId('form-url-error'))
			.toContainText('The URL is not valid. Are you sure you entered a URL and not CSS?')
	})

	test.describe('offline', () => {
		test.beforeEach(async ({ page }) => {
			// Make the page go offline after it was loaded
			await page.context().setOffline(true)
		})

		test('shows an error message when the browser is offline', async ({ page }) => {
			await expect(page.getByTestId('offline-message')).toBeVisible()
		})

		test('offline message is gone after the connection is restored', async ({ page }) => {
			await page.context().setOffline(false)
			await expect(page.getByTestId('offline-message')).not.toBeVisible()
		})
	})
})

test.describe('Raw input mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
	})

	test('analyzes raw input', async ({ page }) => {
		// Fill in some CSS
		await page.getByLabel('CSS to analyze').fill(`h1{color:red;font-size:1em;}`)

		// click 'Analyze direct input'
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that Report is shown
		await expect.soft(page.getByTestId('report')).toBeVisible()
		await expect.soft(page).toHaveURL('/analyze-css')
	})

	test('submits raw form with CMD+Enter', async ({ page }) => {
		// Fill in some CSS
		let textarea = page.getByLabel('CSS to analyze')
		await textarea.fill(`h1{color:red;font-size:1em;}`)
		await textarea.press('Meta+Enter')

		// Verify that Report is shown
		await expect.soft(page.getByTestId('report')).toBeVisible()
		await expect.soft(page).toHaveURL('/analyze-css')
	})

	test('validates required input on CMD+Enter', async ({ page }) => {
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()

		let textarea = page.getByLabel('CSS to analyze')
		await textarea.press('Meta+Enter')

		// Verify that Report is not shown
		await expect.soft(page.getByTestId('report')).not.toBeVisible()
		await expect.soft(page).toHaveURL('/analyze-css')
	})
})

test.describe('File input mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		await page.getByRole('tab', { name: 'Analyze File' }).click()
	})

	test('analyzes a single file', async ({ page }) => {
		// Select a file
		await page.getByLabel('File to analyze').setInputFiles([file_fixture_1])

		// Verify that the file preview is shown
		let previews = page.getByTestId('file-preview')
		await expect.soft(previews).toBeVisible()
		await expect.soft(previews).toHaveCount(1)

		// click 'Analyze CSS'
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that Report is shown
		await expect.soft(page.getByTestId('report')).toBeVisible()
		await expect.soft(page).toHaveURL('/analyze-css')
	})

	test('analyzes multiple files', async ({ page }) => {
		// Select a file
		await page.getByLabel('File to analyze').setInputFiles([file_fixture_1, file_fixture_2])

		// Verify that the file previews are shown
		let previews = page.getByTestId('file-preview')
		await expect.soft(previews.first()).toBeVisible()
		await expect.soft(previews).toHaveCount(2)

		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that Report is shown
		await expect.soft(page.getByTestId('report')).toBeVisible()
		await expect.soft(page).toHaveURL('/analyze-css')
	})

	test('validates required input', async ({ page }) => {
		// Do not select a file
		// Go straight to 'Analyze CSS'
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that Report is shown
		await expect.soft(page.getByTestId('report')).not.toBeVisible()
	})
})

test('does not have horizontal scrollbars', async ({ page }) => {
	await page.route('**/*', async (route) => {
		if (route.request().url().includes('/api/get-css')) {
			await route.fulfill({
				status: 200,
				json: [
					{
						type: 'link',
						href: 'https://example.com/test.css',
						url: 'https://example.com/test.css',
						media: undefined,
						rel: 'stylesheet',
						css: `body { background: rgb(238, 238, 238); width: 60vw; margin: 15vh auto; font-family: system-ui, sans-serif; }h1 { font-size: 1.5em; }div { opacity: 0.8; }a:link, a:visited { color: rgb(51, 68, 136); }`
					}
				] satisfies CSSOrigin[]
			})
		} else {
			await route.continue()
		}
	})

	await page.setViewportSize({
		width: 540,
		height: 667
	})

	await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()

	// Fill in a URL
	await page.getByLabel('URL to analyze').fill(`example.com/`)

	// click 'Analyze URL'
	await page.getByRole('button', { name: 'Analyze URL' }).click()

	// Verify that Report is shown
	await expect.soft(page.getByTestId('report')).toBeVisible()

	// Verify that the body isn't wider than the window
	let window_width = (await page.evaluate('window.innerWidth')) as number
	let body_width = (await page.evaluate('document.body.scrollWidth')) as number
	expect(body_width - 10).toBeLessThanOrEqual(window_width)
})

test.describe('URL preloading', () => {
	test('url=example.com', async ({ page }) => {
		await page.goto('/analyze-css?url=example.com', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
		// 2. prettify is checked by default
		await expect.soft(page.getByLabel('Prettify CSS?').first()).toBeChecked()
	})

	test('url=example.com&prettify=1', async ({ page }) => {
		await page.goto('/analyze-css?url=example.com&prettify=1', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
		// 2. prettify is checked by default
		await expect.soft(page.getByLabel('Prettify CSS?').first()).toBeChecked()
	})

	test('url=example.com&prettify=0', async ({ page }) => {
		await page.goto('/analyze-css?url=example.com&prettify=0', { waitUntil: 'domcontentloaded' })

		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
		// 2. Prettify is NOT checked
		await expect.soft(page.getByLabel('Prettify CSS?').first()).not.toBeChecked()
	})

	test('prettify=0', async ({ page }) => {
		await page.goto('/analyze-css?prettify=0', { waitUntil: 'domcontentloaded' })

		// 1. URL input is NOT prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('')
		// 2. Prettify is NOT checked
		await expect.soft(page.getByLabel('Prettify CSS?').first()).not.toBeChecked()
	})

	test('Raw input unsets URL param', async ({ page }) => {
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Analyze URL first
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		await expect.soft(page).toHaveURL('/analyze-css?url=example.com&prettify=1')

		// Fill in Raw CSS
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
		await page.getByLabel('CSS to analyze').fill(`h1{color:red;font-size:1em;}`)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()
		await expect.soft(page).toHaveURL('/analyze-css')
	})

	test('File input unsets URL param', async ({ page }) => {
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Analyze URL first
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		await expect.soft(page).toHaveURL('/analyze-css?url=example.com&prettify=1')

		// Select a file
		await page.getByRole('tab', { name: 'Analyze File' }).click()
		await page.getByLabel('File to analyze').setInputFiles([file_fixture_1])
		await page.getByRole('button', { name: 'Analyze CSS' }).click()
		await expect.soft(page).toHaveURL('/analyze-css')
	})
})
