import { expect as base_expect, test as base_test } from '@playwright/test'
import type { Page } from '@playwright/test'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

type Fixtures = {
	cssCoverage: void
}

export const test = base_test.extend<Fixtures>({
	cssCoverage: [
		async ({ page }, use, testInfo) => {
			// start before test
			await page.coverage.startCSSCoverage()
			await use()
			// stop after test
			let coverage = await page.coverage.stopCSSCoverage()
			// build unique human-readable file name
			// titlePath gives [file, describe, test]
			let parts = testInfo.titlePath.map(s =>
				s.replaceAll(/\s+|\/|\./g, '-')        // spaces or / → -
					.replaceAll(/[^a-zA-Z0-9-_]/g, '') // remove other invalid chars
					.toLowerCase()               // lowercase
			)
			let file_name = parts.join('-') + '.json'

			let dir = path.join(process.cwd(), 'css-coverage')
			await fs.mkdir(dir, { recursive: true })
			let file_path = path.join(dir, file_name)

			await fs.writeFile(file_path, JSON.stringify(coverage))

			// attach to report
			await testInfo.attach('css-coverage', {
				path: file_path,
				contentType: 'application/json'
			})
		},
		{ auto: true }
	]
})

export const expect = base_expect.extend({
	async toBeHydrated(page: Page) {
		const meta = page.locator('meta[name="hydration-status"][content="true"]');
		await meta.waitFor({ state: 'attached' });
		const count = await meta.count();

		if (count !== 1) {
			return {
				pass: false,
				message: () => 'Hydration meta tag not found',
			};
		}

		return {
			pass: true,
			message: () => 'success',
		};
	},


	async toHaveH1(page: Page) {
		let h1 = await page.getByRole('heading', { level: 1 }).all()

		if (h1.length !== 1) {
			return {
				pass: false,
				message: () => `There are ${h1.length} <h1> elements on the page. There should be exactly 1`
			}
		}

		let text = await h1[0].innerText()

		if (text.length === 0) {
			return {
				pass: false,
				message: () => '<h1> element has no content'
			}
		}

		return {
			pass: true,
			message: () => 'success'
		}
	},

	async toHaveSeoTitle(page: Page) {
		let titles = await page.locator('head title').all()

		if (titles.length !== 1) {
			return {
				pass: false,
				message: () =>
					`There are ${titles.length} <title> elements on the page. There should be exactly 1`
			}
		}

		let text = await titles[0].innerText()

		if (text.length === 0) {
			return {
				pass: false,
				message: () => '<title> element has no content'
			}
		}

		return {
			pass: true,
			message: () => 'success'
		}
	},

	async toHaveCanonical(page, { trailing_slash = false } = {}) {
		let canonicals = await page.locator('head link[rel*=canonical]').all()

		if (canonicals.length !== 1) {
			return {
				pass: false,
				message: () =>
					`There are ${canonicals.length} <link rel="canonical"> elements on the page. There should be exactly 1`
			}
		}

		let href = await canonicals.at(0).getAttribute('href')

		if (href.length === 0) {
			return {
				pass: false,
				message: () => 'canonical href has no content'
			}
		}

		if (href.endsWith('/') !== trailing_slash) {
			return {
				pass: false,
				message: () =>
					`canonical href must ${trailing_slash ? '' : 'not'
					} have a traling slash; received "${href}"`
			}
		}

		return {
			pass: true,
			message: () => 'success'
		}
	},

	async toHaveMetaDescription(page) {
		let descriptions = await page.locator('head meta[name=description]').all()

		if (descriptions.length !== 1) {
			return {
				pass: false,
				message: () =>
					`There are ${descriptions.length} <meta name="description"> elements on the page. There should be exactly 1`
			}
		}

		let content = await descriptions.at(0).getAttribute('content')

		if (content.length === 0) {
			return {
				pass: false,
				message: () => 'canonical href has no content'
			}
		}

		return {
			pass: true,
			message: () => 'success'
		}
	}
})
